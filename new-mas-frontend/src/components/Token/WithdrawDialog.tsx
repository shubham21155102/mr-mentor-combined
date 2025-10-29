"use client"
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { MentorEarningsService } from '../../lib/mentorEarningsService'
import { useAuth } from '../../hooks/useAuth'

interface WithdrawDialogProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
  onSuccess: () => void
}

export default function WithdrawDialog({ isOpen, onClose, availableBalance, onSuccess }: WithdrawDialogProps) {
  const [mounted, setMounted] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank'>('UPI')
  const [bankUPI, setBankUPI] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { backendToken } = useAuth()

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const withdrawAmount = Number.parseFloat(amount)

    if (!amount || Number.isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (withdrawAmount > availableBalance) {
      setError('Insufficient balance')
      return
    }

    if (!bankUPI.trim()) {
      setError(`Please enter ${paymentMethod === 'UPI' ? 'UPI ID' : 'bank details'}`)
      return
    }

    if (!backendToken) {
      setError('Authentication required')
      return
    }

    try {
      setIsSubmitting(true)
      const result = await MentorEarningsService.requestWithdrawal(
        backendToken,
        withdrawAmount,
        paymentMethod,
        bankUPI
      )

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.message || 'Failed to request withdrawal')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request withdrawal')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[24px] w-full max-w-[500px] relative overflow-hidden"
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
          <h2 className="text-[28px] font-semibold text-center text-black mb-6">
            Withdraw Amount
          </h2>

          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-1">Available Balance</div>
            <div className="text-2xl font-bold text-[#1a97a4]">
              ₹{availableBalance.toLocaleString('en-IN')}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
                  min="0"
                  max={availableBalance}
                  step="0.01"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="w-4 h-4 text-[#1a97a4] focus:ring-[#1a97a4]"
                  />
                  <span className="text-sm text-gray-700">UPI</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Bank"
                    checked={paymentMethod === 'Bank'}
                    onChange={() => setPaymentMethod('Bank')}
                    className="w-4 h-4 text-[#1a97a4] focus:ring-[#1a97a4]"
                  />
                  <span className="text-sm text-gray-700">Bank Transfer</span>
                </label>
              </div>
            </div>

            {/* Bank/UPI Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {paymentMethod === 'UPI' ? 'UPI ID' : 'Bank Account Details'}
              </label>
              <input
                type="text"
                value={bankUPI}
                onChange={(e) => setBankUPI(e.target.value)}
                placeholder={paymentMethod === 'UPI' ? 'yourname@upi' : 'Account Number & IFSC'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1a97a4] text-white rounded-full py-3 text-base font-medium hover:bg-[#158a96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Requesting...' : 'Request Withdrawal'}
            </button>
          </form>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-yellow-600 font-bold">ℹ</span>
              <div>
                <p className="font-medium mb-1">Please Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Withdrawal requests are processed every Friday</li>
                  <li>Minimum withdrawal amount is ₹100</li>
                  <li>Processing time: 1-3 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
