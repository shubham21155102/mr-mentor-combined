import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRightIcon } from 'lucide-react';
import React from 'react'

type Props = {
    slotOverviewData: {
        title: string;
        count: number;
        status: string;
        lineColor: string;
        description: string;
    }[];
}

const SlotOverView = (props: Props) => {
    const { slotOverviewData } = props;
  return (
    <section className="mx-auto max-w-[1424px] px-4 sm:px-6 mt-12 sm:mt-[112px]">
        <h2 className="text-center [font-family:'Inter',Helvetica] font-bold text-black text-2xl sm:text-3xl lg:text-[40px] tracking-[-0.48px] sm:tracking-[-0.64px] lg:tracking-[-0.80px] leading-[normal] whitespace-nowrap">
          Your Slot Overview
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mt-8 sm:mt-[42px]">
          {slotOverviewData.map((slot, index) => (
            <Card
              key={index}
              className="flex-col items-start gap-[19px] p-4 sm:p-6 flex-1 rounded-3xl bg-[linear-gradient(180deg,rgba(163,255,229,1)_0%,rgba(255,245,136,1)_79%)] border-none shadow-none"
            >
              <CardContent className="p-0 w-full">
                <div className="flex flex-col items-start gap-[18px] w-full">
                  <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#3f3f3f] text-lg sm:text-2xl tracking-[-0.36px] sm:tracking-[-0.48px] leading-[normal]">
                    {slot.title}
                  </div>

                  <div className="flex items-center justify-between w-full">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#1a97a4] text-4xl sm:text-[64px] tracking-[-0.8px] sm:tracking-[-1.28px] leading-[normal]">
                      {slot.count}
                    </div>

                    <div className="relative w-fit [font-family:'Inter',Helvetica] font-bold text-[#030303] text-lg sm:text-2xl text-right tracking-[-0.36px] sm:tracking-[-0.48px] leading-[normal]">
                      {slot.status}
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-px mt-[19px]">
                  <img
                    className="absolute top-[-5px] -left-6 w-full sm:w-[454px] h-[5px]"
                    alt="Line"
                    src={slot.lineColor}
                  />
                </div>

                <div className="flex flex-col items-start gap-2 w-full mt-[19px]">
                  <div className="flex items-center gap-[50px] w-full">
                    <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-black text-base sm:text-lg tracking-[-0.32px] sm:tracking-[-0.36px] leading-[normal]">
                      {slot.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:mt-[30px]">
          <Button className="h-auto inline-flex items-center justify-center gap-2 px-[90px] py-3 bg-dominant-color rounded-[30px] shadow-[0px_3.87px_19.35px_#1a97a44c] hover:bg-dominant-color/90 transition-colors text-white bg-[#1A97A4] w-60">
            <span className="relative w-fit mt-[-0.97px] [font-family:'Roboto',Helvetica] font-medium text-white-bg text-base tracking-[0] leading-6 whitespace-nowrap">
              Release Slot
            </span>

            <ArrowUpRightIcon className="relative w-6 h-6" />
          </Button>
        </div>
      </section>
  )
}

export default SlotOverView