import React, { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Globe,
  Link2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Card, Button, Badge, LoadingSkeleton } from "../../components/common/UI";
import { SkillEvidenceManager } from "../../components/candidate/SkillEvidenceManager";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../api/client";

export function CandidateProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || "");
  const [headline, setHeadline] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillEvidence, setSkillEvidence] = useState([]);

  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await api.get("/candidates/profile");
        if (res.success && res.data) {
          const p = res.data;
          setHeadline(p.headline || "");
          setPhone(p.phone || "");
          setLocation(p.location || "");
          setBio(p.bio || "");
          setPortfolioUrl(p.portfolioUrl || "");
          setGithubUrl(p.githubUrl || "");
          setLinkedinUrl(p.linkedinUrl || "");
          setSkills(p.skills || []);
          setSkillEvidence(p.skillEvidence || []);
          setExperience(p.experience || []);
          setEducation(p.education || []);
          setProjects(p.projects || []);
          setProfileCompletion(p.profileCompletion || 0);
          if (p.userId?.name) setName(p.userId.name);
        }
      } catch (err) {
        error("Unable to load profile information.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [error]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleEvidenceUpdated = (newEvidence) => {
    setSkillEvidence(newEvidence);
    if (Array.isArray(newEvidence)) {
      const evidenceSkills = newEvidence.map((e) => e.skill).filter(Boolean);
      setSkills((prev) => Array.from(new Set([...prev, ...evidenceSkills])));
    }
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        jobTitle: "",
        employmentType: "full-time",
        location: "",
        startDate: "",
        endDate: "",
        isCurrentlyWorking: false,
        description: ""
      }
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Education Handlers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        isCurrentlyStudying: false,
        description: ""
      }
    ]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Projects Handlers
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        name: "",
        description: "",
        technologies: [],
        projectUrl: "",
        repositoryUrl: ""
      }
    ]);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name,
        headline,
        phone,
        location,
        bio,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
        skills,
        experience,
        education,
        projects
      };

      const res = await api.put("/candidates/profile", payload);
      if (res.success) {
        success("Profile updated successfully!");
        setProfileCompletion(res.data.profileCompletion || 0);
        updateUser({ name });
      }
    } catch (err) {
      error(err.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingSkeleton count={3} type="list" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Save Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Your profile data is used for deterministic job matching and tailored AI resume suggestions.
            </p>
          </div>
          <Button
            onClick={handleSaveProfile}
            isLoading={isSaving}
            size="md"
            className="self-start sm:self-auto"
          >
            <Save className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>

        {/* Profile Completion Card */}
        <Card className="mb-8 bg-white border-indigo-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0">
              {profileCompletion}%
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile Completeness</h3>
              <p className="text-xs text-slate-500">
                Complete profiles rank significantly higher in recruiter candidate searches.
              </p>
            </div>
          </div>
          <div className="w-32 hidden sm:block">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {/* Section 1: Basic Information */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Basic Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Executive Bio / Summary
              </label>
              <textarea
                rows={3}
                placeholder="Brief summary of your expertise, passions, and background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </Card>

          {/* Section 2: Links */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Online Profiles & Portfolio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Portfolio Website
                </label>
                <input
                  type="url"
                  placeholder="https://yourname.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </Card>

          {/* Section 3: Skills */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" /> Skills & Competencies
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a skill (e.g. React, TypeScript, Docker) and press Add..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="button" onClick={handleAddSkill} size="sm">
                Add Skill
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-indigo-900 text-indigo-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Card>

          {/* Section 4: Signature Feature — Demonstrable Skill Evidence */}
          <SkillEvidenceManager
            evidence={skillEvidence}
            skills={skills}
            onEvidenceUpdated={handleEvidenceUpdated}
          />

          {/* Section 5: Work Experience */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Work Experience
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddExperience}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Position
              </Button>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No experience entries added yet.</p>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) => handleUpdateExperience(index, "jobTitle", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description & Impact</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Section 5: Education */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddEducation}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Degree
              </Button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No education records added yet.</p>
            ) : (
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-slate-50/50 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => handleUpdateEducation(index, "fieldOfStudy", e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Bottom Save Bar */}
          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={handleSaveProfile}
              size="lg"
              isLoading={isSaving}
              className="w-full sm:w-auto px-8"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
