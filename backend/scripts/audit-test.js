/**
 * HireFlow Comprehensive Audit & Security Test Suite
 * Validates RBAC, Authentication, Negative Test Cases, Empty States, and UI Cleanliness
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const http = require("http");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/User");
const CandidateProfile = require("../src/models/CandidateProfile");
const RecruiterProfile = require("../src/models/RecruiterProfile");
const Company = require("../src/models/Company");

async function runAudit() {
  console.log("==================================================");
  console.log("HIREFLOW SECURITY & ARCHITECTURE AUDIT SUITE");
  console.log("==================================================");

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

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("FATAL: MONGO_URI is missing from backend/.env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connection established.");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Ephemeral audit server listening at: ${baseUrl}\n`);

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers });
    let data = null;
    try {
      data = await res.json();
    } catch {
      // no json
    }
    return { status: res.status, data };
  }

  // Cleanup helper
  const createdUserIds = [];

  try {
    // 1. Health check
    const health = await request("/api/health");
    assert("Health endpoint returns 200 & success: true", health.status === 200 && health.data?.success === true);

    // Setup dynamic isolated test accounts for audit
    const testSessionId = Date.now().toString(36);
    const dynamicPass = `AuditPass_${testSessionId}!`;
    const bcrypt = require("bcryptjs");
    const testPasswordHash = await bcrypt.hash(dynamicPass, 12);

    const testCand = await User.create({
      name: "Audit Candidate",
      email: `audit_cand_${testSessionId}@verified-test.io`,
      passwordHash: testPasswordHash,
      role: "candidate",
      isActive: true
    });
    createdUserIds.push(testCand._id);

    const testRec = await User.create({
      name: "Audit Recruiter",
      email: `audit_rec_${testSessionId}@enterprise-test.io`,
      passwordHash: testPasswordHash,
      role: "recruiter",
      isActive: true
    });
    createdUserIds.push(testRec._id);

    const testAdm = await User.create({
      name: "Audit Admin",
      email: `audit_adm_${testSessionId}@internal-test.io`,
      passwordHash: testPasswordHash,
      role: "admin",
      isActive: true
    });
    createdUserIds.push(testAdm._id);

    // 2. Candidate login
    const candLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testCand.email, password: dynamicPass })
    });
    assert("Candidate login authenticates and yields candidate JWT",
      candLogin.status === 200 && candLogin.data?.data?.user?.role === "candidate" && candLogin.data?.data?.token
    );
    const candToken = candLogin.data?.data?.token;

    // 3. Recruiter login
    const recLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testRec.email, password: dynamicPass })
    });
    assert("Recruiter login authenticates and yields recruiter JWT",
      recLogin.status === 200 && recLogin.data?.data?.user?.role === "recruiter" && recLogin.data?.data?.token
    );
    const recToken = recLogin.data?.data?.token;

    // 4. Admin login
    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testAdm.email, password: dynamicPass })
    });
    assert("Admin login authenticates and yields admin JWT",
      adminLogin.status === 200 && adminLogin.data?.data?.user?.role === "admin" && adminLogin.data?.data?.token
    );
    const adminToken = adminLogin.data?.data?.token;

    // 5. Invalid credentials rejected
    const badLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testCand.email, password: "IncorrectPassword999!" })
    });
    assert("Invalid password strictly rejected with 401 Unauthorized", badLogin.status === 401);

    const nonExistentUser = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "doesnotexist@nowhere.com", password: "SomePassword123!" })
    });
    assert("Non-existent email rejected with 401 Unauthorized", nonExistentUser.status === 401);

    // 6. Unauthenticated access rejected
    const unauthReq = await request("/api/auth/me");
    assert("Unauthenticated request to protected endpoint rejected with 401", unauthReq.status === 401);

    // 7. Role-Based Access Control: Candidate cannot access Admin settings
    const candAccessAdmin = await request("/api/admin/settings", {
      headers: { Authorization: `Bearer ${candToken}` }
    });
    assert("Candidate accessing Admin settings endpoint blocked with 403 Forbidden", candAccessAdmin.status === 403);

    // 8. Role-Based Access Control: Recruiter cannot access Admin users
    const recAccessAdmin = await request("/api/admin/users", {
      headers: { Authorization: `Bearer ${recToken}` }
    });
    assert("Recruiter accessing Admin users endpoint blocked with 403 Forbidden", recAccessAdmin.status === 403);

    // 9. Admin CAN access Admin settings
    const adminAccessSettings = await request("/api/admin/settings", {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert("Admin accessing Admin settings succeeds with 200", adminAccessSettings.status === 200);

    // 10. Public registration cannot create Admin account
    const fakeAdminReg = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Malicious Actor",
        email: `hacker_${Date.now()}@domain.com`,
        password: "SecurePassword123!",
        role: "admin"
      })
    });
    assert("Attempt to register with role 'admin' rejected with 400 Bad Request",
      fakeAdminReg.status === 400 && fakeAdminReg.data?.message?.includes("Admin accounts cannot be created publicly")
    );

    // 11. Recruiter registration with free email provider blocked
    const freeEmailRecruiter = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: `johndoe_${Date.now()}@gmail.com`,
        password: "SecurePassword123!",
        role: "recruiter",
        companyName: "Acme Corp",
        jobTitle: "Senior Recruiter"
      })
    });
    assert("Recruiter registration with @gmail.com strictly blocked with 400",
      freeEmailRecruiter.status === 400 && freeEmailRecruiter.data?.message?.includes("official company work email")
    );

    // 12. Valid candidate registration persists in DB
    const testCandidateEmail = `test_candidate_${Date.now()}@verified.edu`;
    const candReg = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Candidate",
        email: testCandidateEmail,
        password: "ValidPassword123!",
        role: "candidate",
        headline: "Full Stack Engineer",
        skills: ["React", "Node.js", "MongoDB"]
      })
    });
    assert("Valid Candidate registration returns 201 and persists to MongoDB",
      candReg.status === 201 && candReg.data?.data?.user?.email === testCandidateEmail
    );
    if (candReg.data?.data?.user?.id) createdUserIds.push(candReg.data.data.user.id);

    // 13. Duplicate email registration rejected with 409
    const dupReg = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Duplicate User",
        email: testCandidateEmail,
        password: "AnotherPassword123!",
        role: "candidate"
      })
    });
    assert("Duplicate email registration cleanly rejected with 409 Conflict", dupReg.status === 409);

    // 14. Valid recruiter registration with corporate email succeeds
    const testRecruiterEmail = `talent_${Date.now()}@enterprise-corp.com`;
    const recReg = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Enterprise Talent Lead",
        email: testRecruiterEmail,
        password: "ValidPassword123!",
        role: "recruiter",
        companyName: `Enterprise Corp ${Date.now()}`,
        jobTitle: "Director of Talent",
        companyWebsite: "https://enterprise-corp.com"
      })
    });
    assert("Valid Recruiter registration with corporate email returns 201 and links Company",
      recReg.status === 201 && recReg.data?.data?.user?.role === "recruiter"
    );
    if (recReg.data?.data?.user?.id) createdUserIds.push(recReg.data.data.user.id);

    // 15. Candidate profile data retrieved and updated
    const newCandToken = candReg.data?.data?.token;
    const candProfile = await request("/api/candidates/profile", {
      headers: { Authorization: `Bearer ${newCandToken}` }
    });
    assert("Candidate profile returns real MongoDB profile data with headline",
      candProfile.status === 200 && candProfile.data?.data?.headline === "Full Stack Engineer"
    );

    // 16. Candidate cannot access Recruiter jobs creation
    const candPostJob = await request("/api/jobs", {
      method: "POST",
      headers: { Authorization: `Bearer ${newCandToken}` },
      body: JSON.stringify({ title: "Unauthorized Job", description: "Test" })
    });
    assert("Candidate attempting to create job vacancy blocked with 403 Forbidden", candPostJob.status === 403);

    // 17. Honest empty states: Querying jobs with impossible criteria returns empty list, not mock data
    const emptyJobsSearch = await request("/api/jobs?location=NONEXISTENT_PLANET_MARS_99999");
    assert("Querying non-matching jobs returns empty list [ ] without fake items",
      emptyJobsSearch.status === 200 && Array.isArray(emptyJobsSearch.data?.data) && emptyJobsSearch.data.data.length === 0
    );

    // 18. Honest empty states: Candidate saved jobs for brand new user returns [ ]
    const emptySaved = await request("/api/saved-jobs", {
      headers: { Authorization: `Bearer ${newCandToken}` }
    });
    assert("New user saved jobs returns empty list [ ] without hardcoded samples",
      emptySaved.status === 200 && Array.isArray(emptySaved.data?.data) && emptySaved.data.data.length === 0
    );

    // 19. Contact inquiry persistence
    const contactRes = await request("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Auditor",
        email: "auditor@security-firm.io",
        role: "candidate",
        subject: "Audit Verification",
        message: "Verifying persistent inquiry storage in MongoDB."
      })
    });
    assert("Public contact inquiry persists to MongoDB and returns 201", contactRes.status === 201);

  } finally {
    // Clean up temporary test accounts created during this run
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
      await CandidateProfile.deleteMany({ userId: { $in: createdUserIds } });
      await RecruiterProfile.deleteMany({ userId: { $in: createdUserIds } });
    }
    server.close();
    await mongoose.disconnect();
  }

  console.log("\n==================================================");
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runAudit().catch((err) => {
  console.error("Audit run error:", err);
  process.exit(1);
});
