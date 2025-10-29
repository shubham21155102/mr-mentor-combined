"use client";

import { useState } from "react";
import { Mail, MessageSquareWarning, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ReportIssueModal from "./ReportIssueModal";

export default function Footer() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <footer className="w-full min-h-[400px] flex flex-col bg-transparent rounded-3xl overflow-hidden bg-[linear-gradient(180deg,rgba(10,167,184,0.01)_0%,rgba(187,251,231,0.6)_100%)] px-4 sm:px-8 md:px-16 lg:px-24 xl:px-[248px] py-6 sm:py-8 md:py-12 lg:py-16">
      <div className="flex items-end gap-2 sm:gap-4 md:gap-6 lg:gap-[10.11px] mb-6 sm:mb-8">
        <div className="flex flex-row">
          <div>
            <Image 
              src={"/mas-logo.svg"} 
              alt="MAS Logo" 
              width={40} 
              height={40} 
              className="sm:w-[50px] sm:h-[50px]"
            />
          </div>
          <div className="[font-family:'Goldman',Helvetica] font-normal text-black text-4xl sm:text-5xl md:text-6xl lg:text-[80.8px] tracking-[-0.05em] leading-none sm:leading-[80.8px] whitespace-nowrap">
            MAS
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl mb-6 sm:mb-8 md:mb-[82px] [font-family:'Inter',Helvetica] font-normal text-[#535353] text-base sm:text-lg md:text-xl tracking-[0] leading-6">
        MAS Connect is an IIT Alumni-founded Start-up, empowering all to
        connect with professionals for mock interviews, guided sessions and
        other.
      </div>

      <div className="w-full h-0.5 mb-4 sm:mb-6 md:mb-[30px] border-[2px] bg-[#00000040]"></div>
       
      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 mb-6 lg:mb-[28px]">
        <div className="w-full lg:w-[696px] flex flex-col sm:flex-row items-start justify-around gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-6 w-full">
            <div className="flex flex-col items-start gap-4 w-full sm:w-1/3">
              <div className="[font-family:'Inter',Helvetica] font-medium text-black text-xl sm:text-2xl tracking-[0] leading-8 whitespace-nowrap">
                Explore
              </div>

              <nav className="flex flex-col items-start gap-2 w-full">
                <Link href="/about" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  About Us
                </Link>

                <Link href="/courses" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  Courses
                </Link>

                <Link href="/how-it-works" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  How it works
                </Link>
              </nav>
            </div>

            <div className="flex flex-col items-start gap-4 w-full sm:w-1/3">
              <div className="[font-family:'Inter',Helvetica] font-medium text-black text-xl sm:text-2xl tracking-[0] leading-8 whitespace-nowrap">
                Resources
              </div>

              <nav className="flex flex-col items-start gap-2 w-full">
                <Link href="/learn" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  Learn @ MAS
                </Link>

                <Link href="/test" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  Test @ MAS
                </Link>
              </nav>
            </div>

            <div className="flex flex-col items-start gap-4 w-full sm:w-1/3">
              <div className="[font-family:'Inter',Helvetica] font-medium text-black text-xl sm:text-2xl tracking-[0] leading-8 whitespace-nowrap">
                Follow Us
              </div>

              <nav className="flex flex-col items-start gap-2 w-full">
                <Link href="https://linkedin.com/company/mas-connect" target="_blank" rel="noopener noreferrer" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  LinkedIn
                </Link>

                <Link href="https://instagram.com/masconnect" target="_blank" rel="noopener noreferrer" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  Instagram
                </Link>

                <Link href="https://youtube.com/@masconnect" target="_blank" rel="noopener noreferrer" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  Youtube
                </Link>

                <Link href="https://facebook.com/masconnect" target="_blank" rel="noopener noreferrer" className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap hover:text-[#1A97A4] transition-colors">
                  Facebook
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full lg:w-auto">
          <div className="flex flex-col items-start gap-4 w-full lg:w-[332px]">
            <div className="[font-family:'Inter',Helvetica] font-medium text-black text-xl sm:text-2xl tracking-[0] leading-8 whitespace-nowrap">
              Contact us
            </div>

            <div className="flex flex-col w-full items-start gap-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6" fill="#000000" />
                <div className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap">
                  +91 9604077455
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-[#000000]" />
                <div className="[font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap">
                  admin@myanalyticsschool.com
                </div>
              </div>

              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-start gap-3 hover:opacity-80 transition-opacity"
              >
                <MessageSquareWarning className="w-5 h-5 sm:w-6 sm:h-6 text-[#EF373A]" />
                <div className="[font-family:'Inter',Helvetica] font-normal text-[#ee363a] text-sm sm:text-base tracking-[0] leading-6 whitespace-nowrap">
                  Report an issue
                </div>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 w-full lg:w-[332px]">
            <div className="[font-family:'Inter',Helvetica] font-medium text-black text-xl sm:text-2xl tracking-[0] leading-8 whitespace-nowrap">
              Address
            </div>

            <div className="flex flex-col w-full items-start gap-4">
              <div className="flex items-start gap-3 w-full">
                <address className="w-full [font-family:'Inter',Helvetica] font-normal text-[#535353] text-sm sm:text-base tracking-[0] leading-6 not-italic">
                  Ground Floor - Nukleus Coworking & Managed Offices, 29, Sector 142, Noida, Uttar Pradesh 201305
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-0.5 mb-4 sm:mb-6 md:mb-[30px] border-[2px] bg-[#00000040]"></div>

      <div className="flex flex-col sm:flex-row h-10 w-full items-center justify-between gap-4">
        <div className="[font-family:'Inter',Helvetica] font-normal text-[#444c4c] text-xs sm:text-sm tracking-[0] leading-5 text-center sm:text-left">
          Copyright © 2023 My Analytics School
        </div>

        <div className="[font-family:'Inter',Helvetica] font-normal text-[#444c4c] text-xs sm:text-sm tracking-[0] leading-5 whitespace-nowrap text-center sm:text-right">
          All Rights Reserved | Terms and Conditions | <Link href="/privacy-policy">Privacy Policy</Link> 
        </div>
      </div>

      {/* Report Issue Modal */}
      <ReportIssueModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </footer>
  );
}