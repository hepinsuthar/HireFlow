require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function createAdmin() {
  const args = process.argv.slice(2);
  let name = process.env.BOOTSTRAP_ADMIN_NAME || "HireFlow Administrator";
  let email = process.env.BOOTSTRAP_ADMIN_EMAIL || "";
  let password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name" && args[i + 1]) name = args[++i];
    if (args[i] === "--email" && args[i + 1]) email = args[++i];
    if (args[i] === "--password" && args[i + 1]) password = args[++i];
  }

  if (!email || !password) {
    console.error("Error: Administrator email and password must be supplied.");
    console.error("Usage: node scripts/createAdmin.js --email <email> --password <password> [--name <name>]");
    console.error("Or configure BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in your environment.");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGO_URI is missing in backend/.env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.role === "admin") {
        console.log(`Admin account '${normalizedEmail}' already exists. Updating password...`);
        existing.passwordHash = await bcrypt.hash(password, 12);
        existing.isActive = true;
        await existing.save();
        console.log(`Admin password successfully reset for: ${normalizedEmail}`);
      } else {
        console.log(`Promoting existing user '${normalizedEmail}' to admin role...`);
        existing.role = "admin";
        existing.passwordHash = await bcrypt.hash(password, 12);
        existing.isActive = true;
        await existing.save();
        console.log(`User '${normalizedEmail}' is now an Administrator.`);
      }
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role: "admin",
        isActive: true
      });
      console.log(`Administrator account created successfully!\nEmail: ${normalizedEmail}\nName: ${name}`);
    }

    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  } catch (error) {
    console.error(`Failed to create admin: ${error.message}`);
    process.exit(1);
  }
}

createAdmin();
