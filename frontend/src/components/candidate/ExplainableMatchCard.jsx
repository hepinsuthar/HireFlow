import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Info,
  Clock,
  Briefcase,
  GraduationCap,
  FolderGit2
} from "lucide-react";
import { Card, Button, Badge } from "../common/UI";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export function ExplainableMatchCard({ match, jobId, onAddEvidenceClick }) {
  const { showToast } = useToast();
  const [showFormula, setShowFormula] = useState(false);
  const [activeTab, setActiveTab] = useState("skills"); // 'skills' | 'experience' | 'actionPlan'
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiPlan, setAiPlan] = useState(null);

  if (!match) return null;

  const {
    score = 0,
    isProfileIncomplete,
    profileCompleteness = 0,
    confidenceDisclosure,
    formulaExplanation = {},
    breakdown = {},
    actionPlan = []
  } = match;

  const required = breakdown.requiredSkills || {};
  const optional = breakdown.optionalSkills || {};
  const exp = breakdown.experience || {};
  const proj = breakdown.projects || {};
  const edu = breakdown.education || {};

  const demonstrated = required.demonstratedWithEvidence || [];
  const claimed = required.claimedWithoutEvidence || [];
  const missing = required.notDemonstrated || [];

  const handleFetchAiPlan = async () => {
    try {
      setLoadingAi(true);
      const res = await api.post("/ai/skill-gap-plan", { jobId });
      if (res.success && res.data) {
        setAiPlan(res.data);
        showToast("Gemini AI synthesized customized gap recommendations!", "success");
      }
    } catch (err) {
      showToast(err.message || "AI copilot currently unavailable. Using deterministic plan.", "info");
    } finally {
      setLoadingAi(false);
    }
  };

  // Score color scheme
  const getScoreTheme = (val) => {
    if (val >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "stroke-emerald-500" };
    if (val >= 60) return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", ring: "stroke-indigo-500" };
    if (val >= 40) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "stroke-amber-500" };
    return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", ring: "stroke-slate-400" };
  };

  const theme = getScoreTheme(score);

  return (
    <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-6">
      {/* 1. Header with Deterministic Score & Profile Disclosure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Explainable Candidate-Job Alignment
            </h3>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Deterministic Math
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {confidenceDisclosure}
          </p>

          {isProfileIncomplete && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>
                Profile completeness is only {profileCompleteness}%. Add missing skills and projects in your profile for higher accuracy.
              </span>
            </div>
          )}
        </div>

        {/* Circular Score Gauge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${theme.ring} transition-all duration-1000 ease-out`}
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
              <span className={`text-xl font-black ${theme.text}`}>{score}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Match</span>
            </div>
          </div>

          <div className="text-left text-xs space-y-1">
            <div className="font-bold text-slate-800">
              {score >= 75 ? "Strong Evidence Alignment" : score >= 50 ? "Moderate Alignment" : "Emerging Alignment"}
            </div>
            <button
              type="button"
              onClick={() => setShowFormula(!showFormula)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <span>{showFormula ? "Hide Formula" : "Inspect Calculation"}</span>
              {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Expandable Formula Transparency Breakdown */}
      {showFormula && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="font-bold text-slate-800">Deterministic Mathematical Weighting</span>
            <span className="text-[11px] text-slate-500 font-mono">100-Point Target Model</span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            {formulaExplanation.methodology}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Required Skills</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{required.score} / {required.max} pts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Backed by evidence</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Optional Skills</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{optional.score} / {optional.max} pts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Bonus competencies</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Experience</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{exp.score} / {exp.max} pts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{exp.candidateYears}y of {exp.requiredYears}y req</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Projects</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{proj.score} / {proj.max} pts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{proj.evidenceCount} verified artifacts</div>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-400">Education</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">{edu.score} / {edu.max} pts</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{edu.hasDegree ? "Degree verified" : "Self-taught / None"}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "skills"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Skills & Evidence Breakdown ({demonstrated.length + claimed.length + missing.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "experience"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Seniority & Experience Comparison
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("actionPlan")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === "actionPlan"
              ? "bg-indigo-600 text-white"
              : "text-indigo-600 hover:bg-indigo-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Skill Gap Action Plan ({actionPlan.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Skills & Evidence Coverage */}
      {activeTab === "skills" && (
        <div className="space-y-4 text-xs">
          {/* Demonstrated Skills with Supporting Evidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated with Evidence ({demonstrated.length})
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold">100% Credit per Criterion</span>
            </div>

            {demonstrated.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">None of the required skills currently have linked proof.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {demonstrated.map((item) => (
                  <div key={item.skill} className="p-3 rounded-xl border border-emerald-200/80 bg-emerald-50/30 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 capitalize text-xs">{item.skill}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {item.evidenceCount} Linked Proof{item.evidenceCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    {item.evidenceItems && item.evidenceItems.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {item.evidenceItems.map((e, idx) => (
                          <div key={idx} className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-900 truncate">{e.title}</span>
                              {e.url && (
                                <a
                                  href={e.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 shrink-0 text-[10px]"
                                >
                                  <span>Artifact</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            {e.contribution && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {e.contribution}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Claimed in Profile but Missing Supporting Proof */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Claimed in Profile, but Lacking Proof ({claimed.length})
              </span>
              <span className="text-[11px] text-amber-700 font-semibold">50% Partial Credit</span>
            </div>

            {claimed.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">All claimed skills have corresponding evidence items.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {claimed.map((item) => (
                  <div
                    key={item.skill}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50/50 text-slate-800"
                  >
                    <span className="font-bold capitalize">{item.skill}</span>
                    <button
                      type="button"
                      onClick={() => onAddEvidenceClick ? onAddEvidenceClick(item.skill) : null}
                      className="text-[10px] font-semibold text-amber-800 hover:underline cursor-pointer"
                    >
                      + Attach Artifact
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Required Skills */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-slate-400" />
                Not Demonstrated or Claimed ({missing.length})
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">0% Credit</span>
            </div>

            {missing.length === 0 ? (
              <p className="text-[11px] text-emerald-700 font-medium">You claim or demonstrate all required skills for this role!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missing.map((item) => (
                  <span
                    key={item.skill}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 font-semibold capitalize text-[11px]"
                  >
                    {item.skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Optional / Preferred Skills */}
          {optional.totalOptional > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 block">Optional / Preferred Competencies:</span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {optional.matched.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
                    ✓ {s} (Bonus Met)
                  </span>
                ))}
                {optional.missing.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    ○ {s} (Optional)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Experience & Education Comparison */}
      {activeTab === "experience" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-600" />
                Seniority & Experience Comparison
              </span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                exp.meetsRequirement ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {exp.meetsRequirement ? "Meets Requirement" : "Below Stated Expectation"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Your Calculated Experience</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{exp.candidateYears} Years</div>
                <div className="text-[10px] text-slate-500">Summed from verified employment history</div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Job Target Requirement</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">{exp.requiredYears} Years</div>
                <div className="text-[10px] text-slate-500">Minimum seniority threshold</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-600" />
              <div>
                <div className="font-bold text-slate-900">Education & Academic Alignment</div>
                <div className="text-[11px] text-slate-500">
                  {edu.hasDegree ? "Candidate lists degree or institutional study" : "No formal degree recorded in profile"}
                </div>
              </div>
            </div>
            <span className="font-mono font-bold text-xs text-slate-700">
              {edu.score} / {edu.max} pts
            </span>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Skill Gap Action Plan */}
      {activeTab === "actionPlan" && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">Personalized Improvement Tasks</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Concrete steps derived deterministically from the missing requirements for this role.
              </p>
            </div>

            <Button
              size="xs"
              variant="outline"
              onClick={handleFetchAiPlan}
              loading={loadingAi}
              className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthesize with Gemini</span>
            </Button>
          </div>

          {/* AI Synthesis if loaded */}
          {aiPlan?.aiRecommendations && (
            <div className="p-4 rounded-xl bg-linear-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gemini Career Copilot Analysis:</span>
              </div>
              <div className="text-[11px] text-indigo-900 whitespace-pre-line leading-relaxed">
                {aiPlan.aiRecommendations}
              </div>
            </div>
          )}

          {/* Deterministic Action Plan Items */}
          <div className="space-y-2.5">
            {actionPlan.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center font-medium">
                No skill gaps detected! Your profile demonstrates all required criteria for this position.
              </div>
            ) : (
              actionPlan.map((task, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        task.priority === "high" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className="font-bold text-slate-900">{task.skill}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{task.recommendation}</p>
                    <p className="text-[10px] text-slate-400 italic">Recommended Action: {task.action}</p>
                  </div>

                  {task.type === "unverified_skill" && onAddEvidenceClick && (
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => onAddEvidenceClick(task.skill)}
                      className="shrink-0 text-[10px]"
                    >
                      + Add Evidence
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default ExplainableMatchCard;
