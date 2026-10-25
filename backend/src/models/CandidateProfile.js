const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, maxlength: 150, default: "" },
  degree: { type: String, trim: true, maxlength: 150, default: "" },
  fieldOfStudy: { type: String, trim: true, maxlength: 150, default: "" },
  startDate: Date, endDate: Date,
  isCurrentlyStudying: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 1000, default: "" }
});
const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, maxlength: 150, default: "" },
  jobTitle: { type: String, trim: true, maxlength: 150, default: "" },
  employmentType: { type: String, enum: ["full-time", "part-time", "internship", "contract", "freelance", ""], default: "" },
  location: { type: String, trim: true, maxlength: 150, default: "" },
  startDate: Date, endDate: Date,
  isCurrentlyWorking: { type: Boolean, default: false },
  description: { type: String, trim: true, maxlength: 2000, default: "" }
});
const projectSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 150, default: "" },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  technologies: { type: [String], default: [] },
  projectUrl: { type: String, trim: true, maxlength: 500, default: "" },
  repositoryUrl: { type: String, trim: true, maxlength: 500, default: "" }
});

const skillEvidenceSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true, maxlength: 80 },
  evidenceType: {
    type: String,
    enum: ["project", "work_experience", "education", "repository", "portfolio", "certification", "other"],
    default: "project"
  },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 2500, default: "" },
  contribution: { type: String, trim: true, maxlength: 2500, default: "" },
  url: { type: String, trim: true, maxlength: 500, default: "" },
  linkedProjectId: { type: mongoose.Schema.Types.ObjectId, default: null },
  linkedExperienceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  verificationStatus: {
    type: String,
    enum: ["self_reported", "under_review", "verified"],
    default: "self_reported"
  },
  createdAt: { type: Date, default: Date.now }
});

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  headline: { type: String, trim: true, maxlength: 150, default: "" },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  location: { type: String, trim: true, maxlength: 150, default: "" },
  bio: { type: String, trim: true, maxlength: 2000, default: "" },
  skills: { type: [String], default: [] },
  skillEvidence: { type: [skillEvidenceSchema], default: [] },
  education: { type: [educationSchema], default: [] },
  experience: { type: [experienceSchema], default: [] },
  projects: { type: [projectSchema], default: [] },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", default: null },
  profileCompletion: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("CandidateProfile", schema);
