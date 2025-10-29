import { api, createApiWithToken } from './api';

export interface Slot {
  id: string;
  startDateTime: string;
  endDateTime: string;
  mentorId: string;
  studentId?: string | null;
  isAvailable: boolean;
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed' | 'cancellation_requested';
}

export interface MeetingDetails {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: 'confirmed' | 'tentative' | 'cancelled' | 'completed' | 'cancellation_requested';
  mentor: {
    id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
    company?: string;
    role?: string;
    institute?: string;
    category?: string;
    subCategory?: string;
    description?: string;
  };
  student: {
    id: string;
    fullName: string;
    email: string;
    profilePhoto?: string;
  };
  feedback?: {
    rating: number;
    experience: string;
    comments: string;
    isMentorJoinedOnTime: boolean;
  } | null;
}

export class MentorService {
  /**
   * Get meeting details by meeting ID
   */
  static async getMeetingDetails(meetingId: string, token?: string): Promise<MeetingDetails> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get(`/api/mentors/meetings/${meetingId}/details`);
    return response.data.data;
  }

  /**
   * Mark time slots as available for booking
   */
  static async markSlotsAvailable(
    slots: Array<{ startDateTime: string; endDateTime: string }>,
    mentorId: string,
    token?: string
  ): Promise<Slot[]> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.post('/api/mentors/slots/available', { slots, mentorId });
    return response.data.data;
  }

  /**
   * Get mentor's available slots
   */
  static async getMentorAvailableSlots(mentorId: string, token?: string): Promise<Slot[]> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get(`/api/mentors/${mentorId}/slots/available`);
    return response.data.data;
  }

  /**
   * Get all mentor's slots (both available and booked)
   */
  static async getMentorSlots(mentorId: string, token?: string): Promise<Slot[]> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get(`/api/mentors/${mentorId}/slots`);
    // The API returns data directly in response.data, but it might be wrapped
    // Try to handle both cases: response.data.data or response.data
    const slots = response.data?.data || response.data;
    return Array.isArray(slots) ? slots : [];
  }

  /**
   * Remove slots from availability
   */
  static async removeSlotsAvailability(
    slotIds: string[],
    mentorId: string,
    token?: string
  ): Promise<Slot[]> {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.delete('/api/mentors/slots/available', {
      data: { slotIds, mentorId }
    });
    return response.data.data;
  }
}
