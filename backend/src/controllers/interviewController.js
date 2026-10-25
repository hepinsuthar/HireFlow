const Interview = require("../models/Interview");
const Application = require("../models/Application");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { createNotification } = require("../services/notificationService");

const createInterview = asyncHandler(async (req, res) => {
  const { applicationId, scheduledAt, duration = 30, type = "online", meetingLink = "", location = "", notes = "" } = req.body || {};
  if (!applicationId || !scheduledAt || Number.isNaN(new Date(scheduledAt).getTime())) throw new AppError("applicationId and a valid scheduledAt are required.", 400);
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError("Application not found.", 404);
  const job = await Job.findById(application.jobId);
  if (!job || (req.user.role !== "admin" && job.recruiterId.toString() !== req.user.userId)) throw new AppError("You cannot schedule an interview for this application.", 403);
  const interview = await Interview.create({
    applicationId, candidateId: application.candidateId, recruiterId: req.user.userId,
    scheduledAt: new Date(scheduledAt), duration, type, meetingLink, location, notes
  });
  if (application.status === "shortlisted") {
    application.status = "interview";
    application.statusHistory.push({ status: "interview", changedBy: req.user.userId, note: "Interview scheduled." });
    await application.save();
  }
  await createNotification({
    userId: application.candidateId, type: "interview_scheduled", title: "Interview scheduled",
    message: `An interview has been scheduled for ${job.title}.`, relatedEntityType: "interview", relatedEntityId: interview._id
  });
  res.status(201).json({ success: true, message: "Interview scheduled.", data: interview });
});
const listInterviews = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : req.user.role === "candidate" ? { candidateId: req.user.userId } : { recruiterId: req.user.userId };
  if (req.query.status) filter.status = req.query.status;
  const items = await Interview.find(filter).populate("candidateId", "name email").populate("recruiterId", "name email")
    .populate({ path: "applicationId", populate: { path: "jobId", select: "title companyId" } }).sort({ scheduledAt: 1 }).limit(200);
  res.json({ success: true, data: items });
});
const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError("Interview not found.", 404);
  const permitted = req.user.role === "admin" || interview.recruiterId.toString() === req.user.userId;
  if (!permitted) throw new AppError("Only the interview's recruiter or an admin can edit it.", 403);
  const allowed = ["scheduledAt", "duration", "type", "meetingLink", "location", "status", "notes", "feedback"];
  for (const key of allowed) if (key in (req.body || {})) interview[key] = req.body[key];
  await interview.save();
  res.json({ success: true, message: "Interview updated.", data: interview });
});
const deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) throw new AppError("Interview not found.", 404);
  if (req.user.role !== "admin" && interview.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot cancel this interview.", 403);
  interview.status = "cancelled";
  await interview.save();
  await createNotification({
    userId: interview.candidateId, type: "interview_cancelled", title: "Interview cancelled",
    message: "A scheduled interview has been cancelled.", relatedEntityType: "interview", relatedEntityId: interview._id
  });
  res.json({ success: true, message: "Interview cancelled.", data: interview });
});
module.exports = { createInterview, listInterviews, updateInterview, deleteInterview };
