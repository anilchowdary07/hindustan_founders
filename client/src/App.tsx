import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import RoleSelectionPage from "@/pages/role-selection-page";
import HomePage from "@/pages/home-page-improved";
import ProfilePage from "@/pages/profile-page";
import JobsPage from "@/pages/jobs-page-fixed";
import JobDetailPage from "@/pages/job-detail-page";
import NetworkPage from "@/pages/network-fixed";
import NotificationsPage from "@/pages/notifications-page";
import MessagesPage from "@/pages/basic-messaging-page";
import SettingsPage from "@/pages/settings-page";
import PitchRoomPage from "@/pages/pitch-room-fixed";
import ResourcesPage from "@/pages/resources-page";
import AnalyticsPageSimple from "@/pages/analytics-page-simple";
import StudentInnovationsPage from "@/pages/student-innovations-basic";
import EventsPageSimple from "@/pages/events-page-simple";
import HelpPage from "@/pages/help-page";
import SavedItemsPage from "@/pages/saved-items";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import CookiePolicyPage from "@/pages/cookie-policy-page";
import TermsOfServicePage from "@/pages/terms-of-service-page";
import AboutPage from "@/pages/about-page";
import InvestorRelationsPage from "@/pages/investor-relations-page";
import StartupResourcesPage from "@/pages/startup-resources-page";
import FAQPage from "@/pages/faq-page";
import SupportPage from "@/pages/support-page";
import SupportTicketsPage from "@/pages/support-tickets-page";
import AdminDashboard from "@/pages/admin-dashboard";
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
      <ProtectedRoute path="/pitch-room" component={PitchRoomPage} />
      <ProtectedRoute path="/resources" component={ResourcesPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPageSimple} />
      <ProtectedRoute path="/events" component={EventsPageSimple} />
      <Route path="/student-innovations" component={StudentInnovationsPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/saved-items" component={SavedItemsPage} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/jobs/:jobId" component={JobDetailPage} />
      <Route path="/jobs" component={JobsPage} />
      
      {/* Public pages */}
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/cookie-policy" component={CookiePolicyPage} />
      <Route path="/terms-of-service" component={TermsOfServicePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/investor-relations" component={InvestorRelationsPage} />
      <Route path="/startup-resources" component={StartupResourcesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/support-tickets" component={SupportTicketsPage} />
      
      {/* Catch-all route for 404 */}
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
  const [, navigate] = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;