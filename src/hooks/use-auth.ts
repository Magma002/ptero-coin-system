import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Auth token management
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

const removeAuthToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

export const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Register hook
export function useRegister() {
  return useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Registration failed');
      }
      
      return json;
    },
  });
}

// Login hook
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: {
      username: string;
      password: string;
    }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Login failed');
      }
      
      // Store token
      setAuthToken(json.token);
      
      return json;
    },
    onSuccess: () => {
      // Invalidate user queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // Redirect to dashboard
      window.location.href = "/";
    },
  });
}

// Logout hook
export function useLogout() {
  const queryClient = useQueryClient();
  
  return () => {
    removeAuthToken();
    queryClient.clear();
    window.location.href = "/login";
  };
}

// Check if user is authenticated
export function useIsAuthenticated() {
  return !!getAuthToken();
}
