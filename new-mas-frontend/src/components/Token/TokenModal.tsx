"use client"
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Background from './Background'
import TokenPurchaseBackground from './TokenPurchaseBackground'
import CloseButton from './CloseButton'
import TokenDetails from './TokenDetails'
import TokenUsageDetails from './TokenUsageDetails'
import Pagination from './Pagination'
import TokenHistory from './TokenHistory'
import MentorTokenModal from './MentorTokenModal'
import { useRazorpay } from '../../hooks/useRazorpay'
import { TokenService } from '../../lib/tokenService'
import { useAuth } from '../../hooks/useAuth'
import { useUser } from '../../contexts/UserContext'

const imgStar24 = "/b4a13f5311dc65797e13a46db579b15c16f53006.svg"

interface TokenModalProps {
  isOpen: boolean
  onClose: () => void
  tokenCount: number
}

// Mock data for token history
const tokenHistoryData = [
  {
    id: "1",
    purchaseDate: "02 Aug 2025",
    expiry: "02 Aug 2025",
    redeemed: true,
    usedOn: "02 Aug 2025",
    meetId: "ipx-srrt-grg",
    meetsDate: "02 Aug 2025",
    meetTime: "09:00 PM"
  },
  {
    id: "2",
    purchaseDate: "02 Aug 2025",
    expiry: "02 Aug 2025",
    redeemed: false,
    usedOn: "02 Aug 2025",
    meetId: "ipx-srrt-grg",
    meetsDate: "02 Aug 2025",
    meetTime: "09:00 PM"
  },
  {
    id: "3",
    purchaseDate: "02 Aug 2025",
    expiry: "02 Aug 2025",
    redeemed: false,
    usedOn: "02 Aug 2025",
    meetId: "ipx-srrt-grg",
    meetsDate: "02 Aug 2025",
    meetTime: "09:00 PM"
  },
  {
    id: "4",
    purchaseDate: "02 Aug 2025",
    expiry: "02 Aug 2025",
    redeemed: false,
    usedOn: "02 Aug 2025",
    meetId: "ipx-srrt-grg",
    meetsDate: "02 Aug 2025",
    meetTime: "09:00 PM"
  }
]

export default function TokenModal({ isOpen, onClose, tokenCount }: TokenModalProps) {
  const { userRole } = useUser()
  
  // If user is a mentor, show the mentor-specific modal
  if (userRole === 'expert') {
    return <MentorTokenModal isOpen={isOpen} onClose={onClose} />
  }
  
  // Otherwise, continue with student token modal
  const [showDetails, setShowDetails] = useState(false)
  const [selectedToken, setSelectedToken] = useState<any | null>(null)
  const [selectedTokenType, setSelectedTokenType] = useState<'purchase' | 'usage' | null>(null)
  const [showRecharge, setShowRecharge] = useState(false)
  const [tokenQuantity, setTokenQuantity] = useState('')
  const [mounted, setMounted] = useState(false)
  const [currentTokenBalance, setCurrentTokenBalance] = useState(tokenCount)
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([])
  const [usageHistory, setUsageHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isTokenInputFocused, setIsTokenInputFocused] = useState(false)

  // Fixed conversion rate: 1 Token = ₹300
  const tokenCountValue = tokenQuantity ? parseInt(tokenQuantity, 10) : 0
  const computedAmount = tokenCountValue * 300
  const formattedComputedAmount = `₹ ${computedAmount.toLocaleString()}`
  
  const { purchaseTokens, loading: razorpayLoading, error: razorpayError, clearError } = useRazorpay()
  const { isAuthenticated, backendToken } = useAuth()
  const { fetchUserDetails } = useUser()

  useEffect(() => {
    setMounted(true)
    setCurrentTokenBalance(tokenCount)
    return () => setMounted(false)
  }, [tokenCount])

  // Load purchase history when showing details
  useEffect(() => {
    if (showDetails && (purchaseHistory.length === 0 || usageHistory.length === 0)) {
      loadPurchaseHistory()
      loadUsageHistory()
    }
  }, [showDetails])

  const loadPurchaseHistory = async () => {
    if (!isAuthenticated || !backendToken) {
      console.warn('User not authenticated, cannot load purchase history')
      return
    }

    try {
      setIsLoadingHistory(true)
      const history = await TokenService.getTokenPurchaseHistory(backendToken)
      setPurchaseHistory(history)
    } catch (error) {
      console.error('Failed to load purchase history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const loadUsageHistory = async () => {
    if (!isAuthenticated || !backendToken) {
      console.warn('User not authenticated, cannot load usage history')
      return
    }

    try {
      setIsLoadingHistory(true)
      const history = await TokenService.getTokenUsageHistory(backendToken)
      setUsageHistory(history)
    } catch (error) {
      console.error('Failed to load usage history:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleTokenPurchase = async () => {
    if (!isAuthenticated || !backendToken) {
      alert('Please log in to purchase tokens')
      return
    }

    if (!tokenQuantity) {
      alert('Please enter token quantity')
      return
    }

    const quantity = parseInt(tokenQuantity, 10)
    const amount = computedAmount

    if (quantity <= 0 || amount <= 0) {
      alert('Please enter valid token quantity and amount')
      return
    }

    try {
      clearError()
      
      // Define payment success callback
      const onPaymentSuccess = async (result: { success: boolean; error?: string; response?: any; verificationResult?: any }) => {
        if (result.success) {
          try {
            // Refresh user details (including token balance) from the backend
            await fetchUserDetails()
            
            // Close recharge modal
            setShowRecharge(false)
            setTokenQuantity('')
            
            alert('Tokens purchased successfully!')
          } catch (error) {
            console.error('Error refreshing user details:', error)
            alert('Tokens purchased successfully, but there was an error refreshing your balance. Please refresh the page.')
          }
        } else {
          alert(`Purchase failed: ${result.error}`)
        }
      }

      const result = await purchaseTokens(quantity, amount, undefined, onPaymentSuccess)
      
      if (!result.success) {
        alert(`Purchase failed: ${result.error}`)
      }
      // Note: Success case is handled in the onPaymentSuccess callback
    } catch (error: any) {
      console.error('Token purchase error:', error)
      alert(`Purchase failed: ${error.message}`)
    }
  }

  if (!isOpen || !mounted) return null

  // Show authentication required message if user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100002] p-4" style={{ zIndex: 100002 }}>
        <div className="backdrop-blur-[115.25px] backdrop-filter bg-gradient-to-r from-[#ffffff] to-[#ffffff] overflow-clip relative rounded-[24px] w-[80%] h-[400px] z-[100003]" style={{ zIndex: 100003 }}>
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 text-center mb-6">
              Please log in to view your token balance and purchase tokens.
            </p>
            <button
              onClick={onClose}
              className="bg-[#1a97a4] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#158a96] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 pt-25" style={{ zIndex: 40 }}>
      <div className={`backdrop-blur-[115.25px] backdrop-filter bg-gradient-to-r from-[#ffffff] overflow-clip relative rounded-[24px] ${showDetails || showRecharge ? 'w-[90%] h-[80vh]' : 'w-[80%] h-[650px]'} to-[#ffffff] z-50`} style={{ zIndex: 50 }}>

        {/* Back Button - Show when in details or recharge view */}
        {(showDetails || showRecharge) && (
          <div className="absolute bg-neutral-200 box-border content-stretch flex gap-[10px] items-center p-[4px] left-[24px] rounded-[8px] top-[24px] cursor-pointer z-60" onClick={() => {
            setShowDetails(false)
            setShowRecharge(false)
            setSelectedToken(null)
          }}>
            <div className="relative shrink-0 size-[24px]">
              <ArrowLeft className='w-6 h-6' />
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="absolute bg-neutral-200 box-border content-stretch flex gap-[10px] items-center p-[4px] right-[24px] rounded-[8px] top-[24px] cursor-pointer z-60" onClick={() => {
          setShowDetails(false)
          setShowRecharge(false)
          setSelectedToken(null)
          onClose()
        }}>
          <div className="relative shrink-0 size-[24px]">
            <X className='w-6 h-6' />
          </div>
        </div>

        {!showDetails && !showRecharge ? (
          <>
            {/* Title */}
            <div
              className="absolute flex flex-col justify-center text-black text-nowrap top-[60px] translate-y-[-50%]"
              style={{
                left: "calc(50% - 164.5px)",
                color: '#000',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '36px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '44px',
                letterSpacing: 'var(--Static-Body-Large-Tracking, 0.5px)'
              }}
            >
              <p className="whitespace-pre">Your Token Balance</p>
            </div>

            {/* Decorative Elements - Star Background */}
            <Background/>

            {/* Token Count Display - Centered in the modal */}
            <p
              className="absolute text-nowrap whitespace-pre"
              style={{
                top: '65%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: 'Goldman, sans-serif',
                fontSize: '108.997px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '145.329px',
                letterSpacing: '-2.18px',
                // Gradient text
                background: 'linear-gradient(202deg, #F6C218 -42.63%, #1A97A4 76.5%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {currentTokenBalance}
            </p>

            {/* Conditional Content */}
            {currentTokenBalance > 0 ? (
              <>
                {/* Date Range */}
                <div className="absolute font-['Inter:Regular',_sans-serif] leading-[24px] not-italic text-[#888888] text-[24px] text-nowrap"
                  style={{ top: "75%", left: "50%", transform: "translate(-50%, -50%)" }}>
                  <p className="whitespace-pre">10 Oct 25</p>
                </div>

                {/* Two Buttons */}
                <div className="absolute bottom-[48px] left-1/2 -translate-x-1/2" style={{ width: '420px', height: '60px' }}>
                  <div className="flex gap-4 h-full">
                    {/* View Details Button */}
                    <button 
                      className="flex-1 bg-white border border-[#1a97a4] flex items-center justify-center rounded-[27px] cursor-pointer hover:bg-gray-50 transition-colors px-4"
                      onClick={() => setShowDetails(true)}
                    >
                      <span className="font-semibold text-[19.98px] text-[#1a97a4] whitespace-nowrap">
                        View Details
                      </span>
                    </button>

                    {/* Get Tokens Button */}
                    <button 
                      className="flex-1 bg-[#1a97a4] flex items-center justify-center rounded-[27px] cursor-pointer hover:bg-[#158a96] transition-colors px-4"
                      onClick={() => setShowRecharge(true)}
                    >
                      <span className="font-semibold text-[19.98px] text-white whitespace-nowrap">
                        Get Tokens
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Subtitle - Only when no tokens */}
                <div className="absolute flex flex-col font-['Inter:Semi_Bold',_sans-serif] font-semibold justify-center leading-[0] not-italic text-[#3b3b3b] text-[36px] text-nowrap tracking-[-0.72px]"
                  style={{ top: "73%", left: "50%", transform: "translate(-50%, -50%)" }}>
                  <p className="leading-[24px] whitespace-pre">Purchase token to use them for meetings</p>
                </div>

                {/* Purchase Button - Only when no tokens */}
                <div className="absolute bottom-[48px] left-1/2 -translate-x-1/2" style={{ width: '420px', height: '60px' }}>
                  <button 
                    className="bg-[#1a97a4] flex items-center justify-center rounded-[27px] w-full h-full cursor-pointer hover:bg-[#158a96] transition-colors px-4"
                    onClick={() => setShowRecharge(true)}
                  >
                    <span className="font-semibold text-[19.98px] text-white whitespace-nowrap">
                      Get Tokens
                    </span>
                  </button>
                </div>
              </>
            )}
          </>
        ) : showRecharge ? (
         <>
  {/* Get Tokens View - Matching Figma Design */}
  <div className="h-full flex flex-col px-8 py-6 relative">
    {/* Header with Title */}
    <div className="flex items-center mb-8">
      <h1 className="text-[36px] font-semibold text-black tracking-[0.5px] leading-[44px]">
        Get Tokens
      </h1>
    </div>

    {/* Star Background - Fixed positioning */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <div className="relative w-[367px] h-[367px]">
        <img 
          alt="Star background" 
          className="w-full h-full opacity-30" 
          src={imgStar24} 
        />
      </div>
    </div>

    {/* Main Content Container */}
    <div className="flex-1 flex flex-col relative z-10 justify-center">
      {/* Token Information */}
      <div className="text-center mb-4">
        <p
          className="text-gray-700"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            fontStyle: 'normal', // Semi Bold is represented by fontWeight: 600
            fontSize: '24px',
            // approximated Static/Body Large line height to keep visual rhythm
            lineHeight: '30px',
            // -2% of 24px = -0.48px
            letterSpacing: '-0.48px',
            verticalAlign: 'middle'
          }}
        >
          ₹ 300 INR is equivalent to
        </p>
      </div>

      {/* Central Token Visual - Matching Figma Design */}
      <div className="flex justify-center mb-60">
        <TokenPurchaseBackground />
      </div>

      {/* Input Fields Container - Two side by side */}
      <div className="w-full max-w-[516px] mx-auto mb-8">
        <div className="flex gap-8">
          {/* Left Input Field - Token Quantity */}
          <div className="flex-1">
            <div className="relative">
              <div className={`absolute inset-0 border-b-2 transition-colors duration-200 ${
                isTokenInputFocused ? 'border-[#1a97a4]' : 'border-gray-300'
              }`}></div>
              <div className="flex items-center justify-center h-[47px] relative">
                <div className="text-[47px] font-normal text-black leading-[47px] transition-all duration-200">
                  {tokenQuantity || (isTokenInputFocused ? '' : '0')}
                </div>
                {isTokenInputFocused && (
                  <div className="absolute right-0 w-0.5 h-8 bg-[#1a97a4] animate-pulse"></div>
                )}
              </div>
              <input
                type="number"
                value={tokenQuantity}
                onChange={(e) => setTokenQuantity(e.target.value)}
                onFocus={() => setIsTokenInputFocused(true)}
                onBlur={() => setIsTokenInputFocused(false)}
                placeholder="0"
                className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                min="1"
                max="9999"
              />
            </div>
            <div className={`text-center mt-2 text-[17px] transition-colors duration-200 ${
              isTokenInputFocused ? 'text-[#1a97a4]' : 'text-gray-600'
            }`}>
              Enter Tokens
            </div>
          </div>

          {/* Right Input Field - Payment Method */}
          <div className="flex-1">
            <div className="relative">
              <div className={`absolute inset-0 border-b-2 transition-colors duration-200 border-gray-300`}></div>
              <div className="flex items-center justify-center h-[47px] relative">
                <div className="text-[47px] font-normal text-black leading-[47px] text-center transition-all duration-200">
                  {formattedComputedAmount}
                </div>
              </div>
            </div>
            <div className={`text-center mt-2 text-[17px] text-gray-600`}>
              Equivalent Amount
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {razorpayError && (
        <div className="w-full max-w-[516px] mx-auto mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {razorpayError}
            <button 
              onClick={clearError}
              className="absolute top-0 right-0 mt-1 mr-2 text-red-500 hover:text-red-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons - Matching Figma Design */}
      <div className="w-full max-w-[420px] mx-auto h-[60px] mt-8">
        <div className="flex gap-4 h-full">
          {/* Cancel Button */}
          <div 
            className="flex-1 bg-white border border-[#1a97a4] rounded-[27px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowRecharge(false)}
          >
            <span className="text-[#1a97a4] font-semibold text-[20px] leading-[28px]">
              Cancel
            </span>
          </div>

          {/* Purchase Button */}
          <div 
            className={`flex-1 bg-[#1a97a4] rounded-[27px] flex items-center justify-center cursor-pointer transition-colors ${
              razorpayLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#158a96]'
            }`}
            onClick={handleTokenPurchase}
          >
            <span className="text-white font-semibold text-[20px] leading-[28px]">
              {razorpayLoading ? 'Processing...' : 'Purchase Tokens'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
        ) : (
          <>
            {/* Details View */}
            <TokenHistory 
              setSelectedToken={(token, type) => {
                setSelectedToken(token)
                setSelectedTokenType(type)
              }} 
              purchaseHistory={purchaseHistory}
              usageHistory={usageHistory}
              isLoading={isLoadingHistory}
            />
          </>
        )}
      </div>

      {/* Full Details Modal - Show different modals based on token type */}
      {selectedToken && selectedTokenType === 'purchase' && (
        <TokenDetails selectedToken={selectedToken} setSelectedToken={() => {
          setSelectedToken(null)
          setSelectedTokenType(null)
        }} />
      )}
      
      {selectedToken && selectedTokenType === 'usage' && (
        <TokenUsageDetails selectedToken={selectedToken} setSelectedToken={() => {
          setSelectedToken(null)
          setSelectedTokenType(null)
        }} />
      )}
    </div>
  )

  return createPortal(modalContent, document.body)
}