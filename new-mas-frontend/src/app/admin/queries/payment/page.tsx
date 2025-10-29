"use client";

import React, { useState } from "react";
import { Search, Calendar, ChevronDown, Building2, CreditCard } from "lucide-react";
import PaymentProcessModal from "@/components/admin/PaymentProcessModal";

type PaymentStatus = "pending" | "resolved" | "paid" | "failed";
type PaymentMethod = "bank-transfer" | "upi" | "card" | "wallet";
type UserRole = "mentor" | "mentee" | "admin";

interface PaymentQuery {
  id: string;
  amount: number;
  user: {
    name: string;
    avatar: string;
    role: UserRole;
  };
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  timestamp: Date;
}

// Demo data
const demoPaymentQueries: PaymentQuery[] = [
  {
    id: "1",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "bank-transfer",
    status: "pending",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "2",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "resolved",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "3",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "paid",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "4",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "bank-transfer",
    status: "pending",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "5",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "pending",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "6",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "pending",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "7",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "bank-transfer",
    status: "pending",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "8",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "resolved",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "9",
    amount: 4000,
    user: {
      name: "Hirakjyoti Medhi",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "paid",
    timestamp: new Date("2025-11-12T11:45:00"),
  },
  {
    id: "10",
    amount: 3500,
    user: {
      name: "Priya Sharma",
      avatar: "/avatar-placeholder.png",
      role: "mentee",
    },
    paymentMethod: "card",
    status: "pending",
    timestamp: new Date("2025-11-10T14:30:00"),
  },
  {
    id: "11",
    amount: 5000,
    user: {
      name: "Aman Chahar",
      avatar: "/avatar-placeholder.png",
      role: "mentor",
    },
    paymentMethod: "upi",
    status: "resolved",
    timestamp: new Date("2025-11-11T09:15:00"),
  },
  {
    id: "12",
    amount: 2500,
    user: {
      name: "Rohit Agarwal",
      avatar: "/avatar-placeholder.png",
      role: "mentee",
    },
    paymentMethod: "wallet",
    status: "failed",
    timestamp: new Date("2025-11-09T16:20:00"),
  },
];

const AdminPaymentQueries = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate] = useState("19/09/2025");
  const [endDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] =
    useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentQuery | null>(null);

  // Filter queries
  const filteredQueries = demoPaymentQueries.filter((query) => {
    const matchesSearch =
      searchQuery === "" ||
      query.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.amount.toString().includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" || query.status === statusFilter;

    const matchesPaymentMethod =
      paymentMethodFilter === "all" ||
      query.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
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

  const getStatusBadgeColor = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return "bg-[#fff4ce] text-[#b58100]";
      case "resolved":
        return "bg-[#d4f4dd] text-[#1a7f37]";
      case "paid":
        return "bg-[#ddf4ff] text-[#0969da]";
      case "failed":
        return "bg-[#ffebe9] text-[#cf222e]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "resolved":
        return "Resolved";
      case "paid":
        return "Paid";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "bank-transfer":
        return "Bank Transfer";
      case "upi":
        return "UPI";
      case "card":
        return "Card";
      case "wallet":
        return "Wallet";
      default:
        return method;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "bank-transfer":
        return <Building2 className="w-4 h-4" />;
      case "upi":
      case "card":
      case "wallet":
        return <CreditCard className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
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

  const handleMarkAsPaid = (query: PaymentQuery) => {
    setSelectedPayment(query);
    setIsModalOpen(true);
  };

  const handleMarkResolved = (queryId: string) => {
    console.log("Mark resolved:", queryId);
    // Implement mark resolved functionality
    // Update the status in your backend/state management
  };

  const handleQueryClick = (queryId: string) => {
    console.log("Open query details:", queryId);
    // Implement navigation to query details
  };

  const handleProcessPayment = () => {
    if (selectedPayment) {
      console.log("Processing payment for:", selectedPayment.id);
      // Implement actual payment processing logic here
      // Update the status in your backend/state management
      // You might want to update the query status to "paid"
    }
  };

  return (
    <div className="min-h-screen bg-[#eefdff] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            Admin / Queries / <span className="font-semibold">Payment</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4 flex-wrap">
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
              <span className="text-sm text-gray-900">
                {statusFilter === "all"
                  ? "Status"
                  : getStatusLabel(statusFilter as PaymentStatus)}
              </span>
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
                  All Statuses
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("pending");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="px-3 py-1 rounded-full inline-block bg-[#fff4ce] text-[#b58100]">
                    Pending
                  </span>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("resolved");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="px-3 py-1 rounded-full inline-block bg-[#d4f4dd] text-[#1a7f37]">
                    Resolved
                  </span>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("paid");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="px-3 py-1 rounded-full inline-block bg-[#ddf4ff] text-[#0969da]">
                    Paid
                  </span>
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("failed");
                    setShowStatusDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="px-3 py-1 rounded-full inline-block bg-[#ffebe9] text-[#cf222e]">
                    Failed
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <button
              onClick={() =>
                setShowPaymentMethodDropdown(!showPaymentMethodDropdown)
              }
              className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 rounded-xl hover:border-[#1a97a4]/30 transition-colors"
            >
              <span className="text-sm text-gray-900">
                {paymentMethodFilter === "all"
                  ? "Payment Method"
                  : getPaymentMethodLabel(paymentMethodFilter as PaymentMethod)}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
            {showPaymentMethodDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[200px]">
                <button
                  onClick={() => {
                    setPaymentMethodFilter("all");
                    setShowPaymentMethodDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  All Methods
                </button>
                <button
                  onClick={() => {
                    setPaymentMethodFilter("bank-transfer");
                    setShowPaymentMethodDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Bank Transfer
                </button>
                <button
                  onClick={() => {
                    setPaymentMethodFilter("upi");
                    setShowPaymentMethodDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  UPI
                </button>
                <button
                  onClick={() => {
                    setPaymentMethodFilter("card");
                    setShowPaymentMethodDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Card
                </button>
                <button
                  onClick={() => {
                    setPaymentMethodFilter("wallet");
                    setShowPaymentMethodDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Cards Grid */}
        {filteredQueries.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center text-gray-500">
            No payment queries found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                onClick={() => handleQueryClick(query.id)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusBadgeColor(
                        query.status
                      )}`}
                    >
                      {getStatusLabel(query.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(query.timestamp)} {formatTime(query.timestamp)}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="text-2xl font-bold text-gray-900 mb-3">
                    ₹ {query.amount.toLocaleString("en-IN")}
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
                  {/* Payment Method */}
                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    {getPaymentMethodIcon(query.paymentMethod)}
                    <span className="text-sm font-medium">
                      {getPaymentMethodLabel(query.paymentMethod)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {query.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(query);
                        }}
                        className="flex-1 px-4 py-2 bg-[#1a97a4] text-white rounded-lg text-sm font-medium hover:bg-[#157d89] transition-colors"
                      >
                        Mark As Paid
                      </button>
                    )}
                    {query.status === "paid" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkResolved(query.id);
                        }}
                        className="flex-1 px-4 py-2 bg-[#1a97a4] text-white rounded-lg text-sm font-medium hover:bg-[#157d89] transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {query.status === "resolved" && (
                      <div className="flex-1 text-center text-sm text-gray-500 py-2">
                        ✓ Completed
                      </div>
                    )}
                    {query.status === "failed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(query);
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Retry Payment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Process Modal */}
        <PaymentProcessModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          payment={selectedPayment}
          onProcessPayment={(paymentId) => {
            console.log("Processing payment for:", paymentId);
            // Implement actual payment processing logic here
            // Update the status in your backend/state management
          }}
        />
      </div>
    </div>
  );
};

export default AdminPaymentQueries;