export interface ScheduleMeetingModalProps {
    isOpen: boolean
    onClose: () => void
    mentor: { 
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
  }