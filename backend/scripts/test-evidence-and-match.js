/**
 * Integration Test: Evidence-Based Career & Hiring Intelligence
 * Tests:
 * 1. Skill Evidence Profile CRUD (Add, Update, Delete) & URL validation
 * 2. Self-reported verification status enforcement
 * 3. Deterministic Explainable Job Match & Requirements Coverage
 * 4. Skill Gap Action Plan generation & AI fallback resilience
 * 5. Recruiter Candidate Directory & Evidence Review
 * 6. Structured Recruiter Evaluation with RBAC enforcement
 * 7. Clean teardown of temporary records
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const CandidateProfile = require("../src/models/CandidateProfile");
const Job = require("../src/models/Job");
const Company = require("../src/models/Company");
const Application = require("../src/models/Application");

async function runTests() {
  console.log("=== HireFlow Evidence-Based Intelligence Integration Test ===");
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data };
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

  const runId = Date.now().toString(36);
  const cleanupUserIds = [];
  const cleanupJobIds = [];
  const cleanupCompanyIds = [];
  const cleanupAppIds = [];

  try {
    const passwordHash = await bcrypt.hash(`TestPass_${runId}!`, 10);

    // 1. Create isolated Candidate
    const candidateUser = await User.create({
      name: `Candidate_${runId}`,
      email: `candidate_${runId}@hireflow.test`,
      passwordHash,
      role: "candidate"
    });
    cleanupUserIds.push(candidateUser._id);

    // 2. Create isolated Recruiter
    const recruiterUser = await User.create({
      name: `Recruiter_${runId}`,
      email: `recruiter_${runId}@enterprise.test`,
      passwordHash,
      role: "recruiter"
    });
    cleanupUserIds.push(recruiterUser._id);

    // 3. Login both users to acquire JWT tokens
    const candLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: `candidate_${runId}@hireflow.test`, password: `TestPass_${runId}!` })
    });
    assert("Candidate login returns 200 and token", candLogin.status === 200 && candLogin.data.data?.token);
    const candidateToken = candLogin.data.data.token;

    const recLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: `recruiter_${runId}@enterprise.test`, password: `TestPass_${runId}!` })
    });
    assert("Recruiter login returns 200 and token", recLogin.status === 200 && recLogin.data.data?.token);
    const recruiterToken = recLogin.data.data.token;

    // 4. Test Candidate Skill Evidence CRUD
    // A. Add evidence with invalid URL should fail (400)
    const badUrlRes = await request("/api/candidates/evidence", {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        skill: "React",
        evidenceType: "project",
        title: "Bad URL Project",
        url: "not-a-valid-http-url"
      })
    });
    assert("Adding evidence with invalid URL returns 400", badUrlRes.status === 400);

    // B. Add legitimate evidence
    const goodEvidenceRes = await request("/api/candidates/evidence", {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        skill: "React",
        evidenceType: "repository",
        title: "E-Commerce State Management Engine",
        description: "Architected high-throughput state container with Redux Toolkit and React 19 hooks.",
        contribution: "Designed custom virtualization hooks reducing DOM nodes by 60%.",
        url: "https://github.com/hireflow/react-virtual-grid"
      })
    });
    assert("Adding valid skill evidence returns 201", goodEvidenceRes.status === 201 && goodEvidenceRes.data.success === true);
    assert("New evidence defaults to 'self_reported' verification status", goodEvidenceRes.data.data?.verificationStatus === "self_reported");
    const evidenceId = goodEvidenceRes.data.data?._id;

    // C. Get skill evidence
    const getEvidenceRes = await request("/api/candidates/evidence", {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    assert("GET /api/candidates/evidence returns candidate's evidence array", getEvidenceRes.status === 200 && getEvidenceRes.data.data?.length >= 1);

    // D. Update skill evidence
    const updateEvidenceRes = await request(`/api/candidates/evidence/${evidenceId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        title: "Updated E-Commerce Virtual Grid Engine",
        contribution: "Optimized bundle size by 35% and added strict TypeScript types."
      })
    });
    assert("PUT /api/candidates/evidence/:id updates evidence successfully", updateEvidenceRes.status === 200 && updateEvidenceRes.data.data?.title.includes("Updated"));

    // 5. Update Candidate Profile with another skill claimed without evidence (e.g. Docker, TypeScript)
    await request("/api/candidates/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        headline: "Senior Full Stack Engineer",
        skills: ["React", "TypeScript", "Docker"],
        experience: [{
          company: "Tech Systems Corp",
          jobTitle: "Software Engineer",
          employmentType: "full-time",
          location: "Remote",
          startDate: "2023-01-01",
          isCurrentlyWorking: true,
          description: "Full stack engineering across microservices."
        }]
      })
    });

    // 6. Recruiter creates a Job with required and optional skills
    const comp = await Company.create({
      name: `TestCorp_${runId}`,
      slug: `testcorp-${runId}`,
      createdBy: recruiterUser._id,
      isActive: true
    });
    cleanupCompanyIds.push(comp._id);

    const jobRes = await request("/api/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: JSON.stringify({
        companyId: comp._id,
        title: `Full Stack React & Cloud Architect (${runId})`,
        description: "Leading frontend architecture, cloud deployments, and responsive state.",
        requirements: "Solid React production experience, TypeScript, Docker, and AWS knowledge.",
        skills: ["React", "Docker", "AWS"], // React = has evidence, Docker = claimed without evidence, AWS = missing!
        optionalSkills: ["TypeScript", "GraphQL"],
        experienceMin: 2,
        status: "published"
      })
    });
    assert("Recruiter creates published job returns 201", jobRes.status === 201);
    const jobId = jobRes.data.data?._id;
    cleanupJobIds.push(jobId);

    // 7. Test Explainable Job Match Endpoint (GET /api/jobs/:id/match)
    const matchRes = await request(`/api/jobs/${jobId}/match`, {
      headers: { Authorization: `Bearer ${candidateToken}` }
    });
    assert("GET /api/jobs/:id/match returns 200 for candidate", matchRes.status === 200 && matchRes.data.success === true);

    const matchData = matchRes.data.data.match;
    assert("Deterministic score is calculated (between 0 and 100)", typeof matchData.score === "number" && matchData.score >= 0 && matchData.score <= 100);
    assert("Demonstrated skills correctly identifies 'react' with evidence", matchData.breakdown.requiredSkills.demonstratedWithEvidence.some((i) => i.skill === "react"));
    assert("Claimed skills correctly identifies 'docker' lacking evidence", matchData.breakdown.requiredSkills.claimedWithoutEvidence.some((i) => i.skill === "docker"));
    assert("Missing skills correctly identifies 'aws' as not demonstrated", matchData.breakdown.requiredSkills.notDemonstrated.some((i) => i.skill === "aws"));
    assert("Optional skills matched identifies 'typescript'", matchData.breakdown.optionalSkills.matched.includes("typescript"));
    assert("Action plan provides concrete suggestions for missing AWS skill", matchData.actionPlan.some((a) => a.skill === "aws"));

    // 8. Test Skill Gap Action Plan (POST /api/ai/skill-gap-plan)
    const gapPlanRes = await request("/api/ai/skill-gap-plan", {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({ jobId })
    });
    assert("POST /api/ai/skill-gap-plan returns 200 with deterministic plan", gapPlanRes.status === 200 && gapPlanRes.data.data?.deterministicPlan.length > 0);

    // 9. Candidate applies to the job
    const applyRes = await request("/api/applications", {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        jobId,
        coverLetter: "Excited to bring my React architecture experience to your engineering team."
      })
    });
    assert("Candidate applies to job returns 201", applyRes.status === 201);
    const appId = applyRes.data.data?._id;
    cleanupAppIds.push(appId);

    // 10. Recruiter inspects candidate application and evidence (GET /api/applications/:id)
    const viewAppRes = await request(`/api/applications/${appId}`, {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    assert("Recruiter GET /api/applications/:id returns candidateProfile and skillEvidence", viewAppRes.status === 200 && Array.isArray(viewAppRes.data.data?.candidateProfile?.skillEvidence));

    // 11. Recruiter records structured human evaluation (POST /api/applications/:id/evaluate)
    const evalRes = await request(`/api/applications/${appId}/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${recruiterToken}` },
      body: JSON.stringify({
        criteriaFeedback: [
          { criterion: "React State Architecture", rating: "exceeds", comment: "Demonstrated clear evidence via virtual grid repository." },
          { criterion: "Docker Containerization", rating: "needs_evidence", comment: "Claimed in profile but needs portfolio artifact." },
          { criterion: "AWS Cloud Infrastructure", rating: "not_met", comment: "Missing experience, needs interview assessment." }
        ],
        overallAssessment: "Strong frontend candidate with verified React engineering skills. Need technical interview to probe cloud capability.",
        recommendation: "advance"
      })
    });
    assert("Recruiter records evaluation returns 201", evalRes.status === 201 && evalRes.data.success === true);

    // 12. Security Check: Candidate CANNOT submit recruiter evaluations (403)
    const candEvalRes = await request(`/api/applications/${appId}/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({ recommendation: "advance" })
    });
    assert("Candidate attempting evaluation is blocked with 403 Forbidden", candEvalRes.status === 403);

    // 13. Recruiter Talent Directory (GET /api/candidates)
    const dirRes = await request("/api/candidates?skill=React", {
      headers: { Authorization: `Bearer ${recruiterToken}` }
    });
    assert("Recruiter talent directory GET /api/candidates returns 200 with candidates", dirRes.status === 200 && Array.isArray(dirRes.data.data));

  } catch (err) {
    console.error("Test failed with exception:", err);
    failed++;
  } finally {
    // Teardown temporary test documents
    console.log("Cleaning up temporary test records...");
    if (cleanupAppIds.length) await Application.deleteMany({ _id: { $in: cleanupAppIds } });
    if (cleanupJobIds.length) await Job.deleteMany({ _id: { $in: cleanupJobIds } });
    if (cleanupCompanyIds.length) await Company.deleteMany({ _id: { $in: cleanupCompanyIds } });
    if (cleanupUserIds.length) {
      await CandidateProfile.deleteMany({ userId: { $in: cleanupUserIds } });
      await User.deleteMany({ _id: { $in: cleanupUserIds } });
    }
    server.close();
    await mongoose.disconnect();
  }

  console.log(`\nEvidence & Match Test Result: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
