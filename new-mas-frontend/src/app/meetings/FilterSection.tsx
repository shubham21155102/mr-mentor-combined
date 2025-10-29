import { Search } from 'lucide-react'
import React from 'react'

type Props = {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const FilterSection = (props: Props) => {
    const { searchQuery, setSearchQuery } = props;
  return (
     <div className="bg-[#eefdff] p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-[503px]">
              <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-[0px_2px_13.5px_0px_rgba(26,151,164,0.25)]">
                <input
                  type="text"
                  placeholder="Mentor name / Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-[#919191] text-xl tracking-[0.5px] outline-none"
                />
                <Search className="w-6 h-6 text-[#919191]" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <div className="w-px h-5 bg-gray-300"></div>
              <span className="text-neutral-950 text-xl font-medium tracking-[0.4px]">Clear Filters</span>
            </div>
          </div>
        </div>
  )
}

export default FilterSection