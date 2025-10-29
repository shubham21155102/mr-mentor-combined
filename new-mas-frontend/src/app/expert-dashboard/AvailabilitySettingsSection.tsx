import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const dateEntries = [
  { date: "25", month: "Aug25", day: "MONDAY", bgColor: "bg-[#edf8f9]" },
  { date: "26", month: "Aug25", day: "TUESDAY", bgColor: "bg-white" },
  { date: "27", month: "Aug25", day: "WEDNESDAY", bgColor: "bg-[#edf8f9]" },
  { date: "28", month: "Aug25", day: "THURSDAY", bgColor: "bg-white" },
  { date: "29", month: "Aug25", day: "FRIDAY", bgColor: "bg-[#edf8f9]" },
  { date: "30", month: "Aug25", day: "SATURDAY", bgColor: "bg-white" },
  { date: "31", month: "Aug25", day: "SUNDAY", bgColor: "bg-[#edf8f9]" },
];

const amTimeSlots = [
  { time: "AM", visible: true },
  { time: "01:30", visible: false },
  { time: "02:00", visible: false },
  { time: "02:30", visible: false },
  { time: "03:00", visible: false },
  { time: "03:30", visible: false },
  { time: "04:00", visible: false },
  { time: "04:30", visible: false },
  { time: "05:00", visible: false },
  { time: "05:30", visible: false },
  { time: "06:00", visible: false },
  { time: "06:30", visible: false },
  { time: "07:00", visible: false },
  { time: "07:30", visible: false },
  { time: "08:00", visible: false },
  { time: "08:30", visible: false },
  { time: "09:00", visible: false },
  { time: "09:30", visible: false },
  { time: "10:00", visible: false },
  { time: "10:30", visible: false },
  { time: "11:00", visible: false },
  { time: "11:30", visible: false },
  { time: "PM", visible: true },
  { time: "12:30", visible: false },
];

const pmTimeSlots = [
  { time: "13:00", visible: false },
  { time: "13:30", visible: false },
  { time: "14:00", visible: false },
  { time: "14:30", visible: false },
  { time: "15:00", visible: false },
  { time: "15:30", visible: false },
  { time: "16:00", visible: false },
  { time: "16:30", visible: false },
  { time: "17:00", visible: false },
  { time: "17:30", visible: false },
  { time: "18:00", visible: false },
  { time: "18:30", visible: false },
  { time: "19:00", visible: false },
  { time: "19:30", visible: false },
  { time: "20:00", visible: false },
  { time: "20:30", visible: false },
  { time: "21:00", visible: false },
  { time: "21:30", visible: false },
  { time: "22:00", visible: false },
  { time: "23:30", visible: false },
];

const fullDayAmTimeSlots = [
  { time: "00:00", visible: true },
  { time: "01:30", visible: true },
  { time: "02:00", visible: true },
  { time: "02:30", visible: true },
  { time: "03:00", visible: true },
  { time: "03:30", visible: true },
  { time: "04:00", visible: true },
  { time: "04:30", visible: true },
  { time: "05:00", visible: true },
  { time: "05:30", visible: true },
  { time: "06:00", visible: true },
  { time: "06:30", visible: true },
  { time: "07:00", visible: true },
  { time: "07:30", visible: true },
  { time: "08:00", visible: true },
  { time: "08:30", visible: true },
  { time: "09:00", visible: true },
  { time: "09:30", visible: true },
  { time: "10:00", visible: true },
  { time: "10:30", visible: true },
  { time: "11:00", visible: true },
  { time: "11:30", visible: true },
  { time: "12:00", visible: true },
  { time: "12:30", visible: true },
];

const fullDayPmTimeSlots = [
  { time: "13:00", visible: true },
  { time: "13:30", visible: true },
  { time: "14:00", visible: true },
  { time: "14:30", visible: true },
  { time: "15:00", visible: true },
  { time: "15:30", visible: true },
  { time: "16:00", visible: true },
  { time: "16:30", visible: true },
  { time: "17:00", visible: true },
  { time: "17:30", visible: true },
  { time: "18:00", visible: true },
  { time: "18:30", visible: true },
  { time: "19:00", visible: true },
  { time: "19:30", visible: true },
  { time: "20:00", visible: true },
  { time: "20:30", visible: true },
  { time: "21:00", visible: true },
  { time: "21:30", visible: true },
  { time: "22:00", visible: true },
  { time: "23:30", visible: true },
];

// Helper function to generate random availability data
const generateRandomAvailability = (rows: number, cols: number) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.random() > 0.7)
  );
};

export const AvailabilitySettingsSection = () => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [availability, setAvailability] = useState(
    generateRandomAvailability(dateEntries.length, fullDayAmTimeSlots.length + fullDayPmTimeSlots.length)
  );

  const toggleAvailability = (dateIndex: number, timeIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dateIndex][timeIndex] = !newAvailability[dateIndex][timeIndex];
    setAvailability(newAvailability);
  };

  return (
    <div className="flex w-full items-start justify-between rounded-xl overflow-hidden">
      <aside className="flex flex-col w-[215px] items-start">
        <header className="flex h-[54px] items-center gap-4 pl-4 pr-3 py-1 w-full bg-white">
          <div className="flex items-center gap-2 flex-1">
            <div className="[font-family:'Helvetica-Bold',Helvetica] font-normal text-black text-sm text-center leading-[normal]">
              <span className="font-bold tracking-[-0.04px]">August</span>
              <span className="[font-family:'Montserrat',Helvetica] font-bold tracking-[0]">
                &nbsp;
              </span>
              <span className="[font-family:'Montserrat',Helvetica] font-medium tracking-[0]">
                25
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

              {/* Replaced the image with an SVG icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3.5V12.5M3.5 8H12.5"
                  stroke="#1A97A4"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </header>

        <nav className="w-full">
          {dateEntries.map((entry, index) => (
            <button
              key={index}
              className={cn(
                `flex items-center gap-4 px-4 py-1 w-full ${entry.bgColor} hover:bg-[#d4f1f4] transition-colors cursor-pointer`,
                selectedDate === index && "bg-[#d4f1f4]"
              )}
              onClick={() => setSelectedDate(index)}
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
                    {" "}
                    · {entry.day}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </aside>

      <ScrollArea className="flex-1 overflow-x-auto">
        <div className="relative min-w-max">
          {/* Time slots header */}
          <div className="flex flex-col h-[54px] items-start justify-center w-full z-[7] bg-white">
            <div className="inline-flex items-center">
              <div className="flex items-center px-0 py-0.5 bg-[linear-gradient(90deg,rgba(62,3,93,1)_0%,rgba(255,212,81,1)_83%)]">
                {amTimeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`flex w-[52px] items-center justify-center gap-2 ${
                      !slot.visible ? "opacity-0" : ""
                    }`}
                  >
                    <div
                      className={`mt-[-1.00px] [font-family:'Montserrat',Helvetica] font-semibold text-xs text-center tracking-[0.12px] leading-[normal] ${
                        index < 14 ? "text-white" : "text-black"
                      }`}
                    >
                      {slot.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center px-0 py-0.5 rounded-[0px_12px_12px_0px] overflow-hidden bg-[linear-gradient(90deg,rgba(255,211,81,1)_0%,rgba(178,73,65,1)_56%,rgba(62,3,93,1)_100%)]">
                {pmTimeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`flex w-[52px] items-center justify-center gap-2 ${
                      !slot.visible ? "opacity-0" : ""
                    }`}
                  >
                    <div
                      className={`mt-[-1.00px] [font-family:'Montserrat',Helvetica] font-semibold text-xs text-center tracking-[0.12px] leading-[normal] ${
                        index < 10 ? "text-black" : "text-[#e5cece]"
                      }`}
                    >
                      {slot.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center">
              <div className="inline-flex items-center px-0 py-0.5 bg-[linear-gradient(90deg,rgba(62,3,93,1)_0%,rgba(255,212,81,1)_83%)]">
                {fullDayAmTimeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex w-[52px] items-center justify-center gap-2"
                  >
                    <div
                      className={`mt-[-1.00px] [font-family:'Montserrat',Helvetica] font-semibold text-xs text-center tracking-[0.12px] leading-[normal] ${
                        index < 14 ? "text-white" : "text-black"
                      }`}
                    >
                      {slot.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center px-0 py-0.5 rounded-[0px_12px_12px_0px] overflow-hidden bg-[linear-gradient(90deg,rgba(255,211,81,1)_0%,rgba(178,73,65,1)_56%,rgba(62,3,93,1)_100%)]">
                {fullDayPmTimeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex w-[52px] items-center justify-center gap-2"
                  >
                    <div
                      className={`mt-[-1.00px] [font-family:'Montserrat',Helvetica] font-semibold text-xs text-center tracking-[0.12px] leading-[normal] ${
                        index < 10 ? "text-black" : "text-[#e5cece]"
                      }`}
                    >
                      {slot.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Availability grid - replaced the images with actual components */}
          <div className="relative">
            {dateEntries.map((date, dateIndex) => (
              <div
                key={dateIndex}
                className={cn(
                  "flex h-[54px] items-center",
                  dateIndex % 2 === 0 ? "bg-[#edf8f9]" : "bg-white"
                )}
              >
                {/* Full day availability slots */}
                {[...fullDayAmTimeSlots, ...fullDayPmTimeSlots].map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={cn(
                      "w-[52px] h-full border-r border-gray-200 flex items-center justify-center cursor-pointer transition-colors",
                      availability[dateIndex][slotIndex]
                        ? "bg-[#1a97a4]/20"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => toggleAvailability(dateIndex, slotIndex)}
                  >
                    {availability[dateIndex][slotIndex] && (
                      <div className="w-3 h-3 rounded-full bg-[#1a97a4]" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Time indicator - replaced the image with a component */}
          <div className="absolute top-[126px] left-[1033px] w-[69px] h-[37px] z-[8] pointer-events-none">
            <div className="w-full h-full bg-[#1a97a4]/20 rounded-md flex items-center justify-center">
              <div className="[font-family:'Roboto',Helvetica] font-medium text-black text-xs tracking-[0] leading-6 whitespace-nowrap">
                11:00 AM
              </div>
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};