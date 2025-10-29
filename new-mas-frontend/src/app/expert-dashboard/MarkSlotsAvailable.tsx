"use client"

import React, { useState, useEffect } from 'react';
import { MentorService, Slot } from '@/lib/mentorService';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowLeftIcon, XIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  selected: boolean;
}

export const MarkSlotsAvailable: React.FC = () => {
  const { user } = useUser();
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.getDate().toString(),
        month: date.toLocaleDateString('en-US', { month: 'short' }) + date.getFullYear().toString().slice(-2),
        fullDate: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
        bgColor: i % 2 === 0 ? 'bg-[#edf8f9]' : 'bg-white'
      });
    }
    return dates;
  };

  // Generate time slots (9 AM to 9 PM in 30-min intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startHour = hour.toString().padStart(2, '0');
        const startMin = minute.toString().padStart(2, '0');
        const endMinute = minute + 30;
        const endHour = endMinute === 60 ? (hour + 1).toString().padStart(2, '0') : startHour;
        const endMin = (endMinute % 60).toString().padStart(2, '0');
        
        slots.push({
          start: `${startHour}:${startMin}`,
          end: `${endHour}:${endMin}`,
          label: `${startHour}:${startMin}`
        });
      }
    }
    return slots;
  };

  const timezoneOptions = [
    { city: "New Delhi", offset: "GMT+5:30" },
    { city: "London", offset: "GMT+0:00" },
    { city: "New York", offset: "GMT-5:00" },
  ];

  const dates = generateDates();
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (user?.id) {
      fetchAvailableSlots();
      fetchBookedSlots();
    }
  }, [user?.id]);

  const fetchAvailableSlots = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const slots = await MentorService.getMentorAvailableSlots(user.id);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setMessage({ type: 'error', text: 'Failed to load available slots' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    if (!user?.id) return;
    
    try {
      const allSlots = await MentorService.getMentorSlots(user.id);
      // Filter for booked slots (those that have a studentId)
      const booked = allSlots.filter(slot => slot.studentId !== null && slot.studentId !== undefined);
      setBookedSlots(booked);
    } catch (error) {
      console.error('Failed to fetch booked slots:', error);
    }
  };

  const isSlotAvailable = (date: string, startTime: string): boolean => {
    return availableSlots.some(slot => {
      const slotDate = new Date(slot.startDateTime).toISOString().split('T')[0];
      const slotTime = new Date(slot.startDateTime).toTimeString().slice(0, 5);
      return slotDate === date && slotTime === startTime;
    });
  };

  const isSlotBooked = (date: string, startTime: string): boolean => {
    return bookedSlots.some(slot => {
      const slotDate = new Date(slot.startDateTime).toISOString().split('T')[0];
      const slotTime = new Date(slot.startDateTime).toTimeString().slice(0, 5);
      return slotDate === date && slotTime === startTime;
    });
  };

  const toggleSlot = (date: string, timeSlot: { start: string; end: string }) => {
    const slotKey = `${date}_${timeSlot.start}`;
    const existingIndex = selectedSlots.findIndex(
      s => s.date === date && s.startTime === timeSlot.start
    );

    if (existingIndex >= 0) {
      setSelectedSlots(selectedSlots.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedSlots([
        ...selectedSlots,
        {
          date,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          selected: true
        }
      ]);
    }
  };

  const isSlotSelected = (date: string, startTime: string): boolean => {
    return selectedSlots.some(s => s.date === date && s.startTime === startTime);
  };

  const handleSaveSlots = async () => {
    if (!user?.id) {
      setMessage({ type: 'error', text: 'Please log in to save slots' });
      return;
    }

    if (selectedSlots.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one slot' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const slotsToMark = selectedSlots.map(slot => {
        const [year, month, day] = slot.date.split('-');
        const startDateTime = new Date(`${year}-${month}-${day}T${slot.startTime}:00`);
        const endDateTime = new Date(`${year}-${month}-${day}T${slot.endTime}:00`);
        
        return {
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString()
        };
      });

      await MentorService.markSlotsAvailable(slotsToMark, user.id);
      
      setMessage({ type: 'success', text: `Successfully marked ${selectedSlots.length} slots as available!` });
      setSelectedSlots([]);
      await fetchAvailableSlots();
      await fetchBookedSlots();
    } catch (error: any) {
      console.error('Failed to save slots:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save slots' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedSlots([]);
  };

  return (
    <div className="relative w-full max-w-[1420px] min-h-[793px] rounded-3xl overflow-hidden bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom_right,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_bottom_right_/_50%_50%_no-repeat,linear-gradient(to_bottom_left,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_bottom_left_/_50%_50%_no-repeat,linear-gradient(to_top_left,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_top_left_/_50%_50%_no-repeat,linear-gradient(to_top_right,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_top_right_/_50%_50%_no-repeat]">
      <header className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 flex items-center justify-center">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="[font-family:'Roboto',Helvetica] font-semibold text-black text-[32px] tracking-[0.50px] leading-[44px]">
            Mark Available Slots
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-r-[0.33px] border-l-[0.33px] border-[#d0d0d0] bg-[linear-gradient(180deg,rgba(253,217,101,1)_0%,rgba(86,232,247,1)_100%)]" />
            <span className="text-xs leading-[18px] [font-family:'Inter',Helvetica] font-normal tracking-[0.50px] text-[#909090]">
              Booked
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-r-[0.33px] border-l-[0.33px] border-[#d0d0d0] bg-[#aee0e5]" />
            <span className="text-xs leading-[18px] [font-family:'Inter',Helvetica] font-normal tracking-[0.50px] text-[#909090]">
              Not available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-r-[0.33px] border-l-[0.33px] border-[#d0d0d0] bg-[#1a97a4]" />
            <span className="text-xs leading-[18px] [font-family:'Inter',Helvetica] font-normal tracking-[0.50px] text-[#1a97a4]">
              Available
            </span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {message && (
        <div className={`mx-6 mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <main className="flex flex-col px-6 pb-6">
        {/* Info Section */}
        <section className="flex w-full items-center justify-center gap-4 px-4 py-1 bg-[#fdf1dd] mb-4">
          <InfoIcon className="w-6 h-6 text-[#a97635]" />
          <p className="[font-family:'Montserrat',Helvetica] font-normal text-[#a97635] text-xs text-center tracking-[0.12px] leading-[normal]">
            <span className="font-medium tracking-[0.01px]">
              Select time slots when you're available for meetings
            </span>
          </p>
        </section>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : (
          <div className="flex w-full items-start justify-between rounded-xl overflow-hidden mb-6">
            <aside className="flex flex-col w-[215px] items-start">
              <header className="flex h-[54px] items-center gap-4 pl-4 pr-3 py-1 w-full bg-white">
                <div className="flex items-center gap-2 flex-1">
                  <div className="[font-family:'Helvetica-Bold',Helvetica] font-normal text-black text-sm text-center leading-[normal]">
                    <span className="font-bold tracking-[-0.04px]">
                      {new Date().toLocaleDateString('en-US', { month: 'long' })}
                    </span>
                    <span className="[font-family:'Montserrat',Helvetica] font-bold tracking-[0]">
                      &nbsp;
                    </span>
                    <span className="[font-family:'Montserrat',Helvetica] font-medium tracking-[0]">
                      {new Date().getDate()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-1">
                    <Button
                      variant="outline"
                      className="flex-1 h-auto px-2 py-1 rounded-md border-[#1a97a4] text-[#1a97a4] hover:bg-[#1a97a4]/10 hover:text-[#1a97a4]"
                    >
                      <span className="[font-family:'Helvetica-Regular',Helvetica] font-normal text-sm tracking-[-0.28px] leading-[normal] whitespace-nowrap">
                        Today
                      </span>
                    </Button>
                  </div>
                </div>
              </header>

              <nav className="w-full">
                {dates.map((entry, index) => (
                  <div
                    key={index}
                    className={cn(
                      `flex items-center gap-4 px-4 py-1 w-full ${entry.bgColor} transition-colors`
                    )}
                  >
                    <div className="flex flex-col h-10 items-start justify-center gap-1">
                      <div className="[font-family:'Montserrat',Helvetica] font-normal text-black text-xs text-center tracking-[0.12px] leading-[normal]">
                        <span className="font-bold tracking-[0.01px]">
                          {entry.date}
                        </span>
                        <span className="font-medium tracking-[0.01px]">
                          {entry.month}
                        </span>
                        <span className="font-bold tracking-[0.01px]">
                          {" "}· {entry.dayName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </nav>
            </aside>

            <ScrollArea className="flex-1 overflow-x-auto">
              <div className="relative min-w-max">
                {/* Time slots header */}
                <div className="flex h-[54px] items-center justify-center w-full bg-white mb-0">
                  <div className="inline-flex items-center">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex w-[52px] items-center justify-center gap-2"
                      >
                        <div className="[font-family:'Montserrat',Helvetica] font-semibold text-black text-xs text-center tracking-[0.12px] leading-[normal]">
                          {slot.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability grid */}
                <div className="relative">
                  {dates.map((date, dateIndex) => (
                    <div
                      key={dateIndex}
                      className={cn(
                        "flex h-[54px] items-center",
                        dateIndex % 2 === 0 ? "bg-[#edf8f9]" : "bg-white"
                      )}
                    >
                      {timeSlots.map((timeSlot, slotIndex) => {
                        const alreadyAvailable = isSlotAvailable(date.fullDate, timeSlot.start);
                        const booked = isSlotBooked(date.fullDate, timeSlot.start);
                        const selected = isSlotSelected(date.fullDate, timeSlot.start);
                        
                        return (
                          <div
                            key={slotIndex}
                            className={cn(
                              "w-[52px] h-full border-r border-gray-200 flex items-center justify-center transition-colors",
                              booked
                                ? "bg-[linear-gradient(180deg,rgba(253,217,101,1)_0%,rgba(86,232,247,1)_100%)] cursor-not-allowed"
                                : alreadyAvailable
                                ? "bg-[#1a97a4] cursor-not-allowed"
                                : selected
                                ? "bg-[#1a97a4]/80 hover:bg-[#1a97a4] cursor-pointer"
                                : "hover:bg-gray-100 cursor-pointer"
                            )}
                            onClick={() => !alreadyAvailable && !booked && toggleSlot(date.fullDate, timeSlot)}
                            title={
                              booked
                                ? 'Slot is booked'
                                : alreadyAvailable 
                                ? 'Already marked as available' 
                                : selected 
                                ? 'Click to deselect' 
                                : 'Click to select'
                            }
                          >
                            {(selected || alreadyAvailable) && !booked && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        <div className="flex items-center gap-3 mt-2">
          <Checkbox id="schedule-available" />
          <label
            htmlFor="schedule-available"
            className="text-black text-sm leading-5 [font-family:'Inter',Helvetica] font-normal tracking-[0.50px] cursor-pointer"
          >
            Make this schedule available till next month
          </label>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <span className="text-black text-xl leading-6 [font-family:'Inter',Helvetica] font-normal tracking-[0.50px]">
            Time Zone
          </span>
          <Select defaultValue="new-delhi">
            <SelectTrigger className="w-auto min-w-[200px] bg-[#e9edf0] border-0 rounded-xl h-auto px-4 py-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezoneOptions.map((timezone, index) => (
                <SelectItem
                  key={index}
                  value={`${timezone.city.toLowerCase().replace(" ", "-")}-${index}`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="[font-family:'Inter',Helvetica] font-normal text-neutral-500 text-sm tracking-[0] leading-5">
                      {timezone.city}
                    </div>
                    <div className="[font-family:'Inter',Helvetica] font-normal text-neutral-500 text-xs tracking-[0] leading-5">
                      {timezone.offset}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <Button
            variant="outline"
            className="w-[267px] h-auto px-[31.97px] py-[11.99px] rounded-[26.98px] border-[#1a97a4] text-[#1a97a4] font-button-main font-[number:var(--button-main-font-weight)] text-[length:var(--button-main-font-size)] tracking-[var(--button-main-letter-spacing)] leading-[var(--button-main-line-height)] [font-style:var(--button-main-font-style)]"
          >
            Close
          </Button>
          <Button 
            onClick={handleSaveSlots}
            disabled={isSaving || selectedSlots.length === 0}
            className="w-[330px] h-auto px-[31.97px] py-[11.99px] bg-[#1a97a4] hover:bg-[#157f8b] rounded-[26.98px] [font-family:'Roboto',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[28.0px]"
          >
            {isSaving ? 'Saving...' : `Update Slots ${selectedSlots.length > 0 ? `(${selectedSlots.length})` : ''}`}
          </Button>
        </div>
      </main>
    </div>
  );
};
