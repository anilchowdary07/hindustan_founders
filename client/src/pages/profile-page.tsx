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
  const displayUser = isCurrentUser ? profileUser : {};

  if (!user) return null;

  return (
    <Layout>
      {isLoadingUser ? (
        <Skeleton className="h-64 w-full mb-6" />
      ) : (
        <ProfileHeader 
          user={displayUser || user} 
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
            <Button variant="ghost" size="sm" className="text-gray-500">
              <Plus className="h-5 w-5" />
            </Button>
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
