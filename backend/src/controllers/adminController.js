const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const RecruiterProfile = require("../models/RecruiterProfile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (["candidate", "recruiter", "admin"].includes(req.query.role)) filter.role = req.query.role;
  if (req.query.search) {
    const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } }
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select("name email role avatar isActive createdAt").sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body || {};
  if (typeof isActive !== "boolean") throw new AppError("isActive must be a boolean.", 400);
  if (req.params.id === req.user.userId && !isActive) throw new AppError("You cannot disable your own admin account.", 400);
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found.", 404);
  user.isActive = isActive;
  await user.save();
  res.json({
    success: true,
    message: isActive ? "User account activated." : "User account disabled.",
    data: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
  });
});

const listRecruiters = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = { role: "recruiter" };
  if (req.query.search) {
    const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } }
    ];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select("name email role avatar isActive createdAt").sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter)
  ]);

  // Attach company info for each recruiter
  const recruiterIds = users.map(u => u._id);
  const profiles = await RecruiterProfile.find({ userId: { $in: recruiterIds } }).populate("companyId", "name location isVerified logo");
  const profileMap = new Map();
  profiles.forEach(p => profileMap.set(p.userId.toString(), p));

  const enriched = users.map(u => ({
    ...u.toObject(),
    profile: profileMap.get(u._id.toString()) || null
  }));

  res.json({ success: true, data: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const listCompanies = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.search) {
    const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: escaped, $options: "i" };
  }
  const [companies, total] = await Promise.all([
    Company.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Company.countDocuments(filter)
  ]);
  res.json({ success: true, data: companies, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const verifyCompany = asyncHandler(async (req, res) => {
  const { isVerified } = req.body || {};
  if (typeof isVerified !== "boolean") throw new AppError("isVerified must be a boolean.", 400);
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError("Company not found.", 404);
  company.isVerified = isVerified;
  await company.save();
  res.json({
    success: true,
    message: isVerified ? "Company verified." : "Company verification revoked.",
    data: company
  });
});

const listJobsForModeration = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }
  const [jobs, total] = await Promise.all([
    Job.find(filter).populate("companyId", "name logo location").populate("recruiterId", "name email")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(filter)
  ]);
  res.json({ success: true, data: jobs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const moderateJob = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!["published", "closed", "draft", "archived"].includes(status)) {
    throw new AppError("Valid status required: published, closed, draft, archived.", 400);
  }
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError("Job not found.", 404);
  job.status = status;
  await job.save();
  res.json({
    success: true,
    message: `Job moderation updated: status set to ${status}.`,
    data: job
  });
});

const listApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [apps, total] = await Promise.all([
    Application.find(filter)
      .populate("candidateId", "name email")
      .populate({ path: "jobId", select: "title companyId", populate: { path: "companyId", select: "name" } })
      .populate("resumeId", "fileName fileUrl")
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Application.countDocuments(filter)
  ]);
  res.json({ success: true, data: apps, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const getPlatformReports = asyncHandler(async (req, res) => {
  const [usersCount, jobsCount, appsCount, interviewsCount, companiesCount] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Interview.countDocuments(),
    Company.countDocuments()
  ]);

  const recentUsers = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(5);
  const recentJobs = await Job.find().select("title status createdAt").populate("companyId", "name").sort({ createdAt: -1 }).limit(5);

  res.json({
    success: true,
    data: {
      metrics: {
        totalUsers: usersCount,
        totalJobs: jobsCount,
        totalApplications: appsCount,
        totalInterviews: interviewsCount,
        totalCompanies: companiesCount
      },
      recentUsers,
      recentJobs,
      generatedAt: new Date().toISOString()
    }
  });
});

const SystemSetting = require("../models/SystemSetting");

const getSettings = asyncHandler(async (req, res) => {
  let settings = await SystemSetting.findOne({ key: "global_settings" });
  if (!settings) {
    settings = await SystemSetting.create({ key: "global_settings" });
  }
  res.json({ success: true, data: settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const { allowCandidateReg, allowRecruiterReg, autoApproveJobs, maintenanceMode, announcement } = req.body || {};
  let settings = await SystemSetting.findOne({ key: "global_settings" });
  if (!settings) {
    settings = new SystemSetting({ key: "global_settings" });
  }
  if (typeof allowCandidateReg === "boolean") settings.allowCandidateReg = allowCandidateReg;
  if (typeof allowRecruiterReg === "boolean") settings.allowRecruiterReg = allowRecruiterReg;
  if (typeof autoApproveJobs === "boolean") settings.autoApproveJobs = autoApproveJobs;
  if (typeof maintenanceMode === "boolean") settings.maintenanceMode = maintenanceMode;
  if (announcement && typeof announcement === "object") {
    if (typeof announcement.enabled === "boolean") settings.announcement.enabled = announcement.enabled;
    if (typeof announcement.message === "string") settings.announcement.message = announcement.message.trim();
  }
  await settings.save();
  res.json({ success: true, message: "System settings updated successfully.", data: settings });
});

module.exports = {
  listUsers,
  setUserActive,
  listRecruiters,
  listCompanies,
  verifyCompany,
  listJobsForModeration,
  moderateJob,
  listApplications,
  getPlatformReports,
  getSettings,
  updateSettings
};

