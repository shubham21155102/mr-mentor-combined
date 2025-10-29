'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import LogInForm from "@/components/LogInForm"
import { signIn } from 'next-auth/react'
import RightPanel from './RightPanel'

const LogIn = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Google sign in error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 text-black" style={{
      background: "linear-gradient(to bottom right, #0F919F 0%, #123A53 50%) bottom right / 50% 50% no-repeat, linear-gradient(to bottom left, #0F919F 0%, #123A53 50%) bottom left / 50% 50% no-repeat, linear-gradient(to top left, #0F919F 0%, #123A53 50%) top left / 50% 50% no-repeat, linear-gradient(to top right, #0F919F 0%, #123A53 50%) top right / 50% 50% no-repeat",
      boxShadow: "0 0 230.5px 0 rgba(0, 0, 0, 0.25)"
    }}>
      <div className="w-full max-w-[90vw] md:max-w-[85vw] lg:max-w-[1000px] flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8 items-stretch">
        {/* Left Panel - Login Form */}
        <div className="w-full lg:w-[400px] bg-white/70 backdrop-blur-[115px] rounded-3xl p-4 sm:p-5 md:p-6 flex flex-col justify-center">
          {/* Logo Section */}
          <div className="flex flex-row items-end justify-center gap-1 mb-5 md:mb-7 lg:mb-10">
            <div className="relative">
              <Image
                src="/mas-logo.svg"
                alt="MAS Logo"
                width={28}
                height={28}
                className="drop-shadow-md w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10"
              />
            </div>
            <h1 className="text-2xl sm:text-[28px] md:text-[32px] font-['Goldman'] text-black leading-none tracking-[-4px] sm:tracking-[-5px] md:tracking-[-6px]">
              MAS
            </h1>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-4 md:mb-5 lg:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-[28px] font-semibold text-black leading-tight md:leading-[36px] mb-2 lg:mb-3">
              Let&apos;s Build Real Futures!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-4 sm:leading-5 px-2 sm:px-4">
              Turn your potential into possibilities — connect, learn, and grow with experts who&apos;ve walked the path before you.
            </p>
          </div>

          {/* Form */}
          <LogInForm />

          {/* Divider */}
          <div className="text-center mb-3 lg:mb-4">
            <span className="text-neutral-600 text-xs sm:text-sm">Or sign up with</span>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full py-2.5 sm:py-3 border-[#1a97a4] text-black text-sm sm:text-base md:text-lg font-medium rounded-[30px] shadow-[0px_4px_19px_0px_rgba(26,151,164,0.3)] hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center"
          >
            <Image
              src="/google-icon.png"
              alt="Google"
              width={16}
              height={16}
              className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
            />
            <span className="text-sm sm:text-base">Sign in with Google</span>
          </Button>

          {/* Sign Up Link */}
          <div className="text-center mt-5 md:mt-6 lg:mt-8">
            <p className="text-neutral-600 text-xs sm:text-sm">
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

       <RightPanel/>
      
      </div>
    </div>
  )
}

export default LogIn