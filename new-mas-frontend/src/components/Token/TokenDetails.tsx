"use client"
import React from 'react'
import { X, CreditCard, Calendar, Clock, TrendingUp, IndianRupee } from 'lucide-react'

type TokenPurchase = {
  id: string;
  tokenQuantity: number;
  createdAt: string;
  expiresAt?: string;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'cancelled';
  completedAt?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
}

type Props = {
  selectedToken: TokenPurchase;
  setSelectedToken: () => void;
}

const TokenDetails = (props: Props) => {
  const { selectedToken, setSelectedToken } = props;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 pt-25" style={{ zIndex: 60 }}>
      <div className="backdrop-blur-[115.25px] backdrop-filter bg-gradient-to-r from-[#ffffff] to-[#ffffff] overflow-hidden relative rounded-[24px] w-[90%] h-[80vh] z-[70]" style={{ zIndex: 70 }}>
        {/* Close Button */}
        <button
          className="absolute bg-neutral-200 box-border content-stretch flex gap-[10px] items-center p-[4px] right-[24px] rounded-[8px] top-[24px] cursor-pointer hover:bg-neutral-300 transition-colors z-10"
          onClick={setSelectedToken}
          aria-label="Close purchase details"
        >
          <X className='w-6 h-6' />
        </button>

        {/* Scrollable Content Container */}
        <div className="h-full overflow-y-auto">
          {/* Title */}
          <div className="flex flex-col font-['Roboto:SemiBold',_sans-serif] font-semibold justify-center leading-[0] text-[36px] text-black text-nowrap mt-6 mb-8 tracking-[0.5px] text-center">
            <p className="leading-[44px] whitespace-pre">Purchase Details</p>
          </div>

          <div className="px-8 pb-8 space-y-6">{/* Content stays the same */}
          {/* Purchase Summary Card */}
          <div className="bg-gradient-to-br from-[#1a97a4] to-[#158a96] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-2xl font-bold">
                  +{selectedToken.tokenQuantity} Tokens
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedToken.paymentStatus)} bg-opacity-90`}>
                {selectedToken.paymentStatus.charAt(0).toUpperCase() + selectedToken.paymentStatus.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="opacity-80">Amount Paid</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {selectedToken.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="opacity-80">Currency</p>
                <p className="text-lg font-semibold">{selectedToken.currency}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200"></div>

          {/* Purchase Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Purchase Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex">
                <div className="w-[160px] text-sm font-medium text-gray-600">Purchase ID:</div>
                <div className="text-sm text-gray-900 font-mono break-all">{selectedToken.id}</div>
              </div>

              <div className="flex">
                <div className="w-[160px] text-sm font-medium text-gray-600">Tokens Purchased:</div>
                <div className="text-sm text-gray-900 font-semibold">{selectedToken.tokenQuantity} tokens</div>
              </div>

              <div className="flex items-start">
                <div className="w-[160px] text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Purchase Date:
                </div>
                <div className="text-sm text-gray-900">
                  {formatDateTime(selectedToken.createdAt).date}
                  <br />
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatDateTime(selectedToken.createdAt).time}
                </div>
              </div>

              {selectedToken.expiresAt && (
                <div className="flex items-start">
                  <div className="w-[160px] text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Expiry Date:
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDateTime(selectedToken.expiresAt).date}
                  </div>
                </div>
              )}

              {selectedToken.completedAt && (
                <div className="flex items-start">
                  <div className="w-[160px] text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Completed At:
                  </div>
                  <div className="text-sm text-gray-900">
                    {formatDateTime(selectedToken.completedAt).date}
                    <br />
                    <Clock className="w-4 h-4 inline mr-1" />
                    {formatDateTime(selectedToken.completedAt).time}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {(selectedToken.razorpayOrderId || selectedToken.razorpayPaymentId) && (
            <>
              {/* Divider */}
              <div className="w-full h-px bg-gray-200"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Payment Details
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex">
                    <div className="w-[160px] text-sm font-medium text-gray-600">Payment Gateway:</div>
                    <div className="text-sm text-gray-900">Razorpay</div>
                  </div>

                  {selectedToken.razorpayOrderId && (
                    <div className="flex">
                      <div className="w-[160px] text-sm font-medium text-gray-600">Order ID:</div>
                      <div className="text-sm text-gray-900 font-mono break-all">{selectedToken.razorpayOrderId}</div>
                    </div>
                  )}

                  {selectedToken.razorpayPaymentId && (
                    <div className="flex">
                      <div className="w-[160px] text-sm font-medium text-gray-600">Payment ID:</div>
                      <div className="text-sm text-gray-900 font-mono break-all">{selectedToken.razorpayPaymentId}</div>
                    </div>
                  )}

                  {selectedToken.razorpaySignature && (
                    <div className="flex">
                      <div className="w-[160px] text-sm font-medium text-gray-600">Signature:</div>
                      <div className="text-xs text-gray-900 font-mono break-all">{selectedToken.razorpaySignature}</div>
                    </div>
                  )}

                  <div className="flex">
                    <div className="w-[160px] text-sm font-medium text-gray-600">Amount:</div>
                    <div className="text-sm text-gray-900 font-semibold">₹{selectedToken.amount.toLocaleString()} {selectedToken.currency}</div>
                  </div>

                  <div className="flex">
                    <div className="w-[160px] text-sm font-medium text-gray-600">Status:</div>
                    <div className="text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedToken.paymentStatus)}`}>
                        {selectedToken.paymentStatus.charAt(0).toUpperCase() + selectedToken.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={setSelectedToken}
              className="px-8 py-3 bg-[#1a97a4] text-white rounded-lg hover:bg-[#158a96] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default TokenDetails