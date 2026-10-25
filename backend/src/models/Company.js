const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  logo: { type: String, default: "" },
  description: { type: String, trim: true, maxlength: 5000, default: "" },
  website: { type: String, trim: true, maxlength: 300, default: "" },
  industry: { type: String, trim: true, maxlength: 100, default: "" },
  location: { type: String, trim: true, maxlength: 150, default: "" },
  size: { type: String, enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+", ""], default: "" },
  foundedYear: { type: Number, min: 1800, max: 2100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
schema.index({ name: "text", industry: "text", description: "text" });
module.exports = mongoose.model("Company", schema);
