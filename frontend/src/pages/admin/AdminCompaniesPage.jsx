import React, { useState, useEffect } from "react";
import { Building2, Search, CheckCircle2, Globe, MapPin, ShieldCheck } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function AdminCompaniesPage() {
  const { showToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search.trim()) params.append("search", search.trim());

      const res = await api.get(`/admin/companies?${params.toString()}`);
      if (res.success) {
        setCompanies(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      showToast(err.message || "Failed to load companies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const handleToggleVerify = async (company) => {
    const nextStatus = !company.isVerified;
    try {
      setUpdatingId(company._id);
      const res = await api.patch(`/admin/companies/${company._id}/verify`, { isVerified: nextStatus });
      if (res.success) {
        setCompanies(prev => prev.map(c => c._id === company._id ? { ...c, isVerified: nextStatus } : c));
        showToast(`Company ${company.name} verification ${nextStatus ? "granted" : "revoked"}.`, "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update verification", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employer Organizations</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review company credentials, audit public profiles, and grant verified employer badges.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies by name..."
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
        ) : companies.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Building2} title="No companies found" description="No employer organizations match your search filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {c.name}
                        {c.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                      <div className="text-slate-400 text-[11px]">Created by: {c.createdBy?.name || "System"}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.location || "Remote"}</td>
                    <td className="py-3 px-4">
                      {c.website ? (
                        <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {c.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={c.isVerified ? "success" : "slate"}>
                        {c.isVerified ? "Verified Employer" : "Pending Review"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={c.isVerified ? "outline" : "primary"}
                        onClick={() => handleToggleVerify(c)}
                        disabled={updatingId === c._id}
                        className="text-[11px] py-1 px-2.5"
                      >
                        {updatingId === c._id ? "Updating..." : c.isVerified ? "Revoke Badge" : "Verify Employer"}
                      </Button>
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
