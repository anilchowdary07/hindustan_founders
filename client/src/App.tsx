import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import RoleSelectionPage from "@/pages/role-selection-page";
import HomePage from "@/pages/home-page";
import ProfilePage from "@/pages/profile-page";
import PitchRoomPage from "@/pages/pitch-room-page";
import JobsPage from "@/pages/jobs-page";
import JobDetailPage from "@/pages/job-detail-page";
import CreateJobPage from "@/pages/create-job-page";
import NetworkPage from "@/pages/network-page";
import SettingsPage from "@/pages/settings-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/role-selection" component={RoleSelectionPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile/:id?" component={ProfilePage} />
      <ProtectedRoute path="/network" component={NetworkPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/pitch-room" component={PitchRoomPage} />
      <ProtectedRoute path="/jobs/create" component={CreateJobPage} />
      <Route path="/jobs/:jobId" component={JobDetailPage} />
      <Route path="/jobs" component={JobsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
