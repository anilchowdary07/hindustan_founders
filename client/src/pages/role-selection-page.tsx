import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import RoleSelection from "@/components/auth/role-selection";

export default function RoleSelectionPage() {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // If user already has a role, redirect to home
  useEffect(() => {
    if (user?.role && !isLoading) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <RoleSelection />
    </div>
  );
}
