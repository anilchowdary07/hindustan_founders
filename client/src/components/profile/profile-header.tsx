import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
      <div className="h-40 bg-gradient-to-r from-primary to-blue-700 relative">
        {isCurrentUser && (
          <button className="absolute top-4 right-4 bg-white bg-opacity-70 p-1 rounded-full">
            <Camera className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
      <div className="px-4 sm:px-6 pb-6 relative">
        {isCurrentUser && (
          <div className="flex justify-end py-3">
            <Button variant="ghost" className="text-primary">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        )}
        
        <div className="sm:flex">
          <div className="absolute -top-16 left-4 sm:relative sm:left-0 sm:-top-8">
            <div className="h-28 w-28 rounded-full border-4 border-white overflow-hidden relative">
              <Avatar className="h-full w-full">
                <AvatarImage src={user.avatarUrl || ""} />
                <AvatarFallback className="bg-primary text-white text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              {isCurrentUser && (
                <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full">
                  <Camera className="h-4 w-4 text-gray-700" />
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-12 sm:mt-0 sm:ml-4 flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <h3 className="text-3xl font-bold text-primary mt-1">{getRoleDisplay()}</h3>
            <p className="text-gray-600">{user.company || user.title || ""}</p>
            <p className="text-sm text-gray-500 mt-1">{user.location || "India"} • <a href="#" className="text-primary">Contact info</a></p>
            
            <div className="flex mt-2">
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
