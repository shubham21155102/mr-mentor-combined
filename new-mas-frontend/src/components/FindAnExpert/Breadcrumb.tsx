import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const Breadcrumb = () => {
  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        <Link 
          href="/" 
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <span className="text-gray-900 font-medium">Find an experts</span>
      </div>
    </nav>
  )
}

export default Breadcrumb
