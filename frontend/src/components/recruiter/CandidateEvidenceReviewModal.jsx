import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  FileCheck2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Send,
  User,
  History,
  FileText
} from "lucide-react";
import { Modal, Button, Badge, LoadingSkeleton } from "../common/UI";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const EVIDENCE_ICON_MAP = {
  project: FolderGit2,
  repository: FolderGit2,
  work_experience: Briefcase,
  portfolio: Globe,
  certification: Award,
  education: GraduationCap,
  other: FileCheck2
};

export function CandidateEvidenceReviewModal({ isOpen, onClose, applicationId, onEvaluationSaved }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState(null);

  // Evaluation Form State
  const [activeTab, setActiveTab] = useState("evidence"); // 'evidence' | 'evaluate' | 'history'
  const [criteriaRatings, setCriteriaRatings] = useState({});
  const [criteriaComments, setCriteriaComments] = useState({});
  const [overallAssessment, setOverallAssessment] = useState("");
  const [recommendation, setRecommendation] = useState("hold");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    async function loadApplicationDetails() {
      try {
        setLoading(true);
        const res = await api.get(`/applications/${applicationId}`);
        if (res.success && res.data) {
          setAppData(res.data);

          // Pre-populate criteria ratings with required skills from job
          const jobSkills = res.data.application?.jobId?.skills || [];
          const initialRatings = {};
          const initialComments = {};

          const liveMatch = res.data.liveMatch?.breakdown?.requiredSkills;
          const demonstratedSet = new Set((liveMatch?.demonstratedWithEvidence || []).map((i) => i.skill.toLowerCase()));
          const claimedSet = new Set((liveMatch?.claimedWithoutEvidence || []).map((s) => s.toLowerCase()));

          jobSkills.forEach((skill) => {
            const lower = skill.toLowerCase();
            if (demonstratedSet.has(lower)) {
              initialRatings[skill] = "meets";
            } else if (claimedSet.has(lower)) {
              initialRatings[skill] = "needs_evidence";
            } else {
              initialRatings[skill] = "not_met";
            }
            initialComments[skill] = "";
          });

          setCriteriaRatings(initialRatings);
          setCriteriaComments(initialComments);
        }
      } catch (err) {
        showToast(err.message || "Failed to load application details", "error");
      } finally {
        setLoading(false);
      }
    }

    loadApplicationDetails();
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  const app = appData?.application;
  const profile = appData?.candidateProfile;
  const match = appData?.liveMatch;
  const evaluations = app?.evaluations || [];

  const requiredBreakdown = match?.breakdown?.requiredSkills || {};
  const demonstrated = requiredBreakdown.demonstratedWithEvidence || [];
  const claimed = requiredBreakdown.claimedWithoutEvidence || [];
  const missing = requiredBreakdown.notDemonstrated || [];

  const handleRatingChange = (criterion, rating) => {
    setCriteriaRatings((prev) => ({ ...prev, [criterion]: rating }));
  };

  const handleCommentChange = (criterion, comment) => {
    setCriteriaComments((prev) => ({ ...prev, [criterion]: comment }));
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!overallAssessment.trim()) {
      showToast("Please provide an overall assessment note before submitting.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const criteriaFeedback = Object.keys(criteriaRatings).map((criterion) => ({
        criterion,
        rating: criteriaRatings[criterion],
        comment: criteriaComments[criterion] || ""
      }));

      const payload = {
        criteriaFeedback,
        overallAssessment,
        recommendation
      };

      const res = await api.post(`/applications/${applicationId}/evaluate`, payload);
      if (res.success) {
        showToast("Human evidence evaluation successfully recorded!", "success");
        if (onEvaluationSaved) onEvaluationSaved();
        onClose();
      }
    } catch (err) {
      showToast(err.message || "Failed to record evaluation", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Evidence & Criteria Review"
      size="xl"
    >
      {loading ? (
        <div className="p-6 space-y-4">
          <LoadingSkeleton count={3} />
        </div>
      ) : !app ? (
        <div className="p-6 text-center text-xs text-slate-500">
          Application records could not be loaded.
        </div>
      ) : (
        <div className="space-y-6 text-xs text-slate-700">
          {/* Header Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900">
                  {app.candidateId?.name || "Candidate"}
                </span>
                <Badge variant="indigo" className="text-[10px] capitalize">
                  {app.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-slate-500 text-[11px]">
                Applied for <strong className="text-slate-800">{app.jobId?.title}</strong> on{" "}
                {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
              </p>
              {profile?.headline && (
                <p className="text-slate-600 text-[11px] font-medium">{profile.headline}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {match && (
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Deterministic Match</div>
                  <div className="text-xl font-extrabold text-indigo-700">{match.score}%</div>
                </div>
              )}
              {app.resumeId?.fileUrl && (
                <a
                  href={app.resumeId.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> View Resume
                </a>
              )}
            </div>
          </div>

          {/* Confidence Disclosure if profile incomplete */}
          {match?.isProfileIncomplete && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-[11px]">Incomplete Candidate Profile Disclosure</div>
                <div className="text-[11px] text-amber-800">{match.confidenceDisclosure}</div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("evidence")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === "evidence"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Requirements & Evidence ({demonstrated.length + claimed.length + missing.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("evaluate")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === "evaluate"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Structured Evaluation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Evaluation History ({evaluations.length})
            </button>
          </div>

          {/* TAB 1: EVIDENCE & REQUIREMENTS */}
          {activeTab === "evidence" && (
            <div className="space-y-5">
              {/* Category A: Demonstrated with Evidence */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Demonstrated with Evidence ({demonstrated.length})
                </div>

                {demonstrated.length === 0 ? (
                  <p className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-xs italic">
                    No concrete project or artifact evidence has been linked for the required skills.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {demonstrated.map((item, idx) => {
                      const proof = item.evidence;
                      const Icon = (proof && EVIDENCE_ICON_MAP[proof.evidenceType]) || FolderGit2;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-xs">
                                {item.skill}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <ShieldAlert className="w-2.5 h-2.5 text-amber-600" /> Self-Reported
                              </span>
                            </div>
                            {proof?.url && (
                              <a
                                href={proof.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> Inspect Artifact
                              </a>
                            )}
                          </div>

                          {proof && (
                            <div className="space-y-1.5 pt-1 border-t border-emerald-100">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                                <Icon className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{proof.title}</span>
                              </div>
                              {proof.description && (
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  {proof.description}
                                </p>
                              )}
                              {proof.contribution && (
                                <div className="p-2 rounded bg-white/80 border border-emerald-100 text-[11px] text-slate-700">
                                  <strong className="text-slate-900 font-semibold">Candidate's Stated Contribution: </strong>
                                  {proof.contribution}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category B: Claimed Without Evidence */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Claimed in Profile Without Supporting Proof ({claimed.length})
                </div>

                {claimed.length === 0 ? (
                  <p className="text-slate-400 text-[11px] italic">None</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {claimed.map((s, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{s}</span>
                        <span className="text-[10px] text-amber-600 font-normal">(no artifact attached)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category C: Missing / Not Demonstrated */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Not Demonstrated in Available Profile ({missing.length})
                </div>

                {missing.length === 0 ? (
                  <p className="text-slate-400 text-[11px] italic">All job requirements are claimed or demonstrated.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {missing.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURED EVALUATION */}
          {activeTab === "evaluate" && (
            <form onSubmit={handleSubmitEvaluation} className="space-y-5">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Requirement Coverage & Verification
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Rate the candidate's demonstrated competency against each specific job criterion. Automated scores do not replace human evaluation.
                </p>

                <div className="space-y-3">
                  {Object.keys(criteriaRatings).map((crit) => (
                    <div
                      key={crit}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-slate-900 text-xs">{crit}</span>
                        <div className="flex items-center gap-1.5">
                          {[
                            { value: "exceeds", label: "Exceeds", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
                            { value: "meets", label: "Meets", color: "bg-blue-50 text-blue-700 border-blue-300" },
                            { value: "needs_evidence", label: "Needs Proof", color: "bg-amber-50 text-amber-700 border-amber-300" },
                            { value: "not_met", label: "Not Met", color: "bg-rose-50 text-rose-700 border-rose-300" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleRatingChange(crit, opt.value)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all ${
                                criteriaRatings[crit] === opt.value
                                  ? `${opt.color} ring-2 ring-indigo-500 font-bold shadow-xs`
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Optional recruiter observation note for this criterion..."
                        value={criteriaComments[crit] || ""}
                        onChange={(e) => handleCommentChange(crit, e.target.value)}
                        className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Assessment */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Overall Human Assessment *
                </label>
                <textarea
                  rows={3}
                  placeholder="Record your holistic evaluation of candidate proof, technical depth, interview readiness, and areas of concern..."
                  value={overallAssessment}
                  onChange={(e) => setOverallAssessment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Recommendation */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Recruiter Recommendation *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "advance", label: "Advance to Next Stage", desc: "Sufficient evidence demonstrated" },
                    { value: "hold", label: "Hold / Request Proof", desc: "Needs clarification or additional artifacts" },
                    { value: "reject", label: "Decline Candidate", desc: "Significant criteria gap" }
                  ].map((rec) => (
                    <button
                      key={rec.value}
                      type="button"
                      onClick={() => setRecommendation(rec.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        recommendation === rec.value
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">{rec.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{rec.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Save Evaluation
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: EVALUATION HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {evaluations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic">
                  No evaluations have been recorded for this application yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluations.map((ev, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-bold text-slate-900 text-xs">
                            {ev.evaluatorId?.name || "Recruiter"}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(ev.evaluatedAt).toLocaleString()}
                          </span>
                        </div>
                        <Badge
                          variant={
                            ev.recommendation === "advance"
                              ? "success"
                              : ev.recommendation === "reject"
                              ? "error"
                              : "amber"
                          }
                          className="capitalize text-[10px]"
                        >
                          {ev.recommendation}
                        </Badge>
                      </div>

                      {ev.overallAssessment && (
                        <p className="text-slate-700 text-xs leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                          {ev.overallAssessment}
                        </p>
                      )}

                      {ev.criteriaFeedback && ev.criteriaFeedback.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                            Criteria Breakdown:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ev.criteriaFeedback.map((cf, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2 rounded bg-white border border-slate-100 flex items-center justify-between text-[11px]"
                              >
                                <span className="font-medium text-slate-800">{cf.criterion}</span>
                                <span className="font-bold capitalize text-slate-600 text-[10px]">
                                  {cf.rating?.replace("_", " ")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
