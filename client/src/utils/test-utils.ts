import { useEffect } from 'react';
import { usePerformance } from '@/hooks/use-performance';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * Comprehensive testing utility for automated testing and quality assurance
 * This utility helps identify and fix common issues across browsers and devices
 */

// Browser compatibility detection
export function detectBrowserCompatibility() {
  const compatibilityIssues: string[] = [];
  
  // Check for modern JavaScript features
  if (!window.Promise || !window.fetch) {
    compatibilityIssues.push('Missing core JavaScript features (Promise/fetch)');
  }
  
  // Check for modern CSS features
  const testEl = document.createElement('div');
  if (typeof testEl.style.gridArea === 'undefined') {
    compatibilityIssues.push('Missing CSS Grid support');
  }
  
  if (typeof testEl.style.flexDirection === 'undefined') {
    compatibilityIssues.push('Missing Flexbox support');
  }
  
  // Check for WebSocket support
  if (!window.WebSocket) {
    compatibilityIssues.push('Missing WebSocket support');
  }
  
  // Check for localStorage support
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    compatibilityIssues.push('LocalStorage not available');
  }
  
  return {
    browser: navigator.userAgent,
    compatibilityIssues,
    isFullyCompatible: compatibilityIssues.length === 0
  };
}

// Accessibility testing
export function checkAccessibility(rootElement: HTMLElement = document.body) {
  const accessibilityIssues: string[] = [];
  
  // Check for missing alt attributes on images
  const images = rootElement.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      accessibilityIssues.push(`Image missing alt text: ${img.src}`);
    }
  });
  
  // Check for proper heading hierarchy
  const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastHeadingLevel = 0;
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastHeadingLevel + 1 && lastHeadingLevel !== 0) {
      accessibilityIssues.push(`Improper heading hierarchy: ${heading.tagName} follows h${lastHeadingLevel}`);
    }
    lastHeadingLevel = level;
  });
  
  // Check for missing form labels
  const formInputs = rootElement.querySelectorAll('input, textarea, select');
  formInputs.forEach(input => {
    const hasLabel = input.hasAttribute('aria-label') || 
                    input.hasAttribute('aria-labelledby') || 
                    document.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel && input.type !== 'hidden') {
      accessibilityIssues.push(`Form control missing label: ${input.id || input.name || 'unnamed input'}`);
    }
  });
  
  // Check for sufficient color contrast (simplified)
  // A full implementation would use color contrast algorithms
  
  return {
    accessibilityIssues,
    isFullyAccessible: accessibilityIssues.length === 0
  };
}

// Performance testing
export function usePerformanceTesting() {
  const { 
    metrics, 
    measureComponentRender, 
    logPerformanceMetrics 
  } = usePerformance();
  
  useEffect(() => {
    // Log initial performance metrics
    const timeoutId = setTimeout(() => {
      logPerformanceMetrics();
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [logPerformanceMetrics]);
  
  // Check for performance issues
  const performanceIssues = [];
  
  if (metrics.pageLoadTime && metrics.pageLoadTime > 3000) {
    performanceIssues.push(`Slow page load time: ${metrics.pageLoadTime}ms (target: <3000ms)`);
  }
  
  if (metrics.firstContentfulPaint && metrics.firstContentfulPaint > 1500) {
    performanceIssues.push(`Slow first contentful paint: ${metrics.firstContentfulPaint}ms (target: <1500ms)`);
  }
  
  // Check component render times
  Object.entries(metrics.componentRenderTime).forEach(([component, time]) => {
    if (time > 100) {
      performanceIssues.push(`Slow component render: ${component} (${time}ms)`);
    }
  });
  
  return {
    metrics,
    measureComponentRender,
    performanceIssues,
    isPerformanceOptimal: performanceIssues.length === 0
  };
}

// Security testing
export function checkSecurity() {
  const securityIssues: string[] = [];
  
  // Check if site is served over HTTPS
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    securityIssues.push('Site not served over HTTPS');
  }
  
  // Check for Content Security Policy
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    securityIssues.push('No Content Security Policy meta tag found');
  }
  
  // Check localStorage for sensitive data
  const sensitiveKeys = ['password', 'token', 'secret', 'credit', 'card'];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      securityIssues.push(`Potentially sensitive data stored in localStorage: ${key}`);
    }
  }
  
  return {
    securityIssues,
    isSecure: securityIssues.length === 0
  };
}

// Comprehensive test hook
export function useComprehensiveTesting() {
  const { error, handleError } = useErrorHandler();
  const performanceTesting = usePerformanceTesting();
  
  useEffect(() => {
    // Run browser compatibility check
    const compatibility = detectBrowserCompatibility();
    if (!compatibility.isFullyCompatible) {
      console.warn('Browser compatibility issues detected:', compatibility.compatibilityIssues);
    }
    
    // Run accessibility check
    const accessibility = checkAccessibility();
    if (!accessibility.isFullyAccessible) {
      console.warn('Accessibility issues detected:', accessibility.accessibilityIssues);
    }
    
    // Run security check
    const security = checkSecurity();
    if (!security.isSecure) {
      console.warn('Security issues detected:', security.securityIssues);
    }
  }, []);
  
  return {
    error,
    handleError,
    ...performanceTesting,
    runAccessibilityCheck: () => checkAccessibility(),
    runSecurityCheck: () => checkSecurity(),
    runCompatibilityCheck: () => detectBrowserCompatibility(),
  };
}