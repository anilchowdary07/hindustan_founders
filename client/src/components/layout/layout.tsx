import { useAuth } from "@/hooks/use-auth";
import Header from "./header";
import Footer from "./footer";
import MobileNav from "./mobile-nav-fixed";
import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CreatePost from "@/components/home/create-post";
import ChatSidebar from "@/components/chat/chat-sidebar";
import CookieConsent from "@/components/cookie-consent";
import { Button } from "@/components/ui/button";
import { FileText, Settings, HelpCircle, LogOut, User, Bell, Briefcase, MessageCircle } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

interface MainContentProps {
  onPostCreated: () => void;
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  // Listen for the custom events to open dialogs
  useEffect(() => {
    const handleOpenCreatePost = () => {
      setIsCreatePostOpen(true);
    };
    
    const handleOpenMoreMenu = () => {
      setIsMoreMenuOpen(true);
    };
    
    window.addEventListener('openCreatePost', handleOpenCreatePost);
    window.addEventListener('openMoreMenu', handleOpenMoreMenu);
    
    return () => {
      window.removeEventListener('openCreatePost', handleOpenCreatePost);
      window.removeEventListener('openMoreMenu', handleOpenMoreMenu);
    };
  }, []);
  
  // Simple function to determine active nav item based on current route
  const getActiveTab = () => {
    if (location === "/") return "home";
    if (location.startsWith("/network")) return "network";
    if (location.startsWith("/jobs")) return "jobs";
    if (location.startsWith("/notifications")) return "notifications";
    if (location.startsWith("/profile")) return "profile";
    if (location.startsWith("/pitch")) return "pitches";
    if (location.startsWith("/messages")) return "messages";
    return "";
  };
  
  // Handle more menu item click
  const handleMoreMenuItemClick = (path: string) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F2EF]">
      <Header />
      <main className="flex-1 px-0 sm:px-4 md:px-6 lg:px-8 pt-14 pb-20 md:pb-4 md:pt-20">
        <div className="w-full mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <div className="h-16 md:hidden">
        {/* Spacer for mobile bottom navigation */}
      </div>
      <Footer />
      <MobileNav activeTab={getActiveTab()} />
      
      {/* Cookie Consent Banner */}
      <CookieConsent />
      
      {/* Chat Sidebar is disabled for now */}
      {/* {location !== "/messages" && <ChatSidebar />} */}
      
      {/* Create Post Dialog */}
      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 rounded-lg shadow-lg border border-[#E0E0E0]">
          <CreatePost onPostCreated={() => setIsCreatePostOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Mobile More Menu */}
      <Sheet open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-xl h-auto max-h-[80vh]">
          <SheetHeader className="text-left pb-4 border-b">
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>
          <div className="py-4 flex flex-col space-y-1">
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/profile")}
            >
              <User className="mr-3 h-5 w-5 text-[#0077B5]" />
              Your Profile
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/messages")}
            >
              <MessageCircle className="mr-3 h-5 w-5 text-[#0077B5]" />
              Messages
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/jobs")}
            >
              <Briefcase className="mr-3 h-5 w-5 text-[#0077B5]" />
              Jobs
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/pitch-room")}
            >
              <FileText className="mr-3 h-5 w-5 text-[#0077B5]" />
              Pitches
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/resources")}
            >
              <FileText className="mr-3 h-5 w-5 text-[#0077B5]" />
              Resources
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/notifications")}
            >
              <Bell className="mr-3 h-5 w-5 text-[#0077B5]" />
              Notifications
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/settings")}
            >
              <Settings className="mr-3 h-5 w-5 text-[#0077B5]" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal"
              onClick={() => handleMoreMenuItemClick("/help")}
            >
              <HelpCircle className="mr-3 h-5 w-5 text-[#0077B5]" />
              Help Center
            </Button>
            <Button 
              variant="ghost" 
              className="justify-start h-12 px-4 font-normal text-red-600"
              onClick={() => handleMoreMenuItemClick("/logout")}
            >
              <LogOut className="mr-3 h-5 w-5 text-red-600" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
