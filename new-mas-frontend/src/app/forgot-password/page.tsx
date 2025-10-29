'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Reset code has been sent to your email!')
        setStep('reset')
      } else {
        setError(data.message || 'Failed to send reset code')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Forgot password error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          resetToken,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password reset successful! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 text-black" style={{
      background: "linear-gradient(to bottom right, #0F919F 0%, #123A53 50%) bottom right / 50% 50% no-repeat, linear-gradient(to bottom left, #0F919F 0%, #123A53 50%) bottom left / 50% 50% no-repeat, linear-gradient(to top left, #0F919F 0%, #123A53 50%) top left / 50% 50% no-repeat, linear-gradient(to top right, #0F919F 0%, #123A53 50%) top right / 50% 50% no-repeat",
      boxShadow: "0 0 230.5px 0 rgba(0, 0, 0, 0.25)"
    }}>
      <div className="w-full max-w-[450px] bg-white/70 backdrop-blur-[115px] rounded-3xl p-6 md:p-8">
        {/* Logo Section */}
        <div className="flex flex-row items-end justify-center gap-1 mb-8">
          <div className="relative">
            <Image
              src="/mas-logo.svg"
              alt="MAS Logo"
              width={40}
              height={40}
              className="drop-shadow-md"
            />
          </div>
          <h1 className="text-[32px] font-['Goldman'] text-black leading-none tracking-[-6px]">
            MAS
          </h1>
        </div>

        {/* Back to Login Link */}
        <Link 
          href="/login" 
          className="flex items-center gap-2 text-[#1a97a4] hover:underline mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        {/* Main Heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-[28px] font-semibold text-black leading-tight mb-2">
            {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="text-sm text-neutral-600 leading-5">
            {step === 'email' 
              ? 'Enter your email address and we\'ll send you a reset code.'
              : 'Enter the code sent to your email and your new password.'
            }
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Email Form */}
        {step === 'email' && (
          <form onSubmit={handleSendResetCode} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-300 rounded-[30px] text-base focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1a97a4] hover:bg-[#0d7a85] text-white text-base font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] transition-all"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        )}

        {/* Reset Password Form */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <Input
                type="text"
                placeholder="Reset Code"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                maxLength={6}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-300 rounded-[30px] text-base focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-300 rounded-[30px] text-base focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-neutral-300 rounded-[30px] text-base focus:outline-none focus:ring-2 focus:ring-[#1a97a4]/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1a97a4] hover:bg-[#0d7a85] text-white text-base font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] transition-all"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-sm text-neutral-600 hover:text-[#1a97a4] transition-colors"
            >
              Didn&apos;t receive the code? Send again
            </button>
          </form>
        )}

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-neutral-600 text-sm">
            Don&apos;t have an Account?{' '}
            <Link
              href="/signup"
              className="text-[#1a97a4] font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
