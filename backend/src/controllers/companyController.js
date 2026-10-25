const Company = require("../models/Company");
const RecruiterProfile = require("../models/RecruiterProfile");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

function makeSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
}
const createCompany = asyncHandler(async (req, res) => {
  const { name, description, website, industry, location, size, foundedYear, logo } = req.body || {};
  if (typeof name !== "string" || name.trim().length < 2) throw new AppError("Company name is required.", 400);
  const company = await Company.create({ name: name.trim(), slug: makeSlug(name), description, website, industry, location, size, foundedYear, logo, createdBy: req.user.userId });
  await RecruiterProfile.findOneAndUpdate({ userId: req.user.userId }, { companyId: company._id }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.status(201).json({ success: true, message: "Company created successfully.", data: company });
});
const listCompanies = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const filter = { isActive: true };
  if (req.query.search) filter.$text = { $search: String(req.query.search) };
  const [items, total] = await Promise.all([
    Company.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Company.countDocuments(filter)
  ]);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company || (!company.isActive && req.user?.role !== "admin")) throw new AppError("Company not found.", 404);
  res.json({ success: true, data: company });
});
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError("Company not found.", 404);
  if (req.user.role !== "admin" && company.createdBy.toString() !== req.user.userId) throw new AppError("You cannot modify this company.", 403);
  const allowed = ["name", "description", "website", "industry", "location", "size", "foundedYear", "logo", "isActive"];
  for (const key of allowed) if (key in (req.body || {})) company[key] = req.body[key];
  await company.save();
  res.json({ success: true, message: "Company updated.", data: company });
});
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError("Company not found.", 404);
  if (req.user.role !== "admin" && company.createdBy.toString() !== req.user.userId) throw new AppError("You cannot modify this company.", 403);
  company.isActive = false;
  await company.save();
  await Job.updateMany({ companyId: company._id, status: { $ne: "closed" } }, { status: "closed" });
  res.json({ success: true, message: "Company deactivated and its open jobs closed." });
});
module.exports = { createCompany, listCompanies, getCompany, updateCompany, deleteCompany };
