import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CheckCircle2,
  FileText,
  User,
  Search,
  Bell,
  Check
} from "lucide-react";

/**
 * LaptopPreview
 * Pixel-accurate, high-fidelity Native React + CSS Laptop Dashboard Mockup
 * Matches IMAGE A reference (hero mockup).
 */
export function LaptopPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl select-none">
      {/* Laptop Display Bezel (Dark sleek frame with top webcam dot) */}
      <div className="rounded-2xl bg-[#0B1120] p-2 sm:p-2.5 shadow-2xl shadow-indigo-950/25 border border-slate-800">
        {/* Top Center Webcam Dot */}
        <div className="flex items-center justify-center gap-1.5 pb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700/80" />
        </div>

        {/* Inner Laptop Screen (Crisp widescreen dashboard) */}
        <div className="bg-[#110404] rounded-xl overflow-hidden flex min-h-[330px] sm:min-h-[345px] shadow-inner">
          {/* 1. Left Dark Sidebar (Exact match to IMAGE A) */}
          <div className="w-28 sm:w-30 bg-[#0E172A] text-slate-400 p-2.5 sm:p-3 flex flex-col justify-between shrink-0 border-r border-slate-800/80">
            <div className="space-y-3">
              {/* Brand Logo inside Sidebar */}
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <div className="w-5 h-5 rounded-md bg-linear-to-tr from-[#2563EB] to-[#06B6D4] text-white font-black text-[9px] flex items-center justify-center shadow-2xs">
                  HF
                </div>
                <span className="font-extrabold text-white text-[11px] tracking-tight">HireFlow</span>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1 text-[10px]">
                {/* Active Dashboard Tab */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1E293B] text-white font-semibold shadow-xs">
                  <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dashboard</span>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Jobs</span>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Applications</span>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Interviews</span>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Messages</span>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Main Dashboard Content Area */}
          <div className="flex-1 bg-[#F8FAFC] p-3 sm:p-3.5 space-y-2.5 overflow-hidden text-left flex flex-col justify-between">
            {/* Top Bar: Greeting on left, Search, Notification Bell, User Avatar on right */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-2">
              {/* Left Greeting matching IMAGE A */}
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-xs sm:text-[13px] flex items-center gap-1 leading-tight">
                  Good morning, Alex! <span className="inline-block animate-pulse">👋</span>
                </h3>
                <p className="text-[9px] text-slate-400 font-medium">Frontend Developer Candidate</p>
              </div>

              {/* Right Search Input, Bell, Avatar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search jobs..."
                    className="w-28 sm:w-34 pl-7 pr-2.5 py-1 bg-white border border-slate-200/90 rounded-full text-[9px] text-slate-600 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="w-6 h-6 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 shadow-2xs relative cursor-pointer">
                  <Bell className="w-3 h-3" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 absolute top-1 right-1" />
                </div>

                <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200/90 shadow-2xs shrink-0">
                  <img
                    src="/images/priya_avatar.jpg"
                    alt="Alex avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("bg-indigo-600", "text-white", "flex", "items-center", "justify-center", "font-bold", "text-[9px]");
                      e.target.parentNode.textContent = "A";
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 4 KPI Metric Cards matching IMAGE A */}
            <div className="grid grid-cols-4 gap-2">
              {/* Card 1: Applications */}
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4.5 h-4.5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[8px] font-medium text-slate-500 block truncate">Applications</span>
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base block pl-0.5 leading-tight">12</span>
              </div>

              {/* Card 2: Interviews */}
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4.5 h-4.5 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[8px] font-medium text-slate-500 block truncate">Interviews</span>
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base block pl-0.5 leading-tight">3</span>
              </div>

              {/* Card 3: Shortlisted */}
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4.5 h-4.5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[8px] font-medium text-slate-500 block truncate">Shortlisted</span>
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base block pl-0.5 leading-tight">5</span>
              </div>

              {/* Card 4: Job Matches */}
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4.5 h-4.5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Briefcase className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[8px] font-medium text-slate-500 block truncate">Job Matches</span>
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base block pl-0.5 leading-tight">18</span>
              </div>
            </div>

            {/* Bottom Row: Your Job Match Score (Left) & Recommended for You (Right) */}
            <div className="grid grid-cols-12 gap-2.5 pt-0.5">
              {/* Left Card: Your Job Match Score */}
              <div className="col-span-5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your Job Match Score
                  </span>

                  <div className="flex items-center gap-2 mt-1.5">
                    {/* SVG Circular Donut Progress Ring */}
                    <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                      <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                        {/* Background Track */}
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                        />
                        {/* Cyan Progress Arc: 92% */}
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth="3.5"
                          strokeDasharray="92, 100"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-black text-cyan-600 text-[10.5px]">92%</span>
                      </div>
                    </div>

                    {/* Score Labels */}
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-emerald-600 block leading-tight">
                        Great match!
                      </span>
                      <div className="space-y-0.5 pt-0.5">
                        <span className="text-[7px] text-slate-500 leading-snug flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          <span>5/5 skills backed by evidence</span>
                        </span>
                        <span className="text-[7px] text-slate-500 leading-snug flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          <span>Keep going!</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-1 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[8.5px] font-bold shadow-xs transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>

              {/* Right Card: Recommended for You */}
              <div className="col-span-7 bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between text-[8px]">
                  <span className="font-bold text-slate-700">Recommended for You</span>
                  <span className="text-[#2563EB] font-bold text-[7.5px] hover:underline cursor-pointer">See All</span>
                </div>

                <div className="space-y-1 text-[8.5px]">
                  {/* Job 1 */}
                  <div className="flex items-center justify-between p-1 rounded-lg bg-slate-50/90 border border-slate-100/90">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4.5 h-4.5 rounded-md bg-[#0F172A] text-cyan-400 flex items-center justify-center font-bold text-[7.5px]">
                        FD
                      </div>
                      <div>
                        <span className="font-bold text-[#101B45] block truncate max-w-[110px] text-[8px] leading-tight">
                          Frontend Developer
                        </span>
                        <span className="text-slate-500 text-[7px]">TechCorp • Remote</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      92% Match
                    </span>
                  </div>

                  {/* Job 2 */}
                  <div className="flex items-center justify-between p-1 rounded-lg bg-slate-50/90 border border-slate-100/90">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4.5 h-4.5 rounded-md bg-[#0F172A] text-blue-400 flex items-center justify-center font-bold text-[7.5px]">
                        FS
                      </div>
                      <div>
                        <span className="font-bold text-[#101B45] block truncate max-w-[110px] text-[8px] leading-tight">
                          Full Stack Developer
                        </span>
                        <span className="text-slate-500 text-[7px]">CloudScale • Hybrid</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      87% Match
                    </span>
                  </div>

                  {/* Job 3 */}
                  <div className="flex items-center justify-between p-1 rounded-lg bg-slate-50/90 border border-slate-100/90">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4.5 h-4.5 rounded-md bg-[#0F172A] text-purple-400 flex items-center justify-center font-bold text-[7.5px]">
                        RD
                      </div>
                      <div>
                        <span className="font-bold text-[#101B45] block truncate max-w-[110px] text-[8px] leading-tight">
                          React Developer
                        </span>
                        <span className="text-slate-500 text-[7px]">WebFlow • Remote</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      85% Match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MacBook Metallic Silver Base Lip with Center Notch */}
      <div className="w-[103%] -ml-[1.5%] h-3.5 bg-linear-to-b from-slate-200 via-slate-300 to-slate-400 rounded-b-xl shadow-lg border-t border-slate-300/90 relative">
        <div className="mx-auto w-20 h-1 bg-slate-400/90 rounded-b-md" />
      </div>
      {/* Soft Contact Shadow beneath laptop base matching IMAGE A */}
      <div className="w-[102%] -ml-[1%] h-3 bg-slate-950/25 blur-md rounded-full -mt-0.5 mx-auto" />
    </div>
  );
}

export default LaptopPreview;
