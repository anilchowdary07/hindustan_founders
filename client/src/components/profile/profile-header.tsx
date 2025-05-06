import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, Edit, CheckCircle, UserPlus, UserCheck, Users, Loader2, 
  Share2, Copy, Facebook, Twitter, Linkedin, Mail, Link
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

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
    isVerified?: boolean;
    followerCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    website?: string;
    startupDetails?: {
      name?: string;
      founded?: string;
      industry?: string;
      stage?: string;
      description?: string;
      teamSize?: string;
      funding?: string;
    };
  };
  isCurrentUser: boolean;
}

export default function ProfileHeader({ user, isCurrentUser }: ProfileHeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const { user: currentUser } = useAuth();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    title: user.title || "",
    company: user.company || "",
    location: user.location || "",
    bio: user.bio || "",
    website: user.website || "",
    startupDetails: {
      name: user.startupDetails?.name || "",
      founded: user.startupDetails?.founded || "",
      industry: user.startupDetails?.industry || "",
      stage: user.startupDetails?.stage || "",
      description: user.startupDetails?.description || "",
      teamSize: user.startupDetails?.teamSize || "",
      funding: user.startupDetails?.funding || ""
    }
  });
  
  // State for profile photo upload
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    const totalFields = 7; // name, title, company, location, bio, website, startup details
    
    if (user.name) completed++;
    if (user.title) completed++;
    if (user.company) completed++;
    if (user.location) completed++;
    if (user.bio) completed++;
    if (user.website) completed++;
    if (user.startupDetails?.name) completed++;
    
    return Math.round((completed / totalFields) * 100);
  };
  
  const profileCompletion = user.profileCompleted || calculateProfileCompletion();
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  
  // Update profile data when user changes
  useEffect(() => {
    setProfileData({
      name: user.name || "",
      title: user.title || "",
      company: user.company || "",
      location: user.location || "",
      bio: user.bio || "",
      website: user.website || "",
      startupDetails: {
        name: user.startupDetails?.name || "",
        founded: user.startupDetails?.founded || "",
        industry: user.startupDetails?.industry || "",
        stage: user.startupDetails?.stage || "",
        description: user.startupDetails?.description || "",
        teamSize: user.startupDetails?.teamSize || "",
        funding: user.startupDetails?.funding || ""
      }
    });
  }, [user]);
  
  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("POST", `/api/users/${user.id}/follow`);
        return await res.json();
      } catch (error) {
        console.error("Error following user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsFollowing(true);
      toast({
        title: "Success",
        description: `You are now following ${user.name}`
      });
      // Invalidate user queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to follow user: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("DELETE", `/api/users/${user.id}/follow`);
        return await res.json();
      } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsFollowing(false);
      toast({
        title: "Success",
        description: `You have unfollowed ${user.name}`
      });
      // Invalidate user queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to unfollow user: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };
  
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: Partial<typeof user>) => {
      const response = await apiRequest(`/api/users/${user.id}`, "PATCH", userData);
      
      if (response.error) {
        console.error("Error updating profile:", response.error);
        throw new Error(response.error.message || "Failed to update profile");
      }
      
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Update the user data in the cache
      queryClient.setQueryData(["user"], updatedUser);
      
      // Also invalidate any queries that might depend on this user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: [`users/${user.id}`] });
      
      // Close the edit dialog
      setIsEditProfileOpen(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive"
      });
    },
  });
  
  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File, type: 'profile' | 'cover' }) => {
      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('type', type);
        
        // Check file size
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('File size exceeds 5MB limit');
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
          throw new Error('Only image files are allowed');
        }
        
        const res = await fetch(`/api/users/${user.id}/photo`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload photo');
        }
        
        return await res.json();
      } catch (error) {
        console.error(`Error uploading ${type} photo:`, error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update the user data in the cache
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      toast({
        title: "Photo updated",
        description: "Your photo has been updated successfully",
      });
      
      // Reset the file state
      setProfilePhotoFile(null);
      setCoverPhotoFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload photo: ${error.message}`,
        variant: "destructive"
      });
    },
  });
  
  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setProfilePhotoFile(file);
      setIsUploading(true);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the photo
      uploadPhotoMutation.mutate(
        { file, type: 'profile' },
        {
          onSuccess: () => {
            setIsUploading(false);
            toast({
              title: "Profile photo updated",
              description: "Your profile photo has been updated successfully"
            });
          },
          onError: () => {
            setIsUploading(false);
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
          }
        }
      );
    }
  };
  
  const handleCoverPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setCoverPhotoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Show confirmation dialog before uploading
      if (confirm("Upload this cover photo?")) {
        uploadPhotoMutation.mutate({ file, type: 'cover' });
      } else {
        setCoverPhotoFile(null);
        setCoverPhotoPreview(null);
      }
    }
  };
  
  const handleProfileUpdate = () => {
    updateProfileMutation.mutate(profileData);
    // Dialog will close automatically on success due to the onSuccess handler in the mutation
  };

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
  
  // Get the profile URL for sharing
  const getProfileUrl = () => {
    return `${window.location.origin}/profile/${user.id}`;
  };
  
  // Handle copying profile URL to clipboard
  const handleCopyProfileUrl = () => {
    const profileUrl = getProfileUrl();
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Profile link copied to clipboard"
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard",
          variant: "destructive"
        });
      });
  };
  
  // Handle sharing to social media
  const handleShareToSocial = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email') => {
    const profileUrl = getProfileUrl();
    const userName = user.name;
    const userTitle = user.title || "Professional";
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(`Check out ${userName}'s profile on Founder Network`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`${userName}'s Profile on Founder Network`)}&body=${encodeURIComponent(`Check out ${userName}'s profile on Founder Network: ${profileUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden mb-6">
      {/* Background image - LinkedIn uses a 1584x396 image */}
      <div className="h-[200px] bg-gradient-to-r from-[#70B5F9] to-[#0077B5] relative">
        {isCurrentUser && (
          <>
            <input 
              type="file" 
              id="cover-photo-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleCoverPhotoChange}
            />
            <label 
              htmlFor="cover-photo-upload"
              className="absolute top-4 right-4 bg-white bg-opacity-80 p-1.5 rounded-full hover:bg-white hover:bg-opacity-100 transition-colors cursor-pointer"
            >
              <Camera className="h-5 w-5 text-[#191919]" />
            </label>
          </>
        )}
      </div>
      
      <div className="px-6 sm:px-8 pb-6 relative">
        {/* Edit profile button for current user */}
        {isCurrentUser && (
          <div className="absolute top-4 right-6 flex items-center space-x-2">
            {profileCompletion < 100 && (
              <div className="hidden md:flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <span className="text-xs text-amber-800">{profileCompletion}% complete</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[#0077B5] border-[#0077B5] hover:bg-[#E5F5FC] rounded-full"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit profile
            </Button>
          </div>
        )}
        
        <div className="flex flex-col md:flex-column items-center md:items-start">
          {/* Profile photo - LinkedIn uses 400x400px images */}
          <div className="relative -top-24 md:-top-28 mb-0 md:mb-0 md:mr-6 flex-shrink-0">
            <div className="h-[152px] w-[152px] rounded-full border-4 border-white overflow-hidden relative bg-white shadow-md">
              <Avatar className="h-full w-full">
                {profilePhotoPreview ? (
                  <AvatarImage src={profilePhotoPreview} alt={user.name} />
                ) : (
                  <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                )}
                <AvatarFallback className="bg-[#0077B5] text-white text-5xl">{getInitials()}</AvatarFallback>
              </Avatar>
              {isCurrentUser && (
                <>
                  <input 
                    type="file" 
                    id="profile-photo-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <label 
                      htmlFor="profile-photo-upload"
                      className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-sm hover:bg-[#EBEBEB] transition-colors cursor-pointer"
                    >
                      <Camera className="h-5 w-5 text-[#191919]" />
                    </label>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* User info section */}
          <div className="flex-1 pt-0 md:-mt-16 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start flex-wrap">
              <h1 className="text-3xl font-bold text-[#191919] mr-2">{user.name}</h1>
              {user.isVerified && (
                <div className="text-[#0077B5] mr-2" title="Verified Account">
                  <CheckCircle className="h-5 w-5 fill-[#E5F5FC] stroke-[#0077B5]" />
                </div>
              )}
              <Badge className="bg-[#E7F3FF] text-[#0073B1] hover:bg-[#D0E8FF] border-none font-normal px-2 py-1 h-6 rounded">
                {getRoleDisplay()}
              </Badge>
            </div>
            
            <h2 className="text-lg text-[#191919] mt-2">{user.title || "Professional Title"}</h2>
            <p className="text-[#666666] mt-1">{user.company || "Company"} • {user.location || "India"}</p>
            
            {user.website && (
              <p className="text-[#0077B5] mt-1 hover:underline">
                <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer">
                  {user.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </p>
            )}
            
            <div className="flex items-center text-sm text-[#0077B5] mt-1 justify-center md:justify-start">
              <a href="#" className="hover:underline">Contact info</a>
              <span className="mx-2 text-[#666666]">•</span>
              <a href="#" className="hover:underline flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span className="font-semibold">{user.followerCount || 500}</span> connections
              </a>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
              {isCurrentUser ? (
                <>
                  <Button 
                    id="edit-profile-button"
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium"
                    onClick={() => setIsShareDialogOpen(true)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share profile
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.print()}>
                        Download profile as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({
                        title: "Coming Soon",
                        description: "This feature is not yet implemented."
                      })}>
                        View profile analytics
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium">
                    Connect
                  </Button>
                  <Button variant="outline" className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
                    Message
                  </Button>
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    className={`flex items-center gap-1 rounded-full font-medium ${
                      isFollowing 
                        ? 'border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182]' 
                        : 'bg-[#0A66C2] text-white hover:bg-[#004182]'
                    }`}
                    onClick={handleFollowToggle}
                    disabled={followMutation.isPending || unfollowMutation.isPending}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium"
                    onClick={() => setIsShareDialogOpen(true)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.print()}>
                        Download profile as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({
                        title: "Coming Soon",
                        description: "Report profile feature is not yet implemented."
                      })}>
                        Report profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={profileData.title}
                onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                className="col-span-3"
                placeholder="Professional Title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                className="col-span-3"
                placeholder="Company Name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                className="col-span-3"
                placeholder="City, Country"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                className="col-span-3"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="col-span-3"
                placeholder="Tell us about yourself"
              />
            </div>
            
            {/* Startup Details Section */}
            <div className="col-span-4 mt-4">
              <h3 className="font-semibold text-lg border-b pb-2 mb-4">Startup Details</h3>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="startup-name" className="text-right">
                  Startup Name
                </Label>
                <Input
                  id="startup-name"
                  value={profileData.startupDetails.name}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      name: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="Your Startup Name"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="founded" className="text-right">
                  Founded
                </Label>
                <Input
                  id="founded"
                  type="text"
                  value={profileData.startupDetails.founded}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      founded: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="e.g., 2023"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="industry" className="text-right">
                  Industry
                </Label>
                <Input
                  id="industry"
                  value={profileData.startupDetails.industry}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      industry: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="e.g., Fintech, Healthcare, AI"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="stage" className="text-right">
                  Stage
                </Label>
                <Input
                  id="stage"
                  value={profileData.startupDetails.stage}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      stage: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="e.g., Seed, Series A, Growth"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="team-size" className="text-right">
                  Team Size
                </Label>
                <Input
                  id="team-size"
                  value={profileData.startupDetails.teamSize}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      teamSize: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="e.g., 1-10, 11-50, 51-200"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="funding" className="text-right">
                  Funding
                </Label>
                <Input
                  id="funding"
                  value={profileData.startupDetails.funding}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      funding: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="e.g., Bootstrapped, $500K, $2M"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mb-3">
                <Label htmlFor="startup-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="startup-description"
                  value={profileData.startupDetails.description}
                  onChange={(e) => setProfileData({
                    ...profileData, 
                    startupDetails: {
                      ...profileData.startupDetails,
                      description: e.target.value
                    }
                  })}
                  className="col-span-3"
                  placeholder="Describe your startup, its mission, and vision"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleProfileUpdate}
              disabled={updateProfileMutation.isPending}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Profile Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Profile</DialogTitle>
            <DialogDescription>
              Share {isCurrentUser ? "your" : `${user.name}'s`} profile with others
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="profile-url" className="text-sm font-medium mb-1.5 block">
                Profile Link
              </Label>
              <div className="flex items-center">
                <Input
                  id="profile-url"
                  readOnly
                  value={getProfileUrl()}
                  className="flex-1 pr-10 bg-[#F9F9F9] border-[#E0E0E0] focus-visible:ring-[#0A66C2]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-12 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF]"
                  onClick={handleCopyProfileUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <Label className="text-sm font-medium mb-3 block">
                Share via
              </Label>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 mx-1 flex flex-col items-center py-6 border-[#E0E0E0] hover:bg-[#F3F2EF] hover:border-[#0A66C2]"
                  onClick={() => handleShareToSocial('linkedin')}
                >
                  <Linkedin className="h-6 w-6 mb-2 text-[#0A66C2]" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 mx-1 flex flex-col items-center py-6 border-[#E0E0E0] hover:bg-[#F3F2EF] hover:border-[#1DA1F2]"
                  onClick={() => handleShareToSocial('twitter')}
                >
                  <Twitter className="h-6 w-6 mb-2 text-[#1DA1F2]" />
                  <span className="text-xs">Twitter</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 mx-1 flex flex-col items-center py-6 border-[#E0E0E0] hover:bg-[#F3F2EF] hover:border-[#4267B2]"
                  onClick={() => handleShareToSocial('facebook')}
                >
                  <Facebook className="h-6 w-6 mb-2 text-[#4267B2]" />
                  <span className="text-xs">Facebook</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 mx-1 flex flex-col items-center py-6 border-[#E0E0E0] hover:bg-[#F3F2EF] hover:border-[#EA4335]"
                  onClick={() => handleShareToSocial('email')}
                >
                  <Mail className="h-6 w-6 mb-2 text-[#EA4335]" />
                  <span className="text-xs">Email</span>
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsShareDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
