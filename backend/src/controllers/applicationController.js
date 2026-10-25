const Application = require("../models/Application");
const Job = require("../models/Job");
const CandidateProfile = require("../models/CandidateProfile");
const Resume = require("../models/Resume");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { calculateMatch } = require("../services/matchingService");
const { createNotification } = require("../services/notificationService");

const statuses = ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"];
const applyToJob = asyncHandler(async (req, res) => {
  const { jobId, resumeId, coverLetter = "" } = req.body || {};
  if (!jobId) throw new AppError("jobId is required.", 400);
  const job = await Job.findById(jobId);
  if (!job || job.status !== "published") throw new AppError("This job is not available for applications.", 404);
  if (job.applicationDeadline && job.applicationDeadline < new Date()) throw new AppError("The application deadline has passed.", 400);
  const existing = await Application.findOne({ jobId, candidateId: req.user.userId });
  if (existing) throw new AppError("You have already submitted an application for this position.", 400);
  let resume = null;
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, candidateId: req.user.userId });
    if (!resume) throw new AppError("Resume not found for this candidate.", 404);
  }
  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  const match = calculateMatch(profile || {}, job);
  const application = await Application.create({
    jobId, candidateId: req.user.userId, resumeId: resume ? resume._id : null,
    coverLetter, matchScore: match.score, matchBreakdown: match.breakdown,
    statusHistory: [{ status: "applied", changedBy: req.user.userId, note: "Application submitted." }]
  });
  await createNotification({
    userId: job.recruiterId, type: "application_received", title: "New job application",
    message: `A candidate applied for ${job.title}.`, relatedEntityType: "application", relatedEntityId: application._id
  });
  res.status(201).json({ success: true, message: "Application submitted successfully.", data: application });
});
const mine = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const filter = { candidateId: req.user.userId };
  const [items, total] = await Promise.all([
    Application.find(filter).populate({ path: "jobId", populate: { path: "companyId", select: "name logo" } }).populate("resumeId", "fileName fileUrl")
      .sort({ appliedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Application.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
const byJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new AppError("Job not found.", 404);
  if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot view applications for this job.", 403);
  const filter = { jobId: job._id };
  if (req.query.status && statuses.includes(req.query.status)) filter.status = req.query.status;
  const items = await Application.find(filter).populate("candidateId", "name email avatar").populate("resumeId", "fileName fileUrl")
    .sort({ appliedAt: -1 }).limit(200);
  res.json({ success: true, data: items });
});
const getOne = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("candidateId", "name email avatar")
    .populate({ path: "jobId", populate: { path: "companyId", select: "name logo location industry" } })
    .populate("resumeId", "fileName fileUrl")
    .populate("evaluations.evaluatorId", "name avatar");
  if (!application) throw new AppError("Application not found.", 404);

  const job = await Job.findById(application.jobId._id).select("recruiterId skills optionalSkills requirements title experienceMin");
  if (!job) throw new AppError("Associated job not found.", 404);

  const permitted = req.user.role === "admin" || application.candidateId._id.toString() === req.user.userId || job.recruiterId.toString() === req.user.userId;
  if (!permitted) throw new AppError("You cannot view this application.", 403);

  // Retrieve candidate profile and skill evidence for evidence review
  const profile = await CandidateProfile.findOne({ userId: application.candidateId._id });
  const liveMatch = calculateMatch(profile || {}, job);

  res.json({
    success: true,
    data: {
      ...application.toObject(),
      candidateProfile: {
        headline: profile?.headline || "",
        skills: profile?.skills || [],
        skillEvidence: profile?.skillEvidence || [],
        projects: profile?.projects || [],
        experience: profile?.experience || [],
        education: profile?.education || []
      },
      liveMatch
    }
  });
});
const updateStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new AppError("Application not found.", 404);
  const job = await Job.findById(application.jobId);
  if (!job) throw new AppError("Associated job not found.", 404);
  if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot update this application.", 403);
  const { status, note = "" } = req.body || {};
  if (!statuses.includes(status) || status === "applied") throw new AppError("Provide a valid next status.", 400);
  const allowed = {
    applied: ["under_review", "rejected"],
    under_review: ["shortlisted", "rejected"],
    shortlisted: ["interview", "rejected"],
    interview: ["selected", "rejected", "shortlisted"],
    selected: [],
    rejected: []
  };
  if (!allowed[application.status].includes(status)) throw new AppError(`Status cannot change from ${application.status} to ${status}.`, 409);
  application.status = status;
  application.statusHistory.push({ status, changedBy: req.user.userId, note });
  await application.save();
  await createNotification({
    userId: application.candidateId, type: "application_status", title: "Application status updated",
    message: `Your application for ${job.title} is now ${status.replace("_", " ")}.`,
    relatedEntityType: "application", relatedEntityId: application._id
  });
  res.json({ success: true, message: "Application status updated.", data: application });
});

const listAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.user.role === "recruiter") {
    const jobs = await Job.find({ recruiterId: req.user.userId }).select("_id");
    filter.jobId = { $in: jobs.map(j => j._id) };
  }
  if (req.query.status && statuses.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.jobId) {
    filter.jobId = req.query.jobId;
  }
  const [items, total] = await Promise.all([
    Application.find(filter)
      .populate("candidateId", "name email avatar")
      .populate({ path: "jobId", select: "title companyId location workMode", populate: { path: "companyId", select: "name logo" } })
      .populate("resumeId", "fileName fileUrl")
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Application.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const addEvaluation = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new AppError("Application not found.", 404);

  const job = await Job.findById(application.jobId);
  if (!job) throw new AppError("Associated job not found.", 404);

  if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId) {
    throw new AppError("You can only evaluate applications for your own company's jobs.", 403);
  }

  const { criteriaFeedback = [], overallAssessment = "", recommendation = "hold" } = req.body || {};
  if (!["advance", "hold", "reject"].includes(recommendation)) {
    throw new AppError("Recommendation must be advance, hold, or reject.", 400);
  }

  const newEval = {
    evaluatorId: req.user.userId,
    criteriaFeedback: Array.isArray(criteriaFeedback) ? criteriaFeedback.map((c) => ({
      criterion: String(c.criterion || "").trim(),
      rating: ["exceeds", "meets", "needs_evidence", "not_met"].includes(c.rating) ? c.rating : "meets",
      comment: String(c.comment || "").trim()
    })) : [],
    overallAssessment: String(overallAssessment || "").trim(),
    recommendation,
    evaluatedAt: new Date()
  };

  application.evaluations.push(newEval);

  if (overallAssessment) {
    application.statusHistory.push({
      status: application.status,
      changedBy: req.user.userId,
      note: `Evidence review recorded (${recommendation}): ${overallAssessment.slice(0, 120)}`
    });
  }

  await application.save();

  res.status(201).json({
    success: true,
    message: "Structured candidate evidence evaluation recorded.",
    data: newEval
  });
});

module.exports = { applyToJob, mine, byJob, getOne, updateStatus, listAll, addEvaluation };
