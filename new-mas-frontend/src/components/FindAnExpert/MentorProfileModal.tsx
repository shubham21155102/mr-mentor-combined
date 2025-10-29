"use client"
import React from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'

interface MentorProfileModalProps {
  isOpen: boolean
  onClose: () => void
  mentor: {
    name?: string
    avatar?: string
    bio?: string
    company?: string
    role?: string
    education?: string
    meets?: number
    rating?: number
  }
}

const MentorProfileModal: React.FC<MentorProfileModalProps> = ({
  isOpen,
  onClose,
  mentor
}) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end">
      {/* Backdrop - semi-transparent, not black */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - positioned on the right */}
      <div className="relative bg-white rounded-l-2xl shadow-2xl w-[90%] sm:w-[483px] h-[100vh] sm:h-[1080px] max-h-[100vh] overflow-hidden mr-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Mentor Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Image Section */}
          <div className="relative">
            <div className="w-full h-[220px] sm:h-[250px] rounded-full overflow-hidden relative mx-auto max-w-[220px] border-4 border-white shadow-lg">
              <Image
                src={mentor.avatar || '/mentor_image.svg'}
                alt={mentor.name || 'Mentor'}
                fill
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Bio</h3>
            <h4 className="text-xl font-semibold text-black mb-2">{mentor.name}</h4>
            <p className="text-xs text-black leading-relaxed">
              {mentor.bio}
            </p>
          </div>

          {/* Company Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Company</h3>
            <div className="flex items-center">
              <span className="bg-black/25 text-black px-2 py-1 rounded-md text-sm font-medium">
                {mentor.company}
              </span>
            </div>
          </div>

          {/* Role Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Role</h3>
            <p className="text-base font-semibold text-black">
              {mentor.role}
            </p>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Education</h3>
            <p className="text-base font-semibold text-black">
              {mentor.education}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorProfileModal
