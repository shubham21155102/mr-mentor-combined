"use client";

import React, { useState } from "react";
import { X, ChevronDown, Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IssueFormData {
  name: string;
  email: string;
  issueType: string;
  description: string;
  attachment?: File;
}

const issueTypes = [
  "Technical Issue",
  "Account Problem",
  "Payment Issue",
  "Feature Request",
  "Bug Report",
  "Other"
];

export default function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<IssueFormData>({
    name: user?.name || "",
    email: user?.email || "",
    issueType: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when user changes
  React.useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      issueType: "",
      description: "",
    });
  }, [user]);

  const handleInputChange = (field: keyof IssueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, attachment: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: isAuthenticated ? user?.name : formData.name,
          email: isAuthenticated ? user?.email : formData.email,
          issueType: formData.issueType,
          description: formData.description,
          attachment: formData.attachment ? formData.attachment.name : null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Reset form and close modal
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          issueType: "",
          description: "",
        });
        onClose();
        
        // Show success message (you could add a toast notification here)
        alert('Issue reported successfully! We will contact you within 3-5 business days.');
      } else {
        throw new Error(result.error || 'Failed to submit issue');
      }
    } catch (error) {
      console.error("Error submitting issue:", error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-[669px] overflow-hidden"
        style={{
          borderRadius: "24px",
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.70) 0%, rgba(255, 255, 255, 0.70) 100%), linear-gradient(to bottom right, rgba(15, 145, 159, 0.40) 0%, rgba(18, 58, 83, 0.40) 50%) bottom right / 50% 50% no-repeat, linear-gradient(to bottom left, rgba(15, 145, 159, 0.40) 0%, rgba(18, 58, 83, 0.40) 50%) bottom left / 50% 50% no-repeat, linear-gradient(to top left, rgba(15, 145, 159, 0.40) 0%, rgba(18, 58, 83, 0.40) 50%) top left / 50% 50% no-repeat, linear-gradient(to top right, rgba(15, 145, 159, 0.40) 0%, rgba(18, 58, 83, 0.40) 50%) top right / 50% 50% no-repeat",
          backdropFilter: "blur(115.25px)",
        }}
      >
        {/* Background decoration (non-interactive so it doesn't block clicks) */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-36 h-32 bg-gradient-to-br  rounded-lg rotate-45 pointer-events-none"></div>
        </div>

        {/* Close button moved later with higher z-index to avoid being covered */}

  {/* Content */}
  <div className="relative z-10 p-8 pb-20">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-black tracking-[0.5px] mb-2">
              Report an issue
            </h2>
            <p className="text-[#3b3b3b] text-xl tracking-[-0.4px]">
              Get in touch with us. We are here to help you
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Name field - only show for non-authenticated users */}
              {!isAuthenticated && (
                <div className="bg-[#e9edf0] rounded-xl p-4 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="flex-1 bg-transparent text-[#919191] text-xl placeholder-[#919191] focus:outline-none"
                    required
                  />
                  <span className="text-red-500 text-xl">*</span>
                </div>
              )}

              {/* Email field - only show for non-authenticated users */}
              {!isAuthenticated && (
                <div className="bg-[#e9edf0] rounded-xl p-4 flex items-center gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="flex-1 bg-transparent text-[#919191] text-xl placeholder-[#919191] focus:outline-none"
                    required
                  />
                  <span className="text-red-500 text-xl">*</span>
                </div>
              )}

              {/* Issue Type dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-[#e9edf0] rounded-xl p-4 flex items-center justify-between text-[#919191] text-xl"
                >
                  <span className={formData.issueType ? "text-black" : ""}>
                    {formData.issueType || "Issue Type"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">*</span>
                    <ChevronDown className={`w-6 h-6 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                    {issueTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          handleInputChange("issueType", type);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description field */}
              <div className="bg-[#e9edf0] rounded-xl p-4 h-[140px] flex items-start gap-3">
                <textarea
                  placeholder="Describe your issue"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="flex-1 h-full bg-transparent text-[#919191] text-xl placeholder-[#919191] focus:outline-none resize-none"
                  required
                />
                <span className="text-red-500 text-xl">*</span>
              </div>

              {/* File attachment */}
              <div className="bg-white border border-black/20 rounded-xl p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Paperclip className="w-6 h-6 text-[#919191]" />
                  <span className="text-[#919191] text-xl">Attach Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* removed inline bottom message so it can span full modal width */}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-[#1a97a4] text-[#1a97a4] rounded-[30px] px-6 py-4 text-xl font-medium hover:bg-[#1a97a4] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || 
                  !formData.issueType || 
                  !formData.description ||
                  (!isAuthenticated && (!formData.name || !formData.email))
                }
                className="flex-1 bg-[#cccccc] text-[#929292] rounded-[30px] px-6 py-4 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a97a4] hover:text-white transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Report"}
              </button>
            </div>
          </form>
        </div>

        {/* Full-width bottom message bar (spans the full modal width) */}
        <div className="absolute left-0 right-0 bottom-0 h-[35px] bg-[#0b1b2a] flex items-center justify-center z-10">
          <div className="text-center text-white text-base tracking-[0.5px]">
            We will contact you within 3-5 business days.
          </div>
        </div>

        {/* Close button (re-added at the end with high z-index so it's always clickable) */}
        <button
          type="button"
          onClick={() => { console.log('close button clicked'); onClose(); }}
          aria-label="Close report modal"
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors pointer-events-auto"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Bottom decoration */}
      </div>
    </div>
  );
}
