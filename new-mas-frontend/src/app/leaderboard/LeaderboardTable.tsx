import ImageWithFallback from '@/components/ImageWithFallback';
import { Star, Video } from 'lucide-react';
import React from 'react'

type Props = {
    mentors: {
        rank: number;
        mentorId?: string;
        name: string;
        profilePhoto?: string;
        avatar?: string;
        meets: number;
        rating: number;
        isCurrentUser?: boolean;
    }[];
    total: number;
    perPage: number;
    page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
    handleMentorClick: (mentor: {
        rank: number;
        mentorId?: string;
        name: string;
        profilePhoto?: string;
        avatar?: string;
        meets: number;
        rating: number;
        isCurrentUser?: boolean;
    }) => void;
}

const LeaderboardTable = (props: Props) => {
    const { mentors, total, perPage, page, setPage, handleMentorClick } = props;
  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-[248px] py-4 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-[0px_0px_24px_0px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Table Header */}
          <div className="bg-white border-b-2 border-[#ebebeb] px-2 sm:px-4 py-3 sm:py-4">
            <h2 className="text-[12px] sm:text-[14px] font-bold text-black uppercase tracking-wide">LEADERBOARD</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] table-fixed">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-[12px] sm:text-[14px] font-bold text-black w-16"></th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-[12px] sm:text-[14px] font-bold text-black">Rank</th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-[12px] sm:text-[14px] font-bold text-black">Mentors</th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-[12px] sm:text-[14px] font-bold text-black">
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                      <span>Meets</span>
                      <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-[12px] sm:text-[14px] font-bold text-black">
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                      <span>Rating</span>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor, index) => (
                  <tr 
                    key={mentor.rank} 
                    className={`${
                      (() => {
                        if (mentor.isCurrentUser) {
                          return 'bg-[#1a97a4] text-white';
                        }
                        return index % 2 === 0 ? 'bg-white' : 'bg-[#edf8f9]';
                      })()
                    } border-b border-gray-200 cursor-pointer hover:bg-opacity-80 transition-colors duration-200`}
                    onClick={() => handleMentorClick(mentor)}
                  >
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      {mentor.isCurrentUser && (
                        <span className="text-[14px] sm:text-[16px] font-bold text-center">You</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <span className={`text-[16px] sm:text-[20px] font-bold ${mentor.isCurrentUser ? 'text-white' : 'text-black'}`}>
                        {mentor.rank}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <div className="flex items-center space-x-2">
                        <ImageWithFallback 
                        src={mentor.avatar || '/mentor_image.svg'} 
                          alt={mentor.name} 
                          width={28} 
                          height={28} 
                          className="rounded-lg"
                          />
                         
                        <span className={`text-[12px] sm:text-[14px] ${mentor.isCurrentUser ? 'text-white font-bold' : 'text-black font-medium'}`}>
                          {mentor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <span className={`text-[12px] sm:text-[14px] ${mentor.isCurrentUser ? 'text-white font-bold' : 'text-black font-medium'}`}>
                        {mentor.meets}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 sm:py-4">
                      <span className={`text-[12px] sm:text-[14px] ${mentor.isCurrentUser ? 'text-white font-bold' : 'text-black font-medium'}`}>
                        {mentor.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white border-t border-[#ebebeb] px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                className="text-[10px] sm:text-[12px] text-[#1a97a4] font-medium"
                disabled={page <= 1}
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, Math.ceil((total || 0) / perPage || 1)) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${page === p ? 'bg-[#1a97a4] text-white' : 'bg-[#e0e0e0] text-black'}`}
                    >
                      <span className="text-[10px] sm:text-[12px] font-medium">{p}</span>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage(p => p + 1)}
                className="text-[10px] sm:text-[12px] text-[#1a97a4] font-medium"
                disabled={page >= Math.ceil((total || 0) / perPage || 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default LeaderboardTable