import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  User,
  Briefcase
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState, Modal } from "../../components/common/UI";

export function RecruiterInterviewsPage() {
  const { showToast } = useToast();
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewType, setInterviewType] = useState("video");
  const [meetingLink, setMeetingLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [intRes, appRes] = await Promise.all([
        api.get("/interviews"),
        api.get("/applications?limit=100").catch(() => ({ success: false })),
      ]);

      if (intRes.success) setInterviews(intRes.data || []);
      if (appRes.success) {
        setApplications(appRes.data || []);
        if (appRes.data?.length > 0) setSelectedAppId(appRes.data[0]._id);
      }
    } catch (err) {
      showToast(err.message || "Failed to load interviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setScheduledAt("");
    setDurationMinutes(45);
    setInterviewType("video");
    setMeetingLink("https://meet.google.com/new");
    setFeedback("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setSelectedAppId(item.applicationId?._id || item.applicationId);
    setScheduledAt(item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : "");
    setDurationMinutes(item.durationMinutes || 45);
    setInterviewType(item.type || "video");
    setMeetingLink(item.meetingLink || "");
    setFeedback(item.feedback || "");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      showToast("Please choose interview date and time", "error");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const res = await api.put(`/interviews/${editingId}`, {
          scheduledAt,
          durationMinutes: Number(durationMinutes),
          type: interviewType,
          meetingLink,
          feedback,
        });
        if (res.success) {
          showToast("Interview updated successfully!", "success");
          setModalOpen(false);
          fetchData();
        }
      } else {
        const chosenApp = applications.find((a) => a._id === selectedAppId);
        if (!chosenApp) {
          showToast("Please select a candidate application", "error");
          return;
        }

        const res = await api.post("/interviews", {
          applicationId: chosenApp._id,
          jobId: chosenApp.jobId?._id || chosenApp.jobId,
          candidateId: chosenApp.candidateId?._id || chosenApp.candidateId,
          scheduledAt,
          durationMinutes: Number(durationMinutes),
          type: interviewType,
          meetingLink,
        });
        if (res.success) {
          showToast("Interview scheduled and candidate notified!", "success");
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to schedule interview", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this interview?")) return;
    try {
      const res = await api.delete(`/interviews/${id}`);
      if (res.success) {
        setInterviews((prev) => prev.filter((i) => i._id !== id));
        showToast("Interview cancelled", "info");
      }
    } catch (err) {
      showToast(err.message || "Cancel failed", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interview Operations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coordinate panel conversations, share video links, and capture candidate evaluation notes.
          </p>
        </div>
        <Button onClick={openCreateModal} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Schedule Interview
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled interviews"
          description="Schedule a technical or HR interview with one of your applicant candidates."
          action={
            <Button size="sm" onClick={openCreateModal}>
              Schedule First Interview
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((item) => (
            <Card key={item._id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {item.candidateId?.name || "Candidate"}
                    </span>
                    <Badge variant={item.status === "completed" ? "success" : "blue"}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Position: <span className="font-semibold text-slate-700">{item.jobId?.title || "Role"}</span> • {item.type}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.meetingLink && (
                    <a
                      href={item.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" /> Meeting Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Edit Interview"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCancel(item._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Cancel Interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Scheduled Time</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(item.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Duration</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {item.durationMinutes || 45} minutes
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Candidate Email</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {item.candidateId?.email || "—"}
                  </p>
                </div>
              </div>

              {item.feedback && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900">Interviewer Notes:</span>
                  <p>{item.feedback}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Update Interview Schedule" : "Schedule New Interview"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {!editingId && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Candidate Application *
              </label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {applications.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.candidateId?.name} — {a.jobId?.title} ({a.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="video">Video Conference</option>
                <option value="phone">Phone Screening</option>
                <option value="onsite">On-site In Person</option>
                <option value="technical">Technical Panel</option>
                <option value="hr">HR Culture Fit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Link / URL
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback / Evaluation Notes
            </label>
            <textarea
              rows={3}
              placeholder="Record candidate strengths, technical proficiency, and recommendation..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={saving}>
              {editingId ? "Save Updates" : "Schedule Interview"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
