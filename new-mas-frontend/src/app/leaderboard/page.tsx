"use client"
import React, { useEffect, useState } from 'react'
import Footer from '@/components/Footer'
import MentorProfileModal from '@/components/FindAnExpert/MentorProfileModal'
import { ChevronRight, Star, Video, X} from 'lucide-react'
import Image from 'next/image'
import ConditionalNavBar from '@/components/ConditionalNavBar'
import TopPerformers from './TopPerformers'
import LeaderboardTable from './LeaderboardTable'
import { useRouter } from 'next/navigation'

// We'll fetch leaderboard from backend API and derive podium from the response
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL

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

const MentorsLeaderBoard = () => {
  const router = useRouter()
  const [selectedMentor, setSelectedMentor] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New state for leaderboard
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(10)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/api/mentors/leaderboard?page=${page}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`)
        const json = await res.json()
        const d = json?.data
        if (!d) throw new Error('Invalid response shape')
        setTotal(d.total ?? 0)
        setPerPage(d.perPage ?? 10)
        const mapped: Mentor[] = (d.data || []).map((m: any) => ({
          rank: m.rank,
          mentorId: m.mentorId,
          name: m.name,
          profilePhoto: m.profilePhoto,
          avatar: m.profilePhoto || m.avatar || '/mentor_image.svg',
          meets: m.meets ?? 0,
          rating: m.rating ?? 0
        }))
        setMentors(mapped)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    return () => controller.abort()
  }, [page])

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false)
          setSelectedMentor(null)
        } else {
          router.back()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, router])

  const handleMentorClick = async (mentor: any) => {
    // If mentor has mentorId, fetch full profile from backend
    if (mentor.mentorId) {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/api/mentors/${mentor.mentorId}/profile`)
        if (!res.ok) throw new Error('Failed to fetch mentor profile')
        const json = await res.json()
        const d = json?.data
        const mapped = {
          name: d?.fullName || mentor.name,
          avatar: d?.profilePhoto || mentor.avatar || '/mentor_image.svg',
          bio: d?.mentorProfile?.[0]?.description || '',
          company: d?.mentorProfile?.[0]?.company || '',
          role: d?.mentorProfile?.[0]?.role || '',
          education: d?.mentorProfile?.[0]?.institute || '',
          meets: mentor.meets || 0,
          rating: mentor.rating || 0
        }
        setSelectedMentor(mapped)
        setIsModalOpen(true)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    } else {
      setSelectedMentor(mentor)
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMentor(null)
  }

  const podium = [
    mentors.find(m => m.rank === 2) || mentors[1],
    mentors.find(m => m.rank === 1) || mentors[0],
    mentors.find(m => m.rank === 3) || mentors[2]
  ].map(m => m || { name: '—', meets: 0, rating: 0, avatar: '/mentor_image.svg', rank: 0 })

  return (
    <div className="min-h-screen">
      <ConditionalNavBar/>
      
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-[248px] py-4 sm:py-6">
        <nav className="flex items-center justify-between text-sm" aria-label="Breadcrumb">
          <div className="flex items-center space-x-2">
            <span className="text-neutral-500">Home</span>
            <ChevronRight className="h-4 w-4 text-neutral-500" />
            <span className="text-[#212121] font-medium">Leaderboard</span>
          </div>
          {/* <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <X className="h-4 w-4" />
            Close
          </button> */}
        </nav>
      </div>

      {/* Podium Section */}
      <TopPerformers podium={podium} handleMentorClick={handleMentorClick} />

      {/* Leaderboard Table */}
      <LeaderboardTable
      mentors={mentors}
      total={total}
      perPage={perPage}
      page={page}
      setPage={setPage}
      handleMentorClick={handleMentorClick}
      />

      <Footer />

      {/* Mentor Profile Modal */}
      {selectedMentor && (
        <MentorProfileModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mentor={selectedMentor}
        />
      )}
    </div>
  )
}

export default MentorsLeaderBoard