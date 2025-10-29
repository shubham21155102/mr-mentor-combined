"use client";
import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Filter, ArrowUpDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import MeetingDetailsModal from '@/components/FindAnExpert/MeetingDetailsModal';
import FeedbackModal from '@/components/FindAnExpert/FeedbackModal';
import ConditionalNavBar from '@/components/ConditionalNavBar';
import { useUser } from '@/contexts/UserContext';
import { useSession } from 'next-auth/react';
import { fetchMeetings, requestMeetingCancellation, submitFeedback, fetchMeetingDetails } from './actions';
import { formatMeetingData } from './utils';
import FilterSection from './FilterSection';
import PaginationComponent from './PaginationComponent';

// Progressive Loader Component
const ProgressiveLoader = ({ message }: { message: string }) => {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 200);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  const displayProgress = Math.min(progress, 100);

  return (
    <div className="bg-white p-8">
      <div className="max-w-md mx-auto">
        {/* Animated Meeting Cards Skeleton */}
        <div className="space-y-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-32"></div>
                <div className="h-3 bg-gray-100 rounded w-28"></div>
                <div className="h-3 bg-gray-100 rounded w-40"></div>
              </div>
              <div className="mt-4 h-8 bg-[#e8f7f9] rounded-lg w-full"></div>
            </div>
          ))}
        </div>

        {/* Loading Message */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1a97a4] border-t-transparent"></div>
            <span className="text-lg text-[#1a97a4] font-medium">
              {message}{dots}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1a97a4] to-[#2db3cc] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayProgress}%` }}
          >
            <div className="h-full bg-white/20 animate-pulse"></div>
          </div>
        </div>

        <div className="text-center mt-2">
          <span className="text-sm text-gray-500">{Math.round(displayProgress)}%</span>
        </div>

        {/* Loading Steps */}
        <div className="mt-6 space-y-2">
          <div className={`flex items-center gap-2 text-sm ${displayProgress > 25 ? 'text-[#1a97a4]' : 'text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full ${displayProgress > 25 ? 'bg-[#1a97a4]' : 'bg-gray-200'}`}></div>
            <span>Connecting to server</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${displayProgress > 50 ? 'text-[#1a97a4]' : 'text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full ${displayProgress > 50 ? 'bg-[#1a97a4]' : 'bg-gray-200'}`}></div>
            <span>Fetching your meetings</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${displayProgress > 75 ? 'text-[#1a97a4]' : 'text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full ${displayProgress > 75 ? 'bg-[#1a97a4]' : 'bg-gray-200'}`}></div>
            <span>Preparing your data</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${displayProgress > 95 ? 'text-[#1a97a4]' : 'text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full ${displayProgress > 95 ? 'bg-[#1a97a4]' : 'bg-gray-200'}`}></div>
            <span>Almost ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Interview = () => {
  const { user, isLoading: userLoading, isLoggedIn } = useUser();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<any>(null);
  // store the id of the meeting that's currently loading details (or null)
  const [detailsLoading, setDetailsLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const tabs = ['ALL', 'COMPLETED', 'SCHEDULE', 'UNDER-REVIEW', 'CANCELLED'];

  // Fetch meetings data from API
  const handleFetchMeetings = async () => {
    if (!user?.id) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = session?.backendToken;
      const result = await fetchMeetings(user.id, token);
      
      if (result.success && result.data) {
        setMeetings(result.data);
      } else {
        setError(result.error || 'Failed to fetch meetings data');
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch meetings when user is loaded and logged in
  useEffect(() => {
    if (!userLoading && isLoggedIn && user?.id) {
      handleFetchMeetings();
    } else if (!userLoading && !isLoggedIn) {
      setLoading(false);
      setError('Please log in to view your meetings');
    }
  }, [userLoading, isLoggedIn, user?.id]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Filter meetings based on active tab and search query
  const getFilteredMeetings = () => {
    let filtered = meetings.map(formatMeetingData);

    // Filter by tab
    if (activeTab !== 'ALL') {
      filtered = filtered.filter(meeting => {
        switch (activeTab) {
          case 'COMPLETED':
            return meeting.status === 'COMPLETED';
          case 'SCHEDULE':
            return meeting.status === 'CONFIRMED';
          case 'UNDER-REVIEW':
            return meeting.status === 'PENDING' || meeting.status === 'CANCELLATION_REQUESTED';
          case 'CANCELLED':
            return meeting.status === 'CANCELLED';
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(meeting =>
        meeting.mentor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleViewDetails = async (interview: any) => {
  setSelectedMeeting(interview);
  // mark this meeting id as loading so only its button shows loading state
  setDetailsLoading(interview.id);
    
    try {
      // Fetch detailed meeting information
      const token = session?.backendToken;
      const result = await fetchMeetingDetails(interview.id, token);
      
      if (result.success && result.data) {
        setMeetingDetails(result.data);
        
        // Format the meeting data with details
        const formattedMeeting = {
          ...interview,
          rawData: result.data
        };
        setSelectedMeeting(formattedMeeting);
        
        // Open appropriate modal based on status
        if (interview.status === 'COMPLETED') {
          setIsFeedbackModalOpen(true);
        } else {
          setIsModalOpen(true);
        }
      } else {
        console.error('Failed to fetch meeting details:', result.error);
        // Still open modal with basic data
        if (interview.status === 'COMPLETED') {
          setIsFeedbackModalOpen(true);
        } else {
          setIsModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      // Still open modal with basic data
      if (interview.status === 'COMPLETED') {
        setIsFeedbackModalOpen(true);
      } else {
        setIsModalOpen(true);
      }
    } finally {
      setDetailsLoading(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMeeting(null);
    setMeetingDetails(null);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedMeeting(null);
    setMeetingDetails(null);
  };

  const handleSubmitFeedback = async (feedback: any) => {
    if (!user?.id || !selectedMeeting) {
      setFeedbackError('User not logged in or no meeting selected');
      return;
    }

    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      
      const token = session?.backendToken;
      const result = await submitFeedback(user.id, selectedMeeting.id, feedback, token);
      
      if (result.success) {
        setIsFeedbackModalOpen(false);
        setSelectedMeeting(null);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      } else {
        setFeedbackError(result.error || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackError('Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCancelMeeting = async () => {
    if (!selectedMeeting || !user?.id) {
      console.error('No meeting selected or user not logged in');
      return;
    }

    try {
      const token = session?.backendToken;
      const result = await requestMeetingCancellation(user.id, selectedMeeting.id, token);

      if (result.success) {
        // Close modal and show success notification
        setIsModalOpen(false);
        setSelectedMeeting(null);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);

        // Refresh meetings list to reflect the cancellation request
        await handleFetchMeetings();
      } else {
        // Show error notification
        setError(result.error || 'Failed to request cancellation');
        console.error('Error requesting cancellation:', result.error);
      }
    } catch (err) {
      console.error('Error requesting cancellation:', err);
      setError('Failed to request cancellation. Please try again.');
    }
  };

  const handleReviewNow = (id: string) => {
    console.log('Review now for:', id);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="bg-[#eefdff] min-h-screen relative">
     <ConditionalNavBar/>

      {/* Breadcrumb */}
      <div className="mx-auto w-[92%] mt-4">
        <div className="flex items-center gap-2 text-neutral-500">
          <a href="/" className="text-base hover:text-[#1a97a4] transition-colors">Home</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-base text-[#212121]">Interview</span>
        </div>
        <div className="border-b border-white/30 mt-2"></div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-[92%] mt-8 rounded-3xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-white border-b-2 border-[#ebebeb]">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-4 text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-[#1a97a4] border-b-3 border-[#1a97a4]'
                    : 'text-black hover:text-[#1a97a4]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
       {/* <FilterSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}

        {/* Table Header - Hidden on mobile */}
        <div className="bg-white p-4 hidden md:block">
          <div className="grid grid-cols-6 gap-4 text-sm font-bold text-black">
            <div className="text-center">Meet ID</div>
            <div className="text-center">Mentor</div>
            <div className="flex items-center justify-center gap-2">
              <span>Meets Date</span>
              <ArrowUpDown className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <span>Description</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Details</span>
            </div>
          </div>
        </div>

        {/* User Loading State */}
        {userLoading && <ProgressiveLoader message="Loading user data" />}

        {/* Meetings Loading State */}
        {!userLoading && loading && <ProgressiveLoader message="Loading your meetings" />}

        {/* Error State */}
        {!userLoading && error && (
          <div className="bg-white p-8 text-center">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            {isLoggedIn && user?.id && (
              <Button 
                onClick={handleFetchMeetings}
                className="bg-[#1a97a4] text-white hover:bg-[#158a8a]"
              >
                Retry
              </Button>
            )}
          </div>
        )}

        {/* No Meetings Found */}
        {!userLoading && !loading && !error && getFilteredMeetings().length === 0 && (
          <div className="bg-white p-8 text-center">
            <div className="text-gray-500 text-lg">No meetings found</div>
          </div>
        )}

        {/* Table Rows */}
        {!userLoading && !loading && !error && getFilteredMeetings().map((interview, index) => (
          <div
            key={index}
            className={`p-4 ${index % 2 === 0 ? 'bg-[#edf8f9]' : 'bg-white'}`}
          >
            {/* Mobile Card View */}
            <div className="md:hidden">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Meet ID</div>
                    <div className="text-[#0059c6] font-medium">{interview.id}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${interview.statusColor}`}>
                    {interview.status}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-500">Mentor</div>
                  <div className="font-medium">{interview.mentor}</div>
                  <div className="text-sm text-gray-500">{interview.email}</div>
                </div>
                
                <div className="mb-3">
                  <div className="text-xs text-gray-500">Date & Time</div>
                  <div className="font-medium">{interview.date}</div>
                  <div className="text-sm text-gray-500">{interview.time}</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-xs text-gray-500">Description</div>
                  <div className="text-sm">{interview.description}</div>
                </div>
                
                <Button
                  onClick={() => handleViewDetails(interview)}
                  // disable only the button for the meeting that's loading
                  disabled={detailsLoading === interview.id}
                  className="w-full h-10 border border-[#1a97a4] text-[#1a97a4] bg-transparent hover:bg-[#1a97a4] hover:text-white rounded-[30px] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {detailsLoading === interview.id ? 'Loading...' : 'View details'}
                </Button>
              </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
              <div className="text-center">
                <span className="text-[#0059c6] text-base font-medium">{interview.id}</span>
              </div>
              
              <div className="text-center">
                <div className="text-black text-sm font-medium">{interview.mentor}</div>
                <div className="text-black/50 text-sm font-medium">{interview.email}</div>
              </div>
              
              <div className="text-center">
                <div className="text-black text-sm font-medium">{interview.date}</div>
                <div className="text-black/50 text-sm font-medium">{interview.time}</div>
              </div>
              
              <div className="text-sm font-medium text-black">
                {interview.description}
              </div>
              
              <div>
                <span className={`px-2 py-1.5 rounded-md text-sm font-medium ${interview.statusColor}`}>
                  {interview.status}
                </span>
              </div>
              
              <div>
                <Button
                  onClick={() => handleViewDetails(interview)}
                  // disable only the button for the meeting that's loading
                  disabled={detailsLoading === interview.id}
                  className="w-[150px] h-10 border border-[#1a97a4] text-[#1a97a4] bg-transparent hover:bg-[#1a97a4] hover:text-white rounded-[30px] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {detailsLoading === interview.id ? 'Loading...' : 'View details'}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <PaginationComponent />
      </div>

      {/* Filter Button - Adjusted for mobile */}
      {/* <div className="fixed top-20 right-4 md:right-6 bg-white rounded-xl shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)] p-3 md:p-4 flex items-center gap-4 md:gap-9">
        <span className="text-[#919191] text-base md:text-xl tracking-[0.5px] hidden md:block">All Filter</span>
        <Filter className="w-5 h-5 md:w-6 md:h-6" />
      </div> */}

      {/* Success Notification - Responsive positioning */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-[#329a55] text-[#f5eff7] px-4 py-3 rounded shadow-lg flex items-center gap-4">
          <span className="text-sm">Action completed successfully</span>
          <ThumbsUp className="w-6 h-6" />
        </div>
      )}

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <MeetingDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onCancel={handleCancelMeeting}
          meetingData={selectedMeeting}
        />
      )}

      {/* Feedback Modal for Completed Meetings */}
      {selectedMeeting && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={handleCloseFeedbackModal}
          onSubmit={handleSubmitFeedback}
          meetingData={{
            ...selectedMeeting,
            feedback: meetingDetails?.feedback
          }}
          loading={feedbackLoading}
          error={feedbackError}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Interview;