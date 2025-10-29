import { InfoIcon } from "lucide-react";
import React, { JSX } from "react";

export const TimeSlotSelectionSection = (): JSX.Element => {
  return (
    <section className="flex w-full items-center justify-center gap-4 px-4 py-1 bg-[#fdf1dd]">
      <InfoIcon className="w-6 h-6 text-[#a97635]" />

      <p className="[font-family:'Montserrat',Helvetica] font-normal text-[#a97635] text-xs text-center tracking-[0.12px] leading-[normal]">
        <span className="font-medium tracking-[0.01px]">
          Creating meet using
        </span>
        <span className="font-bold tracking-[0.01px]">&nbsp;</span>
        <span className="font-semibold tracking-[0.01px]">
          &quot;abc0123@gmail.com&quot;
        </span>
      </p>
    </section>
  );
};
