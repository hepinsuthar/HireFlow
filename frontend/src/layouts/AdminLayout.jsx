import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Badge } from "../components/common/UI";
import { BrandLogo } from "../components/common/BrandLogo";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Directory", href: "/admin/users", icon: Users },
    { label: "Recruiters", href: "/admin/recruiters", icon: UserCheck },
    { label: "Companies", href: "/admin/companies", icon: Building2 },
    { label: "Job Moderation", href: "/admin/jobs", icon: Briefcase },
    { label: "Applications Audit", href: "/admin/applications", icon: Layers },
    { label: "System Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Admin Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (href) => {
    if (href === "/admin/dashboard") return location.pathname === "/admin/dashboard" || location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed inset-y-0 left-0 z-30 text-white">
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <BrandLogo size="sm" theme="dark" subtitle="Admin Center" to="/admin/dashboard" />
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
                    ? "bg-indigo-600 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
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
              <span className="text-slate-900 font-semibold">Admin Center</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">
                {location.pathname.split("/")[2] || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/settings"
              className="flex items-center gap-2 py-1 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {user?.name || "Admin"}
              </span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex">
            <div className="w-64 bg-slate-900 text-white h-full flex flex-col p-4 shadow-xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-2">
                <BrandLogo size="sm" theme="dark" subtitle="Admin Center" to="/admin/dashboard" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
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
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-slate-800 transition-colors"
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
