import Image from 'next/image'
import React from 'react'

type Props = {}

const RightPanel = (props: Props) => {
  return (
      <div className="w-full lg:flex-1 min-h-[300px] md:min-h-[400px] lg:min-auto rounded-3xl overflow-hidden relative shadow-[0px_0px_230px_0px_rgba(0,0,0,0.25)]"
          style={{ 
            backgroundImage: 'url(/login_bg.svg)',
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Background Gradient */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: "linear-gradient(to bottom right, #0F919F 0%, #123A53 50%) bottom right / 50% 50% no-repeat, linear-gradient(to bottom left, #0F919F 0%, #123A53 50%) bottom left / 50% 50% no-repeat, linear-gradient(to top left, #0F919F 0%, #123A53 50%) top left / 50% 50% no-repeat, linear-gradient(to top right, #0F919F 0%, #123A53 50%) top right / 50% 50% no-repeat",
              boxShadow: "0 0 230.5px 0 rgba(0, 0, 0, 0.25)"
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-2/5 sm:h-1/2 md:h-3/5 lg:h-3/5 bg-gradient-to-b from-transparent to-[#0c1b2a]" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
            <h3 className="text-[#eeeeee] text-base sm:text-lg md:text-xl lg:text-[24px] font-semibold leading-tight md:leading-[32px] mb-2 lg:mb-3">
              Unlock Your Career with 1:1 Mentorship
            </h3>

            <div className="text-[#d1d1d1] space-y-2 lg:space-y-3 max-w-full md:max-w-[480px]">
              <p className="text-xs sm:text-sm leading-4 sm:leading-5">
                Explore a curated list of industry experts ready to guide you — from resume reviews to mock interviews. Choose who fits your goal and schedule your session instantly
              </p>

              <p className="text-sm sm:text-base font-bold text-[#d1d1d1]">
                &ldquo;Real guidance. Real conversations. Real impact on your future.&rdquo;
              </p>

              <div className="text-xs sm:text-sm leading-4 sm:leading-5 space-y-1">
                <p>✅ Book personal sessions</p>
                <p>✅ Learn from real industry experiences</p>
                <p>✅ Prepare for interviews with confidence</p>
              </div>
            </div>

            {/* User Avatars */}
            <div className="flex items-center mt-3 md:mt-4 lg:mt-5 gap-[-4px]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-[#1a97a4] rounded-full border-2 border-[#0b1b2a] flex items-center justify-center -mr-1"
                >
                  <Image
                    src={i % 2 === 0 ? `/craiyon_232812_image 1.svg` : `/craiyon_233025_image 1.svg`}
                    alt={`User ${i}`}
                    width={14}
                    height={14}
                    className="rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
    
  )
}

export default RightPanel
