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
  ChevronRight
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
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } overflow-y-auto`}>
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="font-bold text-lg">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200">
          {/* Avatar and name section */}
          <div className="flex items-center mb-3">
            <div className="relative flex-shrink-0 mr-4">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-lg">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {/* Hiring badge */}
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold py-0.5 px-1 rounded-sm">
                #HIRING
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="font-bold text-base truncate mr-1">{user.name}</h3>
                <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
              </div>
            </div>
          </div>
          
          {/* Bio and details section */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {user.title || "Update your headline"}
            </p>
            
            {user.location && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
            
            {user.company && (
              <div className="flex items-center mt-1 text-xs">
                <Briefcase className="h-3 w-3 mr-1 text-gray-500 flex-shrink-0" />
                <span className="font-semibold truncate">{user.company}</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full text-primary border-primary hover:bg-primary/5"
            onClick={() => handleNavigation("/profile")}
          >
            View Profile
          </Button>
        </div>
        
        {/* Stats Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm text-gray-600">
              <Eye className="h-4 w-4 mr-2" />
              <span>Profile viewers</span>
            </div>
            <span className="text-primary font-semibold">57</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <BarChart2 className="h-4 w-4 mr-2" />
              <span>Post impressions</span>
            </div>
            <span className="text-primary font-semibold">69</span>
          </div>
        </div>
        
        {/* Manage Pages Section */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-sm mb-3">Manage pages</h4>
          
          <div 
            className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/company/thevedicherbs")}
          >
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center text-blue-600 mr-3">
                <Building2 className="h-4 w-4" />
              </div>
              <span className="text-sm">The Vedic Herbs</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Menu List */}
        <div className="p-4 border-b border-gray-200">
          <div 
            className="flex items-center py-3 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/games")}
          >
            <Puzzle className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">Puzzle games</span>
          </div>
          
          <div 
            className="flex items-center py-3 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/saved-posts")}
          >
            <Bookmark className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">Saved posts</span>
          </div>
          
          <div 
            className="flex items-center py-3 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/groups")}
          >
            <Users className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">Groups</span>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="p-4">
          <div 
            className="flex items-center py-3 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/premium")}
          >
            <div className="h-5 w-5 flex items-center justify-center text-yellow-500 mr-3">
              <Crown className="h-5 w-5" />
            </div>
            <span className="text-sm">Try Premium for ₹0</span>
          </div>
          
          <div 
            className="flex items-center py-3 hover:bg-gray-50 rounded-md cursor-pointer"
            onClick={() => handleNavigation("/settings")}
          >
            <Settings className="h-5 w-5 text-gray-500 mr-3" />
            <span className="text-sm">Settings</span>
          </div>
        </div>
      </div>
    </>
  );
}