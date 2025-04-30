import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function ProfileCard() {
  const { user } = useAuth();
  const [profileStrength, setProfileStrength] = useState(0);
  
  // Calculate profile strength based on user data
  useEffect(() => {
    if (user) {
      let strength = 0;
      
      // Basic profile - 25%
      if (user.name) strength += 5;
      if (user.email) strength += 5;
      if (user.role) strength += 5;
      if (user.title) strength += 5;
      if (user.company) strength += 5;
      
      // Additional info - 25%
      if (user.location) strength += 5;
      if (user.bio && user.bio.length > 10) strength += 10;
      if (user.avatarUrl) strength += 10;
      
      // We'll assume the rest would come from activity, connections, etc.
      // For demo purposes, add some random strength
      strength += 30; // Activity, posts, etc.
      
      setProfileStrength(strength);
    }
  }, [user]);
  
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
            <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
            <AvatarFallback className="bg-primary text-white text-xl">{getInitials()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="mt-12">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="text-sm font-bold text-primary mt-1">{getRoleDisplay()}</div>
              <p className="text-gray-600 mt-1">{user.company || ""}</p>
            </div>
            <Link href="/profile">
              <Button variant="ghost" className="text-primary">Edit</Button>
            </Link>
          </div>
          
          <p className="mt-4 text-gray-700">{user.bio || "Complete your profile by adding a bio."}</p>
          
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800">Profile strength</h3>
              <Badge variant="outline" className={`${profileStrength >= 80 ? 'bg-green-50 text-green-700' : profileStrength >= 50 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                {profileStrength}%
              </Badge>
            </div>
            <Progress value={profileStrength} className="mt-2" />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                {profileStrength < 100 ? 'Complete more steps to improve your profile' : 'Your profile is complete!'}
              </p>
              <Link href="/settings">
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">Improve</Button>
              </Link>
            </div>
          </div>
          
          {/* Profile completion suggestions */}
          {profileStrength < 100 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested actions:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                {!user.bio && <li>• Add a professional bio</li>}
                {!user.avatarUrl && <li>• Upload a profile picture</li>}
                {!user.location && <li>• Add your location</li>}
                {!user.company && <li>• Add your company</li>}
                <li>• Connect with more professionals</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
