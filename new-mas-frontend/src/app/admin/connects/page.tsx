"use client";

import React, { useState } from "react";
import { Search, Calendar, ChevronDown } from "lucide-react";

type ConnectStatus = "completed" | "scheduled" | "under-review" | "cancelled";
type TabFilter = "all" | ConnectStatus;

interface Connect {
  id: string;
  mentee: {
    name: string;
  };
  expert: {
    name: string;
    email: string;
  };
  meetDate: Date;
  duration: string;
  status: ConnectStatus;
  rating: number;
}

// Demo data
const demoConnects: Connect[] = [
  {
    id: "1",
    mentee: { name: "Aman Chahar" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-08-02T21:00:00"),
    duration: "Description in two lines",
    status: "completed",
    rating: 4.4,
  },
  {
    id: "2",
    mentee: { name: "Aman Chahar" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-08-02T21:00:00"),
    duration: "Description in one line",
    status: "scheduled",
    rating: 4.4,
  },
  {
    id: "3",
    mentee: { name: "Aman Chahar" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-08-02T21:00:00"),
    duration: "Description",
    status: "completed",
    rating: 4.4,
  },
  {
    id: "4",
    mentee: { name: "Aman Chahar" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-08-02T21:00:00"),
    duration: "Description",
    status: "cancelled",
    rating: 4.4,
  },
  {
    id: "5",
    mentee: { name: "Aman Chahar" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-08-02T21:00:00"),
    duration: "Description",
    status: "completed",
    rating: 4.4,
  },
  {
    id: "6",
    mentee: { name: "Aman Chahar" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-08-02T21:00:00"),
    duration: "Description",
    status: "cancelled",
    rating: 4.4,
  },
  {
    id: "7",
    mentee: { name: "Priya Sharma" },
    expert: {
      name: "Rahul Verma",
      email: "rahul.verma@expert.com",
    },
    meetDate: new Date("2025-09-15T10:30:00"),
    duration: "In-depth discussion on career goals",
    status: "scheduled",
    rating: 4.7,
  },
  {
    id: "8",
    mentee: { name: "Karan Mehta" },
    expert: {
      name: "Anjali Gupta",
      email: "anjali.gupta@expert.com",
    },
    meetDate: new Date("2025-09-10T14:00:00"),
    duration: "Technical interview preparation",
    status: "completed",
    rating: 4.9,
  },
  {
    id: "9",
    mentee: { name: "Divya Joshi" },
    expert: {
      name: "Vikram Singh",
      email: "vikram.singh@expert.com",
    },
    meetDate: new Date("2025-09-20T16:30:00"),
    duration: "Project review session",
    status: "under-review",
    rating: 4.5,
  },
  {
    id: "10",
    mentee: { name: "Rohit Agarwal" },
    expert: {
      name: "Aman Chahar",
      email: "amanchahar2002@gmail.com",
    },
    meetDate: new Date("2025-09-18T11:00:00"),
    duration: "Resume feedback and tips",
    status: "scheduled",
    rating: 4.6,
  },
];

const AdminConnects = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("19/09/2025");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const itemsPerPage = 6;

  // Filter connects
  const filteredConnects = demoConnects.filter((connect) => {
    const matchesTab = activeTab === "all" || connect.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      connect.mentee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connect.expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connect.expert.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || connect.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConnects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConnects = filteredConnects.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadgeColor = (status: ConnectStatus) => {
    switch (status) {
      case "completed":
        return "bg-[#d4f4dd] text-[#1a7f37]";
      case "scheduled":
        return "bg-[#fff4ce] text-[#b58100]";
      case "under-review":
        return "bg-[#ddf4ff] text-[#0969da]";
      case "cancelled":
        return "bg-[#ffebe9] text-[#cf222e]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: ConnectStatus) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "scheduled":
        return "Scheduled";
      case "under-review":
        return "Under Review";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleRead = (connectId: string) => {
    console.log("Read connect:", connectId);
    // Implement read/view functionality
  };

  return (
    <div className="min-h-screen bg-[#eefdff] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            Admin / <span className="font-semibold">Connects</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Connects</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b-2 border-[#ebebeb] bg-white px-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "all"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setActiveTab("completed");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "completed"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => {
                  setActiveTab("scheduled");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "scheduled"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => {
                  setActiveTab("under-review");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "under-review"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Under-Review
              </button>
              <button
                onClick={() => {
                  setActiveTab("cancelled");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "cancelled"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#eefdff] px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-neutral-200 rounded-xl text-base text-gray-900 placeholder:text-[#919191] focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Start Date */}
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 rounded-xl cursor-pointer hover:border-[#1a97a4]/30 transition-colors">
                  <span className="text-sm text-gray-900 whitespace-nowrap">
                    {startDate || "Start date"}
                  </span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <span className="text-gray-400">-</span>

              {/* End Date */}
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 rounded-xl cursor-pointer hover:border-[#1a97a4]/30 transition-colors">
                  <span className="text-sm text-gray-900 whitespace-nowrap">
                    {endDate || "End date"}
                  </span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:border-[#1a97a4]/30 transition-colors"
                >
                  <span className="text-sm text-gray-900">Status</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[200px]">
                    <button
                      onClick={() => {
                        setStatusFilter("all");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`px-3 py-1 rounded-full inline-block ${
                          statusFilter === "all"
                            ? "bg-[#1a97a4] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        All
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter("completed");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`px-3 py-1 rounded-full inline-block ${
                          statusFilter === "completed"
                            ? "bg-[#1a97a4] text-white"
                            : "bg-[#d4f4dd] text-[#1a7f37]"
                        }`}
                      >
                        Completed
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter("scheduled");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`px-3 py-1 rounded-full inline-block ${
                          statusFilter === "scheduled"
                            ? "bg-[#1a97a4] text-white"
                            : "bg-[#fff4ce] text-[#b58100]"
                        }`}
                      >
                        Scheduled
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setStatusFilter("cancelled");
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`px-3 py-1 rounded-full inline-block ${
                          statusFilter === "cancelled"
                            ? "bg-[#1a97a4] text-white"
                            : "bg-[#ffebe9] text-[#cf222e]"
                        }`}
                      >
                        Cancelled
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Expert Filter Placeholder */}
              <div className="relative">
                <button className="flex items-center gap-2 px-6 py-3 bg-[#1a97a4] text-white rounded-xl hover:bg-[#157d89] transition-colors font-medium">
                  Expert
                </button>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-white px-4 py-4 grid grid-cols-7 gap-4 items-center border-b border-gray-100">
            <div className="font-bold text-sm text-black">Mentee</div>
            <div className="font-bold text-sm text-black">Expert</div>
            <div className="font-bold text-sm text-black flex items-center gap-2">
              Meets Date
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-400"
              >
                <path
                  d="M16 17l-4 4-4-4M16 7l-4-4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="font-bold text-sm text-black">Meet Duration</div>
            <div className="font-bold text-sm text-black">Status</div>
            <div className="font-bold text-sm text-black">Rating</div>
            <div className="font-bold text-sm text-black">Comments</div>
          </div>

          {/* Table Body */}
          {paginatedConnects.length === 0 ? (
            <div className="bg-white px-4 py-12 text-center text-gray-500">
              No connects found
            </div>
          ) : (
            paginatedConnects.map((connect, index) => (
              <div
                key={connect.id}
                className={`px-4 py-4 grid grid-cols-7 gap-4 items-center ${
                  index % 2 === 0 ? "bg-[#edf8f9]" : "bg-white"
                }`}
              >
                <div className="font-medium text-sm text-black">
                  {connect.mentee.name}
                </div>
                <div className="font-medium text-sm">
                  <div className="text-black">{connect.expert.name}</div>
                  <div className="text-gray-600 text-xs mt-1">
                    {connect.expert.email}
                  </div>
                </div>
                <div className="font-medium text-sm">
                  <div className="text-black">{formatDate(connect.meetDate)}</div>
                  <div className="text-black/50 text-xs mt-1">
                    {formatTime(connect.meetDate)}
                  </div>
                </div>
                <div className="font-medium text-sm text-black">
                  {connect.duration}
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      connect.status
                    )}`}
                  >
                    {getStatusLabel(connect.status)}
                  </span>
                </div>
                <div className="font-medium text-sm text-black">
                  {connect.rating}
                </div>
                <div>
                  <button
                    onClick={() => handleRead(connect.id)}
                    className="px-6 py-2 border-2 border-[#1a97a4] text-[#1a97a4] rounded-full text-sm font-medium hover:bg-[#1a97a4] hover:text-white transition-colors"
                  >
                    Read
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {paginatedConnects.length > 0 && (
            <div className="bg-white border-t border-[#ebebeb] px-4 py-4 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`text-xs font-medium ${
                    currentPage === 1
                      ? "text-[#d5d5d5] cursor-not-allowed"
                      : "text-black hover:text-[#1a97a4]"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        currentPage === page
                          ? "bg-[#1a97a4] text-white"
                          : "bg-[#e0e0e0] text-black hover:bg-[#d0d0d0]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`text-xs font-medium ${
                    currentPage === totalPages
                      ? "text-[#d5d5d5] cursor-not-allowed"
                      : "text-black hover:text-[#1a97a4]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConnects;