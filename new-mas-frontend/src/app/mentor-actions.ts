// "use server";
import { api } from '@/lib/api';

export async function fetchAllMentors() {
    try {
        const response = await api.get('/api/mentors');
        return response.data.data.mentors;
    } catch (error) {
        console.error('Error fetching all mentors:', error);
        throw error;
    }
}

export async function fetchMentorsPaginated(
    page?: number,
    limit?: number,
    search?: string,
    companies?: string[],
    expertise?: string[],
    sortBy?: string
) {
    try {
        const params: any = {};
        if (page) params.page = page;
        if (limit) params.limit = limit;
        if (search) params.search = search;
        if (companies && companies.length > 0) params.companies = companies.join(',');
        if (expertise && expertise.length > 0) params.expertise = expertise.join(',');
        if (sortBy) params.sortBy = sortBy;

        const response = await api.get('/api/mentors/paginated', { params });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching mentors paginated:', error);
        throw error;
    }
}

export async function fetchMentors(category: string, subCategory: string) {
    try {
        const response = await api.get('/api/mentors/category', {
            params: { category, subCategory }
        });
        const mentors = response.data.data.mentors;
        const transformed = mentors.map((mentor: any) => {
            const profile = mentor.mentorProfile[0];
            return {
                id: mentor.id,
                name: mentor.fullName,
                company: profile.company,
                role: profile.role,
                institute: profile.institute,
                slotsLeft: profile.slotsLeft,
                image: profile.image,
                description: profile.description,
                category: profile.category,
                subCategory: profile.subCategory
            };
        });
        return transformed;
    } catch (error) {
        console.error('Error fetching mentors:', error);
        throw error;
    }
}


export const mentorSlotsAPI = {
    // Get mentor's booked slots
    getMentorSlots: async (mentorId: string) => {
      const response = await api.get(`/api/mentors/${mentorId}/slots`);
      return response.data;
    },
  
    // Create a new slot/meeting
    createSlot: async (slotData: {
      startDateTime: string;
      endDateTime: string;
      mentorId: string;
      studentId: string;
    }) => {
      const response = await api.post('/api/mentors/slots', slotData);
      return response.data;
    },

    // Mark slots as available
    markSlotsAvailable: async (slots: Array<{ startDateTime: string; endDateTime: string }>, mentorId: string) => {
      const response = await api.post('/api/mentors/slots/available', { slots, mentorId });
      return response.data;
    },

    // Get mentor's available slots
    getMentorAvailableSlots: async (mentorId: string) => {
      const response = await api.get(`/api/mentors/${mentorId}/slots/available`);
      return response.data;
    },

    // Remove slots from availability
    removeSlotsAvailability: async (slotIds: string[], mentorId: string) => {
      const response = await api.delete('/api/mentors/slots/available', {
        data: { slotIds, mentorId }
      });
      return response.data;
    }
  };
