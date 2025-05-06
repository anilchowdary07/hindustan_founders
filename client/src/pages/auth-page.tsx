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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F2EF]">
        <div className="h-16 w-16 bg-primary rounded-md flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-primary">Hindustan Founders Network</h1>
        <div className="mt-8 flex items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-600">Loading your professional community...</p>
        </div>
      </div>
    );
  }

  // Don't render the auth form if we're about to redirect
  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F2EF]">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-primary rounded-md flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Hindustan Founders Network</h1>
            <p className="text-lg text-gray-600">Connect with India's top entrepreneurs and investors</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
