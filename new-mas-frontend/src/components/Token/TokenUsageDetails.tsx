"use client"
import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, CreditCard, TrendingDown, TrendingUp } from 'lucide-react'
import { MentorService, MeetingDetails } from '../../lib/mentorService'
import { useAuth } from '../../hooks/useAuth'

type TokenUsage = {
  id: string;
  tokensUsed: number;
  usageType: 'meeting_booking' | 'penalty' | 'refund' | 'bonus';
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string;
  createdAt: string;
  slotId?: string;
  slot?: {
    id: string;
    title?: string;
  };
}

type Props = {
  selectedToken: TokenUsage;
  setSelectedToken: (token: null) => void;
}

const TokenUsageDetails = (props: Props) => {
  const { selectedToken, setSelectedToken } = props;
  const [meetingDetails, setMeetingDetails] = useState<MeetingDetails | null>(null);
  const [loadingMeeting, setLoadingMeeting] = useState(false);
  const { backendToken } = useAuth();

  useEffect(() => {
    // Fetch meeting details if this is a meeting-related transaction
    if (selectedToken.slotId && backendToken) {
      fetchMeetingDetails(selectedToken.slotId);
    }
  }, [selectedToken.slotId, backendToken]);

  const fetchMeetingDetails = async (slotId: string) => {
    setLoadingMeeting(true);
    try {
      const details = await MentorService.getMeetingDetails(slotId, backendToken);
      setMeetingDetails(details);
    } catch (error) {
      console.error('Failed to fetch meeting details:', error);
    } finally {
      setLoadingMeeting(false);
    }
  };

  const getUsageTypeColor = (type: string) => {
    switch (type) {
      case 'meeting_booking':
        return 'bg-blue-100 text-blue-800';
      case 'penalty':
        return 'bg-red-100 text-red-800';
      case 'refund':
        return 'bg-green-100 text-green-800';
      case 'bonus':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUsageType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isCredit = selectedToken.usageType === 'refund' || selectedToken.usageType === 'bonus';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 pt-25" style={{ zIndex: 60 }}>
      <div className="backdrop-blur-[115.25px] backdrop-filter bg-gradient-to-r from-[#ffffff] to-[#ffffff] overflow-hidden relative rounded-[24px] w-[90%] h-[80vh] z-[70]" style={{ zIndex: 70 }}>
        {/* Close Button */}
        <button
          className="absolute bg-neutral-200 box-border content-stretch flex gap-[10px] items-center p-[4px] right-[24px] rounded-[8px] top-[24px] cursor-pointer hover:bg-neutral-300 transition-colors z-10"
          onClick={() => setSelectedToken(null)}
          aria-label="Close transaction details"
        >
          <X className='w-6 h-6' />
        </button>

        {/* Scrollable Content Container */}
        <div className="h-full overflow-y-auto">
          {/* Title */}
          <div className="flex flex-col font-['Roboto:SemiBold',_sans-serif] font-semibold justify-center leading-[0] text-[36px] text-black text-nowrap mt-6 mb-8 tracking-[0.5px] text-center">
            <p className="leading-[44px] whitespace-pre">Transaction Details</p>
          </div>

          <div className="px-8 pb-8 space-y-6">{/* Content stays the same */}
          {/* Transaction Summary Card */}
          <div className="bg-gradient-to-br from-[#1a97a4] to-[#158a96] rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {isCredit ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <span className="text-2xl font-bold">
                  {isCredit ? '+' : '-'}{selectedToken.tokensUsed} Tokens
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUsageTypeColor(selectedToken.usageType)} bg-opacity-90`}>
                {formatUsageType(selectedToken.usageType)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="opacity-80">Balance Before</p>
                <p className="text-lg font-semibold">{selectedToken.balanceBefore} tokens</p>
              </div>
              <div>
                <p className="opacity-80">Balance After</p>
                <p className="text-lg font-semibold">{selectedToken.balanceAfter} tokens</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gray-200"></div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Transaction Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex">
                <div className="w-[160px] text-sm font-medium text-gray-600">Transaction ID:</div>
                <div className="text-sm text-gray-900 font-mono break-all">{selectedToken.id}</div>
              </div>

              <div className="flex">
                <div className="w-[160px] text-sm font-medium text-gray-600">Date & Time:</div>
                <div className="text-sm text-gray-900">
                  {formatDateTime(selectedToken.createdAt).date} at {formatDateTime(selectedToken.createdAt).time}
                </div>
              </div>

              {selectedToken.description && (
                <div className="flex">
                  <div className="w-[160px] text-sm font-medium text-gray-600">Description:</div>
                  <div className="text-sm text-gray-900">{selectedToken.description}</div>
                </div>
              )}

              {selectedToken.referenceId && (
                <div className="flex">
                  <div className="w-[160px] text-sm font-medium text-gray-600">Reference ID:</div>
                  <div className="text-sm text-gray-900 font-mono">{selectedToken.referenceId}</div>
                </div>
              )}
            </div>
          </div>

          {/* Meeting Details Section - Only show if there's a meeting */}
          {selectedToken.slotId && (
            <>
              {/* Divider */}
              <div className="w-full h-px bg-gray-200"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Meeting Details
                </h3>

                {loadingMeeting ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    Loading meeting details...
                  </div>
                ) : meetingDetails ? (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    {/* Meeting Info */}
                    <div className="space-y-3">
                      <div className="flex">
                        <div className="w-[160px] text-sm font-medium text-gray-600">Meeting ID:</div>
                        <div className="text-sm text-gray-900 font-mono">{meetingDetails.id}</div>
                      </div>

                      <div className="flex">
                        <div className="w-[160px] text-sm font-medium text-gray-600">Status:</div>
                        <div className="text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            meetingDetails.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : meetingDetails.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : meetingDetails.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {meetingDetails.status.charAt(0).toUpperCase() + meetingDetails.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-[160px] text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Start Time:
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDateTime(meetingDetails.startDateTime).date}
                          <br />
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatDateTime(meetingDetails.startDateTime).time}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-[160px] text-sm font-medium text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          End Time:
                        </div>
                        <div className="text-sm text-gray-900">
                          {formatDateTime(meetingDetails.endDateTime).date}
                          <br />
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatDateTime(meetingDetails.endDateTime).time}
                        </div>
                      </div>
                    </div>

                    {/* Mentor Details */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Mentor Information
                      </h4>
                      <div className="flex items-start gap-3">
                        {meetingDetails.mentor.profilePhoto && (
                          <img 
                            src={meetingDetails.mentor.profilePhoto} 
                            alt={meetingDetails.mentor.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex">
                            <div className="w-[120px] text-sm font-medium text-gray-600">Name:</div>
                            <div className="text-sm text-gray-900">{meetingDetails.mentor.fullName}</div>
                          </div>
                          {meetingDetails.mentor.company && (
                            <div className="flex">
                              <div className="w-[120px] text-sm font-medium text-gray-600">Company:</div>
                              <div className="text-sm text-gray-900">{meetingDetails.mentor.company}</div>
                            </div>
                          )}
                          {meetingDetails.mentor.role && (
                            <div className="flex">
                              <div className="w-[120px] text-sm font-medium text-gray-600">Role:</div>
                              <div className="text-sm text-gray-900">{meetingDetails.mentor.role}</div>
                            </div>
                          )}
                          {meetingDetails.mentor.category && (
                            <div className="flex">
                              <div className="w-[120px] text-sm font-medium text-gray-600">Category:</div>
                              <div className="text-sm text-gray-900">{meetingDetails.mentor.category} / {meetingDetails.mentor.subCategory}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Feedback Section - Only if exists */}
                    {meetingDetails.feedback && (
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Feedback</h4>
                        <div className="space-y-2">
                          <div className="flex">
                            <div className="w-[120px] text-sm font-medium text-gray-600">Rating:</div>
                            <div className="text-sm text-gray-900">
                              {'⭐'.repeat(Math.round(meetingDetails.feedback.rating))} ({meetingDetails.feedback.rating}/5)
                            </div>
                          </div>
                          <div className="flex">
                            <div className="w-[120px] text-sm font-medium text-gray-600">Experience:</div>
                            <div className="text-sm text-gray-900 capitalize">{meetingDetails.feedback.experience.replace('_', ' ')}</div>
                          </div>
                          {meetingDetails.feedback.comments && (
                            <div className="flex">
                              <div className="w-[120px] text-sm font-medium text-gray-600">Comments:</div>
                              <div className="text-sm text-gray-900">{meetingDetails.feedback.comments}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    Meeting details not available
                  </div>
                )}
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setSelectedToken(null)}
              className="px-8 py-3 bg-[#1a97a4] text-white rounded-lg hover:bg-[#158a96] transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default TokenUsageDetails
