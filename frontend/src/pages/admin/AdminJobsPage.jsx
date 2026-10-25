import React, { useState, useEffect } from "react";
import { Briefcase, Search, CheckCircle2, XCircle, AlertTriangle, Building2, MapPin } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function AdminJobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/admin/jobs?${params.toString()}`);
      if (res.success) {
        setJobs(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      showToast(err.message || "Failed to load jobs for moderation", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleModerate = async (jobId, nextStatus) => {
    try {
      setUpdatingId(jobId);
      const res = await api.patch(`/admin/jobs/${jobId}/moderate`, { status: nextStatus });
      if (res.success) {
        setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: nextStatus } : j));
        showToast(`Job status set to ${nextStatus}.`, "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update job status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Moderation</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Audit and moderate job postings across all employer accounts.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          <Button type="submit" size="sm" className="w-full sm:w-auto">Filter</Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Briefcase} title="No jobs found" description="No jobs match your moderation filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Recruiter</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Posted Date</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {job.location || "Remote"} • {job.workMode}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {job.companyId?.name || "Company"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {job.recruiterId?.name || "Recruiter"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={job.status === "published" ? "success" : job.status === "closed" ? "slate" : "amber"}
                        className="capitalize"
                      >
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status !== "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerate(job._id, "published")}
                            disabled={updatingId === job._id}
                            className="text-[11px] py-1 px-2"
                          >
                            Publish
                          </Button>
                        )}
                        {job.status !== "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerate(job._id, "closed")}
                            disabled={updatingId === job._id}
                            className="text-[11px] py-1 px-2"
                          >
                            Close
                          </Button>
                        )}
                        {job.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerate(job._id, "archived")}
                            disabled={updatingId === job._id}
                            className="text-[11px] py-1 px-2 text-rose-600 hover:bg-rose-50"
                          >
                            Archive
                          </Button>
                        )}
                      </div>
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
