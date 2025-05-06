import { useLocation } from "wouter";
import { 
  HomeIcon, 
  Users, 
  Bell,
  Briefcase,
  PlusCircle,
  Menu,
  FileText,
  MessageSquare,
  Lightbulb,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";

interface MobileNavProps {
  activeTab: string;
}

export default function MobileNav({ activeTab }: MobileNavProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNav, setShowNav] = useState(true);

  // Handle scroll behavior like LinkedIn (hide on scroll down, show on scroll up)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setShowNav(false);
      } else {
        // Scrolling up or at top
        setShowNav(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: HomeIcon,
      id: "home",
      ariaLabel: "Home feed"
    },
    {
      name: "My Network",
      path: "/network",
      icon: Users,
      id: "network",
      ariaLabel: "My network"
    },
    {
      name: "Post",
      path: "#",
      icon: PlusCircle,
      id: "post",
      ariaLabel: "Create a post",
      action: () => {
        // This will be handled by the parent component
        const createPostEvent = new CustomEvent('openCreatePost');
        window.dispatchEvent(createPostEvent);
      }
    },
    {
      name: "Jobs",
      path: "/jobs",
      icon: Briefcase,
      id: "jobs",
      ariaLabel: "Jobs"
    },
    {
      name: "Innovations",
      path: "/student-innovations",
      icon: Lightbulb,
      id: "innovations",
      ariaLabel: "Student Innovations"
    }
  ];

  return (
    <nav 
      className={`bg-white border-t border-[#E0E0E0] fixed bottom-0 left-0 right-0 md:hidden z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
        showNav ? 'translate-y-0' : 'translate-y-full'
      }`}
      aria-label="Primary navigation"
    >
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : navigate(item.path)}
              className="flex flex-col items-center justify-center cursor-pointer focus:outline-none px-1 py-2 relative flex-1"
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <item.icon className={`${isActive ? 'text-[#0A66C2]' : 'text-[#666666]'} h-6 w-6`} />
                {item.badge && (
                  <span 
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-[#CC1016] rounded-full flex items-center justify-center text-[10px] text-white font-medium"
                    aria-label={`${item.badge} new notifications`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'text-[#0A66C2] font-medium' : 'text-[#666666]'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
        <button 
          onClick={() => {
            // Dispatch a custom event to open the more menu
            const openMoreMenuEvent = new CustomEvent('openMoreMenu');
            window.dispatchEvent(openMoreMenuEvent);
          }}
          className="flex flex-col items-center justify-center cursor-pointer focus:outline-none px-1 py-2 relative flex-1"
          aria-label="More options"
          aria-current={activeTab === "more" ? "page" : undefined}
        >
          <div className="relative">
            <Menu className={`${activeTab === "more" ? 'text-[#0A66C2]' : 'text-[#666666]'} h-6 w-6`} />
          </div>
          <span className={`text-[11px] mt-1 ${activeTab === "more" ? 'text-[#0A66C2] font-medium' : 'text-[#666666]'}`}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}