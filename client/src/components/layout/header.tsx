import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  MessageSquare,
  User,
  LogOut,
  Settings,
  Home,
  Users,
  Briefcase,
  Grid,
  ChevronDown,
  Menu,
  PlusCircle,
  FileText,
  Calendar,
  BarChart2,
  HelpCircle,
  Bookmark,
  Lightbulb
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo, LogoIcon } from "@/components/ui/logo";
import MobileSidebar from "./mobile-sidebar";
import { GlobalSearch } from "@/components/search/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Function to determine if a nav item is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    // Special case for student innovations
    if (path === "/student-innovations" && location.startsWith("/student-innovations")) return true;
    return false;
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Close mobile search overlay if open
      if (isSearchOpen) {
        setIsSearchOpen(false);
      }
      
      // Determine where to navigate based on search term
      if (searchTerm.toLowerCase().includes('job') || 
          searchTerm.toLowerCase().includes('career') || 
          searchTerm.toLowerCase().includes('work')) {
        navigate(`/jobs?search=${encodeURIComponent(searchTerm)}`);
      } else if (searchTerm.toLowerCase().includes('group') || 
                searchTerm.toLowerCase().includes('community')) {
        navigate(`/groups?search=${encodeURIComponent(searchTerm)}`);
      } else if (searchTerm.toLowerCase().includes('event') || 
                searchTerm.toLowerCase().includes('webinar') || 
                searchTerm.toLowerCase().includes('conference')) {
        navigate(`/events?search=${encodeURIComponent(searchTerm)}`);
      } else {
        // Default to network search
        navigate(`/network?search=${encodeURIComponent(searchTerm)}`);
      }
      
      // Clear search term after navigation
      setSearchTerm("");
    }
  };

  // Handle Enter key in search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleSearch();
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="bg-white text-[#191919] border-b border-[#E0E0E0] fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="md:container mx-auto px-3 md:px-4 flex items-center h-14 md:h-14 relative">
        {/* Mobile Header - LinkedIn Style */}
        <div className="flex items-center justify-between w-full md:hidden">
          {/* Left Section: Avatar */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/profile')}
              className="focus:outline-none"
              aria-label="View profile"
            >
              <Avatar className="h-8 w-8 border border-transparent">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback className="bg-[#0A66C2] text-[10px] text-white">{getInitials()}</AvatarFallback>
              </Avatar>
            </button>
          </div>
          
          {/* Middle Section: Search Bar */}
          <button 
            onClick={() => navigate('/search')}
            className="flex items-center bg-[#EEF3F8] rounded-full py-1.5 px-3 flex-1 mx-3 focus:outline-none hover:bg-[#EEF3F8]"
            aria-label="Search"
          >
            <Search size={16} className="text-[#666666] mr-2" />
            <span className="text-[#666666] text-sm font-light">Search</span>
          </button>
          
          {/* Right Section: Notifications and Messages */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/notifications')}
              className="focus:outline-none relative"
              aria-label="Notifications"
            >
              <Bell size={24} className="text-[#666666]" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#CC1016] rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                2
              </span>
            </button>
            <button 
              onClick={() => navigate('/messages')}
              className="focus:outline-none relative"
              aria-label="Messages"
            >
              <MessageSquare size={24} className="text-[#666666]" />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#CC1016] rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center mr-2">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Logo />
            </div>
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="relative flex-1 max-w-xs hidden md:block">
          <GlobalSearch />
        </div>

        {/* Main Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex space-x-1">
            <Link href="/">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"}`}>
                  <Home size={20} />
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">Home</span>
                {isActive("/") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            <Link href="/network">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/network") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/network") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"}`}>
                  <Users size={20} />
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">My Network</span>
                {isActive("/network") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            <Link href="/jobs">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/jobs") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/jobs") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"}`}>
                  <Briefcase size={20} />
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">Jobs</span>
                {isActive("/jobs") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            <Link href="/pitch-room">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/pitch-room") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/pitch-room") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"}`}>
                  <FileText size={20} />
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">Pitches</span>
                {isActive("/pitch-room") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            <Link href="/student-innovations">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/student-innovations") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/student-innovations") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"}`}>
                  <Lightbulb size={20} />
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">Innovations</span>
                {isActive("/student-innovations") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            <Link href="/messages">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/messages") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/messages") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"}`}>
                  <MessageSquare size={20} />
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">Messaging</span>
                {isActive("/messages") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            <Link href="/notifications">
              <div className={`flex flex-col items-center px-3 py-1 cursor-pointer group ${isActive("/notifications") ? "text-[#191919]" : "text-[#666666] hover:text-[#191919]"}`}>
                <div className={`p-1 rounded-md ${isActive("/notifications") ? "text-[#191919]" : "text-[#666666] group-hover:text-[#191919]"} relative`}>
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#CC1016] rounded-full flex items-center justify-center text-[10px] text-white font-medium">
                    2
                  </span>
                </div>
                <span className="text-xs mt-0.5 whitespace-nowrap font-medium">Notifications</span>
                {isActive("/notifications") && <div className="h-0.5 w-full bg-[#191919] mt-1"></div>}
              </div>
            </Link>
            
            {/* Me Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center px-3 py-1 cursor-pointer text-[#666666] hover:text-[#191919]">
                  <div className="p-1 rounded-md">
                    <Avatar className="h-6 w-6 border border-[#E0E0E0]">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                      <AvatarFallback className="bg-[#0077B5] text-[10px] text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs mt-0.5 flex items-center whitespace-nowrap font-medium">
                    Me
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-lg shadow-md border border-[#E0E0E0] p-0">
                <div className="p-3 border-b border-[#E0E0E0]">
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12 flex-shrink-0 border border-[#E0E0E0]">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                      <AvatarFallback className="bg-[#0077B5] text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold truncate text-[#191919]">{user.name}</p>
                      <p className="text-xs text-[#666666] truncate">{user.title || "Update your headline"}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-[#0077B5] border-[#0077B5] hover:bg-[#E5F5FC] rounded-full font-medium"
                    onClick={() => navigate("/profile")}
                  >
                    View Profile
                  </Button>
                </div>
                
                <div className="p-3 border-b border-[#E0E0E0]">
                  <h3 className="font-semibold text-sm mb-2 text-[#191919]">Account</h3>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/saved-items")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <Bookmark className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Saved Items</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <Settings className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Settings & Privacy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/help")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <HelpCircle className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Help</span>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin-dashboard")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                        <BarChart2 className="mr-2 h-4 w-4 text-[#666666]" />
                        <span className="text-[#191919]">Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </div>
                
                <div className="p-3">
                  <DropdownMenuItem onClick={handleLogout} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                    <LogOut className="mr-2 h-4 w-4 text-[#666666]" />
                    <span className="text-[#191919]">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Work Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center px-3 py-1 cursor-pointer text-[#666666] hover:text-[#191919]">
                  <div className="p-1 rounded-md">
                    <Grid size={20} />
                  </div>
                  <span className="text-xs mt-0.5 flex items-center whitespace-nowrap font-medium">
                    Work
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-lg shadow-md border border-[#E0E0E0] p-0">
                <div className="p-3 border-b border-[#E0E0E0]">
                  <h3 className="font-semibold text-sm mb-2 text-[#191919]">Create</h3>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/pitch-room")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <FileText className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Pitch Room</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/create-event")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <Calendar className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Event</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/jobs/create")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <Briefcase className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Job Posting</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-2 text-[#191919]">Hindustan Founders Tools</h3>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/analytics")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <BarChart2 className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Analytics</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/resources")} className="rounded hover:bg-[#EBEBEB] focus:bg-[#EBEBEB] py-2">
                      <FileText className="mr-2 h-4 w-4 text-[#666666]" />
                      <span className="text-[#191919]">Resources</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>


      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
    </header>
  );
}