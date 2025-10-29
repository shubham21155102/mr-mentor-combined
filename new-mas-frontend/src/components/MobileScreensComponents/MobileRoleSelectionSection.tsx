// MobileRoleSelectionSection.tsx
import { content } from '@/app/data/content'
import React from 'react'

type Props = {
  activeCategory: keyof typeof content;
  activeRole: string | null;
  onCategoryChange: (category: keyof typeof content) => void;
  onRoleChange: (role: string) => void;
}

const MobileRoleSelectionSection = ({ activeCategory, activeRole, onCategoryChange, onRoleChange }: Props) => {
  return (
    <div className="w-full px-4 py-6">
      {/* Main heading */}
      <h2 className="text-xl font-bold text-black leading-tight text-center mb-6">
        Your Role, Your Future — Choose Where You Belong
      </h2>

      {/* Mobile Categories - Horizontal Scroll */}
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Object.keys(content).map((category) => (
            <button
              key={category}
              onClick={() => {
                onCategoryChange(category as keyof typeof content);
                // Set first role as active when category changes
                const firstRole = content[category as keyof typeof content][0]?.title;
                if (firstRole) onRoleChange(firstRole);
              }}
              className={`text-sm font-medium py-2 px-4 rounded-full whitespace-nowrap transition-all duration-200 ${
                activeCategory === category
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {category.replace(/&/g, " & ")}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Role Badges - Grid Layout */}
      <div className="grid grid-cols-2 gap-3">
        {content[activeCategory].map((item, index) => (
          <button
            key={`mobile-badge-${index}-${item.title}`}
            onClick={() => onRoleChange(item.title)}
            className={`h-12 flex items-center justify-center px-3 py-2 rounded-2xl transition-all duration-200 ${
              activeRole === item.title
                ? "bg-teal-600 border-2 border-teal-500 shadow-lg"
                : "bg-white shadow-md hover:bg-gray-50"
            }`}
          >
            <span
              className={`font-medium text-xs text-center leading-tight ${
                activeRole === item.title ? "text-white" : "text-black"
              }`}
            >
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MobileRoleSelectionSection
