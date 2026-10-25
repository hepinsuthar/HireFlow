import React from "react";
import { Link } from "react-router-dom";

/**
 * HireFlow Brand Logo
 * Implements the user's logo design:
 * - Two stylized people figures forming the letter "H" (Candidate & Recruiter)
 * - Dynamic ascending flow wave bridging them with an upward career arrow (↗)
 * - Modern dual-tone typography ("Hire" in slate, "Flow" in vivid blue-purple gradient)
 * - Tagline: "Better Matches. Brighter Careers."
 *
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Scale preset
 * @param {'light' | 'dark'} [props.theme='light'] - Theme variant
 * @param {string} [props.subtitle] - Contextual role or section subtitle
 * @param {boolean} [props.showTagline=false] - Display official tagline below wordmark
 * @param {string} [props.to='/'] - Link destination (null for static)
 * @param {string} [props.className=''] - Extra classes
 */
export function BrandLogo({
  size = "md",
  theme = "light",
  subtitle,
  showTagline = false,
  to = "/",
  className = "",
}) {
  const isDark = theme === "dark";

  // Scale presets
  const sizeConfig = {
    sm: {
      box: "w-8 h-8 rounded-xl",
      iconSize: 30,
      title: "text-base font-extrabold",
      tagline: "text-[9px] font-medium tracking-wide",
      gap: "gap-2.5",
    },
    md: {
      box: "w-10 h-10 rounded-xl",
      iconSize: 38,
      title: "text-xl font-black",
      tagline: "text-[10.5px] font-medium tracking-wide",
      gap: "gap-3",
    },
    lg: {
      box: "w-12 h-12 rounded-2xl",
      iconSize: 46,
      title: "text-2xl font-black",
      tagline: "text-xs font-medium tracking-wider",
      gap: "gap-3.5",
    },
    xl: {
      box: "w-16 h-16 rounded-2xl",
      iconSize: 60,
      title: "text-3xl sm:text-4xl font-black",
      tagline: "text-xs sm:text-sm font-medium tracking-wider",
      gap: "gap-4",
    },
  }[size] || {
    box: "w-10 h-10 rounded-xl",
    iconSize: 38,
    title: "text-xl font-black",
    tagline: "text-[10.5px] font-medium tracking-wide",
    gap: "gap-3",
  };

  const displayText = subtitle || (showTagline ? "Better Matches. Brighter Careers." : null);

  const content = (
    <div
      className={`inline-flex items-center ${sizeConfig.gap} group select-none transition-all duration-300 ${className}`}
    >
      {/* 1. Brand Emblem (Two Figures + Ascending Flow Wave + Arrow) */}
      <div
        className={`relative ${sizeConfig.box} flex items-center justify-center shrink-0 transition-transform duration-300 ease-out group-hover:scale-105`}
      >
        <svg
          width={sizeConfig.iconSize}
          height={sizeConfig.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 ease-out group-hover:scale-105"
        >
          <defs>
            {/* Left Pillar: Blue Figure */}
            <linearGradient id="hf-pillar-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Right Pillar: Purple Figure */}
            <linearGradient id="hf-pillar-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>

            {/* Rising Flow Ribbon: Cyan -> Royal Blue -> Indigo -> Violet */}
            <linearGradient id="hf-flow-wave" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Left Person Figure (Candidate) */}
          <circle cx="27" cy="18" r="8" fill="url(#hf-pillar-blue)" />
          <rect x="19" y="32" width="16" height="54" rx="8" fill="url(#hf-pillar-blue)" />

          {/* Right Person Figure (Recruiter) */}
          <circle cx="73" cy="18" r="8" fill="url(#hf-pillar-purple)" />
          <rect x="65" y="32" width="16" height="54" rx="8" fill="url(#hf-pillar-purple)" />

          {/* Depth Drop-shadow under Ribbon */}
          <path
            d="M 17 84 C 17 68 25 56 46 54 C 60 52 70 42 82 28"
            stroke={isDark ? "#020617" : "#0f172a"}
            strokeOpacity="0.12"
            strokeWidth="15"
            strokeLinecap="round"
          />

          {/* Ascending Flow Ribbon bridging Candidate & Recruiter */}
          <path
            d="M 17 84 C 17 68 25 56 46 54 C 60 52 70 42 82 28"
            stroke="url(#hf-flow-wave)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Arrowhead (Pointing ↗ 45° to Career Growth) */}
          <path d="M 91 19 L 89 36 L 82 30 L 73 24 Z" fill="#8b5cf6" />
        </svg>
      </div>

      {/* 2. Typographic Wordmark matching IMAGE A */}
      <div className="flex flex-col text-left justify-center">
        <div className="flex items-center tracking-tight leading-none">
          <span
            className={`${sizeConfig.title} ${
              isDark ? "text-white" : "text-[#101B45]"
            }`}
          >
            HireFlow
          </span>
        </div>

        {displayText && (
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`${sizeConfig.tagline} ${
                isDark ? "text-[#38BDF8]" : "text-slate-500"
              }`}
            >
              {displayText}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!to) {
    return content;
  }

  return (
    <Link
      to={to}
      className="inline-flex focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl"
    >
      {content}
    </Link>
  );
}

export default BrandLogo;
