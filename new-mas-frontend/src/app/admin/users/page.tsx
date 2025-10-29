"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import AddMenteeModal, { MenteeFormData } from "@/components/admin/AddMenteeModal";
import AddMentorModal, { MentorFormData } from "@/components/admin/AddMentorModal";
import AddAdminModal, { AdminFormData } from "@/components/admin/AddAdminModal";
import UpdateMenteeModal from "@/components/admin/UpdateMenteeModal";
import UpdateMentorModal from "@/components/admin/UpdateMentorModal";
import UpdateAdminModal from "@/components/admin/UpdateAdminModal";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";
import { useSession } from "next-auth/react";

type UserRole = "admin" | "expert" | "mentee";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profession?: string;
  domain?: string;
  role: UserRole;
  profilePhoto?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Demo data - will be replaced with API data
const demoUsers: User[] = [];

const AdminUsers = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<UserRole>("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMenteeModalOpen, setIsAddMenteeModalOpen] = useState(false);
  const [isAddMentorModalOpen, setIsAddMentorModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [isUpdateMenteeModalOpen, setIsUpdateMenteeModalOpen] = useState(false);
  const [isUpdateMentorModalOpen, setIsUpdateMentorModalOpen] = useState(false);
  const [isUpdateAdminModalOpen, setIsUpdateAdminModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when tab changes
    fetchUsers();
  }, [activeTab, session]);

  const fetchUsers = async () => {
    if (!session?.backendToken) return;

    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'admin':
          endpoint = '/api/admin/admins';
          break;
        case 'expert':
          endpoint = '/api/admin/experts';
          break;
        case 'mentee':
          endpoint = '/api/admin/mentees';
          break;
      }

      const response = await fetch(`http://localhost:8000${endpoint}?page=1&limit=100`, { // Fetch more users for client-side filtering
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.backendToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Map role "user" to "mentee" and parse dates
          const mappedUsers = result.data.users.map((user: any) => ({
            ...user,
            role: user.role === 'user' ? 'mentee' : user.role,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          }));
          setUsers(mappedUsers);
          setTotalUsers(result.data.pagination.total);
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: any, endpoint: string) => {
    if (!session?.backendToken) return false;

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.backendToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchUsers(); // Refresh the list
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
    return false;
  };

  const deleteUser = async (userId: string) => {
    if (!session?.backendToken) return false;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.backendToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchUsers(); // Refresh the list
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
    return false;
  };

  // Filter users by role and search query
  const filteredUsers = users.filter((user) => {
    const matchesRole = user.role === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Pagination - client-side since we fetch all users
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      if (user.role === "mentee") {
        setIsUpdateMenteeModalOpen(true);
      } else if (user.role === "expert") {
        setIsUpdateMentorModalOpen(true);
      } else if (user.role === "admin") {
        setIsUpdateAdminModalOpen(true);
      }
    }
  };

  const handleAddUser = () => {
    if (activeTab === "mentee") {
      setIsAddMenteeModalOpen(true);
    } else if (activeTab === "expert") {
      setIsAddMentorModalOpen(true);
    } else if (activeTab === "admin") {
      setIsAddAdminModalOpen(true);
    }
  };

  const handleAddMentee = async (menteeData: MenteeFormData) => {
    const userData = {
      fullName: menteeData.fullName,
      email: menteeData.email,
      phone: menteeData.phone,
      profession: menteeData.designation || menteeData.branch,
      domain: menteeData.companyName,
    };
    const success = await addUser(userData, '/api/admin/students');
    if (success) {
      setIsAddMenteeModalOpen(false);
      alert("Mentee added successfully!");
    } else {
      alert("Failed to add mentee");
    }
  };

  const handleAddMentor = async (mentorData: MentorFormData) => {
    const userData = {
      fullName: mentorData.fullName,
      email: mentorData.email,
      phone: mentorData.phone,
      profession: mentorData.designation,
      domain: mentorData.companyName,
    };
    const success = await addUser(userData, '/api/admin/experts');
    if (success) {
      setIsAddMentorModalOpen(false);
      alert("Expert added successfully!");
    } else {
      alert("Failed to add expert");
    }
  };

  const handleAddAdmin = async (adminData: AdminFormData) => {
    const userData = {
      fullName: adminData.fullName,
      email: adminData.email,
      phone: adminData.phone,
      profession: adminData.designation,
      domain: adminData.companyName,
    };
    const success = await addUser(userData, '/api/admin/admins');
    if (success) {
      setIsAddAdminModalOpen(false);
      alert("Admin added successfully!");
    } else {
      alert("Failed to add admin");
    }
  };

  const updateUser = async (userData: any, userId: string) => {
    if (!session?.backendToken) return false;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.backendToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          fetchUsers(); // Refresh the list
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
    return false;
  };

  const handleUpdateMentee = async (menteeData: MenteeFormData) => {
    if (!selectedUser) return;
    const userData = {
      fullName: menteeData.fullName,
      email: menteeData.email,
      phone: menteeData.phone,
      profession: menteeData.designation || menteeData.branch,
      domain: menteeData.companyName,
    };
    const success = await updateUser(userData, selectedUser.id);
    if (success) {
      setIsUpdateMenteeModalOpen(false);
      setSelectedUser(null);
      alert("Mentee updated successfully!");
    } else {
      alert("Failed to update mentee");
    }
  };

  const handleUpdateMentor = async (mentorData: MentorFormData) => {
    if (!selectedUser) return;
    const userData = {
      fullName: mentorData.fullName,
      email: mentorData.email,
      phone: mentorData.phone,
      profession: mentorData.designation,
      domain: mentorData.companyName,
    };
    const success = await updateUser(userData, selectedUser.id);
    if (success) {
      setIsUpdateMentorModalOpen(false);
      setSelectedUser(null);
      alert("Expert updated successfully!");
    } else {
      alert("Failed to update expert");
    }
  };

  const handleUpdateAdmin = async (adminData: AdminFormData) => {
    if (!selectedUser) return;
    const userData = {
      fullName: adminData.fullName,
      email: adminData.email,
      phone: adminData.phone,
      profession: adminData.designation,
      domain: adminData.companyName,
    };
    const success = await updateUser(userData, selectedUser.id);
    if (success) {
      setIsUpdateAdminModalOpen(false);
      setSelectedUser(null);
      alert("Admin updated successfully!");
    } else {
      alert("Failed to update admin");
    }
  };

  const handleDelete = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    const success = await deleteUser(selectedUser.id);
    if (success) {
      alert("User deleted successfully!");
      setSelectedUser(null);
    } else {
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eefdff] p-8 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eefdff] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-2">
            Admin / <span className="font-semibold">User Management</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b-2 border-[#ebebeb] bg-white px-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("admin");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "admin"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setActiveTab("expert");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "expert"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Experts
              </button>
              <button
                onClick={() => {
                  setActiveTab("mentee");
                  setCurrentPage(1);
                }}
                className={`px-3 py-4 font-bold text-sm uppercase transition-all ${
                  activeTab === "mentee"
                    ? "border-b-3 border-[#1a97a4] text-[#1a97a4]"
                    : "text-black"
                }`}
              >
                Mentees
              </button>
            </div>
          </div>

          {/* Search and Add Button */}
          <div className="bg-[#eefdff] px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-lg">
                <input
                  type="text"
                  placeholder="Expert name / Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-neutral-200 rounded-xl text-base text-gray-900 placeholder:text-[#919191] focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/20"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 text-[#1a97a4] font-medium text-lg hover:text-[#157d89] transition-colors ml-4"
              >
                <Plus className="w-6 h-6" />
                {activeTab === "admin" && "Add Admin"}
                {activeTab === "expert" && "Add Expert"}
                {activeTab === "mentee" && "Add Mentee"}
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-white px-4 py-4 grid grid-cols-6 gap-4 items-center border-b border-gray-100">
            <div className="font-bold text-sm text-black">Name</div>
            <div className="font-bold text-sm text-black">Email</div>
            <div className="font-bold text-sm text-black">Phone</div>
            <div className="font-bold text-sm text-black flex items-center gap-2">
              Onboarded On
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
            <div className="font-bold text-sm text-black flex items-center gap-2">
              Onboarded By
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
            <div className="font-bold text-sm text-black">Actions</div>
          </div>

          {/* Table Body */}
          {paginatedUsers.length === 0 ? (
            <div className="bg-white px-4 py-12 text-center text-gray-500">
              No users found
            </div>
          ) : (
            paginatedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`px-4 py-4 grid grid-cols-6 gap-4 items-center ${
                  index % 2 === 0 ? "bg-[#edf8f9]" : "bg-white"
                }`}
              >
                <div className="font-medium text-sm text-black">
                  {user.fullName || 'N/A'}
                </div>
                <div className="font-medium text-sm text-black">
                  {user.email}
                </div>
                <div className="font-medium text-sm text-black">
                  {user.phone || 'N/A'}
                </div>
                <div className="font-medium text-sm">
                  <div className="text-black">{formatDate(user.createdAt)}</div>
                  <div className="text-black/50 text-sm">
                    {formatTime(user.createdAt)}
                  </div>
                </div>
                <div className="font-medium text-sm text-black">
                  Admin
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleEdit(user.id)}
                    className="text-gray-600 hover:text-[#1a97a4] transition-colors"
                    aria-label="Edit user"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                    aria-label="Delete user"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {paginatedUsers.length > 0 && (
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

      {/* Add Mentee Modal */}
      <AddMenteeModal
        isOpen={isAddMenteeModalOpen}
        onClose={() => setIsAddMenteeModalOpen(false)}
        onSubmit={handleAddMentee}
      />

      {/* Add Mentor/Expert Modal */}
      <AddMentorModal
        isOpen={isAddMentorModalOpen}
        onClose={() => setIsAddMentorModalOpen(false)}
        onSubmit={handleAddMentor}
      />

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => setIsAddAdminModalOpen(false)}
        onSubmit={handleAddAdmin}
      />

      {/* Update Mentee Modal */}
      <UpdateMenteeModal
        isOpen={isUpdateMenteeModalOpen}
        onClose={() => {
          setIsUpdateMenteeModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateMentee}
        initialData={selectedUser ? {
          fullName: selectedUser.fullName || "",
          email: selectedUser.email,
          phone: selectedUser.phone || "",
          college: "",
          graduationYear: "",
          branch: "",
          companyName: selectedUser.domain || "",
          designation: selectedUser.profession || "",
          masBatch: "",
          rollNumber: "",
          meetTokens: 0,
          expiryDate: "",
          tokenExpiry: "",
        } : undefined}
      />

      {/* Update Mentor Modal */}
      <UpdateMentorModal
        isOpen={isUpdateMentorModalOpen}
        onClose={() => {
          setIsUpdateMentorModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateMentor}
        initialData={selectedUser ? {
          fullName: selectedUser.fullName || "",
          email: selectedUser.email,
          phone: selectedUser.phone || "",
          college: "",
          graduationYear: "",
          branch: "",
          companyName: selectedUser.domain || "",
          designation: selectedUser.profession || "",
          linkedinUrl: "",
        } : undefined}
      />

      {/* Update Admin Modal */}
      <UpdateAdminModal
        isOpen={isUpdateAdminModalOpen}
        onClose={() => {
          setIsUpdateAdminModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateAdmin}
        initialData={selectedUser ? {
          fullName: selectedUser.fullName || "",
          email: selectedUser.email,
          phone: selectedUser.phone || "",
          college: "",
          graduationYear: "",
          branch: "",
          companyName: selectedUser.domain || "",
          designation: selectedUser.profession || "",
          linkedinUrl: "",
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={selectedUser?.fullName}
        userRole={selectedUser?.role}
      />
    </div>
  );
};

export default AdminUsers;