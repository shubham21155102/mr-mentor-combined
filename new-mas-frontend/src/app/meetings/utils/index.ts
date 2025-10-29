export const formatMeetingData = (meeting: MeetingData) => {
    const startDate = new Date(meeting.startDateTime);
    const endDate = new Date(meeting.endDateTime);
    
    return {
      id: meeting.id,
      mentor: meeting.mentor.fullName,
      email: meeting.mentor.email,
      date: startDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: startDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      description: `Meeting with ${meeting.mentor.fullName}`,
      status: meeting.status.toUpperCase(),
      statusColor: getStatusColor(meeting.status),
      rawData: meeting
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-[#ffeba7] text-[#816400]';
      case 'completed':
        return 'bg-[#d4edda] text-[#155724]';
      case 'cancelled':
        return 'bg-[rgba(244,4,4,0.2)] text-[#f40404]';
      case 'pending':
        return 'bg-[rgba(244,4,4,0.2)] text-[#f40404]';
      case 'cancellation_requested':
        return 'bg-[#fff3cd] text-[#856404]';
      default:
        return 'bg-[#ffeba7] text-[#816400]';
    }
  };