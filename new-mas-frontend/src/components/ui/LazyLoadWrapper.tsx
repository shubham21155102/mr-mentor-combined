"use client"
import React, { ReactNode } from 'react'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import LoadingSpinner from './LoadingSpinner'

interface LazyLoadWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  })

  const defaultFallback = (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <LoadingSpinner size="md" />
    </div>
  )

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : (fallback || defaultFallback)}
    </div>
  )
}

export default LazyLoadWrapper
