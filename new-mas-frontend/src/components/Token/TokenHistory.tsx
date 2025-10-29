import React, { useState } from 'react'
import Pagination from './Pagination'

type TokenPurchase = {
  id: string;
  tokenQuantity: number;
  createdAt: string;
  expiresAt?: string;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'cancelled';
  completedAt?: string;
  razorpayOrderId?: string;
  amount: number;
  currency: string;
}

type TokenUsage = {
  id: string;
  tokensUsed: number;
  usageType: 'meeting_booking' | 'penalty' | 'refund' | 'bonus';
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
  slotId?: string;
  slot?: {
    id: string;
    title?: string;
  };
}

type Props = {
    setSelectedToken: (token: any, type: 'purchase' | 'usage') => void;
    purchaseHistory: TokenPurchase[];
    usageHistory: TokenUsage[];
    isLoading: boolean;
}

const TokenHistory = (props: Props) => {
    const { setSelectedToken, purchaseHistory, usageHistory, isLoading } = props;
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<'credit' | 'debit'>('credit');
    const itemsPerPage = 10;

    // Calculate pagination for credit (purchase) history
    const creditTotalItems = purchaseHistory.length;
    const creditTotalPages = Math.ceil(creditTotalItems / itemsPerPage);
    const creditStartIndex = (currentPage - 1) * itemsPerPage;
    const creditEndIndex = creditStartIndex + itemsPerPage;
    const currentCreditItems = purchaseHistory.slice(creditStartIndex, creditEndIndex);

    // Calculate pagination for debit (usage) history
    const debitTotalItems = usageHistory.length;
    const debitTotalPages = Math.ceil(debitTotalItems / itemsPerPage);
    const debitStartIndex = (currentPage - 1) * itemsPerPage;
    const debitEndIndex = debitStartIndex + itemsPerPage;
    const currentDebitItems = usageHistory.slice(debitStartIndex, debitEndIndex);

    // Reset to page 1 when switching tabs
    const handleTabChange = (tab: 'credit' | 'debit') => {
      setActiveTab(tab);
      setCurrentPage(1);
    };

    const getUsageTypeColor = (type: string) => {
      switch (type) {
        case 'meeting_booking':
          return 'bg-blue-100 text-blue-800';
        case 'penalty':
          return 'bg-red-100 text-red-800';
        case 'refund':
          return 'bg-green-100 text-green-800';
        case 'bonus':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const formatUsageType = (type: string) => {
      return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };
  return (
    <div className="p-6 h-full overflow-y-auto">
              {/* Title */}
              <div className="flex flex-col font-['Roboto:SemiBold',_sans-serif] font-semibold justify-center leading-[0] text-[36px] text-black text-nowrap mb-8 tracking-[0.5px] text-center">
                <p className="leading-[44px] whitespace-pre">Token History</p>
              </div>

              {/* Tabs */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => handleTabChange('credit')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'credit'
                      ? 'bg-[#1a97a4] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Credit (Purchases)
                </button>
                <button
                  onClick={() => handleTabChange('debit')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'debit'
                      ? 'bg-[#1a97a4] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Debit (Usage)
                </button>
              </div>

              {/* Credit Tab - Purchase History */}
              {activeTab === 'credit' && (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 grid grid-cols-9 gap-4 text-sm font-medium text-gray-700">
                      <div>Tokens</div>
                      <div>Purchase Date</div>
                      <div>Expiry</div>
                      <div>Status</div>
                      <div>Completed</div>
                      <div>Order ID</div>
                      <div>Amount</div>
                      <div>Currency</div>
                      <div>Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {isLoading ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                          Loading purchase history...
                        </div>
                      ) : purchaseHistory.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                          No purchase history found
                        </div>
                      ) : (
                        currentCreditItems.map((item) => (
                          <div key={item.id} className="px-6 py-4 grid grid-cols-9 gap-4 text-sm text-gray-900">
                            <div className="font-medium">+{item.tokenQuantity}</div>
                            <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                            <div>{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'N/A'}</div>
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                item.paymentStatus === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : item.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.paymentStatus}
                              </span>
                            </div>
                            <div>{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'N/A'}</div>
                            <div className="font-mono text-xs">{item.razorpayOrderId?.slice(-8) || 'N/A'}</div>
                            <div>₹{item.amount}</div>
                            <div>{item.currency}</div>
                            <div>
                              <button
                                onClick={() => setSelectedToken(item, 'purchase')}
                                className="bg-[#1a97a4] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#158a96] transition-colors"
                              >
                                Full Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pagination for Credit */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={creditTotalPages}
                    onPageChange={setCurrentPage}
                    totalItems={creditTotalItems}
                    itemsPerPage={itemsPerPage}
                  />
                </>
              )}

              {/* Debit Tab - Usage History */}
              {activeTab === 'debit' && (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-4 grid grid-cols-8 gap-4 text-sm font-medium text-gray-700">
                      <div>Tokens Used</div>
                      <div>Type</div>
                      <div>Date</div>
                      <div>Balance Before</div>
                      <div>Balance After</div>
                      <div>Description</div>
                      <div>Reference</div>
                      <div>Action</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {isLoading ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                          Loading usage history...
                        </div>
                      ) : usageHistory.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">
                          No usage history found
                        </div>
                      ) : (
                        currentDebitItems.map((item) => (
                          <div key={item.id} className="px-6 py-4 grid grid-cols-8 gap-4 text-sm text-gray-900">
                            <div className={`font-medium ${
                              item.usageType === 'refund' || item.usageType === 'bonus' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {item.usageType === 'refund' || item.usageType === 'bonus' ? '+' : '-'}{item.tokensUsed}
                            </div>
                            <div>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUsageTypeColor(item.usageType)}`}>
                                {formatUsageType(item.usageType)}
                              </span>
                            </div>
                            <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                            <div>{item.balanceBefore}</div>
                            <div>{item.balanceAfter}</div>
                            <div className="truncate" title={item.description || 'N/A'}>
                              {item.description || 'N/A'}
                            </div>
                            <div className="font-mono text-xs truncate" title={item.referenceId || 'N/A'}>
                              {item.referenceId?.slice(-8) || 'N/A'}
                            </div>
                            <div>
                              <button
                                onClick={() => setSelectedToken(item, 'usage')}
                                className="bg-[#1a97a4] text-white px-3 py-1 rounded text-xs font-medium hover:bg-[#158a96] transition-colors"
                              >
                                Full Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pagination for Debit */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={debitTotalPages}
                    onPageChange={setCurrentPage}
                    totalItems={debitTotalItems}
                    itemsPerPage={itemsPerPage}
                  />
                </>
              )}
            </div>
  )
}

export default TokenHistory