"use client";
import { api, createApiWithToken } from '@/lib/api';

export async function fetchMeetings(userId: string, token?: string): Promise<{
  success: boolean;
  data?: MeetingData[];
  error?: string;
}> {
  try {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get(`/api/mentors/users/${userId}/meetings`);
    
    if (response.data.status === 'OK') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch meetings data'
      };
    }
  } catch (err) {
    console.error('Error fetching meetings:', err);
    return {
      success: false,
      error: 'Failed to fetch meetings. Please try again.'
    };
  }
}

export async function requestMeetingCancellation(userId: string, meetingId: string, token?: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}> {
  try {
    console.log('Requesting cancellation:', { userId, meetingId });
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.post(`/api/mentors/meetings/${meetingId}/request-cancellation`, {
      studentId: userId
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to request cancellation'
      };
    }
  } catch (err: any) {
    console.error('Error requesting cancellation:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to request cancellation. Please try again.'
    };
  }
}

export async function fetchMeetingDetails(meetingId: string, token?: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.get(`/api/mentors/meetings/${meetingId}/details`);
    
    if (response.data.status === 'OK') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to fetch meeting details'
      };
    }
  } catch (err: any) {
    console.error('Error fetching meeting details:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to fetch meeting details. Please try again.'
    };
  }
}

export async function submitFeedback(
  userId: string, 
  meetingId: string, 
  feedbackData: {
    slotId: string;
    isMentorJoinedOnTime: boolean;
    rating: string;
    experience: string;
    comments: string;
  },
  token?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const apiInstance = token ? createApiWithToken(token) : api;
    const response = await apiInstance.post(`/api/mentors/users/${userId}/meetings/${meetingId}/feedback`, feedbackData);
    
    if (response.data.status === 'OK') {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to submit feedback'
      };
    }
  } catch (err: any) {
    console.error('Error submitting feedback:', err);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to submit feedback. Please try again.'
    };
  }
}
