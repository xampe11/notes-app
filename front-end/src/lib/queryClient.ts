import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  console.log('Making API request to:', url, 'with options:', options);
  
  try {
    // Get auth token if available
    const token = localStorage.getItem('auth_token');
    console.log('Auth token available:', !!token);
    
    // Set up headers
    const headers = new Headers(options.headers || {});
    
    // Add auth header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add content-type for JSON if we have a body
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    console.log('Request headers:', Object.fromEntries(headers.entries()));
    
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
    
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    await throwIfResNotOk(res);
    
    // Parse JSON if the response has content
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await res.json();
      console.log('Response data:', responseData);
      return responseData;
    }
    
    return res;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token if available
    const token = localStorage.getItem('auth_token');
    
    // Set up headers with auth token if present
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
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
