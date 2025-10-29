interface MeetingData {
    id: string; // This is the slotId
    startDateTime: string;
    endDateTime: string;
    mentorId: string;
    studentId: string;
    status: string;
    mentor: {
      id: string;
      fullName: string;
      email: string;
      password: string | null;
      phone: string | null;
      profession: string | null;
      domain: string | null;
      role: string;
      profilePhoto: string;
      googleId: string | null;
      isVerified: boolean;
      isProfileComplete: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }