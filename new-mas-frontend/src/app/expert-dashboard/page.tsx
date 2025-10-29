"use client"
import {
  ArrowUpRightIcon
} from "lucide-react";
import React, { JSX } from "react";
import { Button } from "../../components/ui/button";
import SlotsAvailability from "./SlotsAvailability";
import SlotOverView from "./SlotOverView";
import ConditionalNavBar from "@/components/ConditionalNavBar";
import Footer from "@/components/Footer";
import EarningBoard from "./EarningBoard";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { MarkSlotsAvailable } from "./MarkSlotsAvailable";

const slotOverviewData = [
  {
    title: "AVAILABLE SLOTS",
    count: 5,
    status: "Open",
    description: "Opened for booking",
    lineColor: "https://c.animaapp.com/mglbo6qyzUe2Ig/img/line-327.svg",
  },
  {
    title: "BOOKED SLOTS",
    count: 3,
    status: "Sessions",
    description: "Confirmed with user",
    lineColor: "https://c.animaapp.com/mglbo6qyzUe2Ig/img/line-328-1.svg",
  },
  {
    title: "PENDING APPROVALS",
    count: 1,
    status: "Request",
    description: "Awaiting Afirmaton",
    lineColor: "https://c.animaapp.com/mglbo6qyzUe2Ig/img/line-328.svg",
  },
];

const Option = (): JSX.Element => {

    const { user } = useUser();
    const router = useRouter();
  return (
    <div className="relative min-h-screen bg-[#eefdff]">
      <ConditionalNavBar/>

      <section className="mx-auto max-w-[1424px] px-4 sm:px-6 mt-12 sm:mt-[168px]">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1">
            <h1 className="[font-family:'Inter',Helvetica] font-semibold text-neutral-950 text-3xl sm:text-5xl lg:text-[64px] tracking-[-0.64px] sm:tracking-[-1px] lg:tracking-[-1.28px] leading-[36px] sm:leading-[60px] lg:leading-[72px] [text-shadow:0px_0px_9.5px_#17008040]">
              Welcome back, <br />
              {user?.fullName} !
            </h1>

            <p className="mt-4 sm:mt-[18px] w-full sm:w-[489px] [text-shadow:0px_0px_9.5px_#17008040] [font-family:'Inter',Helvetica] font-medium text-neutral-950 text-lg sm:text-2xl tracking-[-0.36px] sm:tracking-[-0.48px] leading-[normal]">
              Your knowledge changes lives. <br />
              Let&apos;s guide the next student today
            </p>
          </div>
          {/* <Calender daysData={daysData} /> */}
          <SlotsAvailability />
        </div>
      </section>

      <SlotOverView slotOverviewData={slotOverviewData} />

      {/* Mark Available Slots Section */}
      <section className="mx-auto max-w-[1424px] px-4 sm:px-6">
        <MarkSlotsAvailable />
      </section>

      <section className="relative mx-auto max-w-[1424px] px-4 sm:px-6 mt-12 sm:mt-[113px]">
        <img
          className="absolute top-0 left-0 w-[100px] sm:w-[154px] h-[100px] sm:h-[148px]"
          alt="Icon"
          src="https://c.animaapp.com/mglbo6qyzUe2Ig/img/icon-5.svg"
        />

        <img
          className="absolute bottom-0 right-0 w-[100px] sm:w-[154px] h-[100px] sm:h-[148px]"
          alt="Icon"
          src="https://c.animaapp.com/mglbo6qyzUe2Ig/img/icon-5.svg"
        />

        <div className="relative z-10 text-center max-w-[894px] mx-auto py-20 sm:py-[173px] [font-family:'Inter',Helvetica] font-semibold text-black text-2xl sm:text-4xl lg:text-5xl tracking-[-0.48px] sm:tracking-[-0.8px] lg:tracking-[-0.96px] leading-[normal]">
          &quot;The influence of a good mentor can never be erased&quot;
        </div>
      </section>

      <section className="mx-auto max-w-[1424px] px-4 sm:px-6 mt-12 sm:mt-[20px]">
        <div className="relative rounded-[20px] sm:rounded-[36px] overflow-hidden bg-[linear-gradient(62deg,rgba(36,95,185,1)_61%)] h-[300px] sm:h-[380px]">
          <img
            className="absolute top-0 left-0 w-full h-full object-cover"
            alt="Group"
            src="https://c.animaapp.com/mglbo6qyzUe2Ig/img/group-48095468.png"
          />

          <div className="absolute top-0 left-0 w-full h-full bg-[#ffffff03] backdrop-blur-sm backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(4px)_brightness(100%)]" />

          <div className="relative z-10 px-6 sm:px-12 py-8 sm:py-12">
            <h2 className="[font-family:'Inter',Helvetica] font-semibold italic text-white text-xl sm:text-2xl lg:text-[40px] tracking-[-0.4px] sm:tracking-[-0.48px] lg:tracking-[-0.80px] leading-[normal] whitespace-nowrap">
              Curious About Your Earnings?
            </h2>

            <p className="mt-4 max-w-full sm:max-w-[740px] [text-shadow:0px_0px_9.5px_#17008040] [font-family:'Inter',Helvetica] font-light text-white text-base sm:text-xl lg:text-2xl tracking-[-0.32px] sm:tracking-[-0.40px] lg:tracking-[-0.48px] leading-[normal]">
              Discover how your experience, ratings, and expertise multiply your
              base pay. Our dynamic calculator shows you the exact breakdown.
            </p>

            <Button className="h-auto inline-flex items-center justify-center gap-2 px-8 sm:px-20 py-4 sm:py-6 mt-6 sm:mt-8 bg-dominant-color rounded-[30px] shadow-[0px_0px_48px_#00000040] hover:bg-dominant-color/90 transition-colors cursor-pointer"
            onClick={() => router.push('/mentor-multiplier')}
            >
              <span className="relative w-fit mt-[-0.97px] [font-family:'Roboto',Helvetica] font-medium text-white-bg text-base sm:text-xl tracking-[0] leading-6 whitespace-nowrap">
                Explore Your Payout Calculator
              </span>

              <ArrowUpRightIcon className="relative w-6 h-6" />
            </Button>
          </div>

          <EarningBoard/>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Option;