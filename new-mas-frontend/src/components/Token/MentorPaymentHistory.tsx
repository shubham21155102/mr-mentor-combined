"use client"
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowLeft } from 'lucide-react'
import { MentorEarningsService, type PaymentHistoryResponse } from '../../lib/mentorEarningsService'
import { useAuth } from '../../hooks/useAuth'

interface MentorPaymentHistoryProps {
  isOpen: boolean
  onClose: () => void
}

export default function MentorPaymentHistory({ isOpen, onClose }: MentorPaymentHistoryProps) {
  const [mounted, setMounted] = useState(false)
  const [history, setHistory] = useState<PaymentHistoryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { backendToken } = useAuth()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && backendToken) {
      loadHistory(currentPage)
    }
  }, [isOpen, backendToken, currentPage])

  const loadHistory = async (page: number) => {
    if (!backendToken) return

    try {
      setIsLoading(true)
      const data = await MentorEarningsService.getPaymentHistory(backendToken, page, 7)
      setHistory(data)
    } catch (error) {
      console.error('Failed to load payment history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800',
      in_process: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    const labels = {
      requested: 'Requested',
      in_process: 'In Process',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] w-full max-w-[1000px] max-h-[90vh] relative overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[28px] font-semibold text-black">Payment History</h2>
          
          <button
            className="ml-auto bg-neutral-200 box-border flex gap-[10px] items-center p-[4px] rounded-[8px] cursor-pointer hover:bg-neutral-300 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a97a4]"></div>
            </div>
          ) : history && history.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Time</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-black">Bank/UPI</th>
                  </tr>
                </thead>
                <tbody>
                  {history.transactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.transactionId || transaction.id.substring(0, 12)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {Math.abs(transaction.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.status ? getStatusBadge(transaction.status) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatTime(transaction.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.paymentMethod || (transaction.type === 'earning' ? 'UPI' : '-')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.bankUPI || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No payment history available
            </div>
          )}
        </div>

        {/* Pagination */}
        {history && history.totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(history.totalPages, 3) }, (_, i) => {
                const pageNum = currentPage <= 2 
                  ? i + 1 
                  : currentPage >= history.totalPages - 1
                  ? history.totalPages - 2 + i
                  : currentPage - 1 + i
                
                if (pageNum < 1 || pageNum > history.totalPages) return null
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                      currentPage === pageNum
                        ? 'bg-[#1a97a4] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= history.totalPages}
                className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-[#1a97a4] text-white rounded-full py-3 text-base font-medium hover:bg-[#158a96] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
