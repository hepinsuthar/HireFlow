import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Clock
} from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton, EmptyState, Modal } from "../../components/common/UI";

export function CandidateResumePage() {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewResume, setViewResume] = useState(null);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/resumes");
      if (res.success) {
        setResumes(res.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load resumes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      showToast("Please select a PDF or DOCX file.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit.", "error");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const res = await api.post("/resumes/upload", formData);
      if (res.success) {
        showToast("Resume uploaded & parsed successfully!", "success");
        setSelectedFile(null);
        fetchResumes();
      }
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await api.delete(`/resumes/${id}`);
      if (res.success) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
        showToast("Resume deleted", "info");
      }
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Upload and manage your CV documents. Our parsing engine automatically extracts your skills and career history.
        </p>
      </div>

      {/* Upload Box */}
      <Card className="p-6 sm:p-8 border-dashed border-2 border-slate-300/80 bg-slate-50/50">
        <form onSubmit={handleUpload} className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">
              {selectedFile ? selectedFile.name : "Choose a resume to upload"}
            </p>
            <p className="text-xs text-slate-500">
              Supported formats: PDF, DOCX (Max: 10MB). Automatically extracted into structured data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors">
                Browse Document
              </span>
            </label>

            {selectedFile && (
              <Button type="submit" size="sm" isLoading={uploading}>
                Upload & Parse Resume
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Resumes List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Uploaded Resumes</h2>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes uploaded yet"
            description="Upload a PDF or Word document to attach it to job applications and power AI skill matching."
          />
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <Card key={resume._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {resume.originalName || resume.fileName || "Candidate Resume"}
                      </span>
                      {resume.extractedText && (
                        <Badge variant="emerald" className="text-[10px]">Text Extracted</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{(resume.size / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>Uploaded on {new Date(resume.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => setViewResume(resume)}
                  >
                    <Eye className="w-3.5 h-3.5" /> View Text
                  </Button>

                  {resume.fileUrl && (
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resume Content Preview Modal */}
      <Modal
        isOpen={Boolean(viewResume)}
        onClose={() => setViewResume(null)}
        title={viewResume?.originalName || "Resume Parsed Text"}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Extracted UTF-8 text from your uploaded document.</span>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {viewResume?.extractedText || "No readable text was extracted from this file."}
          </div>

          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setViewResume(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
