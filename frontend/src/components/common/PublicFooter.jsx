import React, { useState } from "react";
import { X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const currentYear = new Date().getFullYear();

export function PublicFooter() {
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

  const scrollToSection = (e, id) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const offset = 70;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: id === "home" ? 0 : offsetPosition,
          behavior: "smooth",
        });
        window.history.pushState(null, "", `#${id}`);
      }
    }
  };

  return (
    <>
      <footer className="bg-[#0B1120] text-slate-400 border-t border-slate-900 selection:bg-indigo-500 selection:text-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-7">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-slate-800/80">
            {/* Left: Brand Logo & Tagline */}
            <div className="space-y-1.5 max-w-sm">
              <BrandLogo size="md" theme="dark" showTagline={true} to="/#home" />
            </div>

            {/* Center: In-Page Navigation Links */}
            <nav className="flex flex-wrap items-center gap-6 sm:gap-8 text-[13.5px] font-medium text-slate-300">
              <a
                href="#home"
                onClick={(e) => scrollToSection(e, "home")}
                className="hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={(e) => scrollToSection(e, "about")}
                className="hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, "how-it-works")}
                className="hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "contact")}
                className="hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </nav>

            {/* Right: Social Media Icons matching IMAGE A */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center transition-all text-slate-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center transition-all text-slate-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter/X"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center transition-all text-slate-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center transition-all text-slate-400"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Bottom Bar: Copyright and Legal */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {currentYear} HireFlow. All rights reserved.</p>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Accessible Policy & Terms Modal */}
      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-slate-800 text-slate-200 max-w-xl w-full rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {legalModal === "privacy" ? "HireFlow Privacy Policy" : "HireFlow Terms of Service"}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {legalModal === "privacy" ? (
                <>
                  <p>
                    <strong>1. Evidence & Data Protection:</strong> Candidate profile data, project evidence links, and resume uploads are stored securely with strict Role-Based Access Control.
                  </p>
                  <p>
                    <strong>2. Ethical AI Safeguards:</strong> We never sell candidate data. Google Gemini neural services run securely on our backend with parameter sanitization.
                  </p>
                  <p>
                    <strong>3. Human-in-the-Loop Commitment:</strong> HireFlow enforces that no candidate is ever automatically rejected. All hiring decisions require deliberate human recruiter review.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Verifiable Representation:</strong> Candidates agree to provide truthful links to code repositories, projects, and work experience.
                  </p>
                  <p>
                    <strong>2. Employer Verification:</strong> Recruiters must register with verified company work domains and adhere to non-discriminatory hiring.
                  </p>
                  <p>
                    <strong>3. Transparent Scoring:</strong> HireFlow's 100-point matching formula provides deterministic evaluation assistance to hiring teams.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PublicFooter;
