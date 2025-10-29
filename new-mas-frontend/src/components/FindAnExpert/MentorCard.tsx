import React, { useState } from 'react'
import { Star, StarHalf, ArrowUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import ImageWithFallback from '@/components/ImageWithFallback'
import ScheduleMeetingModal from './ScheduleMeetingModal'

interface Mentor {
  id: string
  fullName: string
  email: string
  phone: string | null
  profession: string | null
  domain: string | null
  role: string
  profilePhoto: string
  createdAt: string
  updatedAt: string
  mentorProfile: {
    id: string
    company: string
    role: string
    institute: string
    slotsLeft: number
    description: string
    category: string
    subCategory: string
    image: string
    createdAt: string
    updatedAt: string
  }[]
}

interface MentorCardProps {
  mentor: Mentor
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const { isLoggedIn } = useUser()

  const handleScheduleMeeting = () => {
    if (!isLoggedIn) {
      // Redirect to login page if user is not logged in
      router.push('/login')
      return
    }
    // Open modal if user is logged in
    setIsModalOpen(true)
  }

  const profile = mentor.mentorProfile[0] // Assuming first profile

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="h-5 w-5 text-yellow-400 fill-current" />
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      )
    }

    return stars
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-56 bg-gray-200 rounded-2xl m-3 overflow-hidden">
        {profile?.image ? (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={profile.image}
              alt={mentor?.fullName}
              width={1000}
              height={1000}
              className="object-cover"
            />
          </div>
        ) : null}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Company Badge */}
        <div className="absolute top-3 left-3 bg-black/25 backdrop-blur-sm rounded-lg px-2 py-1.5">
          <span className="text-white text-sm font-medium">{profile?.company}</span>
        </div>

        {/* Rating Stars - Default to 5 since not in API */}
        <div className="absolute top-3 right-3 flex space-x-1">
          {renderStars(5)}
        </div>

        {/* Name and Description */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-semibold mb-1">{mentor?.fullName}</h3>
          <p className="text-white text-xs leading-relaxed opacity-90">
            {profile?.description}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-2">
        <h4 className="text-lg font-semibold text-gray-900">{profile?.role}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{profile?.institute}</p>
      </div>

      {/* Action Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-green-600 font-medium">
            <span className="text-gray-600">Slots left:</span> {profile?.slotsLeft}
          </div>
          <button
            onClick={handleScheduleMeeting}
            className="bg-[#1a97a4] text-white px-5 py-2 rounded-full flex items-center space-x-2 hover:bg-[#168a96] transition-colors"
          >
            <span className="text-sm font-medium">Schedule meet</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mentor={mentor}
      />
    </div>
  )
}

export default MentorCard
