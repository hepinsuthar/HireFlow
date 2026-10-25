const CandidateProfile = require("../models/CandidateProfile");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { generateText } = require("../services/aiService");
const { calculateMatch } = require("../services/matchingService");

const resumeInsights = asyncHandler(async (req, res) => {
  const { resumeId, jobId } = req.body || {};
  const resume = resumeId
    ? await Resume.findOne({ _id: resumeId, candidateId: req.user.userId })
    : await Resume.findOne({ candidateId: req.user.userId }).sort({ createdAt: -1 });
  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  if (!resume && !profile) throw new AppError("Add a candidate profile or upload a resume before requesting insights.", 400);
  const job = jobId ? await Job.findById(jobId) : null;
  const match = job ? calculateMatch(profile || {}, job) : null;
  const prompt = `Give concise resume improvement feedback based only on supplied structured data. Return strengths, gaps, and 5 actionable improvements. Do not claim to have read the file contents; use profile data only.\nProfile: ${JSON.stringify(profile || {})}\nJob: ${JSON.stringify(job ? { title: job.title, skills: job.skills, requirements: job.requirements } : {})}\nDeterministic match: ${JSON.stringify(match || {})}`;
  const insights = await generateText(prompt);
  await Resume.updateOne({ _id: resume?._id }, { $set: { analysis: { insights, match }, analysisStatus: "completed" } });
  res.json({ success: true, data: { insights, match } });
});
const interviewQuestions = asyncHandler(async (req, res) => {
  const { jobId, candidateId } = req.body || {};
  if (!jobId) throw new AppError("jobId is required.", 400);
  const job = await Job.findById(jobId);
  if (!job) throw new AppError("Job not found.", 404);
  if (req.user.role === "recruiter" && job.recruiterId.toString() !== req.user.userId) throw new AppError("You cannot use AI for this job.", 403);
  if (req.user.role === "candidate" && job.status !== "published") throw new AppError("You can only prepare interview questions for active published jobs.", 403);
  const profile = candidateId ? await CandidateProfile.findOne({ userId: candidateId }) : (req.user.role === "candidate" ? await CandidateProfile.findOne({ userId: req.user.userId }) : null);
  const output = await generateText(`Create 10 fair, job-related interview questions with a short purpose for each. Avoid protected-characteristic questions. Job: ${JSON.stringify({ title: job.title, skills: job.skills, requirements: job.requirements })}. Candidate profile: ${JSON.stringify(profile || {})}`);
  res.json({ success: true, data: { questions: output } });
});
const jobDescription = asyncHandler(async (req, res) => {
  if (!["recruiter", "admin"].includes(req.user.role)) throw new AppError("Recruiter access required.", 403);
  const { title, skills = [], experience = "", location = "", employmentType = "full-time" } = req.body || {};
  if (typeof title !== "string" || !title.trim()) throw new AppError("Job title is required.", 400);
  const output = await generateText(`Draft a clear, inclusive job description using only these details. Do not invent salary, benefits, company facts, or requirements. Include overview, responsibilities, required skills, and preferred qualifications. Title: ${title}. Skills: ${JSON.stringify(skills)}. Experience: ${experience}. Location: ${location}. Employment type: ${employmentType}.`);
  res.json({ success: true, data: { description: output } });
});

const skillGapActionPlan = asyncHandler(async (req, res) => {
  const { jobId } = req.body || {};
  if (!jobId) throw new AppError("jobId is required.", 400);

  const job = await Job.findById(jobId);
  if (!job || job.status !== "published") throw new AppError("Job not found or not published.", 404);

  const profile = await CandidateProfile.findOne({ userId: req.user.userId });
  const matchResult = calculateMatch(profile || {}, job);

  const missingSkills = matchResult.breakdown.requiredSkills.notDemonstrated.map((i) => i.skill);
  const claimedSkills = matchResult.breakdown.requiredSkills.claimedWithoutEvidence.map((i) => i.skill);
  const deterministicPlan = matchResult.actionPlan;

  let aiRecommendations = null;
  let aiEnhanced = false;

  if ((missingSkills.length > 0 || claimedSkills.length > 0) && (process.env.GEMINI_API_KEY || process.env.AI_API_KEY)) {
    try {
      const prompt = `You are a career intelligence advisor. Based ONLY on the provided job requirements and candidate gaps, provide practical improvement recommendations.
Job Title: ${job.title}
Job Requirements: ${job.requirements || "Standard requirements"}
Missing Required Skills: ${JSON.stringify(missingSkills)}
Skills Claimed Without Evidence: ${JSON.stringify(claimedSkills)}

Instructions:
1. Provide a practical project idea to build demonstrable evidence for the missing skills.
2. Provide a practical way to verify/demonstrate the skills claimed without evidence.
3. Suggest 3 key interview preparation topics for these specific gaps.
Do NOT fabricate courses, certifications, or fictional credentials. Keep suggestions actionable, ethical, and concise.`;

      aiRecommendations = await generateText(prompt);
      aiEnhanced = true;
    } catch (err) {
      console.warn("AI generation failed or unconfigured, returning deterministic action plan:", err.message);
      aiEnhanced = false;
    }
  }

  res.json({
    success: true,
    data: {
      jobId: job._id,
      jobTitle: job.title,
      score: matchResult.score,
      deterministicPlan,
      aiEnhanced,
      aiRecommendations: aiRecommendations || null
    }
  });
});

module.exports = { resumeInsights, interviewQuestions, jobDescription, skillGapActionPlan };
