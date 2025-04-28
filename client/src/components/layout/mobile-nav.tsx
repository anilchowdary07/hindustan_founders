import { Link } from "wouter";
import { 
  HomeIcon, 
  Users, 
  DoorOpen, 
  Bell, 
  Briefcase,
  User
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
}

export default function MobileNav({ activeTab }: MobileNavProps) {
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
      name: "Jobs",
      path: "/jobs",
      icon: Briefcase,
      id: "jobs"
    },
    {
      name: "Pitch Room",
      path: "/pitch-room",
      icon: DoorOpen,
      id: "pitch-room"
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
      id: "profile"
    }
  ];

  return (
    <nav className="bg-white border-t sticky bottom-0 py-2 px-4 md:hidden z-10">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link 
              key={item.id}
              href={item.path}
            >
              <a className="flex flex-col items-center">
                <item.icon className={`${isActive ? 'text-primary' : 'text-gray-500'}`} />
                <span className={`text-xs mt-1 ${isActive ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {item.name}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
