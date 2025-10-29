"use client";
import React, { JSX, useState } from "react";
import { Inter } from "next/font/google";
import { Star, CalendarClock } from "lucide-react";
const inter = Inter({ subsets: ["latin"] });
const text_3 = 'What makes our mock interviews truly work for you?'
const ActionableFeedBackLogo = (): JSX.Element => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 25 24" fill="none">
            <mask id="mask0_458_5473" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="30" height="30">
                <rect x="0.664062" width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_458_5473)">
                <path d="M6.66406 18L3.51406 21.15C3.3474 21.3167 3.16406 21.3583 2.96406 21.275C2.76406 21.1917 2.66406 21.0333 2.66406 20.8V4C2.66406 3.45 2.8599 2.97917 3.25156 2.5875C3.64323 2.19583 4.11406 2 4.66406 2H20.6641C21.2141 2 21.6849 2.19583 22.0766 2.5875C22.4682 2.97917 22.6641 3.45 22.6641 4V16C22.6641 16.55 22.4682 17.0208 22.0766 17.4125C21.6849 17.8042 21.2141 18 20.6641 18H6.66406ZM12.6641 12.475L14.5641 13.625C14.7474 13.7417 14.9307 13.7375 15.1141 13.6125C15.2974 13.4875 15.3641 13.3167 15.3141 13.1L14.8141 10.925L16.5141 9.45C16.6807 9.3 16.7307 9.12083 16.6641 8.9125C16.5974 8.70417 16.4474 8.59167 16.2141 8.575L13.9891 8.4L13.1141 6.35C13.0307 6.15 12.8807 6.05 12.6641 6.05C12.4474 6.05 12.2974 6.15 12.2141 6.35L11.3391 8.4L9.11406 8.575C8.88073 8.59167 8.73073 8.70417 8.66406 8.9125C8.5974 9.12083 8.6474 9.3 8.81406 9.45L10.5141 10.925L10.0141 13.1C9.96406 13.3167 10.0307 13.4875 10.2141 13.6125C10.3974 13.7375 10.5807 13.7417 10.7641 13.625L12.6641 12.475Z" fill="#6735FF" />
            </g>
        </svg>
    )
}

const FeatureHighlights = (): JSX.Element => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const items = [
        {
            icon: <Star fill="#FFD700" className="text-[#FFD700] w-8 h-8 sm:w-10 sm:h-10" />,
            text: "Experienced Mentors",
            description:
                "Get guidance from seasoned professionals who've been where you are. Our mentors help you build clarity, confidence, and real-world interview skills.",
        },
        {
            icon: <CalendarClock className="w-8 h-8 sm:w-10 sm:h-10" color="#9FFFF2" />,
            text: "Flexible Scheduling",
            description:
                "Book your mock interviews or mentoring sessions at times that suit your schedule — no back-and-forth, just instant booking.",
        },
        {
            icon: <ActionableFeedBackLogo />,
            text: "Actionable Feedback",
            description:
                "Get clear, structured feedback after each session — so you know exactly what to improve and how to grow with every attempt.",
        },
    ];

    return (
        <div className="mt-8 sm:mt-16 lg:mt-30 bg-black/40 mb-8 sm:mb-20 lg:mb-40 px-4">
            <div className="flex flex-col mb-5 max-w-7xl mx-auto">
                {/* Heading */}
                <div className="justify-center items-center text-center mx-auto pt-2 pb-4 sm:pb-6 text-white text-xl sm:text-2xl font-semibold tracking-tight">
                    {text_3}
                </div>

                {/* Items container - responsive layout */}
                <div className={`${inter.className} pb-5`}>
                    <div className="flex flex-col space-y-4 sm:hidden">
                        {items.map((item, index) => (
                            <button
                                type="button"
                                key={item.text}
                                className="relative w-full border-none bg-transparent p-0"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onFocus={() => setHoveredIndex(index)}
                                onBlur={() => setHoveredIndex(null)}
                                onTouchStart={() => setHoveredIndex(hoveredIndex === index ? null : index)}
                            >
                                {/* Base item */}
                                <div className="flex flex-row items-center justify-start gap-3 p-4 bg-[#D9D9D966] rounded-lg w-full transition-all duration-200">
                                    <div className="flex-shrink-0 flex justify-center items-center">
                                        {item.icon}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-black font-medium text-base">
                                            {item.text}
                                        </span>
                                        {/* Show description on mobile always */}
                                        <p className="text-sm text-gray-700 mt-1">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Tablet: 2 columns, then 3 for larger screens */}
                    <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 xl:gap-10">
                        {items.map((item, index) => (
                            <button
                                type="button"
                                key={item.text}
                                className="relative flex justify-center border-none bg-transparent p-0"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onFocus={() => setHoveredIndex(index)}
                                onBlur={() => setHoveredIndex(null)}
                            >
                                {/* Base item */}
                                <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[#D9D9D966] rounded-lg w-full max-w-70 transition-all duration-200 max-h-15">
                                    <div className="flex-shrink-0 flex justify-center items-center">
                                        {item.icon}
                                    </div>
                                    {/* Only show text if NOT hovered on desktop */}
                                    {hoveredIndex !== index && (
                                        <span className="transition-opacity duration-200 text-black font-medium text-sm sm:text-base lg:text-lg text-center">
                                            {item.text}
                                        </span>
                                    )}
                                </div>

                                {/* Hover card with SVG background */}
                                {hoveredIndex === index && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 sm:mb-6 z-10">
                                        <div className="relative w-72 sm:w-80" style={{ aspectRatio: '315/163' }}>
                                            {/* SVG Background */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 501 163"
                                                className="absolute inset-0 w-full h-full"
                                                preserveAspectRatio="none"
                                            >
                                                <path
                                                    d="M0.71875 24.5293C0.71875 11.2745 11.4639 0.529297 24.7188 0.529297H476.719C489.974 0.529297 500.719 11.2745 500.719 24.5293V128.529C500.719 141.784 489.997 152.529 476.742 152.529C447.333 152.529 394.65 152.529 340.219 152.529C319.718 152.529 319.434 162.529 305.219 162.529C291.003 162.529 290.79 152.529 270.219 152.529C206.768 152.529 78.0594 152.529 24.7153 152.529C11.4605 152.529 0.71875 141.784 0.71875 128.529V24.5293Z"
                                                    fill="#9EE6E9"
                                                    fillOpacity="0.94"
                                                />
                                            </svg>

                                            {/* Content overlay */}
                                            <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
                                                <div className="flex flex-row items-center gap-2 sm:gap-3">
                                                    <div className="flex-shrink-0 flex justify-center items-center">
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <p className="font-semibold text-base sm:text-lg text-[#000000]">
                                                            {item.text}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-gray-800">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FeatureHighlights;