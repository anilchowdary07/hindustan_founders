import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Camera, Edit } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id: number;
    name: string;
    role: string;
    title?: string;
    company?: string;
    location?: string;
    bio?: string;
    avatarUrl?: string;
  };
  isCurrentUser: boolean;
}

export default function ProfileHeader({ user, isCurrentUser }: ProfileHeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: Partial<typeof user>) => {
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="h-48 bg-gradient-to-r from-primary to-blue-700 relative">
        {isCurrentUser && (
          <button className="absolute top-4 right-4 bg-white bg-opacity-70 p-1.5 rounded-full hover:bg-white hover:bg-opacity-100 transition-colors">
            <Camera className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
      <div className="px-4 sm:px-6 pb-10 relative pt-4">
        {isCurrentUser && (
          <div className="flex justify-end py-2">
            <Button variant="ghost" className="text-primary">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center md:items-start">
          {/* Profile photo container with fixed positioning */}
          <div className="relative -top-20 mb-4 md:mb-0 md:mr-6">
            <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden relative bg-white shadow-md">
              <Avatar className="h-full w-full">
                <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                <AvatarFallback className="bg-primary text-white text-3xl">{getInitials()}</AvatarFallback>
              </Avatar>
              {isCurrentUser && (
                <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                  <Camera className="h-4 w-4 text-gray-700" />
                </button>
              )}
            </div>
          </div>
          
          {/* User info with proper spacing */}
          <div className="flex-1 pt-0 md:pt-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <h3 className="text-lg font-bold text-primary mt-1">{getRoleDisplay()}</h3>
            <p className="text-gray-600 mt-2">{user.company || user.title || ""}</p>
            <p className="text-sm text-gray-500 mt-1">{user.location || "India"} • <a href="#" className="text-primary">Contact info</a></p>
            
            <div className="flex justify-center md:justify-start mt-4">
              {isCurrentUser ? (
                <>
                  <Button variant="outline" className="text-primary border-primary">Update Profile</Button>
                </>
              ) : (
                <>
                  <Button>Connect</Button>
                  <Button variant="outline" className="ml-2">Message</Button>
                  <Button variant="outline" className="ml-2">Follow</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
