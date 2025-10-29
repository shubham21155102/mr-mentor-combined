import { ArrowLeftIcon, XIcon } from "lucide-react";
import React, { JSX } from "react";
import { Button } from "@/components/ui/button"; 
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvailabilitySettingsSection } from "./AvailabilitySettingsSection"; 
import { TimeSlotSelectionSection } from "./TimeSlotSelectionSection";

const legendItems = [
  {
    label: "Booked",
    color:
      "bg-[linear-gradient(180deg,rgba(253,217,101,1)_0%,rgba(86,232,247,1)_100%)]",
  },
  { label: "Not available", color: "bg-[#aee0e5]" },
  { label: "Available", color: "bg-[#1a97a4]" },
];

const timezoneOptions = [
  { city: "New Delhi", offset: "GMT+5:30" },
  { city: "New Delhi", offset: "GMT+5:30" },
  { city: "New Delhi", offset: "GMT+5:30" },
];

const SlotsAvailability = (): JSX.Element => {
  return (
    <div className="relative w-full max-w-[1420px] min-h-[793px] rounded-3xl overflow-hidden bg-[linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%),linear-gradient(to_bottom_right,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_bottom_right_/_50%_50%_no-repeat,linear-gradient(to_bottom_left,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_bottom_left_/_50%_50%_no-repeat,linear-gradient(to_top_left,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_top_left_/_50%_50%_no-repeat,linear-gradient(to_top_right,rgba(15,145,159,0.5)_0%,rgba(18,58,83,0.5)_50%)_top_right_/_50%_50%_no-repeat]">
      <header className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 flex items-center justify-center">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="[font-family:'Roboto',Helvetica] font-semibold text-black text-[32px] tracking-[0.50px] leading-[44px]">
            Slots Availability
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 border-r-[0.33px] border-l-[0.33px] border-[#d0d0d0] ${item.color}`}
              />
              <span
                className={`text-xs leading-[18px] [font-family:'Inter',Helvetica] font-normal tracking-[0.50px] ${item.label === "Available" ? "text-[#1a97a4]" : "text-[#909090]"}`}
              >
                {item.label}
              </span>
            </div>
          ))}
          <button className="w-8 h-8 flex items-center justify-center">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex flex-col px-6 pb-6">
        <AvailabilitySettingsSection />

        <TimeSlotSelectionSection />

        <div className="flex items-center gap-3 mt-6">
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
          <Button className="w-[330px] h-auto px-[31.97px] py-[11.99px] bg-dominant-color rounded-[26.98px] [font-family:'Roboto',Helvetica] font-semibold text-white text-xl tracking-[0] leading-[28.0px]">
            Update Slots
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SlotsAvailability;