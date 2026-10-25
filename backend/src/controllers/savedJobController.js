const SavedJob = require("../models/SavedJob");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body || {};
  if (!jobId) throw new AppError("jobId is required.", 400);
  const job = await Job.findOne({ _id: jobId, status: "published" });
  if (!job) throw new AppError("Published job not found.", 404);
  const existing = await SavedJob.findOne({ userId: req.user.userId, jobId });
  if (existing) return res.status(200).json({ success: true, message: "Job is already saved.", data: existing });
  const saved = await SavedJob.create({ userId: req.user.userId, jobId });
  res.status(201).json({ success: true, message: "Job saved successfully.", data: saved });
});

const listSavedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ userId: req.user.userId }).sort({ createdAt: -1 }).populate({
    path: "jobId", populate: { path: "companyId", select: "name logo location" }
  });
  res.json({ success: true, data: saved });
});

const removeSavedJob = asyncHandler(async (req, res) => {
  const removed = await SavedJob.findOneAndDelete({ userId: req.user.userId, jobId: req.params.jobId });
  if (!removed) throw new AppError("Saved job not found.", 404);
  res.json({ success: true, message: "Job removed from saved jobs." });
});

const toggleSavedJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId || req.body?.jobId;
  if (!jobId) throw new AppError("jobId is required.", 400);
  const existing = await SavedJob.findOne({ userId: req.user.userId, jobId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ success: true, isSaved: false, message: "Job removed from saved jobs." });
  }
  const job = await Job.findOne({ _id: jobId, status: "published" });
  if (!job) throw new AppError("Published job not found.", 404);
  const saved = await SavedJob.create({ userId: req.user.userId, jobId });
  res.status(201).json({ success: true, isSaved: true, message: "Job saved successfully.", data: saved });
});

module.exports = { saveJob, listSavedJobs, removeSavedJob, toggleSavedJob };
