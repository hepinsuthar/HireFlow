/**
 * HireFlow Integration Test Suite
 * Uses dynamically generated isolated test credentials to verify API behavior and RBAC.
 * Cleans up temporary test accounts upon test completion.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");

async function runTests() {
  console.log("Starting HireFlow API Integration Test...");
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
    } catch {
      // no json response
    }
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

  const cleanupUserIds = [];

  try {
    // 1. Health check
    const health = await request("/api/health");
    assert("GET /api/health returns 200 and success: true", health.status === 200 && health.data.success === true);

    // Setup dynamic isolated test users
    const runId = Date.now().toString(36);
    const dynamicPass = `TestPass_${runId}!`;
    const passwordHash = await bcrypt.hash(dynamicPass, 12);

    const testCandUser = await User.create({
      name: `Test Candidate ${runId}`,
      email: `cand_${runId}@test.io`,
      passwordHash,
      role: "candidate",
      isActive: true,
    });
    cleanupUserIds.push(testCandUser._id);

    const testRecUser = await User.create({
      name: `Test Recruiter ${runId}`,
      email: `rec_${runId}@enterprise.org`,
      passwordHash,
      role: "recruiter",
      isActive: true,
    });
    cleanupUserIds.push(testRecUser._id);

    const testAdminUser = await User.create({
      name: `Test Admin ${runId}`,
      email: `admin_${runId}@platform.internal`,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    cleanupUserIds.push(testAdminUser._id);

    // 2. Candidate login
    const candLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testCandUser.email, password: dynamicPass }),
    });
    assert("POST /api/auth/login [Candidate] returns token and role: candidate", 
      candLogin.status === 200 && candLogin.data.data?.user?.role === "candidate" && candLogin.data.data?.token);
    const candToken = candLogin.data.data?.token;

    // 3. Recruiter login
    const recLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testRecUser.email, password: dynamicPass }),
    });
    assert("POST /api/auth/login [Recruiter] returns token and role: recruiter",
      recLogin.status === 200 && recLogin.data.data?.user?.role === "recruiter" && recLogin.data.data?.token);
    const recToken = recLogin.data.data?.token;

    // 4. Admin login
    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testAdminUser.email, password: dynamicPass }),
    });
    assert("POST /api/auth/login [Admin] returns token and role: admin",
      adminLogin.status === 200 && adminLogin.data.data?.user?.role === "admin" && adminLogin.data.data?.token);
    const adminToken = adminLogin.data.data?.token;

    // 5. Jobs list (authenticated candidate)
    const jobsRes = await request("/api/jobs", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("GET /api/jobs returns jobs array", 
      jobsRes.status === 200 && Array.isArray(jobsRes.data.data));

    // 6. Candidate Analytics
    const candAnalytics = await request("/api/analytics/candidate", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("GET /api/analytics/candidate returns candidate metrics",
      candAnalytics.status === 200 && candAnalytics.data.success === true && typeof candAnalytics.data.data?.totalApplications === "number");

    // 7. Recruiter Analytics
    const recAnalytics = await request("/api/analytics/recruiter", {
      headers: { Authorization: `Bearer ${recToken}` },
    });
    assert("GET /api/analytics/recruiter returns recruiter metrics",
      recAnalytics.status === 200 && recAnalytics.data.success === true && typeof recAnalytics.data.data?.totalJobs === "number");

    // 8. Admin Reports
    const adminReports = await request("/api/admin/reports", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert("GET /api/admin/reports returns platform metrics and totals",
      adminReports.status === 200 && adminReports.data.success === true && typeof adminReports.data.data?.metrics?.totalUsers === "number");

    // 9. Role protection verification: Candidate accessing Admin route must be rejected with 403
    const forbiddenRes = await request("/api/admin/reports", {
      headers: { Authorization: `Bearer ${candToken}` },
    });
    assert("GET /api/admin/reports with Candidate token correctly blocked (403)", forbiddenRes.status === 403);

    console.log(`\nVerification complete: ${passed} passed, ${failed} failed.`);
  } finally {
    if (cleanupUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: cleanupUserIds } });
    }
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
