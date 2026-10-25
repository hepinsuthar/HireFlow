
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Job = require("../src/models/Job");
const Company = require("../src/models/Company");
const Application = require("../src/models/Application");
const Interview = require("../src/models/Interview");
const SavedJob = require("../src/models/SavedJob");
const CandidateProfile = require("../src/models/CandidateProfile");
const RecruiterProfile = require("../src/models/RecruiterProfile");
const Notification = require("../src/models/Notification");
const Resume = require("../src/models/Resume");

async function clearDemoData() {
  console.log("Connecting to MongoDB Atlas to purge demo data...");
  await connectDB();

  console.log("Removing demo recruitment records...");

  const [delJobs, delComps, delApps, delInts, delSaved, delCandP, delRecP, delNotifs, delResumes] = await Promise.all([
    Job.deleteMany({}),
    Company.deleteMany({}),
    Application.deleteMany({}),
    Interview.deleteMany({}),
    SavedJob.deleteMany({}),
    CandidateProfile.deleteMany({}),
    RecruiterProfile.deleteMany({}),
    Notification.deleteMany({}),
    Resume.deleteMany({})
  ]);

  console.log(`✓ Deleted ${delJobs.deletedCount} demo jobs`);
  console.log(`✓ Deleted ${delComps.deletedCount} demo companies`);
  console.log(`✓ Deleted ${delApps.deletedCount} demo applications`);
  console.log(`✓ Deleted ${delInts.deletedCount} demo interviews`);
  console.log(`✓ Deleted ${delSaved.deletedCount} demo saved jobs`);
  console.log(`✓ Deleted ${delCandP.deletedCount} demo candidate profiles`);
  console.log(`✓ Deleted ${delRecP.deletedCount} demo recruiter profiles`);
  console.log(`✓ Deleted ${delNotifs.deletedCount} notifications`);
  console.log(`✓ Deleted ${delResumes.deletedCount} resume references`);

  console.log("\nDatabase is now completely clean. All dashboards will display honest, real data only.");
  await mongoose.disconnect();
  process.exit(0);
}

clearDemoData().catch((err) => {
  console.error("Failed to clear demo data:", err);
  process.exit(1);
});
