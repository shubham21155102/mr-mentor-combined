"use client"
import React, { Suspense } from 'react'
import LoadingSpinner from './LoadingSpinner'
import ErrorBoundary from './ErrorBoundary'

interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ReactNode
  className?: string
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback,
  errorFallback,
  className = ''
}) => {
  const defaultFallback = (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <LoadingSpinner size="lg" />
    </div>
  )

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export default LazyWrapper
