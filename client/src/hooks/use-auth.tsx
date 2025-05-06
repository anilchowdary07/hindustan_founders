import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { apiRequest, ApiResponse } from "../lib/api";

// Define User type if it doesn't exist in types.ts
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  title?: string | null;
  company?: string | null;
  location?: string | null;
  bio?: string | null;
  profileCompleted?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutMutation: ReturnType<typeof useMutation<void, Error, void>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current user
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        console.log("Fetching current user...");
        const response = await apiRequest<User>("/api/user", "GET");
        
        if (response.error) {
          console.log("User fetch failed:", response.error);
          // Not authenticated, return null instead of throwing
          if (response.error.status === 401) {
            return null;
          }
          throw new Error(response.error.message || "Failed to fetch user");
        }
        
        console.log("User fetch successful:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: "Error",
          description: "Failed to fetch user information.",
          variant: "destructive",
        });
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Update loading state based on user query status
  useEffect(() => {
    if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [isUserLoading]);

  // Login mutation
  const loginMutation = useMutation<User, Error, { username: string; password: string }>({
    mutationFn: async (credentials) => {
      console.log("Login attempt with:", credentials.username);
      const response = await apiRequest<User>("/api/login", "POST", credentials);
      
      if (response.error) {
        console.error("Login error:", response.error);
        throw new Error(response.error.message || "Invalid username or password");
      }
      
      if (!response.data) {
        throw new Error("No user data returned from server");
      }
      
      return response.data;
    },
    onSuccess: (userData) => {
      console.log("Login successful:", userData);
      queryClient.setQueryData(["user"], userData);
      
      // Invalidate any user-related queries to ensure fresh data
      queryClient.invalidateQueries(["profile"]);
      queryClient.invalidateQueries(["connections"]);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      // Check if profile is incomplete and show a reminder
      if (userData.profileCompleted && userData.profileCompleted < 80) {
        setTimeout(() => {
          toast({
            title: "Complete your profile",
            description: "Add more details to your profile to connect with others.",
          });
        }, 2000);
      }
    },
    onError: (error) => {
      console.error("Login error in handler:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  // Original functionality restored

  // Register mutation
  const registerMutation = useMutation<User, Error, any>({
    mutationFn: async (userData) => {
      // Validate email format before sending to server
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Validate password strength
      if (userData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      
      // Check if passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      
      const response = await apiRequest<User>("/api/register", "POST", userData);
      
      if (response.error) {
        console.error("Register error:", response.error);
        
        // Handle specific error cases
        if (response.error.message?.includes("username already exists") || 
            response.error.status === 409) {
          throw new Error("This username is already taken. Please choose another one.");
        }
        
        throw new Error(response.error.message || "Registration failed");
      }
      
      if (!response.data) {
        throw new Error("No user data returned from server after registration");
      }
      
      return response.data;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["user"], userData);
      
      // Show success message
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });
      
      // Show welcome message with delay
      setTimeout(() => {
        toast({
          title: "Welcome to Founder Network!",
          description: "Complete your profile to connect with other founders and investors.",
        });
      }, 1500);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "This username may already be taken.",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        const response = await apiRequest("/api/logout", "POST");
        
        if (response.error) {
          console.error("Logout error:", response.error);
          throw new Error(response.error.message || "Failed to logout");
        }
        
        // Clear any auth cookies manually as a fallback
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        return;
      } catch (error) {
        console.error("Logout request failed:", error);
        // Even if the API call fails, we'll still clear local state
        // This ensures users can log out even if the server is unreachable
        throw error;
      }
    },
    onSuccess: () => {
      // Clear all query cache to prevent data leakage between users
      queryClient.clear();
      
      // Reset user state
      queryClient.setQueryData(["user"], null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1000);
    },
    onError: (error) => {
      console.error("Logout error in handler:", error);
      
      // Even on error, clear the user data for security
      queryClient.setQueryData(["user"], null);
      
      toast({
        title: "Logout Issue",
        description: "You've been logged out locally, but there was a server communication issue.",
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/auth";
      }, 1500);
    },
  });

  // Utility functions that will be exposed through the context
  const login = async (credentials: { username: string; password: string }): Promise<boolean> => {
    try {
      await loginMutation.mutateAsync(credentials);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password.",
        variant: "destructive",
      });
      return false;
    }
  };



  const register = async (userData: any): Promise<boolean> => {
    try {
      await registerMutation.mutateAsync(userData);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "This username may already be taken.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: error.message || "Could not log out.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login,
        register,
        logout,
        logoutMutation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
