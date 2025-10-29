"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Inter, Roboto } from 'next/font/google'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import TokenModal from './Token/TokenModal'

const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'] })

const LoggedInNavBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout ,userRole} = useUser()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)

  // Calculate total tokens
  const totalTokens = user?.tokens[0].token || 0

  // Close dropdown when route changes
  useEffect(() => {
    setIsProfileDropdownOpen(false)
  }, [pathname])

  const handleLogout = () => {
    setIsProfileDropdownOpen(false)
    logout()
    router.push('/')
  }

  return (
    <div className='flex justify-between p-4 bg-[#0B1B2A] rounded-4xl w-[92%] mx-auto top-0 sticky z-50'>
      {/* Left side - Logo and Navigation */}
      <div className='flex items-center justify-between w-[756px]'>
        <div className='flex items-center gap-3 pl-4'>
          <div className='flex items-center py-2 cursor-pointer' onClick={() => router.push('/')}>
            <div className='h-[22px] w-[18px] relative'>
              <Image
                src="/f9bdc36fc903462c714dd636877cc51424a5769a.png"
                alt="MR Mentor Logo"
                width={18}
                height={22}
                className='object-cover'
              />
            </div>
          </div>
          <p className={`font-bold text-[22px] leading-[28px] text-white tracking-[-0.48px] ${inter.className} cursor-pointer`} onClick={() => router.push('/')}>
            Mr. Mentor
          </p>
        </div>
        {userRole==='expert' && (<div className='flex items-center gap-8'>
          <Link 
            href={'/leaderboard'} 
            className={`font-medium text-[16px] leading-[38px] text-white tracking-[-0.32px] uppercase ${inter.className}`}
          >
            Leaderboard
          </Link>
        </div>) }
         {userRole==='user' && (<div className='flex items-center gap-8'>
          <Link 
            href={'/find-an-expert'} 
            className={`font-medium text-[16px] leading-[38px] text-white tracking-[-0.32px] uppercase ${inter.className}`}
          >
            Find an expert
          </Link>
        </div>) }
      </div>

      {/* Right side - Tokens and Profile */}
      <div className='flex items-center gap-6'>
        {/* Earnings Display for Experts */}
        {userRole==='expert' && (
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className='flex items-center gap-3 bg-[rgba(26,151,164,0.5)] rounded-[30px] px-4 py-2 border border-[rgba(255,255,255,0.2)] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.7)] transition-colors cursor-pointer'
          >
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 flex-shrink-0'>
                <Image src="/tokens_icon.svg" alt="Earnings Visual" width={24} height={24} />
              </div>
              <p className={`font-medium text-[16px] leading-[20px] text-white tracking-[-0.32px] ${inter.className}`}>
                Earnings
              </p>
            </div>
            <div className='bg-black/20 rounded-lg px-2 py-1 min-w-fit'>
              <p className={`font-semibold text-[16px] leading-[20px] text-white tracking-[-0.32px]`}>
                ₹{parseInt(String(totalTokens)) * 300}
              </p>
            </div>
          </button>
        )}

        {/* Tokens Display for Users */}
        {userRole==='user' && (
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className='flex items-center gap-3 bg-[rgba(26,151,164,0.5)] rounded-[30px] px-4 py-2 border border-[rgba(255,255,255,0.2)] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.7)] transition-colors cursor-pointer'
          >
            <div className='flex items-center gap-2'>
              <div className='w-6 h-6 flex-shrink-0'>
                <Image src="/tokens_icon.svg" alt="Token Visual" width={24} height={24} />
              </div>
              <p className={`font-medium text-[16px] leading-[20px] text-white tracking-[-0.32px] ${inter.className}`}>
                Tokens
              </p>
            </div>
            <div className='bg-black/20 rounded-lg px-2 py-1 min-w-fit'>
              <p className={`font-semibold text-[16px] leading-[20px] text-white tracking-[-0.32px]`}>
                {totalTokens}
              </p>
            </div>
          </button>
        )}
       

        {/* Profile Button */}
        <div className='relative'>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className='bg-[rgba(26,151,164,0.5)] rounded-[30px] p-2 border border-[rgba(255,255,255,0.2)] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.7)] transition-colors'
          >
            <div className='w-6 h-6 relative'>
              {/* Profile icon - using a placeholder for now */}
              <div className='w-6 h-6 bg-white/20 rounded-full flex items-center justify-center'>
                <span className='text-white text-xs font-bold'>👤</span>
              </div>
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className='absolute right-0 top-[66px] bg-[#0B1B2A] rounded-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.25)] p-3 min-w-[200px] pointer-events-auto' style={{ zIndex: 50 }}>
              <div className='space-y-2'>
                <button
                  onClick={() => router.push('/profile')}
                  className='block w-full text-left px-3 py-2 rounded-[30px] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.1)] transition-colors'
                >
                  <p className={`font-normal text-[16px] leading-[24px] text-white ${roboto.className}`}>
                    Manage profile
                  </p>
                </button>

                <button
                  onClick={() => router.push('/meetings')}
                  className='block w-full text-left px-3 py-2 rounded-[30px] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.1)] transition-colors'
                >
                  <p className={`font-normal text-[16px] leading-[24px] text-white ${roboto.className}`}>
                    Interviews
                  </p>
                </button>

                {userRole==='user' && (
                  <button
                    onClick={() => router.push('/become-an-expert')}
                    className='block w-full text-left px-3 py-2 rounded-[30px] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.1)] transition-colors'
                  >
                    <p className={`font-normal text-[16px] leading-[24px] text-white ${roboto.className}`}>
                      Become an Expert
                    </p>
                  </button>
                )}

                {userRole==='expert' && (
                  <button
                    onClick={() => router.push('/expert-dashboard')}
                    className='block w-full text-left px-3 py-2 rounded-[30px] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] hover:bg-[rgba(26,151,164,0.1)] transition-colors'
                  >
                    <p className={`font-normal text-[16px] leading-[24px] text-white ${roboto.className}`}>
                      Switch to Expert
                    </p>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className='w-full bg-[rgba(26,151,164,0.5)] rounded-[12px] px-3 py-2 flex items-center justify-between hover:bg-[rgba(26,151,164,0.7)] transition-colors'
                >
                  <p className={`font-normal text-[16px] leading-[24px] text-white ${roboto.className}`}>
                    Sign out
                  </p>
                  <div className='w-6 h-6 relative'>
                    {/* Logout icon - using a placeholder for now */}
                    <div className='w-6 h-6 bg-white/20 rounded flex items-center justify-center'>
                      <span className='text-white text-xs'>↪</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className='fixed inset-0'
          style={{ zIndex: 45 }}
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}

      {/* Token Modal */}
      <TokenModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        tokenCount={typeof totalTokens === 'string' ? parseInt(totalTokens, 10) : totalTokens}
      />
    </div>
  )
}

export default LoggedInNavBar
