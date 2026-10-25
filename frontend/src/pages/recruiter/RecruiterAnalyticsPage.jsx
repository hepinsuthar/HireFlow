import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Briefcase, Calendar, Layers } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { api } from "../../api/client";
import { Card, LoadingSkeleton } from "../../components/common/UI";

export function RecruiterAnalyticsPage() {
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

  const pipelineData = [
    { name: "Applied", value: analytics?.applicationsByStatus?.applied || 0, color: "#94a3b8" },
    { name: "Under Review", value: analytics?.applicationsByStatus?.under_review || 0, color: "#f59e0b" },
    { name: "Shortlisted", value: analytics?.applicationsByStatus?.shortlisted || 0, color: "#8b5cf6" },
    { name: "Interview", value: analytics?.applicationsByStatus?.interview || 0, color: "#3b82f6" },
    { name: "Selected", value: analytics?.applicationsByStatus?.selected || 0, color: "#10b981" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruitment Analytics</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics on candidate flow, pipeline stage velocity, and active hiring campaigns.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Jobs</span>
              <div className="text-2xl font-bold text-slate-900">{analytics?.publishedJobs || 0}</div>
              <p className="text-[11px] text-slate-500">Total: {analytics?.totalJobs || 0}</p>
            </Card>

            <Card className="p-5 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Candidates</span>
              <div className="text-2xl font-bold text-slate-900">{analytics?.totalApplications || 0}</div>
              <p className="text-[11px] text-slate-500">Across company postings</p>
            </Card>

            <Card className="p-5 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Interviews Conducted</span>
              <div className="text-2xl font-bold text-slate-900">{analytics?.interviews || 0}</div>
              <p className="text-[11px] text-slate-500">Panel & technical rounds</p>
            </Card>

            <Card className="p-5 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Offer Acceptance</span>
              <div className="text-2xl font-bold text-emerald-600">
                {analytics?.applicationsByStatus?.selected || 0}
              </div>
              <p className="text-[11px] text-slate-500">Final hires extended</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Pipeline Stage Volume</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px", border: "none" }}
                    />
                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Stage Proportions</h3>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0.75rem", color: "#fff", fontSize: "12px", border: "none" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
