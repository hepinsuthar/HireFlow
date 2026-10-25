import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Clock, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function RecruiterNotificationsPage() {
  const { showToast } = useToast();
  const { setUnreadCount } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications?limit=50");
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast("All notifications marked as read", "success");
    } catch (err) {
      showToast("Failed to mark all as read", "error");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Alerts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time notifications for incoming applications, interview bookings, and hiring milestones.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={handleMarkAllRead} className="gap-1.5">
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alerts right now"
          description="When new candidate applications are submitted, notifications will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                !n.isRead ? "bg-blue-50/40 border-blue-200" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    !n.isRead ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 p-1 cursor-pointer"
                  title="Mark as read"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
