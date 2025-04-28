import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Bell, 
  MessageCircle,
  User,
  LogOut,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeafIcon } from "../ui/leaf-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
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

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="bg-white bg-opacity-20 rounded-md p-1">
                <LeafIcon className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg ml-1">HF</span>
              <h1 className="hidden md:block ml-2 font-bold">Hindustan Founders</h1>
            </div>
          </Link>
          
          <div className="hidden md:flex ml-8 space-x-6">
            <Link href="/">
              <a className="text-white hover:text-blue-200">Home</a>
            </Link>
            <Link href="/jobs">
              <a className="text-white hover:text-blue-200">Jobs</a>
            </Link>
            <Link href="/pitch-room">
              <a className="text-white hover:text-blue-200">Pitch Room</a>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <Input 
              className="w-full bg-blue-700 text-white rounded-md py-2 pl-10 pr-4 placeholder-gray-300"
              placeholder="Search" 
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-5">
          <button className="hidden md:block">
            <Bell size={20} />
          </button>
          <button className="hidden md:block">
            <MessageCircle size={20} />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl || ""} />
                  <AvatarFallback className="bg-blue-600">{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs text-gray-500">@{user.username}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
