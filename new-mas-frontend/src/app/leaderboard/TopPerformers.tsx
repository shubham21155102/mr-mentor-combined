import ImageWithFallback from '@/components/ImageWithFallback'
import { ChevronsDown, Star, Video } from 'lucide-react'
import React from 'react'
type Mentor = {
  rank: number
  mentorId?: string
  name: string
  profilePhoto?: string
  avatar?: string
  meets: number
  rating: number
  isCurrentUser?: boolean
}

type Props = {
    podium: Mentor[]
    handleMentorClick: (mentor: Mentor) => void

}
const TopPerformers = (props: Props) => {
    const { podium, handleMentorClick } = props;
  return (
  <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-[248px] py-4 sm:py-8">
    {/* allow sticky children to escape this container */}
    <div className='bg-[#0B1B2A] rounded-xl sm:rounded-2xl overflow-visible'>
          <div className="relative flex justify-center items-end h-[320px] sm:h-[400px] md:h-[480px]">
          {/* Podium Cards */}
          <div className="flex items-end space-x-2 sm:space-x-4 px-2 sm:px-4">
            {/* 2nd Place */}
            {/* make each card sticky within the podium container */}
            <div className="flex flex-col items-center self-start">
              <button
                type="button"
                className={"w-[140px] sm:w-[180px] md:w-[228px] h-[240px] sm:h-[320px] md:h-[390px] rounded-xl sm:rounded-2xl shadow-lg flex flex-col items-center justify-end pb-4 sm:pb-6 md:pb-8 cursor-pointer hover:scale-105 transition-transform duration-200 sticky top-0 z-10"}
                style={{borderRadius: '0 0 20px 20px', border: '1px solid rgba(255, 255, 255, 0.00)', background: 'linear-gradient(180deg, rgba(185, 182, 192, 0.00) 0%, #B9B6C0 100%)'}}
                onClick={() => handleMentorClick(podium[0])}
              >
                <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[102px] md:h-[100px] rounded-full" style={{backgroundImage: 'url("/2nd_position.svg")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                <ImageWithFallback
                  src={podium[0].avatar}
                  alt={podium[0].name}
                  width={100}
                  height={100}
                  className="rounded-2xl mb-2 sm:mb-4 w-50"
                />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black mb-1 sm:mb-2">{podium[0].name}</h3>
                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{podium[0].meets}</span>
                  </div>
                  <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span>{podium[0].rating}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center self-start">
              
              <button
                type="button"
                className={"w-[160px] sm:w-[210px] md:w-[266px] h-[300px] sm:h-[400px] md:h-[480px] rounded-xl sm:rounded-2xl shadow-xl flex flex-col items-center justify-end pb-4 sm:pb-6 md:pb-8 cursor-pointer hover:scale-105 transition-transform duration-200 sticky top-0 z-20"} 
                style={{borderRadius: '0 0 20px 20px', border: '2px solid rgba(255, 255, 255, 0.00)', background: 'linear-gradient(180deg, rgba(212, 154, 78, 0.00) 0%, #D49A4E 77.4%, #FFEC8C 100%)'}}
                onClick={() => handleMentorClick(podium[1])}
              >
                <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[135px] md:h-[132px] rounded-full" style={{backgroundImage: 'url("/1st_position.svg")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                <ImageWithFallback
                  src={podium[1].avatar}
                  alt={podium[1].name}
                  width={120}
                  height={120}
                  className="rounded-2xl mb-2 sm:mb-4 w-50"
                />
                
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black mb-1 sm:mb-2">{podium[1].name}</h3>
                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{podium[1].meets}</span>
                  </div>
                  <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span>{podium[1].rating}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center self-start">
              
              <button
                type="button"
                className={"w-[140px] sm:w-[180px] md:w-[228px] h-[240px] sm:h-[320px] md:h-[390px] rounded-xl sm:rounded-2xl shadow-lg flex flex-col items-center justify-end pb-4 sm:pb-6 md:pb-8 cursor-pointer hover:scale-105 transition-transform duration-200 sticky top-0 z-10"} 
                style={{borderRadius: '0 0 20px 20px', border: '1px solid rgba(255, 255, 255, 0.00)', background: 'linear-gradient(180deg, rgba(202, 131, 100, 0.00) 0%, #CA8364 100%)'}}
                onClick={() => handleMentorClick(podium[2])}
              >
                <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[102px] md:h-[100px] rounded-full" style={{backgroundImage: 'url("/3rd_position.svg")', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                <ImageWithFallback
                  src={podium[2].avatar}
                  alt={podium[2].name}
                  width={100}
                  height={100}
                  className="rounded-2xl mb-2 sm:mb-4 w-50"
                />
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black mb-1 sm:mb-2">{podium[2].name}</h3>
                <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{podium[2].meets}</span>
                  </div>
                  <div className="w-px h-3 sm:h-4 bg-gray-300"></div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span>{podium[2].rating}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Rank Button */}
        <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
          <div className="flex items-center space-x-2 bg-[#1A97A4] text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-[20px] sm:rounded-[30px] border border-[#1A97A4] mb-4 sm:mb-6 md:mb-8">
            <span className="text-sm sm:font-medium">Your Rank: 2</span>
            <ChevronsDown className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
        </div>
        
      </div>
  )
}

export default TopPerformers