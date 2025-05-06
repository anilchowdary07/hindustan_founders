import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  X, 
  CheckCircle, 
  MapPin, 
  Briefcase, 
  Eye, 
  BarChart2, 
  Building2, 
  Bookmark, 
  Users, 
  Puzzle, 
  Settings, 
  Crown,
  ChevronRight,
  MessageSquare,
  Bell,
  FileText,
  Calendar
} from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user) return null;

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.name) return "HF";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - LinkedIn Style */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[80%] max-w-[360px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
        aria-label="Menu"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
              <AvatarFallback className="bg-[#0A66C2] text-white text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-base">{user.name}</h2>
              <p className="text-xs text-gray-500 line-clamp-1">View profile</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Account Section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base">Account</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#0A66C2] hover:bg-[#EEF3F8] text-sm h-8 px-3 rounded-full"
              onClick={() => handleNavigation("/settings")}
            >
              Settings
            </Button>
          </div>
          
          {/* Premium Badge */}
          <div 
            className="mt-3 flex items-center p-3 bg-[#F5FAFF] rounded-lg cursor-pointer"
            onClick={() => handleNavigation("/premium")}
          >
            <div className="h-10 w-10 flex items-center justify-center bg-[#F8C77E] rounded-full mr-3">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">Try Premium for free</h4>
              <p className="text-xs text-gray-500">Unlock exclusive tools & insights</p>
            </div>
          </div>
        </div>
        
        {/* Recent & Groups Section */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-base">Recent</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:bg-gray-100 text-sm h-8 px-2 rounded-full"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Recent Items */}
          <div className="space-y-3">
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/groups/tech-founders")}
            >
              <Users className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-sm text-gray-700">Tech Founders Group</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/events/upcoming")}
            >
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-sm text-gray-700">Upcoming Startup Events</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/jobs/saved")}
            >
              <Briefcase className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-sm text-gray-700">Saved Jobs</span>
            </div>
          </div>
          
          {/* Groups */}
          <div className="mt-4">
            <h4 className="font-medium text-sm text-[#0A66C2] mb-2">Groups</h4>
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/groups")}
            >
              <Users className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-sm text-gray-700">See all groups</span>
            </div>
          </div>
        </div>
        
        {/* Main Menu Items */}
        <div className="px-4 py-3">
          <h3 className="font-medium text-base mb-3">Visit</h3>
          
          <div className="space-y-4">
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/network")}
            >
              <Users className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-sm font-medium">My Network</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/pitch-room")}
            >
              <FileText className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-sm font-medium">Pitches</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/jobs")}
            >
              <Briefcase className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-sm font-medium">Jobs</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/messages")}
            >
              <MessageSquare className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-sm font-medium">Messaging</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/notifications")}
            >
              <Bell className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-sm font-medium">Notifications</span>
              <span className="ml-auto bg-[#CC1016] text-white text-xs font-medium h-5 min-w-5 rounded-full flex items-center justify-center px-1">
                2
              </span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/saved-posts")}
            >
              <Bookmark className="h-5 w-5 text-gray-700 mr-3" />
              <span className="text-sm font-medium">Saved Posts</span>
            </div>
          </div>
          
          {/* Products Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-base">Products</h3>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() => handleNavigation("/premium")}
            >
              <Crown className="h-5 w-5 text-[#F8C77E] mr-3" />
              <span className="text-sm font-medium">Premium</span>
            </div>
            
            <div 
              className="flex items-center py-1 hover:bg-gray-50 rounded-md cursor-pointer mt-3"
              onClick={() => handleNavigation("/pitch-room")}
            >
              <FileText className="h-5 w-5 text-[#0A66C2] mr-3" />
              <span className="text-sm font-medium">Pitch Room</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}