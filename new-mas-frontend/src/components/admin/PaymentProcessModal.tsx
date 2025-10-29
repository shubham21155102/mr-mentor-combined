"use client";

import React from "react";
import { CreditCard } from "lucide-react";

interface PaymentProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: {
    id: string;
    amount: number;
    user: {
      name: string;
      avatar: string;
    };
    paymentMethod: string;
  } | null;
  onProcessPayment: (paymentId: string) => void;
}

const PaymentProcessModal: React.FC<PaymentProcessModalProps> = ({
  isOpen,
  onClose,
  payment,
  onProcessPayment,
}) => {
  if (!isOpen || !payment) return null;

  const handleProcessPayment = () => {
    onProcessPayment(payment.id);
    onClose();
  };

  const getPaymentMethodLabel = (method: string) => {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Payment
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Amount */}
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">
                Amount:
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ₹ {payment.amount.toLocaleString("en-IN")}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a97a4] to-[#157d89] flex items-center justify-center text-white text-lg font-semibold">
                {payment.user.name.charAt(0)}
              </div>
              <span className="text-lg font-medium text-gray-900">
                {payment.user.name}
              </span>
            </div>

            {/* Payment Method */}
            <div className="flex items-center gap-3 text-gray-700">
              <CreditCard className="w-5 h-5" />
              <span className="text-base font-medium">
                {getPaymentMethodLabel(payment.paymentMethod)}
              </span>
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="p-6 pt-0 flex gap-4">
            <button
              onClick={handleProcessPayment}
              className="flex-1 px-6 py-3.5 bg-[#1a97a4] text-white rounded-full text-base font-semibold hover:bg-[#157d89] transition-colors shadow-md"
            >
              Process Payment
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-white border-2 border-[#1a97a4] text-[#1a97a4] rounded-full text-base font-semibold hover:bg-[#1a97a4]/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentProcessModal;
