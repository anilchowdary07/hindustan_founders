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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden md:col-span-1 hover:shadow-md transition-shadow">
      {/* Cover photo */}
      <div className="h-24 bg-gradient-to-r from-primary to-blue-600 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('/patterns/dot-pattern.png')] bg-repeat"></div>
      </div>
      
      {/* Profile content */}
      <div className="px-4 py-4">
        {/* Avatar section - positioned at the top center */}
        <div className="flex justify-center -mt-12 mb-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-md">
            <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Name and basic info - centered */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <div className="text-sm font-bold text-primary mt-1 flex items-center justify-center flex-wrap">
            <Badge className="mx-1 mb-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
              {getRoleDisplay()}
            </Badge>
            <Badge variant="outline" className="mx-1 mb-1 bg-blue-50 text-blue-600 border-blue-200">
              Verified
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">{user.company || ""}</p>
        </div>
        
        {/* Edit profile button */}
        <div className="flex justify-center mb-4">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors">
              Edit Profile
            </Button>
          </Link>
        </div>
          
        {/* Bio section */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {user.bio || "Complete your profile by adding a professional bio to help others understand your expertise and interests."}
          </p>
        </div>
        
        {/* Profile strength section */}
        <div className="mt-5 border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Profile strength</h3>
            <Badge variant="outline" className={`${
              profileStrength >= 80 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : profileStrength >= 50 
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {profileStrength}%
            </Badge>
          </div>
          <Progress 
            value={profileStrength} 
            className="mt-2 h-2" 
            indicatorClassName={`${
              profileStrength >= 80 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : profileStrength >= 50 
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              {profileStrength < 100 ? 'Complete more steps to improve your profile' : 'Your profile is complete!'}
            </p>
            <Link href="/settings">
              <Button variant="link" size="sm" className="text-xs p-0 h-auto text-primary hover:text-primary/80 transition-colors">
                Improve
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Profile completion suggestions */}
        {profileStrength < 100 && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Suggested actions:</h4>
              <ul className="text-xs text-blue-700 space-y-2">
                {!user.bio && (
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                    <span>Add a professional bio</span>
                  </li>
                )}
                {!user.avatarUrl && (
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                    <span>Upload a profile picture</span>
                  </li>
                )}
                {!user.location && (
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                    <span>Add your location</span>
                  </li>
                )}
                {!user.company && (
                  <li className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                    <span>Add your company</span>
                  </li>
                )}
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                  <span>Connect with more professionals</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
