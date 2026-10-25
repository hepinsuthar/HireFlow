import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HeroSection } from "../../components/landing/HeroSection";
import { FeaturesSection } from "../../components/landing/FeaturesSection";
import { AudiencePanelsSection } from "../../components/landing/AudiencePanelsSection";
import { WorkflowSection } from "../../components/landing/WorkflowSection";
import { ContactSection } from "../../components/landing/ContactSection";
import { CtaBannerSection } from "../../components/landing/CtaBannerSection";

export function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Smooth scroll handler for anchor hash in URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          const offset = 70;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: id === "home" ? 0 : offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [location.hash]);

  const scrollToSection = (e, id) => {
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
    } else {
      navigate(`/#${id}`);
    }
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "recruiter") return "/recruiter/dashboard";
    return "/candidate/dashboard";
  };

  return (
    <div className="w-full bg-white text-[#101B45] overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* 1. Hero Section (#home) */}
      <HeroSection
        isAuthenticated={isAuthenticated}
        getDashboardPath={getDashboardPath}
        scrollToSection={scrollToSection}
      />

      {/* 2. Why HireFlow / Feature Overview (#about) */}
      <FeaturesSection />

      {/* 3. Candidate & Recruiter Dual Panels */}
      <AudiencePanelsSection />

      {/* 4. How It Works (#how-it-works) */}
      <WorkflowSection />

      {/* 5. Contact Us Section (#contact) */}
      <ContactSection />

      {/* 6. Call To Action Banner */}
      <CtaBannerSection />
    </div>
  );
}

export default LandingPage;
