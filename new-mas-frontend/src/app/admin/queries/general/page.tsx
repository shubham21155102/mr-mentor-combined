"use client";

import React, { useState } from "react";
import { Paperclip, ChevronDown } from "lucide-react";
import QueryDetailsModal from "@/components/admin/QueryDetailsModal";

type QueryStatus = "in-progress" | "open" | "resolved";
type QueryType = "bug" | "feedback" | "feature-request" | "other";
type UserRole = "mentor" | "mentee" | "admin";
type ResolutionFilter = "unresolved" | "resolved" | "all";

interface Query {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: UserRole;
  };
  type: QueryType;
  status: QueryStatus;
  title: string;
  description: string;
  attachments: number;
  timestamp: Date;
  attachmentFiles?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

// Demo data
const demoQueries: Query[] = [
  {
    id: "1",
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "bug",
    status: "in-progress",
    title: "Slot Selection Issue",
    description:
      "I'm facing an issue where I'm not able to select the available slots. The slots are visible on the screen, but when I click or tap on them, nothing happens. It seems like the interaction is either disabled or not responding properly. I tried refreshing the page and even checking on a different browser, but the problem still exists. It might be related to a frontend validation or a script not loading correctly. Sometimes, the slot briefly highlights but doesn't stay selected. This makes it difficult to proceed with the booking process. If possible, please check whether the slot selection feature is active or temporarily restricted. I've also ensured my internet connection is stable. A quick fix or clarification would help complete the process smoothly.",
    attachments: 2,
    timestamp: new Date("2025-11-12T11:45:00"),
    attachmentFiles: [
      {
        id: "att1",
        name: "screenshot.jpg",
        type: "image",
        url: "/attachments/screenshot.jpg",
      },
      {
        id: "att2",
        name: "error-log.pdf",
        type: "pdf",
        url: "/attachments/error-log.pdf",
      },
    ],
  },
  {
    id: "2",
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "feedback",
    status: "open",
    title: "Platform Feedback",
    description:
      "I'm facing an issue where I'm not able to select the available slots. The slots are visible on the screen, but when I click or tap on them, nothing happens. It seems like the interaction is either disabled or not responding properly. I tried refreshi...",
    attachments: 2,
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "3",
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "bug",
    status: "resolved",
    title: "Authentication Error",
    description:
      "I'm facing an issue where I'm not able to select the available slots. The slots are visible on the screen, but when I click or tap on them, nothing happens. It seems like the interaction is either disabled or not responding properly. I tried refreshi...",
    attachments: 2,
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "4",
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "bug",
    status: "in-progress",
    title: "Payment Gateway Issue",
    description:
      "I'm facing an issue where I'm not able to select the available slots. The slots are visible on the screen, but when I click or tap on them, nothing happens. It seems like the interaction is either disabled or not responding properly. I tried refreshi...",
    attachments: 2,
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "5",
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "feedback",
    status: "open",
    title: "UI Improvement Suggestion",
    description:
      "I'm facing an issue where I'm not able to select the available slots. The slots are visible on the screen, but when I click or tap on them, nothing happens. It seems like the interaction is either disabled or not responding properly. I tried refreshi...",
    attachments: 2,
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "6",
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "bug",
    status: "resolved",
    title: "Mobile Responsiveness",
    description:
      "I'm facing an issue where I'm not able to select the available slots. The slots are visible on the screen, but when I click or tap on them, nothing happens. It seems like the interaction is either disabled or not responding properly. I tried refreshi...",
    attachments: 2,
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "7",
    user: {
      name: "Priya Sharma",
      avatar: "/avatar-placeholder.png",
      role: "mentee",
    },
    type: "feature-request",
    status: "open",
    title: "Calendar Integration",
    description:
      "Would love to see calendar integration with Google Calendar and Outlook for better scheduling management and automatic reminders for upcoming sessions.",
    attachments: 0,
    timestamp: new Date("2025-11-10T14:30:00"),
  },
  {
    id: "8",
    user: {
      name: "Aman Chahar",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    type: "bug",
    status: "in-progress",
    title: "Video Call Quality",
    description:
      "During sessions, I've noticed the video quality drops significantly after 15-20 minutes. This happens consistently across different sessions and devices.",
    attachments: 3,
    timestamp: new Date("2025-11-11T09:15:00"),
  },
];

const AdminGeneralQueries = () => {
  const [resolutionFilter, setResolutionFilter] =
    useState<ResolutionFilter>("unresolved");
  const [queryTypeFilter, setQueryTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");
  const [showQueryTypeDropdown, setShowQueryTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

  // Filter queries
  const filteredQueries = demoQueries.filter((query) => {
    const matchesResolution =
      resolutionFilter === "all" ||
      (resolutionFilter === "resolved" && query.status === "resolved") ||
      (resolutionFilter === "unresolved" && query.status !== "resolved");

    const matchesQueryType =
      queryTypeFilter === "all" || query.type === queryTypeFilter;

    const matchesStatus =
      statusFilter === "all" || query.status === statusFilter;

    const matchesUserRole =
      userRoleFilter === "all" || query.user.role === userRoleFilter;

    return (
      matchesResolution && matchesQueryType && matchesStatus && matchesUserRole
    );
  });

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

  const getStatusBadgeColor = (status: QueryStatus) => {
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

  const getStatusLabel = (status: QueryStatus) => {
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

  const getTypeLabel = (type: QueryType) => {
    switch (type) {
      case "bug":
        return "Bug";
      case "feedback":
        return "Feedback";
      case "feature-request":
        return "Feature Request";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "mentor":
        return "Mentor";
      case "mentee":
        return "Mentee";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  const handleQueryClick = (query: Query) => {
    setSelectedQuery(query);
    setIsModalOpen(true);
  };

  const handleStatusChange = (queryId: string, newStatus: string) => {
    console.log("Update query status:", queryId, newStatus);
    // Implement status update logic here
    // Update the status in your backend/state management
  };

  return (
    <div className="min-h-screen bg-[#eefdff] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            Admin / <span className="font-semibold">Queries</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">General</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          {/* Resolution Filter */}
          <div className="relative">
            <button
              onClick={() =>
                setResolutionFilter(
                  resolutionFilter === "unresolved" ? "resolved" : "unresolved"
                )
              }
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-[#1a97a4]/30 transition-colors"
            >
              <span className="text-sm text-gray-900 font-medium">
                {resolutionFilter === "unresolved" ? "Unresolved" : "Resolved"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Query Type Filter */}
          <div className="relative">
            <button
              onClick={() => setShowQueryTypeDropdown(!showQueryTypeDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-[#1a97a4]/30 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {queryTypeFilter === "all"
                  ? "Query Type"
                  : getTypeLabel(queryTypeFilter as QueryType)}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showQueryTypeDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[180px]">
                <button
                  onClick={() => {
                    setQueryTypeFilter("all");
                    setShowQueryTypeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  All Types
                </button>
                <button
                  onClick={() => {
                    setQueryTypeFilter("bug");
                    setShowQueryTypeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Bug
                </button>
                <button
                  onClick={() => {
                    setQueryTypeFilter("feedback");
                    setShowQueryTypeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Feedback
                </button>
                <button
                  onClick={() => {
                    setQueryTypeFilter("feature-request");
                    setShowQueryTypeDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Feature Request
                </button>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-[#1a97a4]/30 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {statusFilter === "all"
                  ? "Status"
                  : getStatusLabel(statusFilter as QueryStatus)}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[180px]">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  All Statuses
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("in-progress");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  In Progress
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("open");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("resolved");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Resolved
                </button>
              </div>
            )}
          </div>

          {/* User Role Filter */}
          <div className="relative">
            <button
              onClick={() => setShowUserRoleDropdown(!showUserRoleDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:border-[#1a97a4]/30 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {userRoleFilter === "all"
                  ? "User Role"
                  : getRoleLabel(userRoleFilter as UserRole)}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showUserRoleDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[180px]">
                <button
                  onClick={() => {
                    setUserRoleFilter("all");
                    setShowUserRoleDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  All Roles
                </button>
                <button
                  onClick={() => {
                    setUserRoleFilter("mentor");
                    setShowUserRoleDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Mentor
                </button>
                <button
                  onClick={() => {
                    setUserRoleFilter("mentee");
                    setShowUserRoleDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Mentee
                </button>
                <button
                  onClick={() => {
                    setUserRoleFilter("admin");
                    setShowUserRoleDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Query Cards Grid */}
        {filteredQueries.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-gray-500">
            No queries found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                onClick={() => handleQueryClick(query)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusBadgeColor(
                          query.status
                        )}`}
                      >
                        {getStatusLabel(query.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {getTypeLabel(query.type)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(query.timestamp)} {formatTime(query.timestamp)}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a97a4] to-[#157d89] flex items-center justify-center text-white text-sm font-semibold">
                        {query.user.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {query.user.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {getRoleLabel(query.user.role)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                    {query.description}
                  </p>
                </div>

                {/* Card Footer */}
                {query.attachments > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Paperclip className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {query.attachments} attachment
                        {query.attachments > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Query Details Modal */}
        <QueryDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          query={
            selectedQuery
              ? {
                  id: selectedQuery.id,
                  type: selectedQuery.type,
                  user: {
                    name: selectedQuery.user.name,
                    avatar: selectedQuery.user.avatar,
                    role: selectedQuery.user.role.charAt(0).toUpperCase() + selectedQuery.user.role.slice(1),
                  },
                  status: selectedQuery.status,
                  timestamp: selectedQuery.timestamp,
                  title: selectedQuery.title,
                  description: selectedQuery.description,
                  attachments: selectedQuery.attachmentFiles,
                  attachmentNote: "Mandatory to fill the feedback form after the meet",
                }
              : null
          }
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default AdminGeneralQueries;