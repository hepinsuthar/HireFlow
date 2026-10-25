import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Video, Phone, MapPin, Building2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState } from "../../components/common/UI";

export function CandidateInterviewsPage() {
  const { showToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        setLoading(true);
        const res = await api.get("/interviews");
        if (res.success) {
          setInterviews(res.data || []);
        }
      } catch (err) {
        showToast(err.message || "Failed to load interviews", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="indigo">Scheduled</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Schedule</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review upcoming technical and hiring manager conversations, join video rooms, and check feedback.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          description="When recruiters advance your applications to the interview stage, scheduled meetings will appear here."
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <Card key={item._id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {item.jobId?.title || "Role Interview"}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.jobId?.companyId?.name || "Verified Employer"}</span>
                    <span>•</span>
                    <span className="capitalize">{item.type || "Video Call"}</span>
                  </div>
                </div>

                {item.meetingLink && item.status === "scheduled" && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <Video className="w-4 h-4" /> Join Video Meeting <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Scheduled Date & Time</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Planned Duration</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {item.durationMinutes || 45} minutes
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location / Link</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">
                    {item.meetingLink || item.location || "Online Video Conference"}
                  </p>
                </div>
              </div>

              {item.feedback && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900">Recruiter Feedback Note:</span>
                  <p className="leading-relaxed">{item.feedback}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
