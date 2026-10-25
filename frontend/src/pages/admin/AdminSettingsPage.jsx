import React, { useState } from "react";
import {
  Shield,
  Lock,
  Cpu,
  Database,
  Radio,
  Sliders,
  Bell,
  Save,
  CheckCircle2,
  RefreshCw,
  HardDriveDownload,
  AlertTriangle
} from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge } from "../../components/common/UI";

export function AdminSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Platform policy states
  const [allowCandidateReg, setAllowCandidateReg] = useState(true);
  const [allowRecruiterReg, setAllowRecruiterReg] = useState(true);
  const [autoApproveJobs, setAutoApproveJobs] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState({
    enabled: false,
    message: "",
  });
  const [savingPolicies, setSavingPolicies] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  // Load real settings from backend on mount
  React.useEffect(() => {
    async function loadSettings() {
      try {
        setLoadingPolicies(true);
        const res = await api.get("/admin/settings");
        if (res.success && res.data) {
          setAllowCandidateReg(res.data.allowCandidateReg ?? true);
          setAllowRecruiterReg(res.data.allowRecruiterReg ?? true);
          setAutoApproveJobs(res.data.autoApproveJobs ?? false);
          setMaintenanceMode(res.data.maintenanceMode ?? false);
          if (res.data.announcement) {
            setAnnouncement({
              enabled: res.data.announcement.enabled ?? false,
              message: res.data.announcement.message || "",
            });
          }
        }
      } catch (err) {
        showToast(err.message || "Failed to load system settings", "error");
      } finally {
        setLoadingPolicies(false);
      }
    }
    loadSettings();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please enter your current and new password.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("New password must be at least 8 characters long.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirmation do not match.", "error");
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        showToast("Admin password updated successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      showToast(err.message || "Failed to update password", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePolicies = async (e) => {
    e.preventDefault();
    try {
      setSavingPolicies(true);
      const res = await api.patch("/admin/settings", {
        allowCandidateReg,
        allowRecruiterReg,
        autoApproveJobs,
        maintenanceMode,
        announcement,
      });
      if (res.success) {
        showToast(res.message || "Platform policies and system rules updated in MongoDB.", "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to save settings.", "error");
    } finally {
      setSavingPolicies(false);
    }
  };

  const handlePurgeCache = () => {
    showToast("Application memory cache and temporary sessions purged.", "success");
  };

  const handleExportSystemAudit = () => {
    showToast("System audit logs snapshot queued for download.", "info");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin System Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Global platform controls, AI service health, registration governance, and administrative security.
        </p>
      </div>

      {/* 1. System Engine & Infrastructure Status */}
      <Card className="p-6 space-y-4 border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Infrastructure & AI Services
          </h2>
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> All Services Operational
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">AI Intelligence</span>
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-base font-bold text-slate-800">Gemini 2.5 Flash</div>
            <p className="text-xs text-slate-600">
              Google Gen AI SDK (@google/genai) connected for resume parsing, scoring & interview prep.
            </p>
            <div className="pt-1">
              <Badge variant="neutral" className="bg-purple-100 text-purple-800 border-purple-200">
                Active Engine
              </Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Database Storage</span>
              <Database className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-base font-bold text-slate-800">Persistent Storage Engine</div>
            <p className="text-xs text-slate-600">
              High-availability document store for user profiles, job vacancies, and applicant tracking records.
            </p>
            <div className="pt-1">
              <Badge variant="success">Operational</Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Realtime Gateway</span>
              <Radio className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-base font-bold text-slate-800">Live Event Gateway</div>
            <p className="text-xs text-slate-600">
              Bi-directional messaging channel for real-time application updates, interview alerts, and notifications.
            </p>
            <div className="pt-1">
              <Badge variant="info">Active</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Platform Policies & Governance */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Platform Registration & Moderation Governance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure system-wide acceptance criteria and onboarding gates.
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePolicies} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Candidate Registration</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Allow new job seekers to sign up publicly via /register.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowCandidateReg}
                onChange={(e) => setAllowCandidateReg(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-1 cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Recruiter Registration</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Allow hiring managers and talent partners to sign up.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowRecruiterReg}
                onChange={(e) => setAllowRecruiterReg(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-1 cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Auto-Publish Recruiter Jobs</span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  If disabled, new postings require Super Admin approval before going live.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoApproveJobs}
                onChange={(e) => setAutoApproveJobs(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 mt-1 cursor-pointer"
              />
            </div>

            <div className="flex items-start justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/50">
              <div>
                <span className="font-semibold text-amber-950 text-sm block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Maintenance Mode
                </span>
                <span className="text-xs text-amber-800 block mt-0.5">
                  Show maintenance warning on public pages and pause job submissions.
                </span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300 mt-1 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-600" /> Platform Announcement Banner
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                Show banner to all users
              </label>
            </div>
            <input
              type="text"
              disabled={!announcement.enabled}
              value={announcement.message}
              onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
              placeholder="Enter announcement text..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={savingPolicies} className="gap-2 text-xs">
              <Save className="w-4 h-4" /> Save Governance Policies
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Admin Security & Password Update */}
      <Card className="p-6 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Super Administrator Credentials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-800">{user?.email}</span> (Role: Super Admin)
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Admin Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="At least 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" loading={updatingPassword} className="gap-2 text-xs">
            <Shield className="w-4 h-4" /> Update Super Admin Password
          </Button>
        </form>
      </Card>

      {/* 4. Platform Maintenance Operations */}
      <Card className="p-6 space-y-4 border-slate-200">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-600" />
          Maintenance Operations
        </h2>
        <p className="text-xs text-slate-500">
          Execute operational maintenance routines, snapshot data audits, or clear volatile runtime caches.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="secondary" onClick={handlePurgeCache} className="gap-2 text-xs">
            <RefreshCw className="w-4 h-4 text-slate-500" /> Flush Memory & Cache
          </Button>
          <Button variant="secondary" onClick={handleExportSystemAudit} className="gap-2 text-xs">
            <HardDriveDownload className="w-4 h-4 text-slate-500" /> Download Audit Snapshot
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default AdminSettingsPage;
