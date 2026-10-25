import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function RecruiterDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.get("/analytics/recruiter");
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load recruiter analytics", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const chartData = [
    { stage: "Applied", count: analytics?.applicationsByStatus?.applied || 0 },
    { stage: "Under Review", count: analytics?.applicationsByStatus?.under_review || 0 },
    { stage: "Shortlisted", count: analytics?.applicationsByStatus?.shortlisted || 0 },
    { stage: "Interview", count: analytics?.applicationsByStatus?.interview || 0 },
    { stage: "Selected", count: analytics?.applicationsByStatus?.selected || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
            Employer ATS Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Recruitment Command Center
          </h1>
          <p className="text-xs sm:text-sm text-blue-200">
            Manage your open jobs, review candidate pipelines, and schedule interviews with AI assistance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/recruiter/jobs">
            <Button size="sm" className="bg-white text-blue-900 hover:bg-blue-50 font-bold gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> Post New Job
            </Button>
          </Link>
          <Link to="/recruiter/ai-assistant">
            <Button size="sm" variant="subtle" className="bg-blue-800 text-white hover:bg-blue-700 border border-blue-600 gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-300" /> AI Drafter
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
              <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.publishedJobs ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">{analytics?.totalJobs ?? 0} total positions drafted</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Applicants</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.totalApplications ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Across all active postings</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">In Pipeline</span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {(analytics?.applicationsByStatus?.shortlisted || 0) + (analytics?.applicationsByStatus?.under_review || 0)}
            </div>
            <p className="text-[11px] text-slate-500">Review & shortlisted candidates</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Interviews</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.interviews ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Scheduled conversations</p>
          </Card>
        </div>
      )}

      {/* Chart & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recharts Funnel Chart */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Applicant Pipeline Distribution</h2>
          <Card className="p-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px", border: "none" }}
                    itemStyle={{ color: "#93c5fd" }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Applications */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Candidates</h2>
            <Link to="/recruiter/applications" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton count={3} />
              </div>
            ) : !analytics?.recentApplications || analytics.recentApplications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No candidate submissions yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {analytics.recentApplications.map((app) => (
                  <div key={app._id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{app.candidateId?.name || "Candidate"}</p>
                      <p className="text-slate-500 text-[11px]">{app.jobId?.title || "Role"}</p>
                    </div>
                    <Badge variant={app.status === "selected" ? "success" : "blue"}>
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
