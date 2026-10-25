import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button, Card, Badge } from "../../components/common/UI";
import { BrandLogo } from "../../components/common/BrandLogo";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { login, logout, user, isAuthenticated } = useAuth();
  const { success } = useToast();
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
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const loggedUser = await login(email.trim(), password);
      success(`Welcome back, ${loggedUser.name}!`);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200/20 rounded-full blur-2xl pointer-events-none -z-10 animate-float" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-down flex flex-col items-center">
        <BrandLogo size="lg" to="/" className="mb-4" showTagline />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Workspace
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your registered credentials to access your verified workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 animate-fade-up">
        <Card className="p-8 shadow-xl border-slate-200 bg-white/95 backdrop-blur-md">
          {/* Active Session Notice if already logged in */}
          {isAuthenticated && user && (
            <div className="mb-6 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-down">
              <div>
                <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Currently Signed In
                </div>
                <p className="text-indigo-700 mt-0.5">
                  {user.name} · <span className="uppercase font-bold">{user.role}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="xs"
                  variant="primary"
                  onClick={() => redirectByRole(user.role)}
                >
                  Dashboard
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => {
                    logout();
                    success("Signed out. You can now sign in with another account.");
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full py-2.5 justify-center shadow-md font-semibold text-sm gap-2 btn-interactive"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 text-center">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 underline underline-offset-2">
                Create an Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted JWT Sessions & bcrypt Protected</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
