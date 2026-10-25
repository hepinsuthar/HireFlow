import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  MapPin,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  Code2,
  Link2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Card, Button, Badge, LoadingSkeleton, EmptyState, Modal } from "../../components/common/UI";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

export function RecruiterCandidatesPage() {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/candidates?limit=50");
      if (res.success) {
        setCandidates(res.data || []);
      }
    } catch (err) {
      showToast(err.message || "Failed to load candidate talent pool", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const nameMatch = (c.userId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.headline || "").toLowerCase().includes(search.toLowerCase());
    const skillMatch = !skillFilter || (c.skills || []).some(s => s.toLowerCase().includes(skillFilter.toLowerCase()));
    return nameMatch && skillMatch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Talent Directory</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search qualified talent by verified skills, experience, and location for direct outreach.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name or headline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Sparkles className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by skill token (e.g. React, Docker, Python)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Candidates Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filteredCandidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="Try broadening your skill keyword search to view more profiles."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate._id} hover className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {candidate.userId?.name?.charAt(0) || "C"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {candidate.userId?.name || "Candidate"}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{candidate.headline || "Software Engineer"}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {candidate.location || "Remote"}
                    </p>
                  </div>
                </div>

                {/* Skills tags */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {candidate.skills.slice(0, 5).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                    {candidate.skills.length > 5 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{candidate.skills.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {candidate.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {candidate.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {candidate.experience?.length || 0} work positions
                </span>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => setSelectedCandidate(candidate)}
                  className="gap-1 text-xs"
                >
                  View Profile <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Candidate Profile Details Modal */}
      <Modal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.userId?.name || "Candidate Profile"}
        maxWidth="max-w-2xl"
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shrink-0">
                {selectedCandidate.userId?.name?.charAt(0) || "C"}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{selectedCandidate.userId?.name}</h3>
                <p className="text-xs font-semibold text-blue-600">{selectedCandidate.headline || "Professional Profile"}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {selectedCandidate.location || "Worldwide / Remote"}
                  <span>•</span>
                  <span>{selectedCandidate.userId?.email}</span>
                </p>
              </div>
            </div>

            {/* Social / External Links */}
            {(selectedCandidate.portfolioUrl || selectedCandidate.githubUrl || selectedCandidate.linkedinUrl) && (
              <div className="flex flex-wrap gap-3 text-xs">
                {selectedCandidate.portfolioUrl && (
                  <a href={selectedCandidate.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> Portfolio
                  </a>
                )}
                {selectedCandidate.githubUrl && (
                  <a href={selectedCandidate.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-slate-700 hover:underline">
                    <Code2 className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
                {selectedCandidate.linkedinUrl && (
                  <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Link2 className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            )}

            {/* Bio */}
            {selectedCandidate.bio && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">About</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedCandidate.bio}</p>
              </div>
            )}

            {/* Skills & Competencies */}
            {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Skills & Competencies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.skills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Demonstrable Skill Evidence */}
            {selectedCandidate.skillEvidence && selectedCandidate.skillEvidence.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Demonstrable Skill Evidence ({selectedCandidate.skillEvidence.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCandidate.skillEvidence.map((ev, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ev.skill}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                          Self-Reported
                        </span>
                      </div>
                      <div className="font-medium text-slate-800 text-[11px]">{ev.title}</div>
                      {ev.contribution && (
                        <p className="text-slate-600 text-[11px]">
                          <strong>Contribution:</strong> {ev.contribution}
                        </p>
                      )}
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline pt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View Evidence Artifact
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work History */}
            {selectedCandidate.experience && selectedCandidate.experience.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Experience History</h4>
                <div className="space-y-2">
                  {selectedCandidate.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                      <div className="font-bold text-slate-900">{exp.jobTitle || exp.title}</div>
                      <div className="text-slate-500 font-medium">{exp.company} • {exp.location || "Remote"}</div>
                      {exp.description && <p className="text-slate-600 text-[11px] pt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" onClick={() => setSelectedCandidate(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
