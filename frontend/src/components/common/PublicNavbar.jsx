import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Button } from "./UI";
import { BrandLogo } from "./BrandLogo";

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { isAuthenticated, user, role, logout } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Contact Us", id: "contact" },
  ];

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "recruiter") return "/recruiter/dashboard";
    return "/candidate/dashboard";
  };

  const handleLogout = () => {
    logout();
    success("You have been signed out successfully.");
    navigate("/");
  };

  // Track active section via IntersectionObserver when on the landing page
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sectionIds = ["home", "about", "how-it-works", "contact"];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                if (window.scrollY < 300) {
                  setActiveSection("home");
                } else {
                  setActiveSection(id);
                }
              }
            });
          },
          { rootMargin: "-25% 0px -55% 0px", threshold: 0 }
        );
        observer.observe(el);
        observers.push(observer);
      }
    });

    const handleScroll = () => {
      if (window.scrollY < 300) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observers.forEach((obs) => obs.disconnect());
    };
  }, [location.pathname]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
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
        setActiveSection(id);
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white transition-all duration-200">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Brand Logo */}
          <div className="shrink-0">
            <Link
              to="/#home"
              onClick={(e) => scrollToSection(e, "home")}
              className="inline-flex items-center focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
            >
              <BrandLogo size="md" to={null} />
            </Link>
          </div>

          {/* Center Navigation Links (Exact order: Home, About, How It Works, Contact Us) */}
          <nav className="hidden md:flex items-center gap-9 text-[14.5px] font-semibold text-[#101B45]">
            {navItems.map((item) => {
              const isCurrent = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`transition-colors py-1.5 relative ${
                    isCurrent
                      ? "text-[#2563EB] font-bold"
                      : "text-slate-600 hover:text-[#2563EB]"
                  }`}
                >
                  {item.label}
                  {isCurrent && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2.5px] bg-[#2563EB] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-800 max-w-[120px] truncate">
                    {user?.name || "Account"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                    {role}
                  </span>
                </div>

                <Link to={getDashboardPath()}>
                  <Button variant="primary" size="sm" className="gap-2 shadow-xs font-semibold bg-[#2563EB] hover:bg-blue-700">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 gap-1.5"
                  title="Sign out of your account"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-[#2563EB] px-3.5 py-2 rounded-full hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/register">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 font-bold text-sm text-white bg-linear-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] rounded-full px-5 py-2.5 shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md cursor-pointer"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E5EAF5] bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <div className="flex flex-col space-y-1 pt-2">
            {navItems.map((item) => {
              const isCurrent = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isCurrent
                      ? "bg-blue-50 text-[#2563EB] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{user?.name}</span>
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">
                      {role}
                    </span>
                  </div>
                </div>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full gap-2 bg-[#2563EB]">
                    <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold border-[#E5EAF5] text-[#101B45]">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-1.5 font-bold text-sm text-white bg-linear-to-r from-[#2563EB] to-[#7C3AED] rounded-xl py-2.5 shadow-sm"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicNavbar;
