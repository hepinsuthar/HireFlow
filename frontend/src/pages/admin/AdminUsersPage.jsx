import React, { useState, useEffect } from "react";
import { Users, Search, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 15 });
      if (search.trim()) params.append("search", search.trim());
      if (roleFilter) params.append("role", roleFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (err) {
      showToast(err.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleActive = async (user) => {
    const nextStatus = !user.isActive;
    try {
      setUpdatingId(user._id);
      const res = await api.patch(`/admin/users/${user._id}/active`, { isActive: nextStatus });
      if (res.success) {
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: nextStatus } : u));
        showToast(`User ${user.name} is now ${nextStatus ? "activated" : "disabled"}.`, "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update user status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Directory</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search platform users, audit roles, and activate or deactivate accounts.
        </p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Roles</option>
            <option value="candidate">Candidate</option>
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>

          <Button type="submit" size="sm" className="w-full sm:w-auto">Search</Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" description="No user accounts match your search filter." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === "admin" ? "purple" : u.role === "recruiter" ? "blue" : "indigo"} className="capitalize">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.isActive ? "success" : "slate"}>
                        {u.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant={u.isActive ? "outline" : "primary"}
                        onClick={() => handleToggleActive(u)}
                        disabled={updatingId === u._id}
                        className="text-[11px] py-1 px-2.5"
                      >
                        {updatingId === u._id ? "Updating..." : u.isActive ? "Deactivate" : "Activate"}
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
            <span className="text-slate-500">Page {pagination.page} of {pagination.pages} ({pagination.total} total)</span>
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
