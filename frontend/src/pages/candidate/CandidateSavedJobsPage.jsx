import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Building2, MapPin, Trash2, ArrowRight, Briefcase } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function CandidateSavedJobsPage() {
  const { showToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get("/saved-jobs");
      if (res.success) {
        setSavedJobs(res.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load saved jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      const res = await api.post(`/saved-jobs/toggle/${jobId}`);
      if (res.success) {
        setSavedJobs(prev => prev.filter(item => (item.jobId?._id || item.jobId) !== jobId));
        showToast("Removed from saved jobs", "info");
      }
    } catch (err) {
      showToast(err.message || "Failed to remove job", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Positions you bookmarked to review or apply for later.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Browse published vacancies and bookmark the roles that fit your background."
          action={
            <Link to="/candidate/jobs">
              <Button size="sm">Explore Open Positions</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((item) => {
            const job = item.jobId;
            if (!job) return null;
            return (
              <Card key={item._id} className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <Link
                        to={`/candidate/jobs/${job._id}`}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.companyId?.name || "Verified Employer"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(job._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
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
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location || "Worldwide"}
                  </span>
                  <Link to={`/candidate/jobs/${job._id}`}>
                    <Button size="sm" className="gap-1 text-xs">
                      View & Apply <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
