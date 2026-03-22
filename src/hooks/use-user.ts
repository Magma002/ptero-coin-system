import { useQuery } from "@tanstack/react-query";
import { authHeaders } from "@/hooks/use-auth";
import type { UserResponse } from "@/types/api";

// Mock user data for development
const mockUser = {
  id: "1",
  email: "demo@coinreward.com",
  name: "Demo User",
  balance: 1250,
  totalEarned: 5680,
  coins: 1250,
  dailyEarnings: 150
};

// Get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export function useUser() {
  return useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      // For development, return mock data if no token or if API call fails
      const token = getAuthToken();
      
      if (!token) {
        return null;
      }

      // Try to make real API call, but fallback to mock data
      try {
        const res = await fetch("/api/user", {
          headers: {
            ...authHeaders(),
          },
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        
        const data = await res.json();
        return data as UserResponse;
      } catch (error) {
        // Fallback to mock data for development
        console.log("Using mock user data for development");
        return { user: mockUser } as UserResponse;
      }
    },
    retry: false,
  });
}
