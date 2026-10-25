const CandidateProfile = require("../models/CandidateProfile");
const Application = require("../models/Application");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const fields = ["headline", "phone", "location", "bio", "skills", "skillEvidence", "education", "experience", "projects"];

function isValidHttpUrl(string) {
  if (!string || typeof string !== "string") return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

const getProfile = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId: req.user.userId },
    { $setOnInsert: { userId: req.user.userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate("userId", "name email avatar");
  res.json({ success: true, data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const updates = {};
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) updates[field] = body[field];
  }
  if (!Object.keys(updates).length) throw new AppError("Provide at least one editable profile field.", 400);

  for (const field of ["skills", "skillEvidence", "education", "experience", "projects"]) {
    if (field in updates && !Array.isArray(updates[field])) throw new AppError(`${field} must be an array.`, 400);
  }
  if ("skills" in updates && !updates.skills.every((skill) => typeof skill === "string" && skill.trim().length <= 80)) {
    throw new AppError("Skills must be strings no longer than 80 characters.", 400);
  }

  // Calculate profile completion percentage
  let completeness = 0;
  if (updates.headline || body.headline) completeness += 15;
  if (updates.bio || body.bio) completeness += 15;
  if ((updates.skills || []).length >= 3) completeness += 20;
  if ((updates.experience || []).length > 0) completeness += 20;
  if ((updates.education || []).length > 0) completeness += 10;
  if ((updates.projects || []).length > 0 || (updates.skillEvidence || []).length > 0) completeness += 20;
  updates.profileCompletion = Math.min(100, completeness);

  const profile = await CandidateProfile.findOneAndUpdate(
    { userId: req.user.userId },
    { $set: updates, $setOnInsert: { userId: req.user.userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).populate("userId", "name email avatar");

  res.json({ success: true, message: "Candidate profile updated successfully.", data: profile });
});

const getSkillEvidence = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  const evidence = profile?.skillEvidence || [];
  res.json({ success: true, data: evidence });
});

const addSkillEvidence = asyncHandler(async (req, res) => {
  const { skill, evidenceType = "project", title, description = "", contribution = "", url = "", linkedProjectId, linkedExperienceId } = req.body || {};

  if (!skill || typeof skill !== "string" || !skill.trim()) {
    throw new AppError("Skill name is required.", 400);
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    throw new AppError("Evidence title is required (e.g. Project Name, Repository, or Role).", 400);
  }
  if (url && typeof url === "string" && url.trim()) {
    if (!isValidHttpUrl(url.trim())) {
      throw new AppError("Please provide a valid HTTP or HTTPS URL for your project/repository.", 400);
    }
  }

  const allowedTypes = ["project", "work_experience", "education", "repository", "portfolio", "certification", "other"];
  if (!allowedTypes.includes(evidenceType)) {
    throw new AppError(`Invalid evidence type. Allowed types: ${allowedTypes.join(", ")}`, 400);
  }

  const profile = await CandidateProfile.findOneAndUpdate(
    { userId: req.user.userId },
    { $setOnInsert: { userId: req.user.userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const cleanSkill = skill.trim();
  const evidenceItem = {
    skill: cleanSkill,
    evidenceType,
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    contribution: typeof contribution === "string" ? contribution.trim() : "",
    url: typeof url === "string" ? url.trim() : "",
    linkedProjectId: linkedProjectId || null,
    linkedExperienceId: linkedExperienceId || null,
    verificationStatus: "self_reported", // Accurately designated self-reported per specification
    createdAt: new Date()
  };

  profile.skillEvidence.push(evidenceItem);

  // Automatically register skill in skills list if not present
  if (!profile.skills.some((s) => s.toLowerCase() === cleanSkill.toLowerCase())) {
    profile.skills.push(cleanSkill);
  }

  await profile.save();
  const addedItem = profile.skillEvidence[profile.skillEvidence.length - 1];

  res.status(201).json({
    success: true,
    message: "Skill evidence recorded successfully.",
    data: addedItem
  });
});

const updateSkillEvidence = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { skill, evidenceType, title, description, contribution, url } = req.body || {};

  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  if (!profile) throw new AppError("Candidate profile not found.", 404);

  const item = profile.skillEvidence.id(id);
  if (!item) throw new AppError("Evidence record not found.", 404);

  if (skill !== undefined) {
    if (!skill || typeof skill !== "string" || !skill.trim()) throw new AppError("Skill name cannot be empty.", 400);
    item.skill = skill.trim();
  }
  if (title !== undefined) {
    if (!title || typeof title !== "string" || !title.trim()) throw new AppError("Title cannot be empty.", 400);
    item.title = title.trim();
  }
  if (evidenceType !== undefined) {
    const allowedTypes = ["project", "work_experience", "education", "repository", "portfolio", "certification", "other"];
    if (!allowedTypes.includes(evidenceType)) throw new AppError("Invalid evidence type.", 400);
    item.evidenceType = evidenceType;
  }
  if (url !== undefined) {
    if (url && !isValidHttpUrl(url.trim())) throw new AppError("Invalid URL format. Must begin with http:// or https://", 400);
    item.url = url ? url.trim() : "";
  }
  if (description !== undefined) item.description = String(description).trim();
  if (contribution !== undefined) item.contribution = String(contribution).trim();

  await profile.save();

  res.json({
    success: true,
    message: "Skill evidence updated successfully.",
    data: item
  });
});

const deleteSkillEvidence = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  if (!profile) throw new AppError("Candidate profile not found.", 404);

  const item = profile.skillEvidence.id(id);
  if (!item) throw new AppError("Evidence record not found.", 404);

  profile.skillEvidence.pull(id);
  await profile.save();

  res.json({
    success: true,
    message: "Skill evidence removed successfully."
  });
});

const myApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const filter = { candidateId: req.user.userId };
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ appliedAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate({ path: "jobId", populate: { path: "companyId", select: "name logo" } })
      .populate("resumeId", "fileName fileUrl"),
    Application.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

const listCandidates = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};

  if (req.query.skill) {
    filter.skills = { $regex: String(req.query.skill).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }
  if (req.query.location) {
    filter.location = { $regex: String(req.query.location).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const [items, total] = await Promise.all([
    CandidateProfile.find(filter)
      .populate("userId", "name avatar")
      .select("headline location bio skills skillEvidence experience projects profileCompletion updatedAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: -1 }),
    CandidateProfile.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getSkillEvidence,
  addSkillEvidence,
  updateSkillEvidence,
  deleteSkillEvidence,
  myApplications,
  listCandidates
};
