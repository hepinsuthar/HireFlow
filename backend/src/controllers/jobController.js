const Job = require("../models/Job");
const Company = require("../models/Company");
const Application = require("../models/Application");
const RecruiterProfile = require("../models/RecruiterProfile");
const CandidateProfile = require("../models/CandidateProfile");
const { calculateMatch } = require("../services/matchingService");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const jobFields = ["title", "description", "requirements", "skills", "optionalSkills", "experienceMin", "experienceMax", "education", "employmentType", "location", "salaryMin", "salaryMax", "status", "applicationDeadline"];
const createJob = asyncHandler(async (req, res) => {
  let { companyId, title, description, status = "published" } = req.body || {};
  if (!title || !description) throw new AppError("title and description are required.", 400);

  if (!companyId) {
    const profile = await RecruiterProfile.findOne({ userId: req.user.userId });
    if (profile && profile.companyId) {
      companyId = profile.companyId;
    } else {
      const existingCompany = await Company.findOne({ createdBy: req.user.userId, isActive: true });
      if (existingCompany) {
        companyId = existingCompany._id;
      } else {
        // Create an initial company entity for this recruiter if none exists
        const newComp = await Company.create({
          name: "Company",
          slug: "company-" + Date.now().toString(36),
          createdBy: req.user.userId,
          isActive: true
        });
        companyId = newComp._id;
        await RecruiterProfile.findOneAndUpdate({ userId: req.user.userId }, { companyId: newComp._id }, { upsert: true });
      }
    }
  }

  const company = await Company.findById(companyId);
  if (!company || !company.isActive) throw new AppError("Active company not found.", 404);
  if (req.user.role !== "admin" && company.createdBy.toString() !== req.user.userId) {
    throw new AppError("You can only create jobs for your own company.", 403);
  }

  const data = { companyId, title, description, recruiterId: req.user.userId, status };
  for (const key of jobFields) if (key in req.body) data[key] = req.body[key];

  const job = await Job.create(data);
  res.status(201).json({ success: true, message: "Job created successfully.", data: job });
});
const listJobs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const filter = {};
  if (req.user?.role !== "admin" && req.user?.role !== "recruiter") filter.status = "published";
  else if (req.query.status) filter.status = req.query.status;
  if (req.query.location) filter.location = { $regex: String(req.query.location).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (req.query.employmentType) filter.employmentType = req.query.employmentType;
  if (req.query.companyId) filter.companyId = req.query.companyId;
  if (req.query.skill) filter.skills = { $regex: String(req.query.skill).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (req.query.search) filter.$text = { $search: String(req.query.search) };
  const [items, total] = await Promise.all([
    Job.find(filter).populate("companyId", "name logo location industry").populate("recruiterId", "name")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Job.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("companyId", "name logo description website industry location size").populate("recruiterId", "name");
  if (!job) throw new AppError("Job not found.", 404);
  if (job.status !== "published" && req.user?.role !== "admin" && job.recruiterId._id.toString() !== req.user?.userId) throw new AppError("Job not found.", 404);
  res.json({ success: true, data: job });
});
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError("Job not found.", 404);
  if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot edit this job.", 403);
  for (const key of jobFields) if (key in (req.body || {})) {
    if (key === "status" && req.user.role !== "admin" && !["draft", "closed"].includes(req.body.status)) continue;
    job[key] = req.body[key];
  }
  await job.save();
  res.json({ success: true, message: "Job updated.", data: job });
});
const updateJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError("Job not found.", 404);
  if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot update this job.", 403);
  const { status } = req.body || {};
  if (!["draft", "published", "closed"].includes(status)) throw new AppError("Status must be draft, published, or closed.", 400);
  job.status = status;
  await job.save();
  res.json({ success: true, message: "Job status updated.", data: job });
});
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError("Job not found.", 404);
  if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot delete this job.", 403);
  if (await Application.exists({ jobId: job._id })) {
    job.status = "closed";
    await job.save();
    return res.json({ success: true, message: "Job has applications, so it was closed instead of deleted.", data: job });
  }
  await job.deleteOne();
  res.json({ success: true, message: "Job deleted." });
});

const getJobMatch = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("companyId", "name logo location industry");
  if (!job) throw new AppError("Job not found.", 404);
  if (job.status !== "published" && req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) {
    throw new AppError("Job is not currently published.", 404);
  }

  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  const matchResult = calculateMatch(profile || {}, job);

  res.json({
    success: true,
    data: {
      jobId: job._id,
      title: job.title,
      company: job.companyId,
      match: matchResult
    }
  });
});

module.exports = { createJob, listJobs, getJob, getJobMatch, updateJob, updateJobStatus, deleteJob };
