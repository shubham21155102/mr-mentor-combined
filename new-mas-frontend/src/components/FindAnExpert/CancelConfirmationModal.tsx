"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  meetingData: {
    id: string;
    mentor: string;
    email: string;
    date: string;
    time: string;
    description: string;
    mentee?: string;
  } | null;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  meetingData
}) => {
  if (!isOpen) {
    return null;
  }

  const meetingId = meetingData?.id || '';
  const mentor = meetingData?.mentor || '';
  const date = meetingData?.date || '';
  const time = meetingData?.time || '';
  const mentee = meetingData?.mentee || '—';
  const description = meetingData?.description || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[669px] bg-gradient-to-r from-white/80 to-white/80 backdrop-blur-[115.25px] rounded-[24px] p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-black tracking-[0.5px]">Meet Details</h2>
        </div>


        {/* Details */}
        {/* Header - Confirmation */}
        <div className="text-center mb-4">
          <h2
            style={{
              color: '#000000',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '32px',
              letterSpacing: '0.5px'
            }}
          >
            Confirmation
          </h2>
        </div>

        {/* Body text */}
        <div className="text-center mb-6 px-4">
          <p
            style={{
              color: '#525252',
              textAlign: 'center',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '24px',
              letterSpacing: '0.5px'
            }}
          >
            Do you want to cancel this session?
          </p>

          <p
            style={{
              color: '#525252',
              textAlign: 'center',
              fontFamily: 'Roboto, sans-serif',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.5px'
            }}
            className="mt-3"
          >
            Just a heads-up: the token won’t come back and the payment can’t be refunded.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onConfirm}
            className="bg-[#1a97a4] text-white rounded-[30px] shadow-[0_3.871px_19.353px_rgba(26,151,164,0.3)] min-w-[264px] px-6 py-4 flex items-center justify-center"
            style={{
              borderRadius: '30px',
              width: '264px',
              padding: '16px 20px 16px 24px',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            Yes, cancel this meet
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="border-[#1a97a4] text-[#1a97a4] rounded-[30px] min-w-[264px] px-6 py-4 flex items-center justify-center"
            style={{
              borderRadius: '30px',
              borderWidth: '0.968px',
              width: '264px'
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmationModal;
