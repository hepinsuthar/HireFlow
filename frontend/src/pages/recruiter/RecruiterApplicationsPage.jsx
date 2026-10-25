import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Edit3,
  User,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState, Modal } from "../../components/common/UI";
import { CandidateEvidenceReviewModal } from "../../components/recruiter/CandidateEvidenceReviewModal";

export function RecruiterApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Evidence Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAppId, setReviewAppId] = useState(null);

  const openEvidenceReview = (appId) => {
    setReviewAppId(appId);
    setReviewModalOpen(true);
  };

  // Update status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState("under_review");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications?limit=100");
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load candidate applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openStatusModal = (app) => {
    setSelectedApp(app);
    // Suggest next allowed status
    const defaultNext = {
      applied: "under_review",
      under_review: "shortlisted",
      shortlisted: "interview",
      interview: "selected",
      selected: "selected",
      rejected: "rejected"
    };
    setNewStatus(defaultNext[app.status] || "under_review");
    setStatusNote("");
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      const res = await api.patch(`/applications/${selectedApp._id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });

      if (res.success) {
        showToast(`Candidate status updated to ${newStatus.replace("_", " ")}!`, "success");
        setApplications((prev) =>
          prev.map((a) => (a._id === selectedApp._id ? { ...a, status: newStatus } : a))
        );
        setStatusModalOpen(false);
      }
    } catch (err) {
      showToast(err.message || "Failed to update candidate status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !search ||
      (app.candidateId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (app.jobId?.title || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applicant Pipeline</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review candidate submissions, inspect deterministic match scores, and progress candidates through hiring stages.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name or role title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Stages ({applications.length})</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Candidates Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Layers}
              title="No applications match criteria"
              description="Candidates who apply to your published vacancies will appear in this pipeline."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Job</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {app.candidateId?.name || "Candidate"}
                      </div>
                      <div className="text-slate-400 text-[11px]">{app.candidateId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{app.jobId?.title || "Role"}</div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {app.jobId?.workMode || "Remote"} • {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => openEvidenceReview(app._id)}
                        className="font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Click to view explainable criteria breakdown"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        {app.matchScore ?? "—"}% Match
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          app.status === "selected" ? "success" :
                          app.status === "rejected" ? "error" :
                          app.status === "interview" ? "indigo" :
                          app.status === "shortlisted" ? "purple" : "amber"
                        }
                        className="capitalize"
                      >
                        {app.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {app.resumeId?.fileUrl ? (
                        <a
                          href={app.resumeId.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" /> View CV
                        </a>
                      ) : (
                        <span className="text-slate-400">Profile Data Only</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => openEvidenceReview(app._id)}
                          className="gap-1 text-xs"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Review Evidence
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStatusModal(app)}
                          className="gap-1 text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Stage
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Update Candidate Stage Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Advance Candidate: ${selectedApp?.candidateId?.name || "Candidate"}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select New Stage *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview Scheduled</option>
              <option value="selected">Selected / Offer Extended</option>
              <option value="rejected">Not Selected / Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Internal Team Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Candidate excelled in technical take-home; advancing to panel round..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={updating}>
              Confirm Status Change
            </Button>
          </div>
        </form>
      </Modal>

      {/* Structured Evidence Review Modal */}
      <CandidateEvidenceReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        applicationId={reviewAppId}
        onEvaluationSaved={fetchApplications}
      />
    </div>
  );
}
