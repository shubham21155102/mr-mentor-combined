import React from 'react'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: Props) => {
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
    <div className="flex justify-center items-center mt-6 space-x-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        Previous
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
            page === currentPage
              ? 'bg-[#1a97a4] text-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        Next
      </button>

      {totalItems && itemsPerPage && (
        <span className="ml-4 text-sm text-gray-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </span>
      )}
    </div>
  )
}

export default Pagination