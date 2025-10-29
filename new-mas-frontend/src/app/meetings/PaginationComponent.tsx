import React from 'react'

type Props = {
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

const PaginationComponent = ({ currentPage = 1, totalPages = 0, onPageChange = () => {}, totalItems, itemsPerPage }: Props) => {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  // Generate page numbers to show
  const getVisiblePages = () => {
    const pages = []
    const maxVisiblePages = 3

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage === 1) {
        pages.push(1, 2, 3)
      } else if (currentPage === totalPages) {
        pages.push(totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1)
      }
    }

    return pages.filter(page => page >= 1 && page <= totalPages)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="bg-white border-t border-[#ebebeb] p-4">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`text-xs font-medium transition-colors ${
            currentPage === 1 ? 'text-[#d5d5d5] cursor-not-allowed' : 'text-[#666666] hover:text-black'
          }`}
        >
          Previous
        </button>

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
              page === currentPage
                ? 'bg-[#1a97a4] text-white'
                : 'bg-[#e0e0e0] text-black hover:bg-[#d5d5d5]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`text-xs font-medium transition-colors ${
            currentPage === totalPages ? 'text-[#999999] cursor-not-allowed' : 'text-black hover:text-[#666666]'
          }`}
        >
          Next
        </button>

        {totalItems && itemsPerPage && (
          <span className="ml-4 text-xs text-gray-500">
            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </span>
        )}
      </div>
    </div>
  )
}

export default PaginationComponent