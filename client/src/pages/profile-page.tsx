import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import ProfileHeader from "@/components/profile/profile-header";
import ExperienceItem from "@/components/profile/experience-item";
import ActivityItem from "@/components/profile/activity-item";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const profileId = params.id ? parseInt(params.id) : user?.id;
  const { toast } = useToast();
  
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [experienceData, setExperienceData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });
  
  const isCurrentUser = user?.id === profileId;
  
  const {
    data: profileUser,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ["/api/user"],
    enabled: isCurrentUser,
  });
  
  const createExperienceMutation = useMutation({
    mutationFn: async (data: typeof experienceData) => {
      const res = await apiRequest("POST", "/api/experiences", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Experience added successfully"
      });
      setIsExperienceDialogOpen(false);
      setExperienceData({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}/experiences`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add experience: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const {
    data: experiences,
    isLoading: isLoadingExperiences,
  } = useQuery({
    queryKey: [`/api/users/${profileId}/experiences`],
    enabled: !!profileId,
  });

  const {
    data: posts,
    isLoading: isLoadingPosts,
  } = useQuery({
    queryKey: [`/api/users/${profileId}/posts`],
    enabled: !!profileId,
  });

  // Use the profile user data if viewing own profile
  const displayUser = isCurrentUser ? profileUser ?? user : user;
  
  const handleExperienceSubmit = () => {
    if (!experienceData.title || !experienceData.company) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    createExperienceMutation.mutate(experienceData);
  };

  if (!user) return null;

  return (
    <Layout>
      {isLoadingUser ? (
        <Skeleton className="h-64 w-full mb-6" />
      ) : (
        <ProfileHeader 
          user={displayUser} 
          isCurrentUser={isCurrentUser} 
        />
      )}
      
      {/* About */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Narrative</h3>
        {isLoadingUser ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-gray-700">
            {displayUser?.bio || "This user hasn't added a bio yet."}
          </p>
        )}
      </div>
      
      {/* Experience */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Experience</h3>
          {isCurrentUser && (
            <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Experience</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="exp-title">Job Title*</Label>
                    <Input 
                      id="exp-title" 
                      value={experienceData.title}
                      onChange={(e) => setExperienceData({...experienceData, title: e.target.value})}
                      placeholder="e.g. Software Engineer"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="exp-company">Company*</Label>
                    <Input 
                      id="exp-company" 
                      value={experienceData.company}
                      onChange={(e) => setExperienceData({...experienceData, company: e.target.value})}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="exp-location">Location</Label>
                    <Input 
                      id="exp-location" 
                      value={experienceData.location}
                      onChange={(e) => setExperienceData({...experienceData, location: e.target.value})}
                      placeholder="e.g. Bangalore, India"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="exp-start-date">Start Date</Label>
                      <Input 
                        id="exp-start-date" 
                        type="date"
                        value={experienceData.startDate}
                        onChange={(e) => setExperienceData({...experienceData, startDate: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="exp-end-date">End Date</Label>
                      <Input 
                        id="exp-end-date" 
                        type="date"
                        value={experienceData.endDate}
                        onChange={(e) => setExperienceData({...experienceData, endDate: e.target.value})}
                        disabled={experienceData.current}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="exp-current"
                      checked={experienceData.current}
                      onChange={(e) => setExperienceData({...experienceData, current: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="exp-current">I currently work here</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="exp-description">Description</Label>
                    <Textarea 
                      id="exp-description" 
                      value={experienceData.description}
                      onChange={(e) => setExperienceData({...experienceData, description: e.target.value})}
                      placeholder="Describe your responsibilities and achievements"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleExperienceSubmit}
                    disabled={createExperienceMutation.isPending}
                  >
                    {createExperienceMutation.isPending ? 
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </div> 
                      : 'Add Experience'
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {isLoadingExperiences ? (
          <div className="space-y-6">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex">
                <Skeleton className="h-12 w-12 rounded-md flex-shrink-0" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : experiences?.length > 0 ? (
          experiences.map((exp: any) => (
            <ExperienceItem key={exp.id} experience={exp} />
          ))
        ) : (
          <p className="text-gray-500">No experience added yet.</p>
        )}
      </div>
      
      {/* Activity */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Activity</h3>
          <Button variant="ghost" className="text-primary font-medium">See all</Button>
        </div>
        
        {isLoadingPosts ? (
          <div className="space-y-6">
            {Array(2).fill(0).map((_, i) => (
              <div key={i}>
                <div className="flex items-start mb-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-3 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2 ml-15">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts?.length > 0 ? (
          posts.map((post: any) => (
            <ActivityItem 
              key={post.id} 
              activity={{
                id: post.id,
                content: post.content,
                createdAt: new Date(post.createdAt),
                user: {
                  id: user.id,
                  name: user.name,
                  avatarUrl: user.avatarUrl,
                },
              }} 
            />
          ))
        ) : (
          <p className="text-gray-500">No activity to show yet.</p>
        )}
      </div>
    </Layout>
  );
}
