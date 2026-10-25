import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Play,
  LayoutDashboard,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";

export function HeroSection({ isAuthenticated, getDashboardPath, scrollToSection }) {
  return (
    <section
      id="home"
      className="relative pt-6 pb-12 lg:pt-8 lg:pb-14 overflow-hidden border-b border-[#E5EAF5]"
    >
      {/* Soft Ambient Radial Background Glows matching IMAGE A */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1360px] h-[480px] bg-linear-to-b from-[#EEF2FF]/90 via-[#F0F7FF]/50 to-transparent blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-8 right-1/4 w-[460px] h-[360px] bg-purple-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-5 space-y-4 text-left">
            {/* Eyebrow Pill Tag with Sparkle */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5] text-[11.5px] font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>AI-Powered Recruitment & Career Intelligence</span>
            </div>

            {/* Dominant Multi-line Headline matching IMAGE A exact line breaks */}
            <h1 className="text-3xl sm:text-4xl lg:text-[49px] font-black text-[#101B45] tracking-tight leading-[1.08]">
              Show Your Skills. <br />
              Land Your Next <br />
              <span className="bg-linear-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                Opportunity.
              </span>
            </h1>

            {/* Subheading matching IMAGE A */}
            <p className="text-[14.5px] sm:text-[15px] text-slate-500 max-w-[440px] leading-relaxed">
              HireFlow helps candidates showcase real skills with evidence and gives recruiters the tools to find, evaluate and hire the right talent — faster, fairer and smarter.
            </p>

            {/* Action Buttons: Pill-shaped matching IMAGE A */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardPath()}>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold px-6 py-3 rounded-full shadow-md shadow-indigo-500/20 text-sm transition-all cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                    </button>
                  </Link>
                  <a
                    href="#about"
                    onClick={(e) => scrollToSection(e, "about")}
                    className="inline-flex items-center justify-center font-bold text-[#101B45] bg-white border border-[#E2E8F0] hover:bg-slate-50 px-6 py-3 rounded-full text-sm transition-all gap-2 shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" /> Learn More
                  </a>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-bold px-6 sm:px-7 py-3 rounded-full shadow-md shadow-indigo-500/20 text-sm transition-all cursor-pointer"
                    >
                      Get Started Free <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <a
                    href="#about"
                    onClick={(e) => scrollToSection(e, "about")}
                    className="inline-flex items-center justify-center font-bold text-[#101B45] bg-white border border-[#E2E8F0] hover:bg-slate-50 px-6 py-3 rounded-full text-sm transition-all gap-2 shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" /> Learn More
                  </a>
                </>
              )}
            </div>

            {/* Three Product Benefits (Clean inline icons matching IMAGE A) */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B45] text-[11.5px]">AI Matching</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Smarter, explainable job matches
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B45] text-[11.5px]">Skill Evidence</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Show what you can do, not just what you list
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#101B45] text-[11.5px]">Career Growth</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Personalized guidance and improvement plans
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Native React + CSS Laptop & Phone Mockup */}
          <div className="lg:col-span-7 relative w-full pt-3 sm:pt-1">
            {/* Soft Ambient Glows behind laptop matching IMAGE A */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[120%] bg-linear-to-tr from-indigo-100/60 via-purple-100/40 to-blue-50/50 rounded-full blur-2xl -z-10 pointer-events-none" />

            {/* Handwritten Script Annotation positioned top-right over laptop matching IMAGE A */}
            <div className="absolute -top-6 right-3 sm:right-6 hidden sm:flex items-start gap-1 select-none pointer-events-none z-20">
              <span className="text-indigo-400 font-bold text-base select-none mt-0.5">✦</span>
              <div className="flex flex-col items-end -rotate-[8deg]">
                <span className="font-caveat text-[18px] sm:text-[20px] font-bold text-[#6366F1] leading-[1.05] text-right">
                  Better Matches. <br /> Brighter Careers.
                </span>
                {/* Curved dashed arrow curving down toward top-right corner of laptop */}
                <svg width="40" height="26" viewBox="0 0 40 26" fill="none" className="text-[#6366F1] mt-0.5 mr-1">
                  <path d="M 6 4 C 26 4, 34 11, 28 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 3" />
                  <path d="M 33 14 L 28 20 L 22 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Top-center Sparkle matching IMAGE A */}
            <div className="absolute -top-2 left-1/3 hidden sm:block text-indigo-400 select-none pointer-events-none z-20 text-sm font-bold">
              ✦
            </div>

            {/* Left Sparkles matching IMAGE A */}
            <div className="absolute top-12 -left-6 hidden sm:block text-indigo-500 select-none pointer-events-none z-20 text-2xl font-bold">
              ✦
            </div>

            {/* Mockup Container using the supplied transparent dashboard image */}
            <div className="relative flex items-center justify-center">
              <img
                src="/images/hero_dashboard_mockup.png"
                alt="HireFlow AI recruitment platform dashboard and mobile application preview"
                className="w-full max-w-2xl h-auto object-contain select-none pointer-events-none drop-shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;