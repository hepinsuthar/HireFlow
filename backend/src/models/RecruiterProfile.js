const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
  jobTitle: { type: String, trim: true, maxlength: 150, default: "" },
  phone: { type: String, trim: true, maxlength: 30, default: "" },
  bio: { type: String, trim: true, maxlength: 1500, default: "" }
}, { timestamps: true });
module.exports = mongoose.model("RecruiterProfile", schema);
