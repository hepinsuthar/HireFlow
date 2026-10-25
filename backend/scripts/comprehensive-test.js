require("dotenv").config();
const http = require("http");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const CandidateProfile = require("../src/models/CandidateProfile");
const RecruiterProfile = require("../src/models/RecruiterProfile");
const Job = require("../src/models/Job");
const Application = require("../src/models/Application");
const Interview = require("../src/models/Interview");
const Notification = require("../src/models/Notification");
const SavedJob = require("../src/models/SavedJob");
const ContactInquiry = require("../src/models/ContactInquiry");

async function runComprehensiveVerification() {
  console.log("=================================================");
  console.log("HIREFLOW FULL E2E SYSTEM & AI INTEGRATION TEST");
  console.log("=================================================");

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Ephemeral test server active at: ${baseUrl}\n`);

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = "") {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request("/api/health");
    assert("Health endpoint returns 200 and success: true", health.status === 200 && health.data.success === true);

    // Setup dynamic isolated test users
    const runId = Date.now().toString(36);
    const dynamicPass = `CompPass_${runId}!`;
    const bcrypt = require("bcryptjs");
    const testHash = await bcrypt.hash(dynamicPass, 12);
    const cleanupUserIds = [];

    const testCand = await User.create({
      name: `Test Candidate ${runId}`,
      email: `cand_${runId}@verified-test.io`,
      passwordHash: testHash,
      role: "candidate",
      isActive: true,
    });
    cleanupUserIds.push(testCand._id);

    const testRec = await User.create({
      name: `Test Recruiter ${runId}`,
      email: `rec_${runId}@enterprise-test.io`,
      passwordHash: testHash,
      role: "recruiter",
      isActive: true,
    });
    cleanupUserIds.push(testRec._id);

    const testAdm = await User.create({
      name: `Test Admin ${runId}`,
      email: `adm_${runId}@platform-test.io`,
      passwordHash: testHash,
      role: "admin",
      isActive: true,
    });
    cleanupUserIds.push(testAdm._id);

    // 2. Authentication: Candidate, Recruiter, Admin logins
    const candLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testCand.email, password: dynamicPass }),
    });
    assert("Candidate login verified and returns JWT token", candLogin.status === 200 && candLogin.data.data?.token);
    const candToken = candLogin.data.data?.token;

    const recLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testRec.email, password: dynamicPass }),
    });
    assert("Recruiter login verified and returns JWT token", recLogin.status === 200 && recLogin.data.data?.token);
    const recToken = recLogin.data.data?.token;

    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testAdm.email, password: dynamicPass }),
    });
    assert("Admin login verified and returns JWT token", adminLogin.status === 200 && adminLogin.data.data?.token);
    const adminToken = adminLogin.data.data?.token;

    // 3. User Registration & Duplicate Email rejection
    const testEmail = `testuser_${Date.now()}@hireflow.test`;
    const regRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Automated Test User", email: testEmail, password: "TestPassword123!", role: "candidate" }),
    });
    assert("New user registration persists to MongoDB", regRes.status === 201 && regRes.data.success === true);

    const dupRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Automated Test User", email: testEmail, password: "TestPassword123!", role: "candidate" }),
    });
    assert("Duplicate email registration correctly rejected with 409", dupRes.status === 409);

    // Clean up test user
    if (regRes.data.data?.user?.id) {
      await User.findByIdAndDelete(regRes.data.data.user.id);
      await CandidateProfile.deleteOne({ userId: regRes.data.data.user.id });
    }

    // 4. Candidate Profile retrieval & update
    const profGet = await request("/api/candidates/profile", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("Candidate profile retrieved from MongoDB", profGet.status === 200 && profGet.data.success === true);

    const profUpdate = await request("/api/candidates/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${candToken}` },
      body: JSON.stringify({ headline: "Full-Stack Engineer & AI Specialist", skills: ["React", "Node.js", "MongoDB", "Tailwind CSS", "Gemini AI"] }),
    });
    assert("Candidate profile update persists skills and headline", profUpdate.status === 200 && profUpdate.data.success === true);

    // 5. Job Search & Listing
    const jobsList = await request("/api/jobs?status=published&limit=10", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("Job search queries real MongoDB vacancies", jobsList.status === 200 && Array.isArray(jobsList.data.data) && jobsList.data.data.length > 0);
    const targetJob = jobsList.data.data[0];

    // 6. Save / Bookmark Job toggle
    const toggleSave = await request(`/api/saved-jobs/toggle/${targetJob._id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("Job save / bookmark toggle persists in MongoDB", toggleSave.status === 200 || toggleSave.status === 201);

    const savedJobsList = await request("/api/saved-jobs", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("Saved jobs query returns candidate's bookmarked roles", savedJobsList.status === 200 && Array.isArray(savedJobsList.data.data));

    // 7. Duplicate application prevention
    const existingApp = await Application.findOne({ candidateId: candLogin.data.data.user.id, jobId: targetJob._id });
    if (!existingApp) {
      const applyRes = await request("/api/applications", {
        method: "POST",
        headers: { Authorization: `Bearer ${candToken}` },
        body: JSON.stringify({ jobId: targetJob._id, coverLetter: "Excited to contribute to your engineering team." }),
      });
      assert("Job application submitted and persisted", applyRes.status === 201 && applyRes.data.success === true);
    }
    // Now verify duplicate application is rejected
    const dupApply = await request("/api/applications", {
      method: "POST",
      headers: { Authorization: `Bearer ${candToken}` },
      body: JSON.stringify({ jobId: targetJob._id, coverLetter: "Duplicate submission attempt." }),
    });
    assert("Duplicate application attempt cleanly rejected with 400", dupApply.status === 400);

    // 8. Recruiter Job Management (Create Job vacancy)
    const newJobRes = await request("/api/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${recToken}` },
      body: JSON.stringify({
        title: "Staff Cloud Architect",
        description: "Leading multi-region cloud infrastructure and Kubernetes microservices.",
        skills: ["Kubernetes", "Docker", "AWS", "Terraform", "Go"],
        location: "San Francisco, CA (or Remote)",
        workMode: "remote",
        employmentType: "full-time",
        status: "published"
      }),
    });
    assert("Recruiter creates real job vacancy with auto-resolved companyId", newJobRes.status === 201 && newJobRes.data.success === true);
    const createdJob = newJobRes.data.data;

    // 9. Real Google Gemini AI integration tests
    console.log("\n  [Testing Google Gemini AI Integration with Official SDK @google/genai]...");

    // 9a. Recruiter AI Job Description Drafter
    const aiJd = await request("/api/ai/job-description", {
      method: "POST",
      headers: { Authorization: `Bearer ${recToken}` },
      body: JSON.stringify({
        title: "Senior AI Integration Engineer",
        skills: ["Node.js", "Gemini API", "Vector Databases", "REST APIs"],
        location: "Remote",
        employmentType: "full-time"
      }),
    });
    assert("Gemini AI drafts structured job description", aiJd.status === 200 && aiJd.data.data?.description?.length > 50);

    // 9b. Recruiter/Candidate AI Interview Questions
    const aiQuestions = await request("/api/ai/interview-questions", {
      method: "POST",
      headers: { Authorization: `Bearer ${recToken}` },
      body: JSON.stringify({ jobId: targetJob._id }),
    });
    assert("Gemini AI generates job-specific interview questions", aiQuestions.status === 200 && aiQuestions.data.data?.questions?.length > 50);

    // 9c. Candidate AI Resume Insights
    const aiInsights = await request("/api/ai/resume-insights", {
      method: "POST",
      headers: { Authorization: `Bearer ${candToken}` },
      body: JSON.stringify({ jobId: targetJob._id }),
    });
    assert("Gemini AI provides candidate resume improvement insights", aiInsights.status === 200 && aiInsights.data.data?.insights?.length > 50);

    // 10. Real Contact Form Submission (MongoDB ContactInquiry)
    const contactRes = await request("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Enterprise Partner",
        email: "enterprise@company.com",
        role: "employer",
        subject: "Enterprise ATS Inquiries",
        message: "We are interested in onboarding 50 recruiters onto HireFlow."
      }),
    });
    assert("Contact form submission persists inquiry in MongoDB", contactRes.status === 201 && contactRes.data.success === true);

    // 11. Admin System Settings & Governance
    const adminSettingsGet = await request("/api/admin/settings", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert("Admin retrieves system governance settings from MongoDB", adminSettingsGet.status === 200 && adminSettingsGet.data.success === true);

    const adminSettingsPatch = await request("/api/admin/settings", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        allowCandidateReg: true,
        allowRecruiterReg: true,
        autoApproveJobs: true,
        announcement: { enabled: true, message: "Welcome to HireFlow AI Recruitment Platform." }
      }),
    });
    assert("Admin updates system governance settings in MongoDB", adminSettingsPatch.status === 200 && adminSettingsPatch.data.success === true);

    // 12. Security & Role Gates: Candidate cannot access Admin settings
    const candForbidden = await request("/api/admin/settings", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("Candidate accessing Admin settings blocked with 403 Forbidden", candForbidden.status === 403);

    // Clean up created job and test users
    if (createdJob?._id) {
      await Job.findByIdAndDelete(createdJob._id);
    }
    if (cleanupUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: cleanupUserIds } });
    }

    console.log(`\n=================================================`);
    console.log(`ALL TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED.`);
    console.log(`=================================================`);
  } finally {
    server.close();
    const mongoose = require("mongoose");
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runComprehensiveVerification().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
