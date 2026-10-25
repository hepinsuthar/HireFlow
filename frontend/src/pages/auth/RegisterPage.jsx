import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Info
} from "lucide-react";
import { Button, Card, Badge } from "../../components/common/UI";
import { BrandLogo } from "../../components/common/BrandLogo";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "mail.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "live.com",
  "msn.com",
  "yandex.com",
  "gmx.com"
];

export function RegisterPage() {
  const [role, setRole] = useState("candidate"); // 'candidate' | 'recruiter'

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Candidate-specific fields
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState("");

  // Recruiter-specific fields (Enterprise verification)
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, user, isAuthenticated, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  // Check email domain in real time for recruiter role
  const emailDomain = email.includes("@") ? email.split("@")[1].toLowerCase().trim() : "";
  const isFreeDomain = FREE_EMAIL_DOMAINS.includes(emailDomain);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all basic required fields.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must contain at least 8 characters.");
      return;
    }

    if (role === "recruiter") {
      if (isFreeDomain) {
        setErrorMsg(
          "Recruiter registration requires an official company work email (e.g., name@company.com). Free personal email providers are restricted to Candidate accounts."
        );
        return;
      }
      if (!companyName.trim()) {
        setErrorMsg("Company name is required for recruiter registration.");
        return;
      }
      if (!jobTitle.trim()) {
        setErrorMsg("Official job title is required for recruiter registration.");
        return;
      }
    }

    try {
      setIsLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      if (role === "candidate") {
        payload.headline = headline.trim();
        payload.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        payload.companyName = companyName.trim();
        payload.jobTitle = jobTitle.trim();
        payload.companyWebsite = companyWebsite.trim();
      }

      const user = await register(payload);
      success(
        role === "recruiter"
          ? `Welcome to HireFlow Talent Acquisition, ${user.name}!`
          : `Welcome to HireFlow, ${user.name}!`
      );

      if (user.role === "recruiter") {
        navigate("/recruiter/dashboard", { replace: true });
      } else {
        navigate("/candidate/dashboard", { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. An account with this email may already exist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-indigo-50/20 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-200/20 rounded-full blur-2xl pointer-events-none -z-10 animate-float" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center animate-fade-down flex flex-col items-center">
        <BrandLogo size="lg" to="/" className="mb-4" showTagline />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Your Account
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 underline underline-offset-2">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0 animate-fade-up">
        <Card className="p-6 sm:p-8 shadow-xl border-slate-200 bg-white/95 backdrop-blur-md">
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
                  onClick={() =>
                    navigate(
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "recruiter"
                        ? "/recruiter/dashboard"
                        : "/candidate/dashboard"
                    )
                  }
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
                    success("Signed out. You can now register a brand-new account.");
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole("candidate");
                  setErrorMsg("");
                }}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  role === "candidate"
                    ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20 text-indigo-950"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <User className={`w-4 h-4 ${role === "candidate" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>Job Seeker / Candidate</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Discover verified jobs, submit resumes, and track interviews.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("recruiter");
                  setErrorMsg("");
                }}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  role === "recruiter"
                    ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 text-blue-950"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Building2 className={`w-4 h-4 ${role === "recruiter" ? "text-blue-600" : "text-slate-400"}`} />
                  <span>Verified Employer / Recruiter</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Post openings, review applications, and manage candidates.
                </p>
              </button>
            </div>
          </div>

          {/* Employer Verification Banner */}
          {role === "recruiter" && (
            <div className="mb-6 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs space-y-1 animate-scale-in">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Enterprise Recruiter Gate</span>
              </div>
              <p className="text-blue-800 text-[11px]">
                To safeguard candidate privacy and prevent spam, Recruiter accounts require an <strong>official company work email</strong> and valid corporate information.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {role === "recruiter" ? "Corporate Work Email" : "Email Address"}
                </label>
                {role === "recruiter" && (
                  <span className="text-[10px] text-blue-600 font-semibold">
                    Work domain required
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "recruiter" ? "alex@yourcompany.com" : "alex@example.com"}
                  className={`w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    role === "recruiter" && isFreeDomain
                      ? "border-rose-300 focus:ring-rose-500 bg-rose-50/30"
                      : "border-slate-300 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {role === "recruiter" && isFreeDomain && (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Free webmail (@{emailDomain}) is not accepted for employer registration. Please use your corporate email.
                </p>
              )}
            </div>

            {/* Recruiter-Specific Fields */}
            {role === "recruiter" && (
              <div className="space-y-4 pt-1 animate-scale-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Company Legal Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Tech Labs"
                        className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Official Title
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Head of Talent"
                        className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://acmelabs.com"
                      className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Candidate-Specific Fields */}
            {role === "candidate" && (
              <div className="space-y-4 pt-1 animate-scale-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Role / Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, Python, AWS, Docker"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full py-2.5 justify-center shadow-md font-semibold text-sm gap-2 mt-2 btn-interactive"
            >
              {role === "recruiter" ? "Create Verified Employer Account" : "Create Candidate Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              By creating an account, you agree to HireFlow's Terms of Service and Privacy Policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
