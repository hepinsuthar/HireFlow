import React, { useState } from "react";
import { Mail, Clock, ShieldCheck, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "../../api/client";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "candidate",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
  const [responseMessage, setResponseMessage] = useState("");

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address (e.g., alex@company.com).";
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field upon typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      setResponseMessage("");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const res = await api.post("/contact", payload);

      if (res?.success) {
        setSubmitStatus("success");
        setResponseMessage(
          res.message || "Thank you for reaching out! A HireFlow specialist will respond within 24 business hours."
        );
        setFormData({
          name: "",
          email: "",
          role: "candidate",
          subject: "",
          message: "",
        });
        setErrors({});
      } else {
        setSubmitStatus("error");
        setResponseMessage(res?.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      setSubmitStatus("error");
      setResponseMessage(
        err.message || "Unable to reach server. Please check your network connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-12 lg:py-16 bg-[#F8FAFC] border-b border-[#E5EAF5] scroll-mt-16 text-left selection:bg-indigo-500 selection:text-white"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11.5px] font-bold uppercase tracking-widest text-[#2563EB] bg-[#EEF2FF] px-3.5 py-1 rounded-full border border-[#DBEAFE] inline-block">
            Get In Touch
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-[#101B45] tracking-tight">
            Contact Us
          </h2>
          <p className="text-xs sm:text-[14px] text-slate-500 leading-relaxed">
            Have questions about AI match scoring, skill evidence verification, or enterprise recruiting? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        {/* 2-Column Layout: Contact Cards (Left) & Real Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info Cards & Privacy Commitments */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card 1: Direct Email Support */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#101B45] text-sm">Direct Support Email</h3>
                  <a
                    href="mailto:support@hireflow.dev"
                    className="text-xs font-semibold text-[#2563EB] hover:underline"
                  >
                    support@hireflow.dev
                  </a>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 pt-1 leading-relaxed">
                For platform inquiries, candidate feedback, or recruiter account assistance.
              </p>
            </div>

            {/* Card 2: Office Hours & Response SLA */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#101B45] text-sm">Response Time Guarantee</h3>
                  <span className="text-xs font-semibold text-slate-700">Under 24 Business Hours</span>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 pt-1 leading-relaxed">
                Monday – Friday: 9:00 AM – 6:00 PM EST. Urgent recruiter inquiries are prioritized.
              </p>
            </div>

            {/* Card 3: Human-in-the-Loop & Privacy Safeguard */}
            <div className="p-5 bg-linear-to-br from-[#EEF2FF] to-white rounded-2xl border border-[#DBEAFE] shadow-2xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#101B45] text-sm">Ethical AI & Data Protection</h3>
                  <span className="text-xs font-medium text-indigo-700">Strict Privacy Protocols</span>
                </div>
              </div>
              <p className="text-[12px] text-slate-600 pt-1 leading-relaxed">
                Your inquiry data is securely stored in our encrypted MongoDB repository. We never share contact details with third-party advertisers.
              </p>
            </div>
          </div>

          {/* Right Column: Functional Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs">
            {submitStatus === "success" ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xs border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#101B45]">Message Sent Successfully!</h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {responseMessage}
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitStatus(null);
                      setResponseMessage("");
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {submitStatus === "error" && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{responseMessage}</span>
                  </div>
                )}

                {/* Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1 text-left">
                    <label htmlFor="contact-name" className="block text-xs font-bold text-slate-800">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      disabled={isSubmitting}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Morgan"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.name
                          ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200"
                          : "border-slate-200 focus:border-[#2563EB] focus:ring-blue-100 bg-slate-50/50"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-[11px] font-medium text-rose-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1 text-left">
                    <label htmlFor="contact-email" className="block text-xs font-bold text-slate-800">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="alex@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200"
                          : "border-slate-200 focus:border-[#2563EB] focus:ring-blue-100 bg-slate-50/50"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] font-medium text-rose-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Role / Inquiry Category & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category / Role Selection */}
                  <div className="space-y-1 text-left">
                    <label htmlFor="contact-role" className="block text-xs font-bold text-slate-800">
                      I Am A...
                    </label>
                    <select
                      id="contact-role"
                      name="role"
                      disabled={isSubmitting}
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 bg-slate-50/50 text-xs sm:text-sm transition-all focus:outline-none"
                    >
                      <option value="candidate">Job Seeker / Candidate</option>
                      <option value="recruiter">Recruiter / Talent Lead</option>
                      <option value="employer">Enterprise / Employer</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1 text-left">
                    <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-800">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Question about skill verification"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.subject
                          ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200"
                          : "border-slate-200 focus:border-[#2563EB] focus:ring-blue-100 bg-slate-50/50"
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-[11px] font-medium text-rose-600">{errors.subject}</p>
                    )}
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-1 text-left">
                  <label htmlFor="contact-message" className="block text-xs font-bold text-slate-800">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about what you need assistance with..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 resize-y ${
                      errors.message
                        ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200"
                        : "border-slate-200 focus:border-[#2563EB] focus:ring-blue-100 bg-slate-50/50"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] font-medium text-rose-600">{errors.message}</p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-400 text-left">
                    Fields marked with <span className="text-rose-500">*</span> are required.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-linear-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-full shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
