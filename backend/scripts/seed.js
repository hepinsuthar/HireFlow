/**
 * HireFlow Platform Initializer & System Governance Setup
 * Initializes system governance configurations without hardcoded credentials or demo records.
 * Real user accounts and company profiles are registered through the application workflows.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const SystemSetting = require("../src/models/SystemSetting");
const User = require("../src/models/User");

async function seed() {
  console.log("Connecting to database for platform initialization...");
  await connectDB();

  // 1. Initialize or verify Global System Settings
  let settings = await SystemSetting.findOne({ key: "global_settings" });
  if (!settings) {
    settings = await SystemSetting.create({
      key: "global_settings",
      allowCandidateReg: true,
      allowRecruiterReg: true,
      autoApproveJobs: false,
      maintenanceMode: false,
      announcement: {
        enabled: false,
        message: ""
      }
    });
    console.log("✓ Initialized default platform governance settings in database.");
  } else {
    console.log("✓ Platform governance settings already active.");
  }

  // 2. Optional: Bootstrap administrator ONLY IF explicitly provided via environment or CLI
  const args = process.argv.slice(2);
  let bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || "";
  let bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || "";
  let bootstrapName = process.env.BOOTSTRAP_ADMIN_NAME || "HireFlow Administrator";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) bootstrapEmail = args[++i];
    if (args[i] === "--password" && args[i + 1]) bootstrapPassword = args[++i];
    if (args[i] === "--name" && args[i + 1]) bootstrapName = args[++i];
  }

  if (bootstrapEmail && bootstrapPassword) {
    const normalizedEmail = bootstrapEmail.trim().toLowerCase();
    let admin = await User.findOne({ email: normalizedEmail });
    const passwordHash = await bcrypt.hash(bootstrapPassword, 12);

    if (admin) {
      admin.role = "admin";
      admin.passwordHash = passwordHash;
      admin.isActive = true;
      await admin.save();
      console.log(`✓ Updated administrator account: ${normalizedEmail}`);
    } else {
      await User.create({
        name: bootstrapName.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "admin",
        isActive: true
      });
      console.log(`✓ Bootstrapped administrator account: ${normalizedEmail}`);
    }
  } else {
    console.log(
      "✓ Zero demo users seeded. Platform operates purely on real user data.\n" +
      "  To initialize an administrator, run:\n" +
      "  node scripts/createAdmin.js --email <email> --password <password>"
    );
  }

  console.log("Platform initialization complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Initialization error:", err);
  process.exit(1);
});
