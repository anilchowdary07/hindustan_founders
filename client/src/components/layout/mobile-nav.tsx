import { Link, useLocation } from "wouter";
import { 
  HomeIcon, 
  Users, 
  DoorOpen, 
  Settings, 
  MessageCircle
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
}

export default function MobileNav({ activeTab }: MobileNavProps) {
  const [, navigate] = useLocation();

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: HomeIcon,
      id: "home"
    },
    {
      name: "Network",
      path: "/network",
      icon: Users,
      id: "network"
    },
    {
      name: "Pitch",
      path: "/pitch-room",
      icon: DoorOpen,
      id: "pitch-room"
    },
    {
      name: "Chats",
      path: "/messages",
      icon: MessageCircle,
      id: "messages"
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      id: "settings"
    }
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 fixed bottom-0 left-0 right-0 py-2 px-4 md:hidden z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center cursor-pointer focus:outline-none"
            >
              <item.icon className={`${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'} h-5 w-5`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}