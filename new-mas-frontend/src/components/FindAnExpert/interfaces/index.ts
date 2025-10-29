export interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: FeedbackData) => void;
    meetingData: {
      id: string;
      mentor: string;
      email: string;
      date: string;
      time: string;
      description: string;
      mentee?: string;
      feedback?: {
        id: string;
        slotId: string;
        isMentorJoinedOnTime: boolean;
        rating: number;
        experience: string;
        comments: string;
      };
    };
    loading?: boolean;
    error?: string | null;
  }

  export interface FeedbackData {
    slotId: string;
    isMentorJoinedOnTime: boolean;
    rating: string;
    experience: string;
    comments: string;
  }
  
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