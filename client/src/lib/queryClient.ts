import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      } else {
        const text = await res.text();
        console.error('API Error:', text);
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Transform API URL for Netlify if needed
  let apiUrl = getApiUrl(url);
  
  // Ensure URL is absolute
  if (!apiUrl.startsWith('http')) {
    apiUrl = window.location.origin + apiUrl;
  }
  
  console.log(`Making API request to: ${apiUrl}`, method, data);
  
  try {
    const res = await fetch(apiUrl, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        // Add cache control headers to prevent caching of API requests
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Log response status
    console.log(`API response status: ${res.status} ${res.statusText}`);
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request failed to ${apiUrl}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the URL from the query key
    const url = queryKey[0] as string;
    
    // Transform API URL for Netlify if needed
    let apiUrl = getApiUrl(url);
    
    // Ensure URL is absolute
    if (!apiUrl.startsWith('http')) {
      apiUrl = window.location.origin + apiUrl;
    }
    
    console.log(`Making query request to: ${apiUrl}`);
    
    try {
      const res = await fetch(apiUrl, {
        credentials: "include",
        headers: {
          // Add cache control headers to prevent caching of API requests
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });
      
      console.log(`Query response status: ${res.status} ${res.statusText}`);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Unauthorized request, returning null as configured");
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Query response data:`, data);
      return data;
    } catch (error) {
      console.error(`Query request failed to ${apiUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
