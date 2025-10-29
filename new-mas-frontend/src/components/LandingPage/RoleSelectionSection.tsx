// RoleSelectionSection.tsx
import { content } from '@/app/data/content'
import React from 'react'

type Props = {
  activeCategory: keyof typeof content;
  activeRole: string | null;
  onCategoryChange: (category: keyof typeof content) => void;
  onRoleChange: (role: string) => void;
}

const RoleSelectionSection = ({ activeCategory, activeRole, onCategoryChange, onRoleChange }: Props) => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start px-4 md:px-0">
      {/* Main heading */}
      <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-black leading-tight lg:leading-[48px] tracking-[-0.02em] text-center lg:text-left mb-6 md:mb-8 lg:mb-12 w-full">
        Your Role, Your Future — Choose Where You Belong
      </h2>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12 w-full">
        {/* Left side - Categories */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-3 md:gap-4 lg:gap-6">
          {Object.keys(content).map((category) => (
            <button
              key={category}
              onClick={() => {
                onCategoryChange(category as keyof typeof content);
                // Set first role as active when category changes
                const firstRole = content[category as keyof typeof content][0]?.title;
                if (firstRole) onRoleChange(firstRole);
              }}
              className={`text-lg md:text-xl lg:text-3xl text-left w-full py-2 md:py-3 transition-all my-10 duration-200 ${activeCategory === category
                ? "font-bold text-black"
                : "font-medium text-gray-400 hover:text-gray-600"
                }`}
            >
              {category.replace(/&/g, " & ")}
            </button>
          ))}
        </div>

        {/* Right side - Badges */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3 md:gap-4 lg:gap-6 items-start lg:items-end my-10">
          {content[activeCategory].map((item, index) => (
            <button
              key={`badge-${index}-${item.title}`}
              onClick={() => onRoleChange(item.title)}
              className={`w-full h-auto min-h-[48px] md:min-h-[56px] flex flex-row justify-center items-center px-4 md:px-6 py-3 md:py-4 rounded-[30px] my-2 transition-all duration-200 ${activeRole === item.title
                ? "bg-[rgba(26,151,164,0.6)] border-2 border-[rgba(12,132,145,0.25)] shadow-[0px_0px_34px_rgba(0,0,0,0.15)]"
                : "bg-white shadow-[0px_0px_34px_rgba(0,0,0,0.15)] hover:bg-gray-50"
                }`}
            >
              <span
                className={`font-normal text-base md:text-lg lg:text-2xl tracking-[-0.48px] leading-6 whitespace-nowrap ${activeRole === item.title ? "text-white" : "text-black"
                  }`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RoleSelectionSection