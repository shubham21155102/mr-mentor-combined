"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (adminData: AdminFormData) => void;
}

export interface AdminFormData {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  graduationYear: string;
  branch: string;
  companyName: string;
  designation: string;
  linkedinUrl: string;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<AdminFormData>({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    graduationYear: "",
    branch: "",
    companyName: "",
    designation: "",
    linkedinUrl: "",
  });

  if (!isOpen) return null;

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields: (keyof AdminFormData)[] = [
      "fullName",
      "email",
      "phone",
      "college",
      "graduationYear",
      "branch",
      "companyName",
      "designation",
    ];

    const hasEmptyFields = requiredFields.some((field) => !formData[field]);

    if (hasEmptyFields) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 z-40 transition-opacity cursor-default"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto pointer-events-none">
        <div className="bg-[#c4c4c4] rounded-3xl shadow-2xl w-full max-w-5xl my-8 pointer-events-auto">
          {/* Header */}
          <div className="relative px-6 py-6 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-black">Add New Admin</h2>
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-black hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Form Content */}
          <div className="px-10 pb-10">
            {/* Row 1: Full Name & Email */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name*"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
            </div>

            {/* Row 2: Phone & College */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number*"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="College*"
                  value={formData.college}
                  onChange={(e) => handleInputChange("college", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
            </div>

            {/* Row 3: Graduation Year & Branch */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="relative">
                <select
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                >
                  <option value="">Graduation Year*</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i - 5;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-400"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Branch*"
                  value={formData.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
            </div>

            {/* Row 4: Company Name & Designation */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Company Name*"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Designation*"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
            </div>

            {/* Row 5: LinkedIn URL */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="w-full max-w-md bg-[#1a97a4] hover:bg-[#157d89] text-white font-bold py-4 px-8 rounded-full transition-colors"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddAdminModal;