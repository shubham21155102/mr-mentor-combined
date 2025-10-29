"use client"
import React, { useState } from 'react'
import { SlidersHorizontal, X, Search, ChevronDown, Check } from 'lucide-react'

interface FilterComponentProps {
  selectedCompanies: string[];
  setSelectedCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  selectedExpertise: string[];
  setSelectedExpertise: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSlots: string[];
  setSelectedSlots: React.Dispatch<React.SetStateAction<string[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  clearAllFilters: () => void;
  resultCount: number;
  // sorting
  sortBy?: string;
  setSortBy?: React.Dispatch<React.SetStateAction<string>>;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  selectedCompanies,
  setSelectedCompanies,
  selectedExpertise,
  setSelectedExpertise,
  selectedSlots,
  setSelectedSlots,
  searchQuery,
  setSearchQuery,
  clearAllFilters,
  resultCount,
  sortBy,
  setSortBy
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(true);
  const [expertiseOpen, setExpertiseOpen] = useState(false)
  const [slotsOpen, setSlotsOpen] = useState(false)

  const companies = ['Microsoft', 'Google', 'Zomato', 'TCS', 'Oracle']
  const expertiseOptions = ['Data Science', 'Software Engineering', 'Product Management', 'UX Design', 'Marketing']
  const slotsOptions = ['Available Now', 'This Week', 'Next Week']

  const sortOptions = ['','Active Slots','Alphabetical','Experience','Ratings','Total meets']

  const toggleCompany = (company: string) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    )
  }

  const toggleExpertise = (expertise: string) => {
    setSelectedExpertise(prev =>
      prev.includes(expertise)
        ? prev.filter(exp => exp !== expertise)
        : [...prev, expertise]
    );
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <span className="text-gray-500 text-lg tracking-wide">All Filter</span>
        <SlidersHorizontal className="h-6 w-6 text-gray-500" />
      </button>

      {/* Slide-out Filter Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Transparent Backdrop - covers the left side */}
          <div
            className="absolute left-0 top-0 h-full w-[calc(100%-535px)] bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Filter Panel */}
          <div className="absolute right-0 top-0 h-full w-[535px] bg-white shadow-[-4px_0px_24px_2px_rgba(0,0,0,0.25)] transform transition-transform duration-300 ease-in-out z-[60]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 tracking-wide">All Filter</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Expert Search */}
              <div className="relative">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)]">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-gray-500 text-lg tracking-wide w-full outline-none"
                  />
                  <Search className="h-6 w-6 text-gray-500" />
                </div>
              </div>

              {/* Current Company Dropdown */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)] relative z-20">
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setCompanyOpen(!companyOpen)}>
                  <span className="text-gray-500 text-lg tracking-wide">Current Company</span>
                  <ChevronDown className={`h-6 w-6 text-gray-500 transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
                </div>

                {companyOpen && (
                  <div className="px-2 pb-2 relative z-10">
                    {companies.map((company) => (
                      <div
                        key={company}
                        className="flex items-center justify-between px-2 py-3 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleCompany(company)}
                      >
                        <span className="text-black text-base">{company}</span>
                        <div className="h-6 w-6 flex items-center justify-center">
                          {selectedCompanies.includes(company) ? (
                            <Check className="h-5 w-5 text-[#1a97a4]" />
                          ) : (
                            <div className="h-5 w-5 border border-gray-300 rounded" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expertise Dropdown */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)] relative z-20">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpertiseOpen(!expertiseOpen)}
                >
                  <span className="text-gray-500 text-lg tracking-wide">Expertise</span>
                  <ChevronDown className={`h-6 w-6 text-gray-500 transition-transform ${expertiseOpen ? 'rotate-180' : ''}`} />
                </div>
                {expertiseOpen && (
                  <div className="px-2 pb-2 relative z-10">
                    {expertiseOptions.map((expertise) => (
                      <div
                        key={expertise}
                        className="flex items-center justify-between px-2 py-3 rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpertise(expertise)}
                      >
                        <span className="text-black text-base">{expertise}</span>
                        <div className="h-6 w-6 flex items-center justify-center">
                          {selectedExpertise.includes(expertise) ? (
                            <Check className="h-5 w-5 text-[#1a97a4]" />
                          ) : (
                            <div className="h-5 w-5 border border-gray-300 rounded" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slots Availability Dropdown */}
              <div className="relative z-20">
                <div
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)] cursor-pointer"
                  onClick={() => setSlotsOpen(!slotsOpen)}
                >
                  <span className="text-gray-500 text-lg tracking-wide">Slots Availability</span>
                  <ChevronDown className={`h-6 w-6 text-gray-500 transition-transform ${slotsOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)] relative z-20">
                <div className="flex items-center justify-between p-4">
                  <span className="text-gray-500 text-lg tracking-wide">Sort By</span>
                </div>
                <div className="px-2 pb-2 relative z-10">
                  {sortOptions.map((opt) => (
                    <div
                      key={opt}
                      className={`flex items-center justify-between px-2 py-3 rounded hover:bg-gray-50 cursor-pointer ${sortBy === opt ? 'bg-[#e6fffe]' : ''}`}
                      onClick={() => setSortBy && setSortBy(opt)}
                    >
                      <span className="text-black text-base">{opt === '' ? 'None' : opt}</span>
                      <div className="h-6 w-6 flex items-center justify-center">
                        {sortBy === opt ? (
                          <Check className="h-5 w-5 text-[#1a97a4]" />
                        ) : (
                          <div className="h-5 w-5 border border-gray-300 rounded" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-[#1a97a4] text-white px-5 py-2 rounded-full flex items-center justify-center gap-2 hover:bg-[#168a96] transition-colors"
                >
                  <span className="text-base font-medium">View</span>
                  <span className="text-base font-light">{resultCount}</span>
                </button>
                <button
                  onClick={clearAllFilters}
                  className="flex-1 bg-gray-300 text-gray-500 px-5 py-2 rounded-full hover:bg-gray-400 transition-colors"
                >
                  <span className="text-base font-medium">Clear All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FilterComponent