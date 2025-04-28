import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AuthForm from "@/components/auth/auth-form";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render the auth form if we're about to redirect
  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center p-6">
        <AuthForm />
      </div>
    </div>
  );
}
