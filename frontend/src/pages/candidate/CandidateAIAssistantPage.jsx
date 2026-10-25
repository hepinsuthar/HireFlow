import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Target,
  FileCheck2,
  HelpCircle,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Send,
  RefreshCw,
  Cpu,
  ShieldCheck
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton } from "../../components/common/UI";

export function CandidateAIAssistantPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("insights"); // 'insights' | 'tailor' | 'interview'

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);

  // 1. Resume Insights State
  const [insightsResult, setInsightsResult] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // 2. Interview Prep State
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    async function loadPublishedJobs() {
      try {
        setLoadingJobs(true);
        const res = await api.get("/jobs?status=published&limit=20");
        if (res.success && res.data) {
          setJobs(res.data);
          if (res.data.length > 0) setSelectedJobId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load jobs for AI assistant", err);
      } finally {
        setLoadingJobs(false);
      }
    }
    loadPublishedJobs();
  }, []);

  const handleGenerateInsights = async (forTailoring = false) => {
    try {
      setLoadingInsights(true);
      const payload = {};
      if (forTailoring && selectedJobId) {
        payload.jobId = selectedJobId;
      }
      const res = await api.post("/ai/resume-insights", payload);
      if (res.success) {
        setInsightsResult(res.data?.insights || "Insights generated successfully.");
        showToast("AI analysis generated!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to generate AI insights. Check GEMINI_API_KEY in backend.", "error");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedJobId) {
      showToast("Please select a target job position.", "error");
      return;
    }
    try {
      setLoadingQuestions(true);
      const res = await api.post("/ai/interview-questions", {
        jobId: selectedJobId,
      });
      if (res.success) {
        setInterviewQuestions(res.data?.questions || "Questions generated successfully.");
        showToast("Interview questions generated!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to generate questions. Check GEMINI_API_KEY.", "error");
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Career Copilot</h1>
            <Badge variant="indigo" className="gap-1 text-[10px]">
              <Cpu className="w-3 h-3" /> Powered by @google/genai
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Ethical, transparent career intelligence. Receive honest resume feedback and practice role-specific interview questions.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("insights")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "insights"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Resume Analysis & Strengths
        </button>
        <button
          onClick={() => setActiveTab("tailor")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "tailor"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Targeted Job Tailoring
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "interview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mock Interview Coach
        </button>
      </div>

      {/* Tab 1: General Resume Insights */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Comprehensive Profile Evaluation</h3>
                <p className="text-xs text-slate-500">
                  Analyze your profile and resume data for keyword alignment, formatting strength, and skill completeness.
                </p>
              </div>
              <Button
                size="sm"
                isLoading={loadingInsights}
                onClick={() => handleGenerateInsights(false)}
                className="gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4" /> Run AI Profile Analysis
              </Button>
            </div>

            {insightsResult ? (
              <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {insightsResult}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Click "Run AI Profile Analysis" to generate recommendations from Google Gemini.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Targeted Job Tailoring */}
      {activeTab === "tailor" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Tailor Profile to a Specific Position</h3>
            <p className="text-xs text-slate-500">
              Select one of our verified employer openings. The AI copilot will highlight which of your genuine experiences best match the job requirements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Job Opening
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} • {j.companyId?.name || "Company"} ({j.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  size="md"
                  className="w-full gap-1.5 text-xs"
                  isLoading={loadingInsights}
                  onClick={() => handleGenerateInsights(true)}
                >
                  <Sparkles className="w-4 h-4" /> Tailor Resume
                </Button>
              </div>
            </div>

            {insightsResult ? (
              <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {insightsResult}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select a job and click "Tailor Resume" to inspect contextual improvements.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Mock Interview Practice */}
      {activeTab === "interview" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Generate Practice Interview Questions</h3>
            <p className="text-xs text-slate-500">
              Prepare for upcoming conversations with role-specific technical, behavioral, and architectural questions based on the job requirements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Interview Role
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} • {j.companyId?.name || "Company"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  size="md"
                  className="w-full gap-1.5 text-xs"
                  isLoading={loadingQuestions}
                  onClick={handleGenerateQuestions}
                >
                  <HelpCircle className="w-4 h-4" /> Generate Practice Questions
                </Button>
              </div>
            </div>

            {interviewQuestions ? (
              <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {interviewQuestions}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select a role and click "Generate Practice Questions" to start preparing.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Safeguards footer note */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Ethical AI Guard: Suggestions are guidance only. Prompts strictly forbid generating fabricated credentials or false claims.
        </span>
      </div>
    </div>
  );
}
