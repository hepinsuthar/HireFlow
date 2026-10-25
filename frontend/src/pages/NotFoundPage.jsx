import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowLeft, Home, LayoutDashboard, Compass } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/UI";
import { BrandLogo } from "../components/common/BrandLogo";

export function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return "/login";
    if (user.role === "recruiter") return "/recruiter/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/candidate/dashboard";
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-between">
      {/* Top bar */}
      <header className="px-6 py-6 border-b border-slate-800/80 flex items-center justify-between max-w-7xl mx-auto w-full">
        <BrandLogo size="md" theme="dark" to="/" />
        <Link to="/" className="text-xs text-slate-400 hover:text-white transition-colors">
          hireflow.dev
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-4 h-4" /> 404 — Destination Not Found
          </div>

          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-violet-300 to-indigo-200">
            404
          </h1>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Looking for something?</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The page you're trying to reach does not exist, has been relocated, or requires authenticated role clearance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-2 text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>

            <Link to="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full gap-2 text-xs">
                <Home className="w-4 h-4" /> Homepage
              </Button>
            </Link>

            <Link to={getDashboardPath()} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full gap-2 text-xs">
                <LayoutDashboard className="w-4 h-4" />
                {isAuthenticated ? "My Dashboard" : "Sign In"}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        &copy; {new Date().getFullYear()} HireFlow AI Recruitment Platform. All rights reserved.
      </footer>
    </div>
  );
}
export default NotFoundPage;
