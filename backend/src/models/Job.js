const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 15000 },
  requirements: { type: String, trim: true, maxlength: 10000, default: "" },
  skills: { type: [String], default: [] },
  optionalSkills: { type: [String], default: [] },
  experienceMin: { type: Number, min: 0, default: 0 },
  experienceMax: { type: Number, min: 0, default: 0 },
  education: { type: String, trim: true, maxlength: 150, default: "" },
  employmentType: { type: String, enum: ["full-time", "part-time", "internship", "contract", "freelance"], default: "full-time" },
  location: { type: String, trim: true, maxlength: 150, default: "Remote" },
  workMode: { type: String, enum: ["remote", "hybrid", "onsite"], default: "remote" },
  salaryMin: { type: Number, min: 0 },
  salaryMax: { type: Number, min: 0 },
  status: { type: String, enum: ["draft", "published", "closed", "archived"], default: "draft", index: true },
  applicationDeadline: Date
}, { timestamps: true });
schema.index({ title: "text", description: "text", requirements: "text", skills: "text" });
schema.index({ status: 1, location: 1, employmentType: 1, createdAt: -1 });
module.exports = mongoose.model("Job", schema);
