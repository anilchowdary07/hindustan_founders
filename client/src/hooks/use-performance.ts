import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  // Page load metrics
  pageLoadTime: number | null;
  domContentLoaded: number | null;
  firstPaint: number | null;
  firstContentfulPaint: number | null;
  
  // Resource metrics
  resourceCount: number;
  resourceLoadTime: number;
  
  // Component metrics
  componentRenderTime: Record<string, number>;
  
  // Network metrics
  apiCallCount: number;
  apiCallTime: Record<string, number>;
  
  // Memory usage
  memoryUsage: number | null;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: null,
    domContentLoaded: null,
    firstPaint: null,
    firstContentfulPaint: null,
    resourceCount: 0,
    resourceLoadTime: 0,
    componentRenderTime: {},
    apiCallCount: 0,
    apiCallTime: {},
    memoryUsage: null,
  });
  
  const apiCallsRef = useRef<Record<string, number>>({});
  const componentRenderTimesRef = useRef<Record<string, number>>({});
  
  // Measure page load metrics
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;
    
    // Function to collect performance metrics
    const collectMetrics = () => {
      try {
        // Get navigation timing data
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigationTiming) {
          const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
          const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime;
          
          // Get paint timing data
          const paintMetrics = performance.getEntriesByType('paint');
          const firstPaint = paintMetrics.find(entry => entry.name === 'first-paint')?.startTime || null;
          const firstContentfulPaint = paintMetrics.find(entry => entry.name === 'first-contentful-paint')?.startTime || null;
          
          // Get resource timing data
          const resourceEntries = performance.getEntriesByType('resource');
          const resourceCount = resourceEntries.length;
          const resourceLoadTime = resourceEntries.reduce((total, entry) => total + entry.duration, 0);
          
          // Get memory usage if available
          const memoryUsage = (performance as any).memory?.usedJSHeapSize || null;
          
          setMetrics(prev => ({
            ...prev,
            pageLoadTime,
            domContentLoaded,
            firstPaint,
            firstContentfulPaint,
            resourceCount,
            resourceLoadTime,
            memoryUsage,
          }));
        }
      } catch (error) {
        console.error('Error collecting performance metrics:', error);
      }
    };
    
    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);
  
  // Measure component render time
  const measureComponentRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      componentRenderTimesRef.current[componentName] = renderTime;
      
      setMetrics(prev => ({
        ...prev,
        componentRenderTime: {
          ...prev.componentRenderTime,
          [componentName]: renderTime,
        },
      }));
    };
  }, []);
  
  // Measure API call time
  const measureApiCall = useCallback((url: string) => {
    const startTime = performance.now();
    apiCallsRef.current[url] = startTime;
    
    return () => {
      const endTime = performance.now();
      const callTime = endTime - apiCallsRef.current[url];
      
      setMetrics(prev => ({
        ...prev,
        apiCallCount: prev.apiCallCount + 1,
        apiCallTime: {
          ...prev.apiCallTime,
          [url]: callTime,
        },
      }));
    };
  }, []);
  
  // Get average API call time
  const getAverageApiCallTime = useCallback(() => {
    const apiCallTimes = Object.values(metrics.apiCallTime);
    if (apiCallTimes.length === 0) return 0;
    
    const totalTime = apiCallTimes.reduce((sum, time) => sum + time, 0);
    return totalTime / apiCallTimes.length;
  }, [metrics.apiCallTime]);
  
  // Log performance metrics
  const logPerformanceMetrics = useCallback(() => {
    console.group('Performance Metrics');
    console.log('Page Load Time:', metrics.pageLoadTime, 'ms');
    console.log('DOM Content Loaded:', metrics.domContentLoaded, 'ms');
    console.log('First Paint:', metrics.firstPaint, 'ms');
    console.log('First Contentful Paint:', metrics.firstContentfulPaint, 'ms');
    console.log('Resource Count:', metrics.resourceCount);
    console.log('Resource Load Time:', metrics.resourceLoadTime, 'ms');
    console.log('Component Render Times:', metrics.componentRenderTime);
    console.log('API Call Count:', metrics.apiCallCount);
    console.log('API Call Times:', metrics.apiCallTime);
    console.log('Average API Call Time:', getAverageApiCallTime(), 'ms');
    console.log('Memory Usage:', metrics.memoryUsage ? `${(metrics.memoryUsage / (1024 * 1024)).toFixed(2)} MB` : 'Not available');
    console.groupEnd();
  }, [metrics, getAverageApiCallTime]);
  
  // Send metrics to analytics server
  const sendMetricsToAnalytics = useCallback(async () => {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Error sending performance metrics to analytics:', error);
    }
  }, [metrics]);
  
  return {
    metrics,
    measureComponentRender,
    measureApiCall,
    getAverageApiCallTime,
    logPerformanceMetrics,
    sendMetricsToAnalytics,
  };
}