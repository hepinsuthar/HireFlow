import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  FolderGit2,
  FileText,
  Calendar
} from "lucide-react";

export function AudiencePanelsSection() {
  return (
    <section className="py-10 lg:py-14 bg-white border-b border-[#E5EAF5]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
          {/* Panel 1: For Candidates (Pale Blue Background #F0F7FF) */}
          <div className="rounded-[28px] bg-[#F0F7FF] border border-[#DBEAFE] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Left Sub-Column: Text, Checklist, CTA */}
              <div className="sm:col-span-6 space-y-3.5 text-left">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2563EB] bg-white px-3 py-0.5 rounded-full border border-[#BFDBFE]">
                  <User className="w-3 h-3 text-[#2563EB]" /> For Candidates
                </span>

                <h3 className="text-2xl sm:text-[27px] font-black text-[#101B45] tracking-tight leading-tight">
                  Build Your Career <br /> with Confidence
                </h3>

                <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                  Create a skill profile, get AI-powered insights, find matching jobs and track your journey — all in one place.
                </p>

                {/* Checklist with Blue Checkmark Icons matching IMAGE A */}
                <div className="space-y-1.5 pt-1 text-[12px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>Build your skill evidence profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>Get explainable job match scores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>Receive personalized improvement tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span>Track applications and interviews</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/register">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 bg-linear-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-bold text-xs sm:text-[13px] px-5 py-2.5 rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      Start as a Candidate <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Sub-Column: Supplied Transparent Candidate Image + 2 Floating Cards */}
              <div className="sm:col-span-6 relative min-h-[330px] sm:min-h-[350px] flex items-end justify-end">
                {/* Soft ambient radial glow behind candidate */}
                <div className="absolute right-4 bottom-2 w-56 h-56 bg-linear-to-tr from-blue-200/50 via-indigo-100/40 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Candidate Portrait Image with transparent background */}
                <div className="relative z-10 w-full flex items-end justify-end overflow-visible">
                  <img
                    src="/images/candidate_portrait.png"
                    alt="HireFlow candidate developer holding a laptop"
                    className="max-h-[330px] sm:max-h-[350px] w-auto object-contain object-bottom select-none pointer-events-none drop-shadow-xl"
                    loading="lazy"
                  />
                  {/* Decorative ✦ Sparkle on top right */}
                  <div className="absolute top-2 right-4 text-blue-500 font-bold text-base select-none pointer-events-none">
                    ✦
                  </div>
                </div>

                {/* Floating White Card 1: Your Skills & Evidence (Top Left Overlapping matching IMAGE A) */}
                <div className="absolute top-3 -left-3 sm:-left-6 w-46 sm:w-48 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/90 shadow-lg text-left space-y-1.5 z-20">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-900 border-b border-slate-100 pb-1">
                    <span>Your Skills & Evidence</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="space-y-1 text-[9.5px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[7px] font-black">
                          R
                        </div>
                        <span className="font-semibold text-slate-800">React.js</span>
                      </div>
                      <span className="text-[8px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Project
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-teal-500 text-white flex items-center justify-center text-[7px] font-black">
                          N
                        </div>
                        <span className="font-semibold text-slate-800">Node.js</span>
                      </div>
                      <span className="text-[8px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Experience
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[7px] font-black">
                          M
                        </div>
                        <span className="font-semibold text-slate-800">MongoDB</span>
                      </div>
                      <span className="text-[8px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Project
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-blue-600 text-white flex items-center justify-center text-[7px] font-black">
                          T
                        </div>
                        <span className="font-semibold text-slate-800">Tailwind CSS</span>
                      </div>
                      <span className="text-[8px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Github
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating White Card 2: Job Match Score (Bottom Left Overlapping matching IMAGE A) */}
                <div className="absolute bottom-3 -left-3 sm:-left-6 w-46 sm:w-48 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/90 shadow-lg text-left space-y-1.5 z-20">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-900">
                    <span>Job Match Score</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3.5"
                          strokeDasharray="78, 100"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black text-[#101B45] text-[9.5px]">78%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 block leading-tight">Good match!</span>
                      <span className="text-[8px] text-slate-500">2 skills to improve</span>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="px-3 py-1 rounded-full text-[8.5px] font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: For Recruiters (Pale Violet Background #FAF7FF) */}
          <div className="rounded-[28px] bg-[#FAF7FF] border border-[#EDE9FE] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Left Sub-Column: Text, Checklist, CTA */}
              <div className="sm:col-span-6 space-y-3.5 text-left">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7C3AED] bg-white px-3 py-0.5 rounded-full border border-[#DDD6FE]">
                  <Building2 className="w-3 h-3 text-[#7C3AED]" /> For Recruiters
                </span>

                <h3 className="text-2xl sm:text-[25px] font-extrabold text-[#101B45] tracking-tight leading-tight">
                  Hire Smarter, <br /> Faster
                </h3>

                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                  Review candidate evidence, compare skills and make data-driven hiring decisions.
                </p>

                {/* Checklist with Purple Checkmark Icons */}
                <div className="space-y-1.5 pt-1 text-[11.5px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span>Post jobs and manage applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span>Evaluate real skills and project evidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span>Use structured interview feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span>Track hiring progress and get insights</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to="/register">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 bg-linear-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-bold text-xs sm:text-[13px] px-5 py-2.5 rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      Start as a Recruiter <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Sub-Column: Native React + CSS Candidate Evaluation Card matching IMAGE A */}
              <div className="sm:col-span-6 relative flex items-center justify-center sm:justify-end">
                <div className="bg-white p-4 sm:p-4.5 rounded-2xl border border-[#EDE9FE] shadow-md space-y-2.5 text-left w-full max-w-[260px]">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      Candidate Evaluation
                    </span>
                  </div>

                  {/* Candidate Profile Row */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/priya_avatar.jpg"
                      alt="Candidate Priya Sharma"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <h4 className="font-bold text-[#101B45] text-[12.5px] leading-tight">Priya Sharma</h4>
                      <p className="text-[10px] text-slate-500">Frontend Developer</p>
                    </div>
                  </div>

                  {/* Key Skills Tags */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Key Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[8.5px] border border-emerald-100">
                        React
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[8.5px] border border-blue-100">
                        JavaScript
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold text-[8.5px] border border-teal-100">
                        Tailwind
                      </span>
                    </div>
                  </div>

                  {/* Evidence Links */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Evidence
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <FolderGit2 className="w-3 h-3 text-blue-600" />
                          <span className="text-slate-700 font-medium text-[9.5px]">Portfolio Project</span>
                        </div>
                        <span className="text-[8.5px] font-bold text-[#2563EB] cursor-pointer hover:underline">
                          View
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-slate-600" />
                          <span className="text-slate-700 font-medium text-[9.5px]">GitHub Repository</span>
                        </div>
                        <span className="text-[8.5px] font-bold text-[#2563EB] cursor-pointer hover:underline">
                          View
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-purple-600" />
                          <span className="text-slate-700 font-medium text-[9.5px]">Experience (2 years)</span>
                        </div>
                        <span className="text-[8.5px] font-bold text-[#2563EB] cursor-pointer hover:underline">
                          View
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shortlist Action Button matching IMAGE A */}
                  <div className="pt-1">
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-full bg-linear-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                    >
                      Shortlist Candidate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AudiencePanelsSection;
