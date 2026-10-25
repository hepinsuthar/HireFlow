import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Briefcase
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function CandidateApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    async function loadApps() {
      try {
        setLoading(true);
        const res = await api.get("/applications/mine?limit=50");
        if (res.success) {
          setApplications(res.data || []);
        }
      } catch (err) {
        showToast(err.message || "Failed to load applications", "error");
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  const filteredApps = statusFilter
    ? applications.filter((a) => a.status === statusFilter)
    : applications;

  const getStatusBadge = (status) => {
    switch (status) {
      case "applied":
        return <Badge variant="slate">Applied</Badge>;
      case "under_review":
        return <Badge variant="amber">Under Review</Badge>;
      case "shortlisted":
        return <Badge variant="purple">Shortlisted</Badge>;
      case "interview":
        return <Badge variant="indigo">Interview Scheduled</Badge>;
      case "selected":
        return <Badge variant="success">Selected / Offer</Badge>;
      case "rejected":
        return <Badge variant="error">Not Selected</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const steps = ["applied", "under_review", "shortlisted", "interview", "selected"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status tracking and audit history for all your submitted job applications.
          </p>
        </div>
        <Link to="/candidate/jobs">
          <Button size="sm" variant="outline" className="gap-1.5">
            <Briefcase className="w-4 h-4" /> Explore More Jobs
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            statusFilter === "" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All ({applications.length})
        </button>
        <button
          onClick={() => setStatusFilter("applied")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            statusFilter === "applied" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Applied
        </button>
        <button
          onClick={() => setStatusFilter("under_review")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            statusFilter === "under_review" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Under Review
        </button>
        <button
          onClick={() => setStatusFilter("shortlisted")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            statusFilter === "shortlisted" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Shortlisted
        </button>
        <button
          onClick={() => setStatusFilter("interview")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
            statusFilter === "interview" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Interview
        </button>
      </div>

      {/* Applications List */}
      {loading ? (
        <LoadingSkeleton count={4} />
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No applications in this category"
          description="Explore published job openings and apply with your verified resume."
          action={
            <Link to="/candidate/jobs">
              <Button size="sm">Explore Open Positions</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <Card key={app._id} className="p-6 space-y-5 border-slate-200/90">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/candidate/jobs/${app.jobId?._id}`}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {app.jobId?.title || "Job Posting"}
                    </Link>
                    {app.matchScore && (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {app.matchScore}% Match
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{app.jobId?.companyId?.name || "Verified Employer"}</span>
                    <span>•</span>
                    <span>Applied on {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  {steps.map((step, idx) => {
                    const currentIndex = steps.indexOf(app.status === "rejected" ? "applied" : app.status);
                    const isCompleted = idx <= currentIndex && app.status !== "rejected";
                    const isCurrent = step === app.status;

                    return (
                      <div key={step} className="flex items-center gap-2 flex-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                            isCurrent
                              ? "bg-indigo-600 text-white ring-2 ring-indigo-200"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span
                          className={`capitalize text-[11px] font-medium ${
                            isCurrent
                              ? "text-indigo-900 font-bold"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {step.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Status history audit notes if present */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-700">Latest Update:</span>{" "}
                    {app.statusHistory[app.statusHistory.length - 1]?.note || "Status updated by hiring team."}{" "}
                    <span className="text-slate-400">
                      ({new Date(app.statusHistory[app.statusHistory.length - 1]?.changedAt || Date.now()).toLocaleDateString()})
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
