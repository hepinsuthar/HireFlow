import React from "react";
import {
  FileSearch,
  Users,
  ShieldCheck,
  Brain
} from "lucide-react";

// Ascending bar chart with trend arrow icon for Personalized Roadmap matching IMAGE A
function RoadmapChartIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20h18" />
      <path d="M6 16v-4" />
      <path d="M10 16v-7" />
      <path d="M14 16v-9" />
      <path d="M18 16v-12" />
      <path d="M14 5l4-2 2 4" />
    </svg>
  );
}

export function FeaturesSection() {
  const features = [
    {
      id: "matching",
      title: "Explainable Matching",
      description: "See exactly why you match a job, with skill breakdowns and evidence.",
      icon: Brain,
      bgColor: "bg-[#FAF5FF]",
      borderColor: "border-purple-100",
      textColor: "text-[#9333EA]",
    },
    {
      id: "evidence",
      title: "Skill Evidence Profile",
      description: "Showcase your projects, experience and verified skills with real proof.",
      icon: FileSearch,
      bgColor: "bg-[#EFF6FF]",
      borderColor: "border-blue-100",
      textColor: "text-[#2563EB]",
    },
    {
      id: "roadmap",
      title: "Personalized Roadmap",
      description: "Get actionable steps to improve your skills and job readiness.",
      icon: RoadmapChartIcon,
      bgColor: "bg-[#ECFDF5]",
      borderColor: "border-emerald-100",
      textColor: "text-[#059669]",
    },
    {
      id: "hiring",
      title: "Evidence-Based Hiring",
      description: "Recruiters evaluate real skills and project evidence, not just resumes.",
      icon: Users,
      bgColor: "bg-[#FFF7ED]",
      borderColor: "border-orange-100",
      textColor: "text-[#EA580C]",
    },
    {
      id: "security",
      title: "Secure & Trusted",
      description: "Your data is protected with JWT authentication and role-based access.",
      icon: ShieldCheck,
      bgColor: "bg-[#F5F3FF]",
      borderColor: "border-violet-100",
      textColor: "text-[#7C3AED]",
    },
  ];

  return (
    <section
      id="about"
      className="py-10 lg:py-14 bg-white border-b border-[#E5EAF5] scroll-mt-20"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header matching IMAGE A */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#2563EB] block">
            Why HireFlow
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#101B45] tracking-tight">
            More Than Just a Job Portal
          </h2>
          <p className="text-xs sm:text-[13.5px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            We bridge the gap between your skills and the right opportunities with AI-powered insights, real evidence and a smarter hiring process.
          </p>
        </div>

        {/* 5 Equal Feature Cards in a Single Row on Desktop (Matching IMAGE A) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="p-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 text-left"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${feature.bgColor} ${feature.borderColor} ${feature.textColor} border flex items-center justify-center shadow-2xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-[15px] font-black text-[#101B45] leading-snug">{feature.title}</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
