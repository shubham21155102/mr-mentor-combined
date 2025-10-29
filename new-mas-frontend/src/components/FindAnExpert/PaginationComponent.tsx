import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationComponentProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage: boolean
  hasPrevPage: boolean
}

const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPrevPage
}: PaginationComponentProps) => {
  const handlePrevPage = () => {
    console.log('Previous page clicked, hasPrevPage:', hasPrevPage, 'currentPage:', currentPage);
    if (hasPrevPage && currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    console.log('Next page clicked, hasNextPage:', hasNextPage, 'currentPage:', currentPage, 'totalPages:', totalPages);
    if (hasNextPage && currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="flex items-center justify-between py-6">
      {/* Previous Button */}
      <button
        onClick={handlePrevPage}
        disabled={!hasPrevPage}
        className={`flex items-center space-x-2 transition-colors ${
          hasPrevPage
            ? 'text-gray-500 hover:text-gray-700'
            : 'text-gray-300 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="text-sm font-medium">
          Go to page {hasPrevPage ? currentPage - 1 : currentPage}
        </span>
      </button>

      {/* Center - Next Button */}
      <button
        onClick={handleNextPage}
        disabled={!hasNextPage}
        className={`px-5 py-2 rounded-full flex items-center space-x-2 transition-colors ${
          hasNextPage
            ? 'bg-[#1a97a4] text-white hover:bg-[#168a96]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <span className="text-sm font-medium">Next Page</span>
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Right - Page Info */}
      <div className="flex items-center space-x-2 text-gray-500">
        <span className="text-sm font-medium">Page</span>
        <div className="border border-[#1a97a4] rounded-full px-5 py-2">
          <span className="text-sm font-medium text-gray-500">{currentPage}</span>
        </div>
        <span className="text-sm font-medium">of {totalPages}</span>
      </div>
    </div>
  )
}

export default PaginationComponent
