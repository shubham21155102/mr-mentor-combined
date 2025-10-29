import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Scores } from "@/types/mentorMultiplier";

interface ResultsDisplayProps {
  multiplier: number;
  finalPrice: number;
  scores: Scores;
  onGoHome: () => void;
  onCalculateAgain: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  multiplier,
  finalPrice,
  scores,
  onGoHome,
  onCalculateAgain,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8F4F8] via-[#F0F8FA] to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          {/* Breadcrumb */}
          

          {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">
            🎉 "Here's Your Multiplier!" 🎉
          </h1>


          {/* Main Card with Glowing Effect */}
          <div className="relative flex flex-col items-center">
            
            {/* Radial Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] opacity-30">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-yellow-300 to-teal-300 blur-2xl animate-pulse"></div>
              {/* Sunburst rays */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-0.5 h-24 bg-gradient-to-t from-yellow-200/50 to-transparent origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Wallet + Coin Image */}
            <div className="relative z-10 mb-8 flex flex-col items-center justify-center -mt-25">
              <div className="relative">
                {/* Background Glow (optional, can remove if you don’t want) */}
                {/* <div className="absolute inset-0 w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-yellow-300 via-teal-300 to-teal-400 opacity-30 blur-3xl animate-pulse"></div> */}

                {/* Your PNG Image */}
                <img 
                  src="/images/whole_mentor_multiplier.svg" 
                  alt="Multiplier Coin and Box" 
                  className="w-[450px] h-[450px] object-contain"
                />


                {/* Multiplier Text Over Coin */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="font-bold"
                    style={{
                      background: 'linear-gradient(166deg, #EDDA76 16.39%, #94E093 90.21%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: 'Inter',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      // fontWeight: 700,
                      // lineHeight: '21.779px',
                      // letterSpacing: '-0.76px'
                    }}
                  >
                    {multiplier}x
                  </span>
                </div>
              </div>
            </div>



            {/* Description Text */}
            <div className="relative z-10 text-center mb-6 max-w-sm -mt-28">
              <p className="text-base text-gray-800 leading-relaxed">
                Your sessions earn at <span className="font-bold">{multiplier}x</span> the base rate.
              </p>
              <p className="text-base text-gray-800">
                That's <span className="font-bold">₹{finalPrice}</span> per session — nice work!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={onGoHome}
                className="border-[1px] border-[#1a97a4] text-[#1a97a4] hover:bg-[#1a97a4]/10 rounded-[30px] px-6 py-3 font-medium text-[16px] leading-[24px]"
                style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100", width: '450px' }}
              >
                Go to Home page
              </Button>
              <Button
                size="lg"
                onClick={onCalculateAgain}
                className="bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white rounded-[30px] px-6 py-3 font-medium text-[16px] leading-[24px] shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)]"
                style={{ fontFamily: 'Roboto, sans-serif', fontVariationSettings: "'wdth' 100", width: '450px' }}
              >
                Calculate Again
              </Button>
            </div>
          </div>

          {/* Optional: Score Details Toggle */}
          <details className="mt-12">
            <summary className="cursor-pointer text-center text-teal-600 font-semibold hover:text-teal-700">
              View Score Breakdown
            </summary>
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Work Experience</span>
                  <span className="font-semibold">
                    {scores.experience}/10 (40% weight)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Company Tier</span>
                  <span className="font-semibold">
                    {scores.company}/10 (25% weight)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">College Tier</span>
                  <span className="font-semibold">
                    {scores.college}/10 (5% weight)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Mentor Rating</span>
                  <span className="font-semibold">
                    {scores.rating}/10 (15% weight)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Current Role</span>
                  <span className="font-semibold">
                    {scores.role}/10 (5% weight)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Niche Skills</span>
                  <span className="font-semibold">
                    {scores.niche}/10 (5% weight)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Interview Experience</span>
                  <span className="font-semibold">
                    {scores.interview}/10 (5% weight)
                  </span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">
                    Total Weighted Score
                  </span>
                  <span className="font-bold text-lg">
                    {scores.totalWeightedScore}/10
                  </span>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;