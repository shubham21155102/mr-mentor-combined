"use client"
import { useState, useEffect } from 'react'
// import { HeroSection, MobileHeroSection } from "@/components/LazyComponents";
import Image from "next/image";
import MobileHeroSection from '@/components/MobileScreensComponents/MobileHeroSection';
import HeroSection from '@/components/LandingPage/HeroSection';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false)

  // useEffect(() => {
  //   const checkScreenSize = () => {
  //     setIsMobile(window.innerWidth < 768)
  //   }

  //   // Check on mount
  //   checkScreenSize()

  //   // Add event listener
  //   window.addEventListener('resize', checkScreenSize)

  //   // Cleanup
  //   return () => window.removeEventListener('resize', checkScreenSize)
  // }, [])

  return (
   <>
   <div>
     {isMobile ? <MobileHeroSection/> : <HeroSection/>}
   </div>
   </>
  );
}
