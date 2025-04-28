import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ProfileCard() {
  const { user } = useAuth();
  
  if (!user) return null;

  const getInitials = () => {
    if (!user.name) return "HF";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleDisplay = () => {
    if (!user.role) return "";
    return user.role.toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden md:col-span-1">
      <div className="h-24 bg-gradient-to-r from-primary to-blue-700"></div>
      <div className="px-4 pt-0 pb-4 relative">
        <div className="absolute -top-10 left-4">
          <Avatar className="h-20 w-20 border-4 border-white">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-primary text-white text-xl">{getInitials()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-12">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="text-2xl font-bold text-primary mt-1">{getRoleDisplay()}</div>
              <p className="text-gray-600 mt-1">{user.company || ""}</p>
            </div>
            <Link href="/profile">
              <Button variant="ghost" className="text-primary">Edit</Button>
            </Link>
          </div>
          
          <p className="mt-4 text-gray-700">{user.bio || "Complete your profile by adding a bio."}</p>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-800">Profile strength</h3>
            <Progress value={user.profileCompleted} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              Complete more steps to improve your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
