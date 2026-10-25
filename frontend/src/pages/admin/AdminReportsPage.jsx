import React, { useState, useEffect } from "react";
import { BarChart3, Download, Users, Briefcase, Layers, Calendar, Building2, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton } from "../../components/common/UI";

export function AdminReportsPage() {
  const { showToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await api.get("/admin/reports");
        if (res.success) {
          setReport(res.data);
        }
      } catch (err) {
        showToast(err.message || "Failed to load reports", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hireflow-audit-report-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Audit report JSON downloaded!", "success");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Activity Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit summary of system records, user acquisition, and hiring platform throughput.
          </p>
        </div>
        <Button size="sm" onClick={handleExport} className="gap-1.5 shadow-sm">
          <Download className="w-4 h-4" /> Export Report JSON
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Users</span>
              <div className="text-2xl font-bold text-slate-900">{report?.metrics?.totalUsers ?? 0}</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Companies</span>
              <div className="text-2xl font-bold text-slate-900">{report?.metrics?.totalCompanies ?? 0}</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Jobs</span>
              <div className="text-2xl font-bold text-slate-900">{report?.metrics?.totalJobs ?? 0}</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Applications</span>
              <div className="text-2xl font-bold text-slate-900">{report?.metrics?.totalApplications ?? 0}</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Interviews</span>
              <div className="text-2xl font-bold text-slate-900">{report?.metrics?.totalInterviews ?? 0}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Recent User Registrations</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {report?.recentUsers?.map((u) => (
                  <div key={u._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-slate-400 text-[11px]">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "admin" ? "purple" : u.role === "recruiter" ? "blue" : "indigo"}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Recent Job Vacancies</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {report?.recentJobs?.map((j) => (
                  <div key={j._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{j.title}</p>
                      <p className="text-slate-400 text-[11px]">{j.companyId?.name || "Company"}</p>
                    </div>
                    <Badge variant={j.status === "published" ? "success" : "slate"}>
                      {j.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
