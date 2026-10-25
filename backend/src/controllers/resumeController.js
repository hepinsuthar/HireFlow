const fs = require("fs");
const path = require("path");
const { cloudinary, cloudinaryConfigured } = require("../config/cloudinary");
const Resume = require("../models/Resume");
const CandidateProfile = require("../models/CandidateProfile");
const Application = require("../models/Application");
const Job = require("../models/Job");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const uploadsDir = path.join(__dirname, "../../uploads/resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Choose a resume file to upload.", 400);

  let fileUrl = "";
  let cloudinaryPublicId = "";
  let localPath = "";

  if (cloudinaryConfigured) {
    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      resource_type: "raw",
      folder: "hireflow/resumes",
      public_id: `${req.user.userId}-${Date.now()}`
    });
    fileUrl = uploaded.secure_url;
    cloudinaryPublicId = uploaded.public_id;
  } else {
    const safeName = `${req.user.userId}-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const destPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(destPath, req.file.buffer);
    localPath = destPath;
    fileUrl = `/api/resumes/temp/${safeName}`;
  }

  const resume = await Resume.create({
    candidateId: req.user.userId,
    fileName: req.file.originalname,
    fileUrl,
    cloudinaryPublicId,
    localPath,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    analysisStatus: "pending"
  });

  if (!cloudinaryConfigured) {
    resume.fileUrl = `/api/resumes/${resume._id}/file`;
    await resume.save();
  }

  await CandidateProfile.findOneAndUpdate(
    { userId: req.user.userId },
    { resumeId: resume._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, message: "Resume uploaded successfully.", data: resume });
});

const listMine = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ candidateId: req.user.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: resumes });
});

const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, candidateId: req.user.userId });
  if (!resume) throw new AppError("Resume not found.", 404);

  if (cloudinaryConfigured && resume.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: "raw" });
  } else if (resume.localPath && fs.existsSync(resume.localPath)) {
    try {
      fs.unlinkSync(resume.localPath);
    } catch {}
  }

  await resume.deleteOne();
  await CandidateProfile.updateOne({ userId: req.user.userId, resumeId: resume._id }, { $set: { resumeId: null } });
  res.json({ success: true, message: "Resume deleted." });
});

const getResumeFile = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) throw new AppError("Resume not found.", 404);

  let authorized = false;
  if (req.user.role === "admin") {
    authorized = true;
  } else if (req.user.role === "candidate" && resume.candidateId.toString() === req.user.userId) {
    authorized = true;
  } else if (req.user.role === "recruiter") {
    const recruiterJobs = await Job.find({ recruiterId: req.user.userId }).select("_id");
    const jobIds = recruiterJobs.map((j) => j._id);
    const hasApplication = await Application.exists({
      resumeId: resume._id,
      jobId: { $in: jobIds }
    });
    if (hasApplication) authorized = true;
  }

  if (!authorized) {
    throw new AppError("You are not authorized to access this resume.", 403);
  }

  if (resume.cloudinaryPublicId && resume.fileUrl && resume.fileUrl.startsWith("http")) {
    return res.redirect(resume.fileUrl);
  }

  if (resume.localPath && fs.existsSync(resume.localPath)) {
    res.setHeader("Content-Type", resume.fileType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${resume.fileName}"`);
    const stream = fs.createReadStream(resume.localPath);
    return stream.pipe(res);
  }

  throw new AppError("Resume file is not accessible on the server.", 404);
});

module.exports = { uploadResume, listMine, deleteResume, getResumeFile };
