const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  fileName: { type: String, required: true, maxlength: 255 },
  fileUrl: { type: String, required: true },
  cloudinaryPublicId: { type: String, default: "" },
  localPath: { type: String, default: "" },
  fileType: { type: String, required: true },
  fileSize: { type: Number, min: 0, default: 0 },
  analysis: { type: mongoose.Schema.Types.Mixed, default: null },
  analysisStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  version: { type: Number, default: 1 }
}, { timestamps: true });
module.exports = mongoose.model("Resume", schema);
