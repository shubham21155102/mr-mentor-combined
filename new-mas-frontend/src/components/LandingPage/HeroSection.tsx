"use client"
import React from 'react'
import ConditionalNavBar from '../ConditionalNavBar'
import HeroIntroSection from './HeroIntroSection'
import FeatureHighlights from './FeatureHighlights'
import MentorshipShowcaseSection from './MentorshipShowcaseSection'
import Footer from '../Footer'

const HeroSection = () => {
  return (
      <div style={{backgroundImage:'url(/landing_bg.svg)'}} className='bg-cover bg-center h-screen'>
      <ConditionalNavBar/>
      <HeroIntroSection/>
      <FeatureHighlights/>
      <MentorshipShowcaseSection/>
      <Footer/>
    </div>
  )
}
export default HeroSection