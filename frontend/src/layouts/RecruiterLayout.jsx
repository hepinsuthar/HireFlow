import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Sparkles,
  LayoutDashboard,
  Briefcase,
  Layers,
  Users,
  Calendar,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Badge, Button } from "../components/common/UI";
import { BrandLogo } from "../components/common/BrandLogo";

export function RecruiterLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { label: "Manage Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Applicant Pipeline", href: "/recruiter/applications", icon: Layers },
    { label: "Candidate Search", href: "/recruiter/candidates", icon: Users },
    { label: "Interviews", href: "/recruiter/interviews", icon: Calendar },
    { label: "Company Profile", href: "/recruiter/company", icon: Building2 },
    { label: "AI Recruiting Assistant", href: "/recruiter/ai-assistant", icon: Sparkles, badge: "Gemini" },
    { label: "Analytics", href: "/recruiter/analytics", icon: BarChart3 },
    { label: "Notifications", href: "/recruiter/notifications", icon: Bell, count: unreadCount },
    { label: "Settings", href: "/recruiter/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (href) => {
    if (href === "/recruiter/dashboard") return location.pathname === "/recruiter/dashboard" || location.pathname === "/recruiter";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 fixed inset-y-0 left-0 z-30">
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <BrandLogo size="sm" subtitle="Employer ATS" to="/recruiter/dashboard" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="blue" className="text-[10px] py-0 px-1.5 font-bold">
                    {item.badge}
                  </Badge>
                )}
                {item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || "R"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Recruiter"}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-900 font-semibold">Employer Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">
                {location.pathname.split("/")[2] || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/recruiter/jobs">
              <Button size="sm" className="hidden sm:inline-flex gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-xs">
                <Plus className="w-3.5 h-3.5" /> Post Job
              </Button>
            </Link>

            <Link
              to="/recruiter/notifications"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </Link>

            <Link
              to="/recruiter/settings"
              className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || "R"}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {user?.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white h-full flex flex-col p-4 shadow-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-2">
                <BrandLogo size="sm" subtitle="Employer ATS" to="/recruiter/dashboard" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                        active
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && <Badge variant="blue">{item.badge}</Badge>}
                      {item.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        )}

        {/* Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
