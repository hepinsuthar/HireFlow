import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Layers,
  Calendar,
  Bookmark,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function CandidateDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [anaRes, appRes, intRes] = await Promise.all([
          api.get("/analytics/candidate").catch(() => ({ success: false })),
          api.get("/applications/mine?limit=5").catch(() => ({ success: false })),
          api.get("/interviews").catch(() => ({ success: false })),
        ]);

        if (anaRes.success) setAnalytics(anaRes.data);
        if (appRes.success) setRecentApps(appRes.data || []);
        if (intRes.success) setInterviews((intRes.data || []).filter(i => i.status === "scheduled"));
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Candidate Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || "Candidate"}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200">
            Track your applications, practice AI mock interviews, and discover verified roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/candidate/jobs">
            <Button size="sm" className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold gap-1.5 shadow-sm">
              <Briefcase className="w-4 h-4" /> Explore Jobs
            </Button>
          </Link>
          <Link to="/candidate/ai-assistant">
            <Button size="sm" variant="subtle" className="bg-indigo-800 text-white hover:bg-indigo-700 border border-indigo-600 gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-300" /> AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Applied</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.totalApplications ?? recentApps.length}
            </div>
            <p className="text-[11px] text-slate-500">Active and submitted roles</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Under Review</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.underReview ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Being reviewed by recruiters</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Interviews</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.upcomingInterviews ?? interviews.length}
            </div>
            <p className="text-[11px] text-slate-500">Scheduled conversations</p>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Saved Jobs</span>
              <Bookmark className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {analytics?.savedJobsCount ?? 0}
            </div>
            <p className="text-[11px] text-slate-500">Bookmarked vacancies</p>
          </Card>
        </div>
      )}

      {/* Split Section: Upcoming Interviews & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Applications */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <Link to="/candidate/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton count={3} />
              </div>
            ) : recentApps.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Briefcase}
                  title="No applications yet"
                  description="Explore published job openings and apply with your verified resume."
                  action={
                    <Link to="/candidate/jobs">
                      <Button size="sm">Explore Jobs</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <div key={app._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{app.jobId?.title || "Job Posting"}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{app.jobId?.companyId?.name || "Verified Employer"}</span>
                        <span>•</span>
                        <span>Applied on {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {app.matchScore && (
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {app.matchScore}% Match
                        </span>
                      )}
                      <Badge variant={
                        app.status === "selected" ? "success" :
                        app.status === "rejected" ? "error" :
                        app.status === "interview" ? "indigo" :
                        app.status === "shortlisted" ? "purple" : "amber"
                      }>
                        {app.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Upcoming Interviews & Quick Tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Interviews</h2>
            <Link to="/candidate/interviews" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Schedule
            </Link>
          </div>

          <Card className="p-5 space-y-4">
            {interviews.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No upcoming interviews scheduled right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.slice(0, 3).map((item) => (
                  <div key={item._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.jobId?.title || "Interview"}</span>
                      <Badge variant="indigo" className="text-[10px]">{item.type || "video"}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.scheduledAt).toLocaleString()} ({item.durationMinutes || 45} mins)</span>
                    </div>
                    {item.meetingLink && (
                      <a
                        href={item.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:underline inline-block pt-1"
                      >
                        Join Meeting Link →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick AI Coaching Box */}
          <Card className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Career Copilot</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your resume and get instant deterministic skill analysis, honest tailoring advice, and practice technical questions.
            </p>
            <Link to="/candidate/ai-assistant">
              <Button size="sm" className="w-full gap-1.5 text-xs">
                Launch AI Assistant <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
