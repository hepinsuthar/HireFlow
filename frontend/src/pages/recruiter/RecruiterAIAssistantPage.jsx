import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Briefcase,
  HelpCircle,
  Copy,
  Check,
  Cpu,
  ShieldCheck,
  Send
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge } from "../../components/common/UI";

export function RecruiterAIAssistantPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("jd"); // 'jd' | 'questions'

  // JD Drafter State
  const [jdTitle, setJdTitle] = useState("");
  const [jdSkills, setJdSkills] = useState("");
  const [jdLocation, setJdLocation] = useState("Remote");
  const [jdEmploymentType, setJdEmploymentType] = useState("full-time");
  const [jdOutput, setJdOutput] = useState("");
  const [draftingJd, setDraftingJd] = useState(false);

  // Question Generator State
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [questionsOutput, setQuestionsOutput] = useState("");
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await api.get("/jobs?status=published&limit=20");
        if (res.success && res.data) {
          setJobs(res.data);
          if (res.data.length > 0) setSelectedJobId(res.data[0]._id);
        }
      } catch (err) {}
    }
    loadJobs();
  }, []);

  const handleDraftJd = async (e) => {
    e.preventDefault();
    if (!jdTitle.trim()) {
      showToast("Please enter a role title", "error");
      return;
    }

    try {
      setDraftingJd(true);
      const skillsArr = jdSkills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await api.post("/ai/job-description", {
        title: jdTitle.trim(),
        skills: skillsArr,
        location: jdLocation,
        employmentType: jdEmploymentType,
      });

      if (res.success && res.data?.description) {
        setJdOutput(res.data.description);
        showToast("Job description drafted with Gemini AI!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to generate job description. Check GEMINI_API_KEY.", "error");
    } finally {
      setDraftingJd(false);
    }
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      showToast("Please select a target job", "error");
      return;
    }

    try {
      setGeneratingQuestions(true);
      const res = await api.post("/ai/interview-questions", {
        jobId: selectedJobId,
      });

      if (res.success && res.data?.questions) {
        setQuestionsOutput(res.data.questions);
        showToast("Interview questions generated!", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to generate questions. Check GEMINI_API_KEY.", "error");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Talent Intelligence</h1>
          <Badge variant="blue" className="gap-1 text-[10px]">
            <Cpu className="w-3 h-3" /> Powered by @google/genai
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Accelerate your recruitment workflow with Gemini AI job drafting and structured interview preparation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("jd")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "jd"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Job Description Drafter
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "questions"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Interview Question Generator
        </button>
      </div>

      {/* Tab 1: JD Drafter */}
      {activeTab === "jd" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-5 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Role Parameters</h3>
            <form onSubmit={handleDraftJd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Architect"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Core Skills (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Next.js, GraphQL"
                  value={jdSkills}
                  onChange={(e) => setJdSkills(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work Mode
                  </label>
                  <select
                    value={jdLocation}
                    onChange={(e) => setJdLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Type
                  </label>
                  <select
                    value={jdEmploymentType}
                    onChange={(e) => setJdEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="contract">Contract</option>
                    <option value="part-time">Part-Time</option>
                  </select>
                </div>
              </div>

              <Button type="submit" size="sm" className="w-full gap-1.5" isLoading={draftingJd}>
                <Sparkles className="w-4 h-4" /> Generate Spec with Gemini AI
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-7 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">AI Generated Draft</h3>
              {jdOutput && (
                <button
                  onClick={() => handleCopy(jdOutput)}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Draft"}
                </button>
              )}
            </div>

            {jdOutput ? (
              <textarea
                rows={14}
                value={jdOutput}
                onChange={(e) => setJdOutput(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Fill out the parameters on the left and click Generate.</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Interview Questions */}
      {activeTab === "questions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <Card className="lg:col-span-5 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Target Role</h3>
            <form onSubmit={handleGenerateQuestions} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Job Position *
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {jobs.map((j) => (
                    <option key={j._id} value={j._id}>
                      {j.title} ({j.workMode})
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" size="sm" className="w-full gap-1.5" isLoading={generatingQuestions}>
                <HelpCircle className="w-4 h-4" /> Generate 10 Fair Questions
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-7 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Generated Interview Questions</h3>
              {questionsOutput && (
                <button
                  onClick={() => handleCopy(questionsOutput)}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Questions"}
                </button>
              )}
            </div>

            {questionsOutput ? (
              <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-slate-900 text-white text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {questionsOutput}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select a position and generate structured, non-biased questions.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
