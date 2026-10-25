import React, { useState, useEffect } from "react";
import { Layers, Search, Filter, Building2, User, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function AdminApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/admin/applications?${params.toString()}`);
      if (res.success) {
        setApplications(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      showToast(err.message || "Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applications Audit</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Platform-wide audit of candidate applications, hiring outcomes, and recruiter activity.
        </p>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Filter by Stage</span>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">All Applications</option>
          <option value="applied">Applied</option>
          <option value="under_review">Under Review</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview">Interview</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Layers} title="No applications found" description="No candidate applications match this stage." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Target Job</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.candidateId?.name || "Candidate"}</div>
                      <div className="text-slate-400 text-[11px]">{app.candidateId?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {app.jobId?.title || "Role"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {app.jobId?.companyId?.name || "Verified Employer"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          app.status === "selected" ? "success" :
                          app.status === "rejected" ? "error" :
                          app.status === "interview" ? "indigo" : "amber"
                        }
                        className="capitalize"
                      >
                        {app.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={pagination.page <= 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={pagination.page >= pagination.pages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
