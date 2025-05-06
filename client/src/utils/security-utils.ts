/**
 * Security Utilities
 * 
 * This module provides security-related utilities for protecting the application
 * against common web vulnerabilities and implementing security best practices.
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Create a new DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove potentially dangerous elements and attributes
  const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'style'];
  const dangerousAttributes = ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress'];
  
  // Remove dangerous elements
  dangerousElements.forEach(tag => {
    const elements = doc.getElementsByTagName(tag);
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].parentNode?.removeChild(elements[i]);
    }
  });
  
  // Remove dangerous attributes from all elements
  const allElements = doc.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    
    // Remove event handler attributes
    dangerousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
    
    // Remove javascript: URLs
    if (element.hasAttribute('href')) {
      const href = element.getAttribute('href') || '';
      if (href.toLowerCase().trim().startsWith('javascript:')) {
        element.setAttribute('href', '#');
      }
    }
    
    // Remove data: URLs from images (potential XSS vector)
    if (element.tagName === 'IMG' && element.hasAttribute('src')) {
      const src = element.getAttribute('src') || '';
      if (src.toLowerCase().trim().startsWith('data:')) {
        // Only allow data: URLs for images
        if (!src.toLowerCase().startsWith('data:image/')) {
          element.setAttribute('src', '');
        }
      }
    }
  }
  
  // Return sanitized HTML
  return doc.body.innerHTML;
}

/**
 * Validate and sanitize user input
 * @param input User input string
 * @param type Type of input to validate
 * @returns Sanitized input string
 */
export function sanitizeInput(
  input: string,
  type: 'text' | 'email' | 'url' | 'number' | 'phone' | 'username' | 'password'
): string {
  if (!input) return '';
  
  // Trim whitespace
  let sanitized = input.trim();
  
  switch (type) {
    case 'text':
      // Remove HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');
      break;
      
    case 'email':
      // Basic email validation and sanitization
      sanitized = sanitized.toLowerCase();
      // Remove anything that's not a valid email character
      sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
      break;
      
    case 'url':
      // Basic URL sanitization
      if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
        sanitized = 'https://' + sanitized;
      }
      // Remove anything that's not a valid URL character
      sanitized = sanitized.replace(/[^a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]/g, '');
      break;
      
    case 'number':
      // Keep only digits and decimal point
      sanitized = sanitized.replace(/[^0-9.]/g, '');
      break;
      
    case 'phone':
      // Keep only digits, spaces, and common phone number characters
      sanitized = sanitized.replace(/[^0-9+\-() ]/g, '');
      break;
      
    case 'username':
      // Allow alphanumeric, underscore, hyphen, and period
      sanitized = sanitized.replace(/[^a-zA-Z0-9_.-]/g, '');
      break;
      
    case 'password':
      // Don't modify passwords, just trim
      break;
  }
  
  return sanitized;
}

/**
 * Generate a Content Security Policy header value
 * @param options CSP options
 * @returns CSP header value
 */
export function generateCSP(options?: {
  reportOnly?: boolean;
  reportUri?: string;
  allowInlineScripts?: boolean;
  allowInlineStyles?: boolean;
  allowEval?: boolean;
}): string {
  const {
    reportOnly = false,
    reportUri = '',
    allowInlineScripts = false,
    allowInlineStyles = false,
    allowEval = false
  } = options || {};
  
  // Default sources
  const defaultSrc = ["'self'"];
  const scriptSrc = ["'self'", 'https://analytics.foundernetwork.com', 'https://cdn.foundernetwork.com'];
  const styleSrc = ["'self'", 'https://fonts.googleapis.com', 'https://cdn.foundernetwork.com'];
  const imgSrc = ["'self'", 'data:', 'https://cdn.foundernetwork.com', 'https://storage.foundernetwork.com'];
  const fontSrc = ["'self'", 'https://fonts.gstatic.com', 'https://cdn.foundernetwork.com'];
  const connectSrc = ["'self'", 'https://api.foundernetwork.com', 'wss://ws.foundernetwork.com'];
  
  // Add unsafe-inline if allowed
  if (allowInlineScripts) {
    scriptSrc.push("'unsafe-inline'");
  }
  
  if (allowInlineStyles) {
    styleSrc.push("'unsafe-inline'");
  }
  
  // Add unsafe-eval if allowed
  if (allowEval) {
    scriptSrc.push("'unsafe-eval'");
  }
  
  // Build CSP directives
  const directives = [
    `default-src ${defaultSrc.join(' ')}`,
    `script-src ${scriptSrc.join(' ')}`,
    `style-src ${styleSrc.join(' ')}`,
    `img-src ${imgSrc.join(' ')}`,
    `font-src ${fontSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'"
  ];
  
  // Add report-uri if provided
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }
  
  return directives.join('; ');
}

/**
 * Generate a nonce for use with CSP
 * @returns Random nonce string
 */
export function generateNonce(): string {
  // Generate a random string for use as a nonce
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if the current connection is secure (HTTPS)
 * @returns True if connection is secure
 */
export function isSecureConnection(): boolean {
  return window.location.protocol === 'https:';
}

/**
 * Validate a CSRF token
 * @param token CSRF token to validate
 * @param expectedToken Expected token value
 * @returns True if token is valid
 */
export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) return false;
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Detect common security issues in the current environment
 * @returns Array of security issues found
 */
export function detectSecurityIssues(): string[] {
  const issues: string[] = [];
  
  // Check if running on HTTPS
  if (!isSecureConnection() && window.location.hostname !== 'localhost') {
    issues.push('Application is not running on HTTPS');
  }
  
  // Check for missing security headers
  fetch(window.location.href)
    .then(response => {
      const headers = response.headers;
      
      if (!headers.get('Content-Security-Policy') && !headers.get('Content-Security-Policy-Report-Only')) {
        issues.push('Content Security Policy (CSP) header is missing');
      }
      
      if (!headers.get('X-Content-Type-Options')) {
        issues.push('X-Content-Type-Options header is missing');
      }
      
      if (!headers.get('X-Frame-Options')) {
        issues.push('X-Frame-Options header is missing');
      }
      
      if (!headers.get('X-XSS-Protection')) {
        issues.push('X-XSS-Protection header is missing');
      }
      
      if (!headers.get('Referrer-Policy')) {
        issues.push('Referrer-Policy header is missing');
      }
      
      if (!headers.get('Strict-Transport-Security') && isSecureConnection()) {
        issues.push('Strict-Transport-Security (HSTS) header is missing');
      }
    })
    .catch(() => {
      issues.push('Failed to check security headers');
    });
  
  // Check for sensitive data in localStorage
  const sensitiveKeys = ['password', 'token', 'secret', 'credit', 'card'];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      issues.push(`Potentially sensitive data stored in localStorage: ${key}`);
    }
  }
  
  return issues;
}

/**
 * Securely store sensitive data in browser storage
 * @param key Storage key
 * @param data Data to store
 * @param options Storage options
 */
export function secureStore(
  key: string,
  data: any,
  options?: {
    expires?: number; // Expiration time in seconds
    encrypt?: boolean; // Whether to encrypt the data
    storage?: 'local' | 'session'; // Storage type
  }
): void {
  const {
    expires,
    encrypt = true,
    storage = 'local'
  } = options || {};
  
  // Prepare data object
  const storageObject = {
    data,
    created: Date.now(),
    expires: expires ? Date.now() + (expires * 1000) : null
  };
  
  // Convert to string
  const dataString = JSON.stringify(storageObject);
  
  // Encrypt if needed (simplified - in a real app, use a proper encryption library)
  const finalData = encrypt ? btoa(dataString) : dataString;
  
  // Store in selected storage
  if (storage === 'local') {
    localStorage.setItem(key, finalData);
  } else {
    sessionStorage.setItem(key, finalData);
  }
}

/**
 * Retrieve securely stored data
 * @param key Storage key
 * @param options Retrieval options
 * @returns Retrieved data or null if expired/not found
 */
export function secureRetrieve(
  key: string,
  options?: {
    decrypt?: boolean;
    storage?: 'local' | 'session';
  }
): any {
  const {
    decrypt = true,
    storage = 'local'
  } = options || {};
  
  // Get from selected storage
  const rawData = storage === 'local'
    ? localStorage.getItem(key)
    : sessionStorage.getItem(key);
  
  if (!rawData) return null;
  
  try {
    // Decrypt if needed
    const dataString = decrypt ? atob(rawData) : rawData;
    
    // Parse data
    const storageObject = JSON.parse(dataString);
    
    // Check expiration
    if (storageObject.expires && storageObject.expires < Date.now()) {
      // Data has expired, remove it
      if (storage === 'local') {
        localStorage.removeItem(key);
      } else {
        sessionStorage.removeItem(key);
      }
      return null;
    }
    
    return storageObject.data;
  } catch (error) {
    console.error('Error retrieving secure data:', error);
    return null;
  }
}

/**
 * Implement security headers in a Next.js API route
 * @param res Next.js response object
 */
export function setSecurityHeaders(res: any): void {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    generateCSP({
      allowInlineStyles: true,
      reportOnly: false
    })
  );
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HTTP Strict Transport Security
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }
  
  // Permissions Policy (formerly Feature Policy)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Validation result with score and feedback
 */
export function validatePasswordStrength(password: string): {
  score: number; // 0-4, higher is stronger
  isStrong: boolean;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Check length
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }
  
  // Check for mixed case
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should include both uppercase and lowercase letters');
  }
  
  // Check for numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should include at least one number');
  }
  
  // Check for special characters
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should include at least one special character');
  }
  
  // Check for common passwords (simplified - in a real app, use a more comprehensive list)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome', 'password123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('This is a commonly used password');
  }
  
  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Password contains repeated characters');
  }
  
  // Ensure score is within range
  score = Math.max(0, Math.min(4, score));
  
  return {
    score,
    isStrong: score >= 3,
    feedback: feedback.length > 0 ? feedback : ['Password strength is good']
  };
}

/**
 * Generate a secure random token
 * @param length Token length (default: 32)
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}