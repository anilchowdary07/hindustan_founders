import { useAuth } from "@/hooks/use-auth";
import Header from "./header";
import MobileNav from "./mobile-nav";
import { ReactNode } from "react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // Simple function to determine active nav item based on current route
  const getActiveTab = () => {
    if (location === "/") return "home";
    if (location.startsWith("/network")) return "network";
    if (location.startsWith("/jobs")) return "jobs";
    if (location.startsWith("/messages")) return "messages";
    if (location.startsWith("/notifications")) return "notifications";
    if (location.startsWith("/profile")) return "profile";
    if (location.startsWith("/pitch-room")) return "pitch-room";
    return "";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {children}
      </main>
      <MobileNav activeTab={getActiveTab()} />
    </div>
  );
}
