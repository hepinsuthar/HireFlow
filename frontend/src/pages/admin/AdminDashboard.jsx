import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Layers,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  Database,
  BarChart3
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "../../api/client";
import { Card, Button, Badge, LoadingSkeleton } from "../../components/common/UI";

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get("/analytics/admin");
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load admin analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = [
    { role: "Candidates", count: analytics?.usersByRole?.candidate || 0 },
    { role: "Recruiters", count: analytics?.usersByRole?.recruiter || 0 },
    { role: "Admins", count: analytics?.usersByRole?.admin || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Platform Governance & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitor platform-wide activity, manage users & recruiters, and moderate vacancies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/reports">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 font-bold gap-1.5 shadow-sm">
              <BarChart3 className="w-4 h-4" /> System Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.totals?.users ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Registered platform accounts</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Jobs</span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.totals?.jobs ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Vacancies across all employers</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
              <Layers className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.totals?.applications ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Total submissions</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Interviews</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.totals?.interviews ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Scheduled conversations</p>
          </Card>
        </div>
      )}

      {/* Chart & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">User Distribution by Role</h2>
          <Card className="p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="role" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px", border: "none" }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Administrative Governance</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link to="/admin/users">
              <Card hover className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">User Management</h4>
                    <p className="text-[11px] text-slate-500">Activate or deactivate user accounts</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link to="/admin/recruiters">
              <Card hover className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Recruiter Operations</h4>
                    <p className="text-[11px] text-slate-500">Manage recruiters and company affiliations</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link to="/admin/jobs">
              <Card hover className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Job Moderation</h4>
                    <p className="text-[11px] text-slate-500">Review and moderate job postings</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>

            <Link to="/admin/companies">
              <Card hover className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Company Verification</h4>
                    <p className="text-[11px] text-slate-500">Grant verified employer status</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
