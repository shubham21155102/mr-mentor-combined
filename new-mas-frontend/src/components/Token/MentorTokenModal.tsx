"use client"
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Image from 'next/image'
import { MentorEarningsService, type MentorEarnings } from '../../lib/mentorEarningsService'
import { useAuth } from '../../hooks/useAuth'
import MentorPaymentHistory from './MentorPaymentHistory'
import WithdrawDialog from './WithdrawDialog'

interface MentorTokenModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MentorTokenModal({ isOpen, onClose }: MentorTokenModalProps) {
  const [mounted, setMounted] = useState(false)
  const [earnings, setEarnings] = useState<MentorEarnings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const { isAuthenticated, backendToken } = useAuth()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && isAuthenticated && backendToken) {
      loadEarnings()
    }
  }, [isOpen, isAuthenticated, backendToken])

  const loadEarnings = async () => {
    if (!backendToken) return

    try {
      setIsLoading(true)
      const data = await MentorEarningsService.getMentorEarnings(backendToken)
      setEarnings(data)
    } catch (error) {
      console.error('Failed to load earnings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString('en-IN')}`
  }

  const handleWithdrawSuccess = () => {
    loadEarnings()
    setShowWithdrawDialog(false)
  }

  if (!mounted || !isOpen) return null

  if (showPaymentHistory) {
    return createPortal(
      <MentorPaymentHistory
        isOpen={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
      />,
      document.body
    )
  }

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-[24px] w-full max-w-[600px] relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute bg-neutral-200 box-border flex gap-[10px] items-center p-[4px] right-[24px] rounded-[8px] top-[24px] cursor-pointer hover:bg-neutral-300 transition-colors z-10"
            onClick={onClose}
            aria-label="Close"
          >
            <X className='w-6 h-6' />
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Title */}
            <h2 className="text-[36px] font-semibold text-center text-black mb-8">
              Your Earning
            </h2>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a97a4]"></div>
              </div>
            ) : (
              <>
                {/* Wallet Image and Balance */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-[200px] h-[200px] mb-4">
                    <Image 
                      src="/tokens_icon.svg" 
                      alt="Wallet" 
                      width={200} 
                      height={200}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-[28px] font-bold text-black">
                      {formatCurrency(earnings?.totalEarnings || 0)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Earning since: {formatDate(earnings?.lastTransaction?.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Current Earning Section */}
                <div className="mb-6">
                  <h3 className="text-[24px] font-semibold text-black mb-4">
                    Current Earning
                  </h3>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[12px] text-gray-500">₹</span>
                        <span className="text-[32px] font-bold text-[#1a97a4]">
                          {(earnings?.availableBalance || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {earnings?.lastTransaction && (
                        <>
                          <div className="text-sm text-gray-600">
                            Last Transaction: {formatCurrency(Math.abs(earnings.lastTransaction.amount))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(earnings.lastTransaction.createdAt)}, {formatTime(earnings.lastTransaction.createdAt)}
                          </div>
                          {earnings.lastTransaction.status && (
                            <div className="mt-1">
                              <span className={`inline-block px-2 py-1 rounded text-xs ${
                                earnings.lastTransaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : earnings.lastTransaction.status === 'requested'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {earnings.lastTransaction.status.charAt(0).toUpperCase() + 
                                 earnings.lastTransaction.status.slice(1).replace('_', ' ')}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setShowPaymentHistory(true)}
                        className="px-6 py-2 border-2 border-[#1a97a4] text-[#1a97a4] rounded-full hover:bg-[#1a97a4] hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Payment History
                      </button>
                      <button
                        onClick={() => setShowWithdrawDialog(true)}
                        className="px-6 py-2 bg-[#1a97a4] text-white rounded-full hover:bg-[#158a96] transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Withdraw Amount
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-yellow-600">ℹ</span>
                    <span>Payments are cleared Every fridays</span>
                  </div>
                </div>

                {/* Help Button */}
                <button className="absolute bottom-6 right-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                  <span className="bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-xs">?</span>
                  Help
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Dialog */}
      {showWithdrawDialog && (
        <WithdrawDialog
          isOpen={showWithdrawDialog}
          onClose={() => setShowWithdrawDialog(false)}
          availableBalance={earnings?.availableBalance || 0}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </>,
    document.body
  )
}
