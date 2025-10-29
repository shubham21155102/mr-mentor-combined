"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CancelConfirmationModal from './CancelConfirmationModal';
import { FRONTEND_URL } from '@/lib/api';

interface MeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  meetingData: {
    id: string;
    mentor: string;
    email: string;
    date: string;
    time: string;
    description: string;
    status: string;
    mentee?: string;
  };
}

const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  meetingData
}) => {
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    onCancel();
    setShowCancelConfirmation(false);
  };

  const handleCloseCancelConfirmation = () => {
    setShowCancelConfirmation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[669px] bg-gradient-to-r from-white/80 to-white/80 backdrop-blur-[115.25px] rounded-[24px] p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-black tracking-[0.5px]">
            Meet Details
          </h2>
          {meetingData.status === 'CANCELLED' && (
            <p className="text-red-600 text-sm mt-2 font-medium">
              This meeting has been cancelled
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
            <div className="text-[#0053c4] text-xl font-medium"
            onClick={() => {
              window.open(`${FRONTEND_URL}/meetings/${meetingData.id}`, '_blank');
            }}
            style={{ cursor: 'pointer' }}
            >
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

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {meetingData.status === 'CANCELLED' ? (
            <Button
              onClick={onClose}
              className="bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white px-6 py-4 rounded-[30px] text-xl font-medium shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] min-w-[264px]"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancelClick}
                className="bg-[#1a97a4] hover:bg-[#1a97a4]/90 text-white px-6 py-4 rounded-[30px] text-xl font-medium shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] min-w-[264px]"
              >
                Cancel this meet
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className="border-[#1a97a4] text-[#1a97a4] hover:bg-[#1a97a4] hover:text-white px-6 py-4 rounded-[30px] text-xl font-medium shadow-[0px_3.871px_19.353px_0px_rgba(26,151,164,0.3)] min-w-[264px]"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showCancelConfirmation}
        onClose={handleCloseCancelConfirmation}
        onConfirm={handleConfirmCancel}
        meetingData={meetingData}
      />
    </div>
  );
};

export default MeetingDetailsModal;
