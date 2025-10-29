"use client"
import React, { useState, useEffect } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { mentorSlotsAPI } from '@/app/mentor-actions'  
import { useUser } from '@/contexts/UserContext'
import { ScheduleMeetingModalProps } from './interfaces/ScheduleMeeting'
import { generateDays } from './utils/meetingUtils'

const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  mentor
}) => {
  const { user, fetchUserDetails } = useUser()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookedSlots, setBookedSlots] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Calculate available tokens from user data
  const availableTokens = user?.tokens?.[0]?.token || 0

  // Fetch mentor slots when modal opens
  useEffect(() => {
    if (isOpen && mentor.id) {
      fetchMentorSlots()
    }
  }, [isOpen, mentor.id])

  // Synchronize scrolling between calendar and time grid
  useEffect(() => {
    const calendarScroll = document.getElementById('calendar-scroll')
    const timeScroll = document.getElementById('time-scroll')
    const timeHeader = document.querySelector('.time-header-content') as HTMLElement
    
    if (!calendarScroll || !timeScroll) return

    let isScrolling = false

    // Vertical scroll synchronization
    const syncVerticalScroll = (source: HTMLElement, target: HTMLElement) => {
      const handleScroll = () => {
        if (isScrolling) return
        isScrolling = true
        target.scrollTop = source.scrollTop
        requestAnimationFrame(() => {
          isScrolling = false
        })
      }
      source.addEventListener('scroll', handleScroll)
      return () => source.removeEventListener('scroll', handleScroll)
    }

    // Horizontal scroll - sync header position with time grid
    const handleHorizontalScroll = () => {
      if (timeHeader && timeScroll) {
        timeHeader.style.transform = `translateX(-${timeScroll.scrollLeft}px)`
      }
    }

    const cleanup1 = syncVerticalScroll(calendarScroll, timeScroll)
    const cleanup2 = syncVerticalScroll(timeScroll, calendarScroll)
    
    // Sync horizontal scrolling - update header position
    timeScroll.addEventListener('scroll', handleHorizontalScroll)

    return () => {
      cleanup1()
      cleanup2()
      timeScroll.removeEventListener('scroll', handleHorizontalScroll)
    }
  }, [isOpen])

  const fetchMentorSlots = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch all slots (includes both available and booked)
      const response = await mentorSlotsAPI.getMentorSlots(mentor.id)
      if (response.status === 'OK') {
        const allSlots = response.data;
        // Separate available slots (isAvailable=true and no studentId) from booked slots
        const available = allSlots.filter((slot: any) => slot.isAvailable && !slot.studentId);
        const booked = allSlots.filter((slot: any) => slot.studentId);
        
        setAvailableSlots(available);
        setBookedSlots(booked);
      }
    } catch (err) {
      console.error('Failed to fetch mentor slots:', err)
      setError('Failed to load slots. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  if (!isOpen) {
    return null
  }

  // Generate days dynamically based on available slots


  const days = generateDays()


  const handleScheduleMeeting = async () => {
    if (!selectedDate || !selectedTime) return;
    
    if (!user?.id) {
      setError('Please log in to schedule a meeting.')
      return;
    }
    
    setIsBooking(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Parse the selected date and time to create start and end datetime
      const [timeRange] = selectedTime.split(' - ')
      const [hours, minutes] = timeRange.split(':').map(Number)
      
      // Create date from selected date string (format like "October 27")
      // Parse it properly to avoid timezone issues
      const currentYear = new Date().getFullYear()
      const [monthName, dayStr] = selectedDate.split(' ')
      const day = parseInt(dayStr)
      
      // Get month index from month name
      const monthIndex = new Date(`${monthName} 1, ${currentYear}`).getMonth()
      
      // Create date in local timezone
      const meetingDate = new Date(currentYear, monthIndex, day, hours, minutes, 0, 0)
      
      // Create end time (30 minutes later)
      const endDate = new Date(meetingDate)
      endDate.setMinutes(endDate.getMinutes() + 30)
      
      const slotData = {
        startDateTime: meetingDate.toISOString(),
        endDateTime: endDate.toISOString(),
        mentorId: mentor.id,
        studentId: user?.id
      }
      
      console.log('Booking slot:', slotData)
      
      const response = await mentorSlotsAPI.createSlot(slotData)
      
      if (response.status === 'OK') {
        setSuccess('Meeting scheduled successfully!')
        // Refresh the slots to show the new booking
        await fetchMentorSlots()
        // Refresh user details to update token count
        await fetchUserDetails()
        // Close modal after a short delay
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        throw new Error(response.error || 'Failed to schedule meeting')
      }
    } catch (err: any) {
      console.error('Failed to schedule meeting:', err)
      let errorMessage = err.response?.data?.error || err.message || 'Failed to schedule meeting. Please try again.'

      // Provide more user-friendly error messages for token-related issues
      if (errorMessage.includes('Insufficient tokens') || errorMessage.includes('token')) {
        errorMessage = 'Insufficient tokens. Please purchase more tokens to book this meeting.'
      } else if (errorMessage.includes('Student ID is required')) {
        errorMessage = 'Please log in to schedule a meeting.'
      }

      setError(errorMessage)
    } finally {
      setIsBooking(false)
    }
  }

  const isTimeSlotBooked = (date: string, timeSlot: string) => {
    const [timeRange] = timeSlot.split(' - ')
    const [hours, minutes] = timeRange.split(':').map(Number)
    
    // Create date from selected date string (format like "October 27")
    const currentYear = new Date().getFullYear()
    const [monthName, dayStr] = date.split(' ')
    const day = parseInt(dayStr)
    const monthIndex = new Date(`${monthName} 1, ${currentYear}`).getMonth()
    
    const slotDate = new Date(currentYear, monthIndex, day, hours, minutes, 0, 0)
    
    // Check if this slot is already booked
    return bookedSlots.some(slot => {
      const slotStart = new Date(slot.startDateTime)
      return slotStart.getTime() === slotDate.getTime()
    })
  }

  const isTimeSlotAvailable = (date: string, timeSlot: string) => {
    const [timeRange] = timeSlot.split(' - ')
    const [hours, minutes] = timeRange.split(':').map(Number)
    
    // Create date from selected date string (format like "October 27")
    const currentYear = new Date().getFullYear()
    const [monthName, dayStr] = date.split(' ')
    const day = parseInt(dayStr)
    const monthIndex = new Date(`${monthName} 1, ${currentYear}`).getMonth()
    
    const slotDate = new Date(currentYear, monthIndex, day, hours, minutes, 0, 0)
    
    console.log('Checking availability for:', {
      date,
      timeSlot,
      slotDate: slotDate.toISOString(),
      availableSlotsCount: availableSlots.length,
      sampleSlots: availableSlots.slice(0, 3).map(s => ({
        start: new Date(s.startDateTime).toISOString(),
        match: new Date(s.startDateTime).getTime() === slotDate.getTime()
      }))
    });
    
    // Check if this slot is marked as available by the mentor
    return availableSlots.some(slot => {
      const slotStart = new Date(slot.startDateTime)
      return slotStart.getTime() === slotDate.getTime()
    })
  }

  const getSlotStatus = (date: string, timeSlot: string): 'booked' | 'available' | 'unavailable' => {
    if (isTimeSlotBooked(date, timeSlot)) return 'booked';
    if (isTimeSlotAvailable(date, timeSlot)) return 'available';
    return 'unavailable';
  }

  return (
    <>
      <style jsx>{`
        #calendar-scroll::-webkit-scrollbar {
          display: none;
        }
        #time-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl md:text-3xl font-semibold text-black">Select Your Time Slot</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white rounded-3xl px-3 py-2 shadow-lg border border-white">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-cyan-600 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <span className="text-sm md:text-base font-normal text-black">Tokens</span>
              <span className="text-xl md:text-2xl font-normal text-black">{availableTokens}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar Sidebar */}
          <div className="w-40 md:w-56 shadow-2xl flex flex-col flex-shrink-0 bg-white">
            {/* Month Header */}
            <div className="h-16 px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200">
              <div className="flex flex-row items-center space-x-2">
                <div className="text-lg font-bold text-gray-800">
                  {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-cyan-600">
                    {new Date().getDate()}
                  </div>
                  <div className="px-3 py-1 bg-cyan-600 text-white text-xs font-medium rounded-full">
                    Today
                  </div>
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="flex-1 overflow-y-auto scrollbar-none" id="calendar-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {days.map((day, index) => (
                <div 
                  key={day.date} 
                  className={`h-12 px-4 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    day.isToday ? 'bg-cyan-50 border-cyan-200' : ''
                  } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-1">
                    <div className={`text-lg font-bold ${
                      day.isToday ? 'text-cyan-600' : 'text-gray-800'
                    }`}>
                      {day.date}
                    </div>
                    
                    <div className="text-xs text-gray-500 font-medium">
                      {day.label.split(' ')[0]}
                    </div>
                    <div className={`text-xs font-semibold ${
                    day.isToday ? 'text-cyan-600' : 'text-gray-600'
                  }`}>
                    {new Date().getFullYear()}
                  </div>
                  </div>
             
                  
                  <div className={`text-xs font-semibold ${
                    day.isToday ? 'text-cyan-600' : 'text-gray-600'
                  }`}>
                    {day.day}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Grid */}
          <div className="flex-1 shadow-2xl flex flex-col overflow-hidden">
            {/* Time Header - Fixed, no scrolling */}
            <div className="h-16 bg-white flex flex-col justify-center items-start overflow-hidden">
              <div className="time-header-content transition-transform duration-0">
                <div className="flex-1 flex justify-start items-center overflow-hidden">
                  <div className="py-0.5 bg-gradient-to-r from-purple-950 to-amber-300 flex justify-start items-center overflow-hidden">
                    {Array.from({ length: 48 }, (_, i) => (
                      <div key={i} className="w-10 md:w-12 flex justify-center items-center gap-2 flex-shrink-0">
                        {i % 2 === 0 && (
                          <div className="text-center text-white text-xs font-semibold">
                            {Math.floor(i / 2) < 12 ? (Math.floor(i / 2) === 0 ? 'AM' : `${Math.floor(i / 2)}:00`) : Math.floor(i / 2) === 12 ? 'PM' : `${Math.floor(i / 2) - 12}:00`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-start items-center overflow-hidden">
                  <div className="py-0.5 bg-gradient-to-r from-amber-300 via-pink-800 to-purple-950 rounded-tr-xl rounded-br-xl flex justify-start items-center overflow-hidden">
                    {Array.from({ length: 48 }, (_, i) => (
                      <div key={i} className="w-10 md:w-12 flex justify-center items-center gap-2 flex-shrink-0">
                        {i % 2 === 1 && (
                          <div className="text-center text-black text-xs font-semibold">
                            {Math.floor(i / 2) < 12 ? `${Math.floor(i / 2)}:30` : Math.floor(i / 2) === 12 ? '12:30' : `${Math.floor(i / 2) - 12}:30`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slots Grid - Wrapper for horizontal scroll */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-x-auto overflow-y-auto scrollbar-none" id="time-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center h-64">
                  <div className="text-gray-500">Loading available slots...</div>
                </div>
              ) : error ? (
                <div className="flex-1 flex items-center justify-center h-64">
                  <div className="text-red-500 text-center">
                    <div>{error}</div>
                    <button 
                      onClick={fetchMentorSlots}
                      className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {days.map((day, dayIndex) => (
                    <div key={day.date} className={`flex justify-start items-center ${dayIndex % 2 === 0 ? 'bg-slate-100' : 'bg-white'}`}>
                      <div className="flex justify-start items-center">
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2)
                          const minute = (i % 2) * 30
                          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} - ${hour.toString().padStart(2, '0')}:${(minute + 30).toString().padStart(2, '0')}`
                          const slotStatus = getSlotStatus(day.label, timeString)
                          const isSelected = selectedDate === day.label && selectedTime === timeString
                          
                          // Get background colors based on slot status
                          let bgClass = '';
                          let hoverClass = '';
                          let cursorClass = 'cursor-pointer';
                          
                          if (slotStatus === 'booked') {
                            bgClass = 'bg-red-200 border-red-400';
                            hoverClass = '';
                            cursorClass = 'cursor-not-allowed';
                          } else if (slotStatus === 'available') {
                            bgClass = 'bg-green-100 border-green-300';
                            hoverClass = 'hover:bg-green-200';
                          } else { // unavailable
                            bgClass = 'bg-gray-100 border-gray-300';
                            hoverClass = '';
                            cursorClass = 'cursor-not-allowed';
                          }
                          
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                // Only allow selection of available slots
                                if (slotStatus === 'available') {
                                  setSelectedDate(day.label)
                                  setSelectedTime(timeString)
                                }
                              }}
                              className={`w-10 h-10 md:w-12 md:h-12 border-l border-r flex-shrink-0 ${cursorClass} ${
                                isSelected ? 'bg-cyan-600 border-cyan-600' : `${bgClass} ${hoverClass}`
                              }`}
                              title={
                                slotStatus === 'booked' 
                                  ? 'Already booked' 
                                  : slotStatus === 'available' 
                                  ? 'Available for booking' 
                                  : 'Not available'
                              }
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className={`px-4 py-4 rounded-xl border-2 flex justify-start items-center gap-3 overflow-hidden w-full ${
              selectedDate && selectedTime 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className={`text-sm md:text-xl font-normal ${
                selectedDate && selectedTime ? 'text-green-700' : 'text-gray-500'
              }`}>
                {selectedDate && selectedTime 
                  ? `✓ Meeting with ${mentor.fullName} on ${selectedDate} at ${selectedTime}`
                  : '⚠️ Please select a date and time slot to continue'
                }
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <div className="justify-center text-neutral-600 text-sm md:text-xl font-normal">Session Duration:</div>
                <div className="justify-center text-cyan-600 text-sm md:text-xl font-bold">30 min</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="justify-center text-neutral-600 text-sm md:text-xl font-normal">Token utilised:</div>
                <div className="justify-center text-cyan-600 text-sm md:text-xl font-bold">1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="px-4 md:px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-xs text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
              <span className="text-xs text-gray-700">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-xs text-gray-700">Not Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-600 border border-cyan-600 rounded"></div>
              <span className="text-xs text-gray-700">Selected</span>
            </div>
          </div>
        </div>

        {/* Status and Messages */}
        <div className="px-4 md:px-6 py-2">
          {success && (
            <div className="py-2 rounded-xl flex justify-center items-center gap-3 bg-green-50">
              <div className="w-6 h-6 bg-green-600 rounded-full" />
              <div className="w-4 h-4 bg-green-600 rounded-full" />
              <div className="justify-center text-green-700 text-sm font-normal">{success}</div>
            </div>
          )}
          {error && (
            <div className="py-2 rounded-xl flex justify-center items-center gap-3 bg-red-50">
              <div className="w-6 h-6 bg-red-600 rounded-full" />
              <div className="w-4 h-4 bg-red-600 rounded-full" />
              <div className="justify-center text-red-700 text-sm font-normal">{error}</div>
            </div>
          )}
          {!success && !error && (
            <div className="py-2 rounded-xl flex justify-center items-center gap-3">
              <div className="w-6 h-6 bg-cyan-600 rounded-full" />
              <div className="w-4 h-4 bg-cyan-600 rounded-full" />
              <div className="justify-center text-black text-sm font-normal">Confirming meet</div>
            </div>
          )}
        </div>

        <div className="px-4 md:px-6 pb-4">
          <div className="px-3 py-2 bg-amber-50 rounded-xl flex justify-start items-start gap-3">
            <div className="justify-center text-black text-xs font-normal">🙈 While Fridays are universally loved, data shows that bookings scheduled on Fridays and weekends carry a higher likelihood of no-shows.</div>
          </div>
        </div>

        <div className="px-4 md:px-6 pb-4">
          <div className="px-3 py-2 bg-white rounded-xl shadow-lg flex justify-start items-start gap-3">
            <div className="justify-center text-red-600 text-xs font-medium">Only back-to-back slots can be booked.</div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-orange-100 flex justify-center items-center gap-4">
          <div className="w-6 h-6 bg-yellow-700 rounded-full" />
          <div className="w-5 h-5 bg-yellow-700 rounded-full" />
          <div className="text-center">
            <span className="text-yellow-700 text-xs font-medium">Creating meet using </span>
            <span className="text-yellow-700 text-xs font-semibold">"abc0123@gmail.com"</span>
          </div>
        </div> */}

        {/* Action Buttons - Fixed positioning to ensure visibility */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button 
              onClick={onClose}
              className="h-14 px-8 py-3 rounded-3xl border border-cyan-600 flex justify-center items-center gap-2.5 hover:bg-cyan-50 transition-colors w-full md:w-auto"
            >
              <div className="text-cyan-600 text-xl font-semibold">Close</div>
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              {!selectedDate || !selectedTime ? (
                <div className="text-gray-500 text-sm w-full md:w-auto">
                  Please select a date and time slot to continue
                </div>
              ) : !user?.id ? (
                <div className="text-red-500 text-sm w-full md:w-auto">
                  Please log in to schedule a meeting
                </div>
              ) : null}
              <button 
                onClick={handleScheduleMeeting}
                disabled={!selectedDate || !selectedTime || isBooking || !user?.id}
                className={`h-14 px-8 py-3 rounded-3xl flex justify-center items-center gap-2.5 transition-colors w-full md:w-auto ${
                  selectedDate && selectedTime && !isBooking && user?.id
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="text-xl font-semibold">
                  {isBooking ? 'Creating Meeting...' : 'Create Meeting'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default ScheduleMeetingModal