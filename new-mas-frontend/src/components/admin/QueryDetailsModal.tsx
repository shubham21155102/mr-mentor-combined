"use client";

import React, { useState } from "react";
import { X, ArrowLeft, Paperclip, Download, ChevronDown } from "lucide-react";

interface QueryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: {
    id: string;
    type: string;
    user: {
      name: string;
      avatar: string;
      role: string;
    };
    status: string;
    timestamp: Date;
    title?: string;
    description: string;
    attachments?: {
      id: string;
      name: string;
      type: string;
      url: string;
    }[];
    attachmentNote?: string;
  } | null;
  onStatusChange?: (queryId: string, newStatus: string) => void;
}

const QueryDetailsModal: React.FC<QueryDetailsModalProps> = ({
  isOpen,
  onClose,
  query,
  onStatusChange,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(query?.status || "");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  if (!isOpen || !query) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-[#fff4ce] text-[#b58100]";
      case "open":
        return "bg-[#ddf4ff] text-[#0969da]";
      case "resolved":
        return "bg-[#d4f4dd] text-[#1a7f37]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in-progress":
        return "In-progress";
      case "open":
        return "Open";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bug":
        return "Bug";
      case "feedback":
        return "Feedback";
      case "feature-request":
        return "Feature Request";
      default:
        return type;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setShowStatusDropdown(false);
    if (onStatusChange) {
      onStatusChange(query.id, newStatus);
    }
  };

  const handleDownloadFiles = () => {
    console.log("Download all files for query:", query.id);
    // Implement download all files functionality
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    console.log("Download file:", fileName);
    // Implement individual file download
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                Query Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Query Header Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {getTypeLabel(query.type)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a97a4] to-[#157d89] flex items-center justify-center text-white text-sm font-semibold">
                      {query.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-900">
                        {query.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {query.user.role}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#1a97a4] font-medium mb-2">
                    {formatDate(query.timestamp)} {formatTime(query.timestamp)}
                  </div>
                  {/* Status Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getStatusBadgeColor(
                        selectedStatus
                      )}`}
                    >
                      {getStatusLabel(selectedStatus)}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[160px]">
                        <button
                          onClick={() => handleStatusChange("open")}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          <span className="px-3 py-1 rounded-lg inline-block bg-[#ddf4ff] text-[#0969da] font-semibold">
                            Open
                          </span>
                        </button>
                        <button
                          onClick={() => handleStatusChange("in-progress")}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          <span className="px-3 py-1 rounded-lg inline-block bg-[#fff4ce] text-[#b58100] font-semibold">
                            In-progress
                          </span>
                        </button>
                        <button
                          onClick={() => handleStatusChange("resolved")}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          <span className="px-3 py-1 rounded-lg inline-block bg-[#d4f4dd] text-[#1a7f37] font-semibold">
                            Resolved
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Description:
              </h3>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {query.description}
              </p>
            </div>

            {/* Attachments Section */}
            {query.attachments && query.attachments.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">
                      Attachments
                    </h3>
                  </div>
                  <button
                    onClick={handleDownloadFiles}
                    className="flex items-center gap-2 text-[#1a97a4] hover:text-[#157d89] transition-colors font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Files
                  </button>
                </div>

                {query.attachmentNote && (
                  <p className="text-sm text-gray-600 mb-4">
                    {query.attachmentNote}
                  </p>
                )}

                {/* Attachment Thumbnails */}
                <div className="flex gap-3">
                  {query.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      onClick={() =>
                        handleDownloadFile(attachment.url, attachment.name)
                      }
                      className="w-16 h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#1a97a4] transition-colors bg-white"
                    >
                      {attachment.type === "image" ? (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-green-400 to-green-600" />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            PDF
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3.5 bg-[#1a97a4] text-white rounded-full text-base font-semibold hover:bg-[#157d89] transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueryDetailsModal;
