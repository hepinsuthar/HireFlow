import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowLeft,
  Send,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, Modal, LoadingSkeleton } from "../../components/common/UI";
import { ExplainableMatchCard } from "../../components/candidate/ExplainableMatchCard";

export function CandidateJobDetailPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Apply modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // AI Match Explanation
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    async function loadJobData() {
      try {
        setLoading(true);
        const [jobRes, profRes, resRes, appsRes, savedRes, matchRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get("/candidates/profile").catch(() => ({ success: false })),
          api.get("/resumes").catch(() => ({ success: false })),
          api.get("/applications/mine").catch(() => ({ success: false })),
          api.get("/saved-jobs").catch(() => ({ success: false })),
          api.get(`/jobs/${jobId}/match`).catch(() => ({ success: false })),
        ]);

        if (jobRes.success) setJob(jobRes.data);
        if (profRes.success) setProfile(profRes.data);
        if (matchRes.success) setMatchData(matchRes.data);
        if (resRes.success) {
          const rList = resRes.data || [];
          setResumes(rList);
          if (rList.length > 0) setSelectedResumeId(rList[0]._id);
        }
        if (appsRes.success && Array.isArray(appsRes.data)) {
          const applied = appsRes.data.some((a) => (a.jobId?._id || a.jobId) === jobId);
          setHasApplied(applied);
        }
        if (savedRes.success && Array.isArray(savedRes.data)) {
          const saved = savedRes.data.some((s) => (s.jobId?._id || s.jobId) === jobId);
          setIsSaved(saved);
        }
      } catch (err) {
        showToast(err.message || "Failed to load job details", "error");
      } finally {
        setLoading(false);
      }
    }
    loadJobData();
  }, [jobId]);

  // Deterministic match score calculation
  const candidateSkills = new Set((profile?.skills || []).map((s) => s.toLowerCase()));
  const requiredSkills = job?.skills || [];
  const matchedSkills = requiredSkills.filter((s) => candidateSkills.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter((s) => !candidateSkills.has(s.toLowerCase()));
  const matchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  const handleToggleSave = async () => {
    try {
      const res = await api.post(`/saved-jobs/toggle/${jobId}`);
      if (res.success) {
        setIsSaved(!isSaved);
        showToast(isSaved ? "Job removed from bookmarks" : "Job bookmarked!", "success");
      }
    } catch (err) {
      showToast(err.message || "Action failed", "error");
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedResumeId && resumes.length > 0) {
      showToast("Please select a resume", "error");
      return;
    }

    try {
      setIsApplying(true);
      const res = await api.post("/applications", {
        jobId,
        resumeId: selectedResumeId || undefined,
        coverLetter,
      });
      if (res.success) {
        showToast("Application submitted successfully!", "success");
        setHasApplied(true);
        setApplyModalOpen(false);
        navigate("/candidate/applications");
      }
    } catch (err) {
      showToast(err.message || "Failed to submit application", "error");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRequestAiInsights = async () => {
    try {
      setLoadingAi(true);
      const res = await api.post("/ai/resume-insights", {
        jobId,
        resumeId: selectedResumeId || undefined,
      });
      if (res.success) {
        setAiExplanation(res.data?.insights || "Analysis completed.");
      }
    } catch (err) {
      showToast(err.message || "AI insight request failed. Check GEMINI_API_KEY.", "error");
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <p className="text-sm text-slate-500">Job position not found or has expired.</p>
        <Link to="/candidate/jobs">
          <Button size="sm">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        to="/candidate/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Explore Jobs
      </Link>

      {/* Hero Header */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.companyId?.name || "Verified Employer"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location || "Remote"}
              </span>
              <span>•</span>
              <span className="capitalize">{job.workMode || "remote"}</span>
              <span>•</span>
              <span className="capitalize">{job.employmentType || "full-time"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : "border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
              title={isSaved ? "Saved" : "Save Job"}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-indigo-600" : ""}`} />
            </button>
            {hasApplied ? (
              <Badge variant="emerald" className="py-2 px-3 text-xs gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Applied
              </Badge>
            ) : job.status !== "published" ? (
              <Badge variant="slate" className="py-2 px-3 text-xs">
                Job Closed
              </Badge>
            ) : (
              <Button size="md" onClick={() => setApplyModalOpen(true)}>
                Apply for Position
              </Button>
            )}
          </div>
        </div>

      </Card>

      {/* Signature Feature: Explainable Match & Evidence Breakdown */}
      <ExplainableMatchCard
        match={matchData}
        jobId={jobId}
        onAddEvidenceClick={() => navigate("/candidate/profile")}
      />

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Description */}
          <Card className="p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Job Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>

            {job.requirements && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Requirements & Qualifications</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Role Specifications</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Work Mode</span>
                <p className="font-semibold text-slate-800 capitalize mt-0.5">{job.workMode || "Remote"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Employment Type</span>
                <p className="font-semibold text-slate-800 capitalize mt-0.5">{job.employmentType || "Full-Time"}</p>
              </div>
              {job.salaryMin && (
                <div>
                  <span className="text-slate-400 font-medium">Compensation Range</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k USD
                  </p>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-medium">Office Location</span>
                <p className="font-semibold text-slate-800 mt-0.5">{job.location || "Worldwide"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-900">Required Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((skill, idx) => {
                  const isMatched = candidateSkills.has(skill.toLowerCase());
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                        isMatched
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isMatched ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : null}
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Resume *
            </label>
            {resumes.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                <p>You haven’t uploaded any resumes yet.</p>
                <Link to="/candidate/resume">
                  <Button size="sm" variant="outline">Upload Resume First</Button>
                </Link>
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.originalName || r.fileName || "Resume"} (Uploaded {new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cover Letter / Note (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Why are you a great fit for this position? Highlight relevant experiences..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isApplying}
              disabled={resumes.length === 0}
              className="gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
