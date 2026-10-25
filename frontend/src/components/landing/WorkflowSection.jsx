import React from "react";
import {
  Search,
  User,
  Target,
  CheckCircle2
} from "lucide-react";

// Ascending bar chart icon for Step 4 matching IMAGE A
function WorkflowChartIcon({ className = "w-6 h-6" }) {
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

export function WorkflowSection() {
  const steps = [
    {
      id: "step-1",
      number: "1. Find a Job",
      description: "Explore verified jobs that match your skills.",
      icon: Search,
      bgColor: "bg-[#F0F7FF]",
      textColor: "text-[#2563EB]",
    },
    {
      id: "step-2",
      number: "2. Build Your Profile",
      description: "Add your skills, projects and supporting evidence.",
      icon: User,
      bgColor: "bg-[#F0F9FF]",
      textColor: "text-[#0284C7]",
    },
    {
      id: "step-3",
      number: "3. Get Matched",
      description: "See explainable match scores and detailed insights.",
      icon: Target,
      bgColor: "bg-[#FAF5FF]",
      textColor: "text-[#9333EA]",
    },
    {
      id: "step-4",
      number: "4. Improve & Apply",
      description: "Follow personalized tasks and apply with confidence.",
      icon: WorkflowChartIcon,
      bgColor: "bg-[#F0FDF4]",
      textColor: "text-[#16A34A]",
    },
    {
      id: "step-5",
      number: "5. Get Hired",
      description: "Track your progress and ace your interviews.",
      icon: CheckCircle2,
      bgColor: "bg-[#ECFDF5]",
      textColor: "text-[#059669]",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-10 lg:py-14 bg-white border-b border-[#E5EAF5] scroll-mt-20"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-1.5">
          <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#2563EB] block">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#101B45] tracking-tight">
            Simple Steps to a Smarter Hiring Process
          </h2>
          <p className="text-xs sm:text-[13.5px] text-slate-500 leading-relaxed max-w-2xl mx-auto">
            From job requirements to real evidence, we make the journey transparent for everyone.
          </p>
        </div>

        {/* 5 Sequential Workflow Steps with Connecting Arrows (Squircle Badges matching IMAGE A) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative items-start">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;
            return (
              <div key={step.id} className="text-center space-y-2 p-1 relative">
                <div className={`w-14 h-14 rounded-2xl ${step.bgColor} ${step.textColor} border border-slate-200/60 flex items-center justify-center mx-auto shadow-2xs mb-3 transition-transform hover:scale-105`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-[15px] font-black text-[#101B45]">{step.number}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed max-w-[170px] mx-auto">
                  {step.description}
                </p>
                {!isLast && (
                  <div className="hidden md:flex absolute -right-3.5 top-4.5 text-slate-400 select-none pointer-events-none items-center justify-center">
                    <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default WorkflowSection;
