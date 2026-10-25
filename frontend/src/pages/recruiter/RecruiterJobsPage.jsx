import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  DollarSign
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState, Modal } from "../../components/common/UI";

export function RecruiterJobsPage() {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    location: "Remote",
    workMode: "remote",
    employmentType: "full-time",
    salaryMin: "",
    salaryMax: "",
    status: "published",
  });
  const [saving, setSaving] = useState(false);
  const [draftingAi, setDraftingAi] = useState(false);

  // Search / filter
  const [search, setSearch] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/jobs?limit=100");
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      description: "",
      requirements: "",
      skills: "",
      location: "Remote",
      workMode: "remote",
      employmentType: "full-time",
      salaryMin: "",
      salaryMax: "",
      status: "published",
    });
    setModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      skills: (job.skills || []).join(", "),
      location: job.location || "Remote",
      workMode: job.workMode || "remote",
      employmentType: job.employmentType || "full-time",
      salaryMin: job.salaryMin || "",
      salaryMax: job.salaryMax || "",
      status: job.status || "published",
    });
    setModalOpen(true);
  };

  const handleAiDraft = async () => {
    if (!formData.title.trim()) {
      showToast("Please enter a job title first.", "error");
      return;
    }
    try {
      setDraftingAi(true);
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.post("/ai/job-description", {
        title: formData.title.trim(),
        skills: skillsArray,
        location: formData.location,
        employmentType: formData.employmentType,
      });

      if (res.success && res.data?.description) {
        setFormData((prev) => ({ ...prev, description: res.data.description }));
        showToast("Job description drafted with Gemini AI! You can now review and edit.", "success");
      }
    } catch (err) {
      showToast(err.message || "AI drafting failed. Check GEMINI_API_KEY.", "error");
    } finally {
      setDraftingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast("Title and Description are required.", "error");
      return;
    }

    const payload = {
      ...formData,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
    };

    try {
      setSaving(true);
      if (editingJob) {
        const res = await api.put(`/jobs/${editingJob._id}`, payload);
        if (res.success) {
          showToast("Job updated successfully!", "success");
          setModalOpen(false);
          fetchJobs();
        }
      } else {
        const res = await api.post("/jobs", payload);
        if (res.success) {
          showToast("Job vacancy created successfully!", "success");
          setModalOpen(false);
          fetchJobs();
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to save job", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === "published" ? "closed" : "published";
    try {
      const res = await api.patch(`/jobs/${job._id}/status`, { status: nextStatus });
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === job._id ? { ...j, status: nextStatus } : j))
        );
        showToast(`Job status changed to ${nextStatus}`, "success");
      }
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
        showToast("Job vacancy deleted", "info");
      }
    } catch (err) {
      showToast(err.message || "Failed to delete job", "error");
    }
  };

  const filteredJobs = search.trim()
    ? jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()))
    : jobs;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Postings Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, edit, publish, and moderate your company's open vacancies.
          </p>
        </div>
        <Button onClick={openCreateModal} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Post New Job
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your job listings by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Jobs Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Briefcase}
              title="No jobs posted yet"
              description="Create your first job posting to start receiving verified candidate applications."
              action={
                <Button size="sm" onClick={openCreateModal}>
                  Create First Job
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Title & Details</th>
                  <th className="py-3 px-4">Work Mode</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Posted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3" /> {job.location || "Remote"}
                        {job.salaryMin && (
                          <span>• ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-700">
                      {job.workMode || "remote"}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-700">
                      {job.employmentType || "full-time"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={job.status === "published" ? "success" : "slate"} className="capitalize">
                        {job.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-[11px] cursor-pointer"
                        >
                          {job.status === "published" ? "Close" : "Publish"}
                        </button>
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Job Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingJob ? "Edit Job Posting" : "Post a New Vacancy"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Work Mode
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, MongoDB, TypeScript"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min Salary (USD/yr)
              </label>
              <input
                type="number"
                placeholder="120000"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Salary (USD/yr)
              </label>
              <input
                type="number"
                placeholder="160000"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* AI Drafting helper button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">Need help writing the description?</span>
            <button
              type="button"
              onClick={handleAiDraft}
              disabled={draftingAi}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {draftingAi ? "Generating..." : "Draft with Gemini AI"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Detailed description of the role, team, and company culture..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Requirements & Qualifications
            </label>
            <textarea
              rows={3}
              placeholder="e.g. 5+ years building full-stack applications, BS in CS or equivalent..."
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={saving}>
              {editingJob ? "Save Changes" : "Create Posting"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
