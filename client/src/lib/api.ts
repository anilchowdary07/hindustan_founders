// API utility functions for making requests to the server

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API response type with generic data or error object
 */
export type ApiResponse<T> = {
  data?: T;
  error?: {
    status: number;
    message: string;
    data?: unknown;
  };
  ok?: boolean;
  headers?: Headers;
  status?: number;
};

/**
 * Adjust API URL for Netlify deployment
 * In production, API routes need to use the Netlify Functions path
 */
export const getApiUrl = (url: string): string => {
  // Check if we're in production (Netlify)
  const isProduction = window.location.hostname !== 'localhost';
  
  // If it's an API URL and we're in production, use the Netlify Functions path
  if (url.startsWith('/api/') && isProduction) {
    // Replace /api/ with /.netlify/functions/api/
    return url.replace('/api/', '/.netlify/functions/api/');
  }
  
  return url;
};

/**
 * Make an API request to the server
 * @param url API endpoint
 * @param method HTTP method
 * @param body Optional request body
 * @param contentType Optional content type (defaults to application/json)
 * @returns Promise with the response
 */
export async function apiRequest<T>(
  url: string,
  method: HttpMethod = "GET",
  body?: any,
  contentType: string = "application/json"
): Promise<ApiResponse<T>> {
  try {
    // Determine if we're in development or production (Netlify)
    const isNetlify = window.location.hostname !== 'localhost' && 
                      window.location.hostname !== '127.0.0.1';

    // Format the URL correctly based on environment
    let apiUrl = url;
    
    // Make sure we're using the correct API path format
    if (isNetlify) {
      // Netlify deployment - use /.netlify/functions/api structure
      if (!url.startsWith("/.netlify/functions/api")) {
        // Remove /api prefix if it exists
        const cleanPath = url.startsWith("/api/") ? url.substring(5) : url.startsWith("/api") ? url.substring(4) : url;
        // Add the netlify functions prefix
        apiUrl = `/.netlify/functions/api/${cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath}`;
      }
    } else {
      // Local development - ensure /api prefix
      if (!url.startsWith("/api")) {
        apiUrl = `/api/${url.startsWith("/") ? url.substring(1) : url}`;
      }
    }

    console.log(`Making API request to: ${apiUrl}`, { method, body });

    const headers: HeadersInit = {
      "Content-Type": contentType,
    };

    const options: RequestInit = {
      method,
      headers,
      credentials: "include", // Important for cookies
    };

    if (body && method !== "GET") {
      options.body =
        contentType === "application/json" ? JSON.stringify(body) : body;
    }

    return apiFetch<T>(apiUrl, options);
  } catch (error) {
    // Handle any other errors
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return {
        error: {
          status: 500,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
      } as ApiResponse<T>;
    } else {
      console.error('Unknown error occurred');
      return {
        error: {
          status: 500,
          message: 'Unknown error',
        },
      } as ApiResponse<T>;
    }
  }
}

/**
 * Make a fetch request to the server
 * @param input API endpoint
 * @param init Optional request initialization
 * @returns Promise with the response
 */
export async function apiFetch<T = unknown>(
  input: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      const errorData = await response.json();
      return { 
        error: { 
          status: response.status, 
          message: errorData.message,
          data: errorData
        },
        status: response.status,
        headers: response.headers
      };
    }
    const data = await response.json();
    return { data, status: response.status, headers: response.headers };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return { 
        error: { 
          status: 500, 
          message: error.message
        }
      };
    } else {
      console.error('Unknown error occurred');
      return { 
        error: { 
          status: 500, 
          message: 'Unknown error'
        }
      };
    }
  }
}

/**
 * Upload a file to the server
 * @param url API endpoint
 * @param formData FormData containing the file(s)
 * @param progressCallback Optional callback for tracking upload progress
 * @returns Promise with the response in the same format as apiRequest
 */
export const uploadFile = async <T>(url: string, formData: FormData, progressCallback?: (progress: number) => void): Promise<ApiResponse<T>> => {
  try {
    // Get the correct API URL based on environment
    const apiUrl = getApiUrl(url);
    
    console.log(`Uploading file to: ${apiUrl}`);
    
    // Use XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking if callback provided
      if (progressCallback) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            progressCallback(percentComplete);
          }
        });
      }
      
      xhr.open('POST', apiUrl, true);
      xhr.withCredentials = true; // Include cookies for authentication
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ data });
          } catch (e) {
            resolve({ data: { message: xhr.responseText } as any });
          }
        } else {
          // Handle error responses
          try {
            const errorData = JSON.parse(xhr.responseText);
            resolve({
              error: {
                status: xhr.status,
                message: errorData.message || 'Upload failed',
                data: errorData
              }
            });
          } catch (e) {
            resolve({
              error: {
                status: xhr.status,
                message: 'Upload failed'
              }
            });
          }
        }
      };
      
      xhr.onerror = function() {
        resolve({
          error: {
            status: xhr.status || 500,
            message: 'Network error during upload'
          }
        });
      };
      
      xhr.onreadystatechange = function() {
        // Handle unauthorized responses
        if (xhr.readyState === 4 && xhr.status === 401) {
          window.location.href = '/login';
        }
      };
      
      xhr.send(formData);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
      return {
        error: {
          status: 500,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
      } as ApiResponse<T>;
    } else {
      console.error('Unknown error occurred');
      return {
        error: {
          status: 500,
          message: 'Unknown error during upload',
        },
      } as ApiResponse<T>;
    }
  }
};

/**
 * Type guard for API error responses
 * @param response API response
 * @returns True if the response is an error
 */
export function isApiError<T>(response: ApiResponse<T>): response is { error: { status: number; message: string; data?: unknown } } {
  return (response as any).error !== undefined;
}

/**
 * Type guard for API success responses
 * @param response API response
 * @returns True if the response is a success
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is { data: T } {
  return (response as any).data !== undefined;
}
