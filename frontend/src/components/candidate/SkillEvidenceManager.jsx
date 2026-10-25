import React, { useState } from "react";
import {
  FileCheck2,
  Plus,
  ExternalLink,
  Trash2,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from "lucide-react";
import { Card, Button, Badge, Modal } from "../common/UI";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";

const EVIDENCE_TYPES = [
  { value: "project", label: "Project & Codebase", icon: FolderGit2 },
  { value: "repository", label: "Git Repository", icon: FolderGit2 },
  { value: "work_experience", label: "Employment Impact", icon: Briefcase },
  { value: "portfolio", label: "Live Portfolio / Demo", icon: Globe },
  { value: "certification", label: "Technical Certification", icon: Award },
  { value: "education", label: "Academic / Coursework", icon: GraduationCap },
  { value: "other", label: "Other Demonstrable Artifact", icon: FileCheck2 },
];

export function SkillEvidenceManager({ evidence = [], skills = [], onEvidenceUpdated }) {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [selectedSkill, setSelectedSkill] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [evidenceType, setEvidenceType] = useState("project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contribution, setContribution] = useState("");
  const [url, setUrl] = useState("");

  const openAddModal = (initialSkill = "") => {
    setEditingId(null);
    setSelectedSkill(initialSkill || (skills[0] || ""));
    setCustomSkill("");
    setEvidenceType("project");
    setTitle("");
    setDescription("");
    setContribution("");
    setUrl("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setSelectedSkill(item.skill);
    setCustomSkill("");
    setEvidenceType(item.evidenceType || "project");
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContribution(item.contribution || "");
    setUrl(item.url || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const targetSkill = selectedSkill === "__custom__" ? customSkill.trim() : selectedSkill.trim();
    if (!targetSkill) {
      setErrorMsg("Please select or enter the skill this evidence supports.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please provide a title for this evidence (e.g. project name or repository).");
      return;
    }
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      setErrorMsg("URL must start with http:// or https://");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        skill: targetSkill,
        evidenceType,
        title: title.trim(),
        description: description.trim(),
        contribution: contribution.trim(),
        url: url.trim()
      };

      if (editingId) {
        const res = await api.put(`/candidates/evidence/${editingId}`, payload);
        if (res.success) {
          showToast("Skill evidence updated successfully", "success");
          if (onEvidenceUpdated) onEvidenceUpdated();
          setModalOpen(false);
        }
      } else {
        const res = await api.post("/candidates/evidence", payload);
        if (res.success) {
          showToast(`Evidence linked to ${targetSkill}!`, "success");
          if (onEvidenceUpdated) onEvidenceUpdated();
          setModalOpen(false);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to save skill evidence.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this evidence item?")) return;
    try {
      const res = await api.delete(`/candidates/evidence/${id}`);
      if (res.success) {
        showToast("Skill evidence removed", "success");
        if (onEvidenceUpdated) onEvidenceUpdated();
      }
    } catch (err) {
      showToast(err.message || "Failed to delete evidence item", "error");
    }
  };

  // Group evidence by skill for structured review
  const evidenceBySkill = {};
  evidence.forEach((item) => {
    const key = item.skill || "General";
    if (!evidenceBySkill[key]) evidenceBySkill[key] = [];
    evidenceBySkill[key].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Evidence Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Skill Evidence Portfolio
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {evidence.length} Artifact{evidence.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            HireFlow connects job requirements directly to your tangible work. Attach code repositories, project deliverables, and verified contributions to validate your skills.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => openAddModal()}
          className="gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Skill Evidence
        </Button>
      </div>

      {/* Verification Notice */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Evidence Transparency Principle:</span> Artifacts and repositories you submit are designated as <span className="font-medium text-slate-900 underline decoration-slate-300">Self-Reported</span> until hiring teams evaluate them against role criteria. We never claim external links are verified without human assessment.
        </div>
      </div>

      {/* Empty State */}
      {evidence.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No skill evidence recorded yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Hiring teams prioritize candidates with demonstrable work over unverified skill keywords. Attach a project or repository to start standing out.
          </p>
          <div className="mt-4">
            <Button size="sm" variant="outline" onClick={() => openAddModal()} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Link Your First Skill Proof
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(evidenceBySkill).map(([skillName, items]) => (
            <Card key={skillName} className="p-4 sm:p-5 border-slate-200 bg-white hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Skill:</span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    {skillName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({items.length} supporting proof{items.length === 1 ? "" : "s"})
                  </span>
                </div>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => openAddModal(skillName)}
                  className="text-indigo-600 hover:text-indigo-700 gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" /> Add More
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {items.map((item) => {
                  const typeObj = EVIDENCE_TYPES.find((t) => t.value === item.evidenceType) || EVIDENCE_TYPES[0];
                  const Icon = typeObj.icon;
                  return (
                    <div
                      key={item._id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h5>
                          </div>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">
                            <ShieldAlert className="w-2.5 h-2.5 text-amber-600" /> Self-Reported
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        {item.contribution && (
                          <div className="text-[11px] bg-white p-2 rounded-lg border border-slate-200/60 text-slate-700">
                            <span className="font-semibold text-slate-900">Contribution: </span>
                            {item.contribution}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <span>Inspect Artifact</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">No public URL provided</span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                            title="Edit evidence"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove evidence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Evidence Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Skill Evidence" : "Record Demonstrable Skill Evidence"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Skill Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Target Skill *
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {skills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                <option value="__custom__">+ Enter another skill name...</option>
              </select>
            </div>

            {selectedSkill === "__custom__" && (
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                  Custom Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Docker, GraphQL, Kubernetes"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Evidence Type *
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {EVIDENCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Evidence Title / Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Task Queue, Stripe Billing Microservice, Acme Corp Migration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Artifact Link (GitHub Repository, Live Demo, or Documentation)
            </label>
            <input
              type="url"
              placeholder="https://github.com/yourusername/project or https://yourportfolio.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Links are validated and made accessible to authorized recruiters reviewing your applications.
            </span>
          </div>

          {/* Contribution */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Your Specific Contribution & Impact
            </label>
            <textarea
              rows={2}
              placeholder="Describe what you specifically architected, built, or debugged with this skill..."
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Technical Description */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Architecture & Problem Context (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Technical challenge, design patterns used, scale, or performance metrics achieved..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
            >
              {editingId ? "Update Evidence" : "Save & Attach Evidence"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SkillEvidenceManager;
