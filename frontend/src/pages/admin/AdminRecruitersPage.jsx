import React, { useState, useEffect } from "react";
import { UserCheck, Search, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function AdminRecruitersPage() {
  const { showToast } = useToast();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(`/admin/recruiters?${params.toString()}`);
      if (res.success) {
        setRecruiters(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      showToast(err.message || "Failed to load recruiters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecruiters();
  };

  const handleToggleActive = async (user) => {
    const nextStatus = !user.isActive;
    try {
      setUpdatingId(user._id);
      const res = await api.patch(`/admin/users/${user._id}/active`, { isActive: nextStatus });
      if (res.success) {
        setRecruiters(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));
        showToast(`Recruiter ${user.name} is now ${nextStatus ? "active" : "disabled"}.`, "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update recruiter status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Operations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor employer accounts, company affiliations, and posting privileges.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recruiter name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : recruiters.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={UserCheck} title="No recruiters found" description="No recruiter accounts match your criteria." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Recruiter</th>
                  <th className="py-3 px-4">Company Organization</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recruiters.map((r) => {
                  const company = r.profile?.companyId;
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.name}</div>
                        <div className="text-slate-400 text-[11px]">{r.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {company ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{company.name}</span>
                            {company.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" title="Verified Employer" />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No company linked</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={r.isActive ? "success" : "slate"}>
                          {r.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant={r.isActive ? "outline" : "primary"}
                          onClick={() => handleToggleActive(r)}
                          disabled={updatingId === r._id}
                          className="text-[11px] py-1 px-2.5"
                        >
                          {updatingId === r._id ? "Updating..." : r.isActive ? "Suspend Access" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
