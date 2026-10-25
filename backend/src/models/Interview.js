const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, index: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, min: 15, max: 480, default: 30 },
  type: { type: String, enum: ["online", "offline", "phone"], default: "online" },
  meetingLink: { type: String, trim: true, maxlength: 500, default: "" },
  location: { type: String, trim: true, maxlength: 300, default: "" },
  status: { type: String, enum: ["scheduled", "completed", "cancelled", "rescheduled"], default: "scheduled" },
  notes: { type: String, trim: true, maxlength: 3000, default: "" },
  feedback: { type: String, trim: true, maxlength: 5000, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("Interview", schema);
