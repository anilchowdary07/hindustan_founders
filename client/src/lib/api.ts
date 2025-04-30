// API utility functions for making requests to the server

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Make an API request to the server
 * @param method HTTP method
 * @param url API endpoint
 * @param data Optional request body
 * @returns Promise with the response
 */
export const apiRequest = async (method: HttpMethod, url: string, data?: any) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for authentication
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Handle unauthorized responses
  if (response.status === 401) {
    // Redirect to login page if not authenticated
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
};

/**
 * Upload a file to the server
 * @param url API endpoint
 * @param formData FormData containing the file(s)
 * @returns Promise with the response
 */
export const uploadFile = async (url: string, formData: FormData) => {
  const options: RequestInit = {
    method: 'POST',
    credentials: 'include', // Include cookies for authentication
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
  };

  const response = await fetch(url, options);
  
  // Handle unauthorized responses
  if (response.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
};
