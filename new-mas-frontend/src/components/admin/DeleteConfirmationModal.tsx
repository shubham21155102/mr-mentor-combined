"use client";

import React from "react";
import { X, Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  userRole?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userRole,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
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
        <div className="bg-[#c4c4c4] rounded-3xl shadow-2xl w-full max-w-md my-8 pointer-events-auto">
          {/* Header */}
          <div className="relative px-6 py-6 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-black">Confirm Deletion</h2>
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-black hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-black font-medium mb-2">
                Are you sure you want to delete this user?
              </p>
              {userName && (
                <p className="text-gray-600">
                  <span className="font-semibold">{userName}</span>
                  {userRole && (
                    <span className="text-gray-500"> ({userRole})</span>
                  )}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-medium py-3 px-4 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-full transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmationModal;