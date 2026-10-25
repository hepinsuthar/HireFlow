import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Sparkles,
  Filter,
  CheckCircle2,
  Building2,
  ArrowRight
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function CandidateJobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 9,
        status: "published",
      });
      if (search.trim()) params.append("search", search.trim());
      if (location.trim()) params.append("location", location.trim());
      if (workMode) params.append("workMode", workMode);
      if (employmentType) params.append("employmentType", employmentType);

      const [jobsRes, savedRes] = await Promise.all([
        api.get(`/jobs?${params.toString()}`),
        api.get("/saved-jobs").catch(() => ({ success: false })),
      ]);

      if (jobsRes.success) {
        setJobs(jobsRes.data || []);
        setPagination(jobsRes.pagination || { page: 1, pages: 1, total: 0 });
      }
      if (savedRes.success && Array.isArray(savedRes.data)) {
        setSavedJobIds(new Set(savedRes.data.map(item => item.jobId?._id || item.jobId)));
      }
    } catch (err) {
      showToast(err.message || "Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, workMode, employmentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.post(`/saved-jobs/toggle/${jobId}`);
      if (res.success) {
        setSavedJobIds(prev => {
          const next = new Set(prev);
          if (next.has(jobId)) {
            next.delete(jobId);
            showToast("Job removed from bookmarks", "info");
          } else {
            next.add(jobId);
            showToast("Job saved to your bookmarks!", "success");
          }
          return next;
        });
      }
    } catch (err) {
      showToast(err.message || "Failed to update saved job", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setWorkMode("");
    setEmploymentType("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Verified Jobs</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Discover verified roles from vetted employers. View deterministic skill match scores and apply with one click.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 sm:p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Job title, skills (e.g. React)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Work Mode */}
            <select
              value={workMode}
              onChange={(e) => { setWorkMode(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Work Modes</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>

            {/* Employment Type */}
            <select
              value={employmentType}
              onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Employment Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 font-medium">
              Showing {pagination.total} published jobs
            </span>
            <div className="flex gap-2">
              {(search || location || workMode || employmentType) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <Button type="submit" size="sm">Search Jobs</Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try broadening your search keywords or resetting your location and employment filters."
          action={
            <Button size="sm" onClick={clearFilters}>Reset Filters</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job._id);
            return (
              <Card key={job._id} hover className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link
                        to={`/candidate/jobs/${job._id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.companyId?.name || "Verified Employer"}</span>
                        {job.companyId?.isVerified && (
                          <CheckCircle2 className="w-3 h-3 text-blue-500" title="Verified" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSave(job._id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        isSaved
                          ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                          : "border-slate-200 text-slate-400 hover:text-slate-600"
                      }`}
                      title={isSaved ? "Saved" : "Save Job"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-indigo-600" : ""}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="indigo" className="capitalize">{job.workMode || "Remote"}</Badge>
                    <Badge variant="slate" className="capitalize">{job.employmentType || "Full-Time"}</Badge>
                    {job.salaryMin && (
                      <Badge variant="emerald">
                        ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location || "Worldwide"}
                  </span>
                  <Link to={`/candidate/jobs/${job._id}`}>
                    <Button size="sm" variant="subtle" className="gap-1 text-xs">
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
