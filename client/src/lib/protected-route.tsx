import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F2EF] px-4">
          <div className="h-16 w-16 bg-primary rounded-md flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-primary">Hindustan Founders Network</h1>
          <div className="mt-8 flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <p className="text-gray-600">Loading your professional community...</p>
          </div>
        </div>
      </Route>
    );
  }

  if (!user) {
    // Redirect to auth page with a better user experience
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user doesn't have a role yet and isn't on the role selection page
  if (!user.role && path !== "/role-selection") {
    return (
      <Route path={path}>
        <Redirect to="/role-selection" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />
}
