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
  HelpCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeafIcon } from "@/components/ui/leaf-icon";
import MobileSidebar from "./mobile-sidebar";
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

  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Function to determine if a nav item is active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/network?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Handle Enter key in search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="bg-white text-gray-700 border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 flex items-center h-14">
        {/* Logo */}
        <div className="flex items-center mr-2">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <LeafIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="hidden md:block ml-1 font-bold text-primary">Hindustan Founders</h1>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs mr-4">
          <div className="relative flex items-center">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <Input 
              ref={searchInputRef}
              className="w-full bg-gray-100 text-gray-800 rounded-md py-1.5 pl-10 pr-4 placeholder-gray-500 border-none focus-visible:ring-1 focus-visible:ring-gray-400"
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        {/* Main Navigation */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex space-x-2">
            <Link href="/">
              <div className={`flex flex-col items-center px-4 py-1 cursor-pointer group ${isActive("/") ? "text-black" : "text-gray-500 hover:text-gray-700"}`}>
                <div className={`p-1 rounded-md ${isActive("/") ? "text-black" : "text-gray-500 group-hover:text-gray-700"}`}>
                  <Home size={20} />
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">Home</span>
                {isActive("/") && <div className="h-0.5 w-full bg-black mt-1 rounded-full"></div>}
              </div>
            </Link>
            
            <Link href="/network">
              <div className={`flex flex-col items-center px-4 py-1 cursor-pointer group ${isActive("/network") ? "text-black" : "text-gray-500 hover:text-gray-700"}`}>
                <div className={`p-1 rounded-md ${isActive("/network") ? "text-black" : "text-gray-500 group-hover:text-gray-700"}`}>
                  <Users size={20} />
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">My Network</span>
                {isActive("/network") && <div className="h-0.5 w-full bg-black mt-1 rounded-full"></div>}
              </div>
            </Link>
            
            <Link href="/jobs">
              <div className={`flex flex-col items-center px-4 py-1 cursor-pointer group ${isActive("/jobs") ? "text-black" : "text-gray-500 hover:text-gray-700"}`}>
                <div className={`p-1 rounded-md ${isActive("/jobs") ? "text-black" : "text-gray-500 group-hover:text-gray-700"}`}>
                  <Briefcase size={20} />
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">Jobs</span>
                {isActive("/jobs") && <div className="h-0.5 w-full bg-black mt-1 rounded-full"></div>}
              </div>
            </Link>
            
            <Link href="/messages">
              <div className={`flex flex-col items-center px-4 py-1 cursor-pointer group ${isActive("/messages") ? "text-black" : "text-gray-500 hover:text-gray-700"}`}>
                <div className={`p-1 rounded-md ${isActive("/messages") ? "text-black" : "text-gray-500 group-hover:text-gray-700"}`}>
                  <MessageSquare size={20} />
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">Messaging</span>
                {isActive("/messages") && <div className="h-0.5 w-full bg-black mt-1 rounded-full"></div>}
              </div>
            </Link>
            
            <Link href="/notifications">
              <div className={`flex flex-col items-center px-4 py-1 cursor-pointer group ${isActive("/notifications") ? "text-black" : "text-gray-500 hover:text-gray-700"}`}>
                <div className={`p-1 rounded-md ${isActive("/notifications") ? "text-black" : "text-gray-500 group-hover:text-gray-700"} relative`}>
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white">
                    2
                  </span>
                </div>
                <span className="text-xs mt-1 whitespace-nowrap">Notifications</span>
                {isActive("/notifications") && <div className="h-0.5 w-full bg-black mt-1 rounded-full"></div>}
              </div>
            </Link>
            
            {/* Me Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center px-4 py-1 cursor-pointer text-gray-500 hover:text-gray-700">
                  <div className="p-1 rounded-md">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                      <AvatarFallback className="bg-primary text-[10px]">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs mt-1 flex items-center whitespace-nowrap">
                    Me
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-2 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                      <AvatarFallback className="bg-primary">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.title || "Update your headline"}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 text-primary border-primary hover:bg-primary/5"
                    onClick={() => navigate("/profile")}
                  >
                    View Profile
                  </Button>
                </div>
                
                <div className="p-2 border-b">
                  <h3 className="font-semibold text-sm mb-2">Account</h3>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings & Privacy</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/help")}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help</span>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin-dashboard")}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                </div>
                
                <div className="p-2">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Work Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center px-4 py-1 cursor-pointer text-gray-500 hover:text-gray-700">
                  <div className="p-1 rounded-md">
                    <Grid size={20} />
                  </div>
                  <span className="text-xs mt-1 flex items-center whitespace-nowrap">
                    Work
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="p-2 border-b">
                  <h3 className="font-semibold text-sm mb-2">Create</h3>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/pitch-room")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Pitch Room</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/create-event")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Event</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/jobs/post")}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Job Posting</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </div>
                
                <div className="p-2">
                  <h3 className="font-semibold text-sm mb-2">Hindustan Founders Tools</h3>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navigate("/analytics")}>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/resources")}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Resources</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden ml-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-700"
            onClick={toggleMobileSidebar}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
    </header>
  );
}