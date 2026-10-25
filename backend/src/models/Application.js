const mongoose = require("mongoose");
const historySchema = new mongoose.Schema({
  status: { type: String, enum: ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"], required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: String, trim: true, maxlength: 1000, default: "" },
  changedAt: { type: Date, default: Date.now }
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  criteriaFeedback: [{
    criterion: { type: String, required: true },
    rating: { type: String, enum: ["exceeds", "meets", "needs_evidence", "not_met"], default: "meets" },
    comment: { type: String, trim: true, maxlength: 1000, default: "" }
  }],
  overallAssessment: { type: String, trim: true, maxlength: 3000, default: "" },
  recommendation: { type: String, enum: ["advance", "hold", "reject"], default: "hold" },
  evaluatedAt: { type: Date, default: Date.now }
});

const schema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
  status: { type: String, enum: ["applied", "under_review", "shortlisted", "interview", "selected", "rejected"], default: "applied" },
  coverLetter: { type: String, trim: true, maxlength: 5000, default: "" },
  matchScore: { type: Number, min: 0, max: 100, default: 0 },
  matchBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
  evaluations: { type: [evaluationSchema], default: [] },
  statusHistory: { type: [historySchema], default: [] },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });
schema.index({ jobId: 1, candidateId: 1 }, { unique: true });
schema.index({ candidateId: 1, appliedAt: -1 });
module.exports = mongoose.model("Application", schema);
