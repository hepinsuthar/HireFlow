import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CtaBannerSection() {
  return (
    <section className="py-8 sm:py-10 bg-linear-to-r from-[#0284C7] via-[#2563EB] to-[#9333EA] text-white relative overflow-hidden">
      {/* Subtle decorative curves matching IMAGE A */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Side: Eyebrow and Headline */}
        <div className="space-y-1 text-center lg:text-left max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 block">
            READY TO GET STARTED?
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight leading-tight">
            Your Next Opportunity <br />
            Is Just a Click Away
          </h2>
        </div>

        {/* Right Side: CTAs & Script Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative">
          <Link to="/register">
            <button
              type="button"
              className="bg-white text-[#2563EB] hover:bg-slate-50 font-bold px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl gap-2 transition-all text-xs sm:text-sm inline-flex items-center cursor-pointer"
            >
              Create Your Account <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <a
            href="#about"
            className="px-6 py-2.5 rounded-full bg-white/10 border border-white/40 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all inline-flex items-center cursor-pointer"
          >
            Learn More
          </a>

          {/* Handwritten cursive annotation on right of banner with underline arc matching IMAGE A */}
          <div className="hidden xl:flex flex-col items-center select-none pointer-events-none pl-4 -rotate-[6deg]">
            <span className="font-caveat text-[17px] sm:text-[19px] font-bold tracking-tight text-white/95 leading-[1.05] text-center">
              Better Matches. <br /> Brighter Careers.
            </span>
            <svg width="64" height="10" viewBox="0 0 64 10" fill="none" className="text-white/80 mt-0.5">
              <path d="M 4 2 Q 32 10, 60 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaBannerSection;
