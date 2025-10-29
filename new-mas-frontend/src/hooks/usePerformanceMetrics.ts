"use client"
import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
}

export const usePerformanceMetrics = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const startTime = performance.now()
    const startMemory = (performance as any).memory?.usedJSHeapSize

    const measurePerformance = () => {
      const endTime = performance.now()
      const endMemory = (performance as any).memory?.usedJSHeapSize
      
      const loadTime = endTime - startTime
      const renderTime = performance.now() - startTime
      
      setMetrics({
        loadTime,
        renderTime,
        memoryUsage: endMemory ? endMemory - startMemory : undefined,
      })
      
      setIsLoading(false)
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance metrics for ${componentName}:`, {
          loadTime: `${loadTime.toFixed(2)}ms`,
          renderTime: `${renderTime.toFixed(2)}ms`,
          memoryUsage: endMemory ? `${((endMemory - startMemory) / 1024 / 1024).toFixed(2)}MB` : 'N/A',
        })
      }
    }

    // Measure after component mount
    const timeoutId = setTimeout(measurePerformance, 0)

    return () => clearTimeout(timeoutId)
  }, [componentName])

  return { metrics, isLoading }
}

export default usePerformanceMetrics
