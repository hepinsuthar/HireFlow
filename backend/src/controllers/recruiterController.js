const RecruiterProfile = require("../models/RecruiterProfile");
const CandidateProfile = require("../models/CandidateProfile");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.userId }, { $setOnInsert: { userId: req.user.userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate("companyId");
  res.json({ success: true, data: profile });
});
const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["jobTitle", "phone", "bio", "companyId"];
  const updates = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) updates[key] = req.body[key];
  if (!Object.keys(updates).length) throw new AppError("Provide at least one editable profile field.", 400);
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId: req.user.userId }, { $set: updates, $setOnInsert: { userId: req.user.userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate("companyId");
  res.json({ success: true, message: "Recruiter profile updated.", data: profile });
});
const listCandidates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.skill) filter.skills = { $regex: String(req.query.skill).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (req.query.location) filter.location = { $regex: String(req.query.location).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const [items, total] = await Promise.all([
    CandidateProfile.find(filter).select("-phone").populate("userId", "name avatar").sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
    CandidateProfile.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
module.exports = { getProfile, updateProfile, listCandidates };
