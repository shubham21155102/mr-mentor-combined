// Lazy loading configuration for optimal performance
export const LAZY_LOADING_CONFIG = {
  // Intersection Observer settings
  intersectionObserver: {
    defaultThreshold: 0.1,
    defaultRootMargin: '50px',
    imageThreshold: 0.1,
    imageRootMargin: '100px',
    componentThreshold: 0.2,
    componentRootMargin: '200px',
  },
  
  // Image optimization settings
  images: {
    defaultQuality: 75,
    defaultSizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    priorityImages: ['/landing_bg.svg', '/logo.png'], // Images to load with priority
  },
  
  // Component loading settings
  components: {
    criticalComponents: ['NavBar', 'ConditionalNavBar'], // Load immediately
    deferComponents: ['Footer', 'TestimonialCard'], // Can be deferred
  },
  
  // Performance thresholds
  performance: {
    slowLoadThreshold: 1000, // ms
    memoryWarningThreshold: 50, // MB
  },
}

// Utility function to determine if a component should be lazy loaded
export const shouldLazyLoad = (componentName: string): boolean => {
  return !LAZY_LOADING_CONFIG.components.criticalComponents.includes(componentName)
}

// Utility function to get optimal loading settings for a component
export const getLoadingSettings = (componentType: 'image' | 'component' | 'page') => {
  const config = LAZY_LOADING_CONFIG.intersectionObserver
  
  switch (componentType) {
    case 'image':
      return {
        threshold: config.imageThreshold,
        rootMargin: config.imageRootMargin,
      }
    case 'component':
      return {
        threshold: config.componentThreshold,
        rootMargin: config.componentRootMargin,
      }
    case 'page':
      return {
        threshold: config.defaultThreshold,
        rootMargin: config.defaultRootMargin,
      }
    default:
      return {
        threshold: config.defaultThreshold,
        rootMargin: config.defaultRootMargin,
      }
  }
}

export default LAZY_LOADING_CONFIG
