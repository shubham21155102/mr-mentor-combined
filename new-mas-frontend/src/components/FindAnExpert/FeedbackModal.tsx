"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown } from 'lucide-react';
import { FeedbackData, FeedbackModalProps } from './interfaces';
import { FRONTEND_URL } from '@/lib/api';

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  meetingData,
  loading = false,
  error = null
}) => {
  const [rating, setRating] = useState(meetingData.feedback?.rating || 0);
  const [isMentorJoinedOnTime, setIsMentorJoinedOnTime] = useState<boolean | null>(
    meetingData.feedback?.isMentorJoinedOnTime ?? null
  );
  const [experience, setExperience] = useState(meetingData.feedback?.experience || '');
  const [comments, setComments] = useState(meetingData.feedback?.comments || '');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const hasExistingFeedback = !!meetingData.feedback;

  const experienceOptions = [
    'excellent',
    'good',
    'average',
    'below average',
    'poor'
  ];

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    // The meeting id is the slotId in this case
    const slotId = meetingData.id;
    
    const feedbackData: FeedbackData = {
      slotId,
      isMentorJoinedOnTime: isMentorJoinedOnTime || false,
      rating: rating.toString(),
      experience,
      comments
    };
    onSubmit(feedbackData);
    // Reset form
    setRating(0);
    setIsMentorJoinedOnTime(null);
    setExperience('');
    setComments('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[669px] bg-gradient-to-r from-white/80 to-white/80 backdrop-blur-[115.25px] rounded-[24px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-black tracking-[0.5px]">
            {hasExistingFeedback ? 'Meeting Feedback (Already Provided)' : 'Meeting Feedback'}
          </h2>
          {hasExistingFeedback && (
            <p className="text-green-600 text-sm mt-2 font-medium">
              You have already provided feedback for this meeting
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-5"></div>

        {/* Meeting Details */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-4 items-start">
            <div className="w-[120px] text-neutral-600 text-xl tracking-[0.5px]">
              Meet ID:
            </div>
            <div className="text-[#0053c4] text-xl font-medium">
              {/* https://meet.google.com/{meetingData.id} */}
              {FRONTEND_URL}/meetings/{meetingData.id}
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-[120px] text-neutral-600 text-xl tracking-[0.5px]">
              Time:
            </div>
            <div className="text-black text-xl font-medium">
              {meetingData.date} | {meetingData.time}
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-[120px] text-neutral-600 text-xl tracking-[0.5px]">
              Expert:
            </div>
            <div className="text-black text-xl font-medium">
              {meetingData.mentor.toUpperCase()}
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-[120px] text-neutral-600 text-xl tracking-[0.5px]">
              Mentee:
            </div>
            <div className="text-black text-xl font-medium">
              {meetingData.mentee || 'Ranjan Prasad'}
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-[120px] text-neutral-600 text-xl tracking-[0.5px]">
              Description:
            </div>
            <div className="text-black text-xl font-medium">
              {meetingData.description}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>

        {/* Feedback Section */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-black mb-2">
            How was your experience?
          </h3>
          <p className="text-gray-600">
            Your feedback helps us improve our services
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>

        {/* Feedback Form */}
        <div className="space-y-6">
          {/* Mentor Joined On Time */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-black">
                Did your mentor joined on time?
              </span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mentorJoinedOnTime"
                    checked={isMentorJoinedOnTime === true}
                    onChange={() => setIsMentorJoinedOnTime(true)}
                    disabled={hasExistingFeedback}
                    className="w-6 h-6 text-[#1a97a4] border-gray-300 focus:ring-[#1a97a4] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mentorJoinedOnTime"
                    checked={isMentorJoinedOnTime === false}
                    onChange={() => setIsMentorJoinedOnTime(false)}
                    disabled={hasExistingFeedback}
                    className="w-6 h-6 text-[#1a97a4] border-gray-300 focus:ring-[#1a97a4] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-black">
              Overall Rating
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => !hasExistingFeedback && setRating(star)}
                  disabled={hasExistingFeedback}
                  className="p-1 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    } ${hasExistingFeedback ? 'opacity-50' : ''}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Overall Experience Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-black">
              Overall Experience
            </span>
            <div className="relative">
              <button
                onClick={() => !hasExistingFeedback && setShowDropdown(!showDropdown)}
                disabled={hasExistingFeedback}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white min-w-[200px] justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm">
                  {experience || 'Select experience'}
                </span>
                <ChevronDown className="w-5 h-5" />
              </button>
              
              {showDropdown && !hasExistingFeedback && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {experienceOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setExperience(option);
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm capitalize"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments Text Area */}
          <div className="space-y-2">
            <span className="text-lg font-medium text-black">
              Additional Comments
            </span>
            <textarea
              value={comments}
              onChange={(e) => !hasExistingFeedback && setComments(e.target.value)}
              placeholder="Share your thoughts about the meeting..."
              disabled={hasExistingFeedback}
              className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-[#1a97a4] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {hasExistingFeedback ? (
            <Button
              onClick={onClose}
              className="bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white px-6 py-4 rounded-[30px] text-xl font-medium shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] min-w-[264px]"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={onClose}
                variant="outline"
                className="border-[#1a97a4] text-[#1a97a4] hover:bg-[#1a97a4] hover:text-white px-6 py-4 rounded-[30px] text-xl font-medium shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] min-w-[264px]"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={loading || isMentorJoinedOnTime === null || rating === 0 || !experience}
                className="bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white px-6 py-4 rounded-[30px] text-xl font-medium shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] min-w-[264px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
