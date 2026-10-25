const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const SavedJob = require("../models/SavedJob");
const asyncHandler = require("../utils/asyncHandler");

const candidateAnalytics = asyncHandler(async (req, res) => {
  const candidateId = req.user.userId;
  const [totalApplications, statusCounts, upcomingInterviews, savedJobsCount] = await Promise.all([
    Application.countDocuments({ candidateId }),
    Application.aggregate([
      { $match: { candidateId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Interview.countDocuments({ candidateId, status: "scheduled", scheduledAt: { $gte: new Date() } }),
    SavedJob.countDocuments({ userId: candidateId })
  ]);

  const byStatus = Object.fromEntries(statusCounts.map((row) => [row._id, row.count]));

  res.json({
    success: true,
    data: {
      totalApplications,
      applicationsByStatus: byStatus,
      applied: byStatus.applied || 0,
      underReview: byStatus.under_review || 0,
      shortlisted: byStatus.shortlisted || 0,
      interviewing: byStatus.interview || 0,
      selected: byStatus.selected || 0,
      rejected: byStatus.rejected || 0,
      upcomingInterviews,
      savedJobsCount
    }
  });
});

const recruiterAnalytics = asyncHandler(async (req, res) => {
  const jobFilter = req.user.role === "admin" ? {} : { recruiterId: req.user.userId };
  const jobs = await Job.find(jobFilter).select("_id status title createdAt");
  const jobIds = jobs.map((job) => job._id);
  const appFilter = { jobId: { $in: jobIds } };
  const [totalApplications, statusCounts, interviews, recentApplications] = await Promise.all([
    Application.countDocuments(appFilter),
    Application.aggregate([{ $match: appFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Interview.countDocuments(req.user.role === "admin" ? {} : { recruiterId: req.user.userId }),
    Application.find(appFilter).sort({ appliedAt: -1 }).limit(8).populate("candidateId", "name").populate("jobId", "title")
  ]);
  res.json({
    success: true, data: {
      totalJobs: jobs.length,
      publishedJobs: jobs.filter((job) => job.status === "published").length,
      totalApplications,
      applicationsByStatus: Object.fromEntries(statusCounts.map((row) => [row._id, row.count])),
      interviews,
      recentApplications
    }
  });
});

const adminAnalytics = asyncHandler(async (req, res) => {
  const [users, jobs, applications, interviews, roles, jobStatuses] = await Promise.all([
    User.countDocuments(), Job.countDocuments(), Application.countDocuments(), Interview.countDocuments(),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  ]);
  res.json({
    success: true, data: {
      totals: { users, jobs, applications, interviews },
      usersByRole: Object.fromEntries(roles.map((row) => [row._id, row.count])),
      jobsByStatus: Object.fromEntries(jobStatuses.map((row) => [row._id, row.count]))
    }
  });
});

module.exports = { candidateAnalytics, recruiterAnalytics, adminAnalytics };
