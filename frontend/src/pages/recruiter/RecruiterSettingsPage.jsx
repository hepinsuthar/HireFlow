import React, { useState } from "react";
import { Lock, User, Building2, Save, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge } from "../../components/common/UI";

export function RecruiterSettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [instantAlerts, setInstantAlerts] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("Please enter both current and new passwords.", "error");
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
        showToast("Password updated successfully!", "success");
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your recruiter credentials, security preferences, and pipeline notification channels.
        </p>
      </div>

      {/* Account Info */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" /> Recruiter Identity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Full Name</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{user?.name || "Recruiter"}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Work Email</span>
            <p className="font-semibold text-slate-800 text-sm mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Role</span>
            <p className="mt-0.5">
              <Badge variant="blue" className="capitalize">Verified Recruiter</Badge>
            </p>
          </div>
        </div>
      </Card>

      {/* Security & Password */}
      <Card className="p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" /> Change Password
          </h3>
          <p className="text-xs text-slate-500">
            Ensure your account uses a secure password to protect company recruitment pipelines.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password (min. 8 characters) *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" size="sm" isLoading={updatingPassword} className="gap-1.5">
            <Save className="w-4 h-4" /> Update Password
          </Button>
        </form>
      </Card>

      {/* Pipeline Notifications */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Pipeline Alert Toggles</h3>
        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer text-xs">
          <div>
            <p className="font-bold text-slate-800">New Application Alerts</p>
            <p className="text-slate-500">Receive instant notifications when candidates submit applications to your jobs.</p>
          </div>
          <input
            type="checkbox"
            checked={instantAlerts}
            onChange={(e) => {
              setInstantAlerts(e.target.checked);
              showToast("Alert preferences saved", "info");
            }}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </label>
      </Card>
    </div>
  );
}
