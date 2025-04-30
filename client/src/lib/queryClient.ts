import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Adjust URL for Netlify Functions
  let apiUrl = url;
  if (url.startsWith('/api/')) {
    // Convert /api/xyz to /.netlify/functions/api/xyz for Netlify deployment
    // Remove the /api prefix as our Netlify function handles paths directly
    apiUrl = url.replace(/^\/api\//, '/.netlify/functions/api/');
  }
  
  // Ensure URL is absolute
  if (!apiUrl.startsWith('http')) {
    apiUrl = window.location.origin + apiUrl;
  }
  
  console.log(`Making API request to: ${apiUrl}`);
  
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

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the URL from the query key
    const url = queryKey[0] as string;
    
    // Adjust URL for Netlify Functions
    let apiUrl = url;
    if (url.startsWith('/api/')) {
      // Convert /api/xyz to /.netlify/functions/api/xyz for Netlify deployment
      // Remove the /api prefix as our Netlify function handles paths directly
      apiUrl = url.replace(/^\/api\//, '/.netlify/functions/api/');
    }
    
    // Ensure URL is absolute
    if (!apiUrl.startsWith('http')) {
      apiUrl = window.location.origin + apiUrl;
    }
    
    console.log(`Making query request to: ${apiUrl}`);
    
    const res = await fetch(apiUrl, {
      credentials: "include",
      headers: {
        // Add cache control headers to prevent caching of API requests
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
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
