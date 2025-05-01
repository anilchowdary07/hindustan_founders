import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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
import NotificationsPage from "@/pages/notifications-page";
import MessagesPage from "@/pages/messages-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AnalyticsPage from "@/pages/analytics-page-simple";
import ResourcesPage from "@/pages/resources-page";
import ArticlesPage from "@/pages/articles-page";
import CreateArticlePage from "@/pages/create-article-page";
import EventsPage from "@/pages/events-page-simple";
import CreateEventPage from "@/pages/create-event-page-simple";
import HelpPage from "@/pages/help-page";
import ChatSidebar from "@/components/chat/chat-sidebar";
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
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/pitch-room" component={PitchRoomPage} />
      <ProtectedRoute path="/jobs/create" component={CreateJobPage} />
      <Route path="/jobs/:jobId" component={JobDetailPage} />
      <Route path="/jobs" component={JobsPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/resources" component={ResourcesPage} />
      <ProtectedRoute path="/articles" component={ArticlesPage} />
      <ProtectedRoute path="/create-article" component={CreateArticlePage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/create-event" component={CreateEventPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
      {user && <ChatSidebar />}
    </TooltipProvider>
  );
}

export default App;
