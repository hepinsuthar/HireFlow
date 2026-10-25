import React, { useState, useEffect } from "react";
import { Building2, Globe, MapPin, CheckCircle2, Save, Sparkles } from "lucide-react";
import { api } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Card, Button, Badge, LoadingSkeleton } from "../../components/common/UI";

export function RecruiterCompanyPage() {
  const { showToast } = useToast();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    async function loadCompany() {
      try {
        setLoading(true);
        const res = await api.get("/companies");
        if (res.success && res.data?.length > 0) {
          const comp = res.data[0];
          setCompany(comp);
          setName(comp.name || "");
          setWebsite(comp.website || "");
          setLocation(comp.location || "");
          setDescription(comp.description || "");
        }
      } catch (err) {
        showToast(err.message || "Failed to load company details", "error");
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Company name is required", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        website: website.trim(),
        location: location.trim(),
        description: description.trim(),
      };

      if (company?._id) {
        const res = await api.put(`/companies/${company._id}`, payload);
        if (res.success) {
          showToast("Company profile updated successfully!", "success");
          setCompany(res.data);
        }
      } else {
        const res = await api.post("/companies", payload);
        if (res.success) {
          showToast("Company profile established!", "success");
          setCompany(res.data);
        }
      }
    } catch (err) {
      showToast(err.message || "Failed to save company information", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employer Organization</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your company brand, public careers profile, and verification credentials.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                {name ? name.charAt(0) : "C"}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{name || "Your Company Name"}</h3>
                <div className="flex items-center gap-2">
                  {company?.isVerified ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Employer
                    </Badge>
                  ) : (
                    <Badge variant="slate">Verification Pending</Badge>
                  )}
                  {location && <span className="text-xs text-slate-400">• {location}</span>}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="CloudScale Systems"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Headquarters / Primary Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Description & Culture
              </label>
              <textarea
                rows={4}
                placeholder="Share your mission, values, tech stack, and benefits..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" isLoading={saving} className="gap-1.5">
                <Save className="w-4 h-4" /> Save Company Profile
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
