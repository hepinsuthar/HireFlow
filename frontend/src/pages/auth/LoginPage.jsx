import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { BrandLogo } from "../../components/common/BrandLogo";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const currentYear = new Date().getFullYear();

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const { login, logout, user, isAuthenticated } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const redirectByRole = (userRole) => {
    if (from) {
      navigate(from, { replace: true });
    } else if (userRole === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (userRole === "recruiter") {
      navigate("/recruiter/dashboard", { replace: true });
    } else {
      navigate("/candidate/dashboard", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    try {
      setIsLoading(true);
      const loggedUser = await login(email.trim(), password);
      success(`Welcome back, ${loggedUser.name}!`);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setErrorMsg(err.message || "Invalid email or password. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    info(`${provider} sign-in will be available soon. Please sign in with your email and password.`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between items-center py-8 px-4 sm:px-6 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Soft Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-linear-to-b from-[#EEF2FF] via-[#F0F7FF]/60 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header Logo */}
      <header className="w-full max-w-md mx-auto flex flex-col items-center text-center pt-2 pb-4">
        <Link
          to="/"
          className="inline-flex items-center transition-transform hover:scale-105 duration-200"
          title="Return to HireFlow Home"
        >
          <BrandLogo size="lg" to={null} />
        </Link>
      </header>

      {/* Center Auth Card (LinkedIn / Modern SaaS Focused Aesthetic) */}
      <main className="w-full max-w-[440px] mx-auto my-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 text-left relative">
          
          {/* Active Session Notice if already logged in */}
          {isAuthenticated && user && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-down">
              <div>
                <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Currently signed in
                </span>
                <span className="text-[11.5px] text-blue-700">
                  {user.name} ({user.role})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => redirectByRole(user.role)}
                  className="px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    success("Signed out successfully.");
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Heading */}
          <div className="space-y-1.5 mb-6 text-left">
            <h1 className="text-2xl sm:text-[26px] font-black text-[#101B45] tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-[13.5px] text-slate-500 leading-normal">
              Stay updated on your professional career & hiring pipeline.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Forgot Password Notice */}
          {showForgotNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1">
              <span className="font-bold block">Need to reset your password?</span>
              <p className="text-[11.5px] text-blue-700 leading-relaxed">
                Please contact HireFlow Support at{" "}
                <a href="mailto:support@hireflow.dev" className="underline font-bold text-blue-800">
                  support@hireflow.dev
                </a>{" "}
                with your registered email address.
              </p>
            </div>
          )}

          {/* Quick Social Sign-in Options (LinkedIn-style) */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleSocialClick("Google")}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick("GitHub")}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-800">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-800">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-100 focus:border-[#2563EB] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Callout: New to HireFlow? Join now */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            New to HireFlow?{" "}
            <Link
              to="/register"
              className="font-bold text-[#2563EB] hover:underline"
            >
              Join now
            </Link>
          </div>
        </div>

        {/* Security / Encryption Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured with encrypted JWT & bcrypt hashing</span>
        </div>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="w-full max-w-md mx-auto pt-6 text-center text-[11px] text-slate-400">
        <div className="flex items-center justify-center gap-4 mb-1">
          <Link to="/#about" className="hover:underline">About</Link>
          <Link to="/#contact" className="hover:underline">Contact</Link>
          <span className="text-slate-300">·</span>
          <span>Privacy Policy</span>
          <span className="text-slate-300">·</span>
          <span>Terms</span>
        </div>
        <p>© {currentYear} HireFlow Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LoginPage;
