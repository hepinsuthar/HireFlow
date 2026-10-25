const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CandidateProfile = require("../models/CandidateProfile");
const RecruiterProfile = require("../models/RecruiterProfile");
const Company = require("../models/Company");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const freeEmailProviders = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "live.com",
  "msn.com",
  "yandex.com",
  "gmx.com",
  "googlemail.com"
]);

function tokenFor(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new AppError("JWT_SECRET must be configured with at least 32 characters.", 500);
  }
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "candidate" } = req.body || {};

  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
    throw new AppError("Name must contain 2–100 characters.", 400);
  }
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new AppError("Enter a valid email address.", 400);
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    throw new AppError("Password must contain 8–128 characters.", 400);
  }
  if (!["candidate", "recruiter"].includes(role)) {
    throw new AppError("Public registration is available only for candidate and recruiter roles. Admin accounts cannot be created publicly.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const domain = normalizedEmail.split("@")[1];

  // Enterprise Security Gate: Recruiters MUST register with a verified corporate domain
  if (role === "recruiter") {
    if (freeEmailProviders.has(domain)) {
      throw new AppError(
        "Recruiter registration requires an official company work email (e.g. alex@yourcompany.com). Free personal email providers (@gmail, @yahoo, etc.) are restricted to Candidate accounts.",
        400
      );
    }

    const { companyName, jobTitle, companyWebsite } = req.body || {};
    if (!companyName || typeof companyName !== "string" || companyName.trim().length < 2) {
      throw new AppError("Company legal name is required for recruiter registration.", 400);
    }
    if (!jobTitle || typeof jobTitle !== "string" || jobTitle.trim().length < 2) {
      throw new AppError("Official job title is required for recruiter registration.", 400);
    }
  }

  if (await User.exists({ email: normalizedEmail })) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 12),
    role
  });

  try {
    if (role === "candidate") {
      const { headline, skills = [] } = req.body || {};
      await CandidateProfile.create({
        userId: user._id,
        headline: typeof headline === "string" ? headline.trim() : "",
        skills: Array.isArray(skills) ? skills.slice(0, 20) : []
      });
    } else {
      const { companyName, jobTitle, companyWebsite } = req.body;
      let company = await Company.findOne({
        name: { $regex: new RegExp(`^${companyName.trim()}$`, "i") }
      });

      if (!company) {
        company = await Company.create({
          name: companyName.trim(),
          slug: companyName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36),
          website: companyWebsite?.trim() || `https://${domain}`,
          createdBy: user._id,
          isVerified: false,
          isActive: true
        });
      }

      await RecruiterProfile.create({
        userId: user._id,
        companyId: company._id,
        jobTitle: jobTitle.trim()
      });
    }
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw error;
  }

  res.status(201).json({
    success: true,
    message: role === "recruiter"
      ? "Employer account created successfully. Welcome to HireFlow Talent Acquisition!"
      : "Candidate account created successfully. Welcome to HireFlow!",
    data: { user: safeUser(user), token: tokenFor(user) }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password.", 401);
  }
  if (!user.isActive) {
    throw new AppError("This account has been disabled. Please contact platform support.", 403);
  }

  const token = tokenFor(user);
  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: { user: safeUser(user), token }
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) throw new AppError("User not found.", 404);
  res.json({ success: true, data: { user: safeUser(user) } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required.", 400);
  }
  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters long.", 400);
  }

  const user = await User.findById(req.user.userId).select("+passwordHash");
  if (!user) throw new AppError("User not found.", 404);

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new AppError("Current password is incorrect.", 401);

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: "Password updated successfully." });
});

module.exports = { register, login, getMe, changePassword, safeUser };
