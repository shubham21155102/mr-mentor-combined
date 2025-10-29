"use client"
import React, { useEffect, useState, useCallback } from 'react'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/FindAnExpert/Breadcrumb'
import MentorCard from '@/components/FindAnExpert/MentorCard'
import FilterComponent from '@/components/FindAnExpert/FilterComponent'
import PaginationComponent from '@/components/FindAnExpert/PaginationComponent'
import { fetchMentorsPaginated } from '@/app/mentor-actions'
import ConditionalNavBar from '@/components/ConditionalNavBar'

const FindAnExpert = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('');

  const fetchMentors = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const sortMapping: { [key: string]: string } = {
        'Active Slots': 'slots',
        'Alphabetical': 'alphabetical',
        'Experience': 'experience',
        'Ratings': 'rating',
        'Total meets': 'meets'
      };

      const response = await fetchMentorsPaginated(
        page,
        9,
        searchQuery,
        selectedCompanies,
        selectedExpertise,
        sortMapping[sortBy]
      );

      console.log('API Response:', response); // Debug log
      setMentors(response.mentors || []);

      // Map API response fields to component state
      const apiPagination = response.pagination || {};
      setPagination({
        currentPage: apiPagination.page || 1,
        totalPages: apiPagination.totalPages || 1,
        total: apiPagination.total || 0,
        hasNextPage: apiPagination.hasNextPage || false,
        hasPrevPage: apiPagination.hasPrevPage || false
      });
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCompanies, selectedExpertise, sortBy]);

  useEffect(() => {
    fetchMentors(1);
  }, [fetchMentors]);

  const handlePageChange = (page: number) => {
    console.log('Page change requested to:', page); // Debug log
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMentors(page);
    } else {
      console.warn('Invalid page number:', page);
    }
  };

  const clearAllFilters = () => {
    setSelectedCompanies([]);
    setSelectedExpertise([]);
    setSearchQuery('');
    setSortBy('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConditionalNavBar/>

      {/* Breadcrumb Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumb />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative">
        {/* Header with Results Count and Filter */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {loading ? 'Loading...' : `${pagination.total} Results`}
          </h1>
          <FilterComponent
            selectedCompanies={selectedCompanies}
            setSelectedCompanies={setSelectedCompanies}
            selectedExpertise={selectedExpertise}
            setSelectedExpertise={setSelectedExpertise}
            selectedSlots={selectedSlots}
            setSelectedSlots={setSelectedSlots}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            clearAllFilters={clearAllFilters}
            resultCount={pagination.total}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* Divider */}
        <div className="border-b border-gray-200 mb-8"></div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))
          ) : (
            mentors.map((mentor: any) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && mentors.length > 0 && (
          <PaginationComponent
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
          />
        )}
      </div>

      <Footer />
    </div>
  )
}

export default FindAnExpert