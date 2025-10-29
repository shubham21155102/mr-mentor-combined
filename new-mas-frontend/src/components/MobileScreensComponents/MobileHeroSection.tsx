"use client"
import React, { useState, useEffect } from 'react'
import NavBar from '../NavBar'
import MobileMentorshipShowcaseSection from './MobileMentorshipShowcaseSection'
import Footer from '../Footer'
import HeroIntroSection from '../LandingPage/HeroIntroSection'
import FeatureHighlights from '../LandingPage/FeatureHighlights'
import ConditionalNavBar from '../ConditionalNavBar'

const MobileHeroSection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkScreenSize()

    // Add event listener
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <div style={{backgroundImage:'url(/landing_bg.svg)'}} className='bg-cover bg-center min-h-screen pt-4 px-4'>
      <ConditionalNavBar/>
      
      {/* Mobile Hero Content */}
      <div className="pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
          Level up with guided mock interviews
        </h1>
        <p className="text-white/90 text-sm mb-6 leading-relaxed">
          Get personalized feedback from experts in Data Analytics and boost your confidence for real-world interviews.
        </p>
        <button className="bg-white text-black px-6 py-3 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors">
          Go to Dashboard
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Mobile Feature Highlights */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
        <h3 className="text-white text-center text-sm font-medium mb-4">
          What makes our mock interviews truly work for you?
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium text-sm mb-1">Experienced Mentors</h4>
              <p className="text-white/80 text-xs leading-relaxed">
                Get guidance from seasoned professionals who've been where you are. Our mentors help you build clarity, confidence, and real-world interview skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MobileMentorshipShowcaseSection/>
      <Footer/>
    </div>
  )
}

export default MobileHeroSection
