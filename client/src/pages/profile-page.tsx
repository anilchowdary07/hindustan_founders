import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import ProfileHeader from "@/components/profile/profile-header";
import ExperienceItem from "@/components/profile/experience-item";
import EducationItem from "@/components/profile/education-item";
import ActivityItem from "@/components/profile/activity-item";
import HighlightsSection from "@/components/profile/highlights-section";
import HighlightDialog from "@/components/profile/highlight-dialog";
import NetworkStats from "@/components/profile/network-stats";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, Award, Briefcase, GraduationCap, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const profileId = params.id ? parseInt(params.id) : user?.id;
  const { toast } = useToast();
  
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [experienceData, setExperienceData] = useState({
    id: null as number | null,
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    isEditing: false
  });
  
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
  const [educationData, setEducationData] = useState({
    id: null as number | null,
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    location: "",
    isEditing: false
  });
  
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [skillsData, setSkillsData] = useState({
    skills: ["", "", ""],
    isEditing: false
  });
  
  const [isHighlightDialogOpen, setIsHighlightDialogOpen] = useState(false);
  const [highlightData, setHighlightData] = useState<any>(null);
  
  const isCurrentUser = user?.id === profileId;
  
  // Fetch user profile data - either current user or another user's profile
  const {
    data: profileUser,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        return await res.json();
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    },
    enabled: isCurrentUser,
  });
  
  // Fetch other user's profile if not current user
  const {
    data: otherUserProfile,
    isLoading: isLoadingOtherUser,
  } = useQuery({
    queryKey: [`/api/users/${profileId}`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/users/${profileId}`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching other user profile:", error);
        return null;
      }
    },
    enabled: !isCurrentUser && !!profileId,
  });
  
  const createExperienceMutation = useMutation({
    mutationFn: async (data: typeof experienceData) => {
      try {
        const { isEditing, id, ...experienceFields } = data;
        
        if (id) {
          // Update existing experience
          const response = await apiRequest(`/api/experiences/${id}`, "PATCH", {
            ...experienceFields,
            userId: profileId
          });
          return response.data;
        } else {
          // Create new experience
          const response = await apiRequest("/api/experiences", "POST", {
            ...experienceFields,
            userId: profileId
          });
          return response.data;
        }
      } catch (error) {
        console.error("Error with experience:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: experienceData.isEditing 
          ? "Experience updated successfully" 
          : "Experience added successfully"
      });
      setIsExperienceDialogOpen(false);
      setExperienceData({
        id: null,
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
        isEditing: false
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}/experiences`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${experienceData.isEditing ? 'update' : 'add'} experience: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const {
    data: experiences,
    isLoading: isLoadingExperiences,
  } = useQuery({
    queryKey: [`/api/users/${profileId}/experiences`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/users/${profileId}/experiences`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching experiences:", error);
        return [];
      }
    },
    enabled: !!profileId,
  });

  const {
    data: posts,
    isLoading: isLoadingPosts,
  } = useQuery({
    queryKey: [`/api/users/${profileId}/posts`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/users/${profileId}/posts`);
        return await res.json();
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
      }
    },
    enabled: !!profileId,
  });

  // Use the appropriate user data based on whose profile we're viewing
  const displayUser = isCurrentUser ? profileUser ?? user : otherUserProfile ?? user;
  
  // Create a properly typed user object for the profile header
  const userForProfile = {
    id: (displayUser as any)?.id || 0,
    name: (displayUser as any)?.name || "",
    role: (displayUser as any)?.role || "",
    title: (displayUser as any)?.title || undefined,
    company: (displayUser as any)?.company || undefined,
    location: (displayUser as any)?.location || undefined,
    bio: (displayUser as any)?.bio || undefined,
    avatarUrl: (displayUser as any)?.avatarUrl || undefined,
    isVerified: (displayUser as any)?.isVerified || false,
  };
  
  const handleExperienceSubmit = () => {
    if (!experienceData.title || !experienceData.company || !experienceData.startDate) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate dates
    if (!experienceData.current && experienceData.endDate) {
      const startDate = new Date(experienceData.startDate);
      const endDate = new Date(experienceData.endDate);
      
      if (endDate < startDate) {
        toast({
          title: "Validation Error",
          description: "End date cannot be before start date",
          variant: "destructive",
        });
        return;
      }
    }
    
    createExperienceMutation.mutate(experienceData);
  };
  
  const handleEditExperience = (experience: any) => {
    setExperienceData({
      id: experience.id,
      title: experience.title,
      company: experience.company,
      location: experience.location || "",
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      current: experience.current,
      description: experience.description || "",
      isEditing: true
    });
    setIsExperienceDialogOpen(true);
  };
  
  // Highlight handlers
  const handleAddHighlight = () => {
    setHighlightData(null);
    setIsHighlightDialogOpen(true);
  };
  
  const handleEditHighlight = (highlight: any) => {
    setHighlightData(highlight);
    setIsHighlightDialogOpen(true);
  };
  
  const handleSaveHighlight = async (highlightData: any) => {
    try {
      // In a real app, we would save this to the API
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: highlightData.id ? "Highlight updated successfully" : "Highlight added successfully"
      });
      
      // In a real implementation, we would invalidate the query to refresh the data
      // queryClient.invalidateQueries({ queryKey: [`/api/users/${profileId}/highlights`] });
    } catch (error) {
      console.error("Error saving highlight:", error);
      toast({
        title: "Error",
        description: "Failed to save highlight",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <Layout>
      {isLoadingUser ? (
        <Skeleton className="h-64 w-full mb-6" />
      ) : (
        <ProfileHeader 
          user={userForProfile} 
          isCurrentUser={isCurrentUser} 
        />
      )}
      
      {/* Profile Grid - About and Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-2">
          {/* About */}
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#191919]">About</h3>
              {/* Edit button removed to avoid duplication */}
            </div>
            {isLoadingUser ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                <Skeleton className="h-4 w-3/4 bg-[#F3F2EF]" />
              </div>
            ) : (
              <p className="text-[#191919] whitespace-pre-line">
                {userForProfile.bio || "This user hasn't added a bio yet."}
              </p>
            )}
          </div>
          
          {/* Startup Details - Only show if user has startup details or is current user */}
          {((userForProfile as any)?.startupDetails?.name || isCurrentUser) && (
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#191919]">Startup Details</h3>
                {/* Edit button removed to avoid duplication */}
              </div>
              
              {isLoadingUser ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                  <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                  <Skeleton className="h-4 w-3/4 bg-[#F3F2EF]" />
                </div>
              ) : (userForProfile as any)?.startupDetails?.name ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-[#191919]">{(userForProfile as any)?.startupDetails?.name}</h4>
                    <p className="text-[#666666] whitespace-pre-line mt-1">
                      {(userForProfile as any)?.startupDetails?.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {(userForProfile as any)?.startupDetails?.industry && (
                      <div>
                        <p className="text-sm text-[#666666]">Industry</p>
                        <p className="font-medium text-[#191919]">{(userForProfile as any)?.startupDetails?.industry}</p>
                      </div>
                    )}
                    
                    {(userForProfile as any)?.startupDetails?.founded && (
                      <div>
                        <p className="text-sm text-[#666666]">Founded</p>
                        <p className="font-medium text-[#191919]">{(userForProfile as any)?.startupDetails?.founded}</p>
                      </div>
                    )}
                    
                    {(userForProfile as any)?.startupDetails?.stage && (
                      <div>
                        <p className="text-sm text-[#666666]">Stage</p>
                        <p className="font-medium text-[#191919]">{(userForProfile as any)?.startupDetails?.stage}</p>
                      </div>
                    )}
                    
                    {(userForProfile as any)?.startupDetails?.teamSize && (
                      <div>
                        <p className="text-sm text-[#666666]">Team Size</p>
                        <p className="font-medium text-[#191919]">{(userForProfile as any)?.startupDetails?.teamSize}</p>
                      </div>
                    )}
                    
                    {(userForProfile as any)?.startupDetails?.funding && (
                      <div>
                        <p className="text-sm text-[#666666]">Funding</p>
                        <p className="font-medium text-[#191919]">{(userForProfile as any)?.startupDetails?.funding}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#666666] mb-3">No startup details added yet.</p>
                  {isCurrentUser && (
                    <Button 
                      variant="outline" 
                      className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E5F5FC]"
                      onClick={() => {
                        // Open the edit profile dialog from ProfileHeader component
                        document.getElementById('edit-profile-button')?.click();
                      }}
                    >
                      Add Startup Details
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="md:col-span-1">
          {/* Network Stats */}
          <NetworkStats 
            userId={profileId} 
            isOwnProfile={isCurrentUser} 
          />
        </div>
      </div>
      
      {/* Highlights */}
      {!isLoadingUser && (
        <>
          <HighlightsSection 
            profileData={displayUser} 
            isOwnProfile={isCurrentUser}
            onAddHighlight={handleAddHighlight}
            onEditHighlight={handleEditHighlight}
          />
          
          <HighlightDialog 
            isOpen={isHighlightDialogOpen}
            onClose={() => setIsHighlightDialogOpen(false)}
            onSave={handleSaveHighlight}
            initialData={highlightData}
          />
        </>
      )}
      
      {/* Experience */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#191919]">Experience</h3>
          {isCurrentUser && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#666666] hover:bg-[#F3F2EF] rounded-full mr-1"
                onClick={() => {
                  // Reset form for editing all experiences
                  setExperienceData({
                    id: null,
                    title: "",
                    company: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: "",
                    isEditing: false
                  });
                  setIsExperienceDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#F3F2EF] rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] rounded-lg shadow-lg border border-[#E0E0E0]">
                  <DialogHeader>
                    <DialogTitle className="text-[#191919] text-xl font-semibold">
                      {experienceData.isEditing ? "Edit experience" : "Add experience"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <p className="text-[#666666] text-sm">* Indicates required field</p>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="exp-title" className="text-[#191919] font-medium">Title*</Label>
                      <Input 
                        id="exp-title" 
                        value={experienceData.title}
                        onChange={(e) => setExperienceData({...experienceData, title: e.target.value})}
                        placeholder="Ex: Product Manager"
                        className="border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="exp-company" className="text-[#191919] font-medium">Company name*</Label>
                      <Input 
                        id="exp-company" 
                        value={experienceData.company}
                        onChange={(e) => setExperienceData({...experienceData, company: e.target.value})}
                        placeholder="Ex: Microsoft"
                        className="border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="exp-location" className="text-[#191919] font-medium">Location</Label>
                      <Input 
                        id="exp-location" 
                        value={experienceData.location}
                        onChange={(e) => setExperienceData({...experienceData, location: e.target.value})}
                        placeholder="Ex: Bangalore, India"
                        className="border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="exp-current"
                        checked={experienceData.current}
                        onChange={(e) => setExperienceData({...experienceData, current: e.target.checked})}
                        className="rounded border-[#E0E0E0] text-[#0A66C2] focus:ring-[#0A66C2]"
                      />
                      <Label htmlFor="exp-current" className="text-[#191919]">I am currently working in this role</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="exp-start-date" className="text-[#191919] font-medium">Start date*</Label>
                        <Input 
                          id="exp-start-date" 
                          type="date"
                          value={experienceData.startDate}
                          onChange={(e) => setExperienceData({...experienceData, startDate: e.target.value})}
                          className="border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                        />
                      </div>
                      
                      {!experienceData.current && (
                        <div className="grid gap-2">
                          <Label htmlFor="exp-end-date" className="text-[#191919] font-medium">End date</Label>
                          <Input 
                            id="exp-end-date" 
                            type="date"
                            value={experienceData.endDate}
                            onChange={(e) => setExperienceData({...experienceData, endDate: e.target.value})}
                            className="border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="exp-description" className="text-[#191919] font-medium">Description</Label>
                      <Textarea 
                        id="exp-description" 
                        value={experienceData.description}
                        onChange={(e) => setExperienceData({...experienceData, description: e.target.value})}
                        placeholder="Describe your responsibilities and achievements"
                        rows={4}
                        className="border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                      />
                    </div>
                  </div>
                  <DialogFooter className="border-t border-[#E0E0E0] pt-4">
                    <Button 
                      type="submit" 
                      onClick={handleExperienceSubmit}
                      disabled={createExperienceMutation.isPending}
                      className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium"
                    >
                      {createExperienceMutation.isPending ? 
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </div> 
                        : 'Save'
                      }
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        {isLoadingExperiences ? (
          <div className="space-y-6">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex">
                <Skeleton className="h-12 w-12 rounded-md flex-shrink-0 bg-[#F3F2EF]" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-4 w-32 bg-[#F3F2EF]" />
                  <Skeleton className="h-3 w-28 bg-[#F3F2EF]" />
                  <Skeleton className="h-3 w-24 bg-[#F3F2EF]" />
                </div>
              </div>
            ))}
          </div>
        ) : experiences && Array.isArray(experiences) && experiences.length > 0 ? (
          experiences.map((exp: any) => (
            <ExperienceItem 
              key={exp.id} 
              experience={exp} 
              isCurrentUser={isCurrentUser}
              onEdit={handleEditExperience}
            />
          ))
        ) : (
          <p className="text-[#666666]">No experience added yet.</p>
        )}
      </div>
      
      {/* Education */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#191919]">Education</h3>
          {isCurrentUser && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#666666] hover:bg-[#F3F2EF] rounded-full mr-1"
                onClick={() => {
                  setIsEducationDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#666666] hover:bg-[#F3F2EF] rounded-full"
                onClick={() => {
                  setIsEducationDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Education</DialogTitle>
                    <DialogDescription>
                      Add your educational background to your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="school">School</Label>
                      <Input 
                        id="school" 
                        value={educationData.school}
                        onChange={(e) => setEducationData({...educationData, school: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree</Label>
                      <Input 
                        id="degree" 
                        value={educationData.degree}
                        onChange={(e) => setEducationData({...educationData, degree: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="field">Field of Study</Label>
                      <Input 
                        id="field" 
                        value={educationData.field}
                        onChange={(e) => setEducationData({...educationData, field: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input 
                          id="startDate" 
                          type="date"
                          value={educationData.startDate}
                          onChange={(e) => setEducationData({...educationData, startDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input 
                          id="endDate" 
                          type="date"
                          value={educationData.endDate}
                          disabled={educationData.current}
                          onChange={(e) => setEducationData({...educationData, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="current" 
                        checked={educationData.current}
                        onCheckedChange={(checked) => 
                          setEducationData({...educationData, current: checked === true})
                        }
                      />
                      <label htmlFor="current" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I am currently studying here
                      </label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={educationData.description}
                        onChange={(e) => setEducationData({...educationData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEducationDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                      toast({
                        title: "Education Added",
                        description: "Your education has been added to your profile."
                      });
                      setIsEducationDialogOpen(false);
                    }}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        <EducationItem 
          education={{
            id: 1,
            school: "Indian Institute of Technology",
            degree: "Bachelor of Technology - BTech",
            field: "Computer Science",
            startDate: "2016-09-01",
            endDate: "2020-06-01",
            current: false,
            description: "Studied computer science with a focus on artificial intelligence and machine learning.",
            location: "Bangalore, Karnataka, India"
          }}
          isCurrentUser={isCurrentUser}
          onEdit={(education) => {
            setEducationData({
              id: education.id,
              school: education.school,
              degree: education.degree,
              field: education.field || "",
              startDate: education.startDate,
              endDate: education.endDate || "",
              current: education.current,
              description: education.description || "",
              location: education.location || "",
              isEditing: true
            });
            setIsEducationDialogOpen(true);
          }}
        />
      </div>
      
      {/* Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#191919]">Skills</h3>
          {isCurrentUser && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#666666] hover:bg-[#F3F2EF] rounded-full mr-1"
                onClick={() => {
                  // Pre-fill with existing skills for editing
                  setSkillsData({
                    skills: ["React", "TypeScript", "Node.js"],
                    isEditing: true
                  });
                  setIsSkillsDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#666666] hover:bg-[#F3F2EF] rounded-full"
                onClick={() => {
                  // Reset skills data for adding new skills
                  setSkillsData({
                    skills: ["", "", ""],
                    isEditing: false
                  });
                  setIsSkillsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{skillsData.isEditing ? "Edit Skills" : "Add Skills"}</DialogTitle>
                    <DialogDescription>
                      {skillsData.isEditing 
                        ? "Update your skills to showcase your expertise." 
                        : "Add skills to your profile to highlight your expertise."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {skillsData.skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`skill-${index}`}>Skill {index + 1}</Label>
                        <Input 
                          id={`skill-${index}`} 
                          value={skill}
                          onChange={(e) => {
                            const newSkills = [...skillsData.skills];
                            newSkills[index] = e.target.value;
                            setSkillsData({...skillsData, skills: newSkills});
                          }}
                          placeholder="e.g. JavaScript, Product Management, UX Design"
                        />
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => {
                        setSkillsData({
                          ...skillsData, 
                          skills: [...skillsData.skills, ""]
                        });
                      }}
                    >
                      Add Another Skill
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSkillsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => {
                      // Filter out empty skills
                      const filteredSkills = skillsData.skills.filter(skill => skill.trim() !== "");
                      
                      toast({
                        title: skillsData.isEditing ? "Skills Updated" : "Skills Added",
                        description: skillsData.isEditing 
                          ? "Your skills have been updated successfully." 
                          : "Your skills have been added to your profile."
                      });
                      setIsSkillsDialogOpen(false);
                    }}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="group relative border-b border-[#E0E0E0] pb-4">
            <h4 className="font-semibold text-[#191919]">JavaScript</h4>
            <p className="text-sm text-[#666666]">3 endorsements</p>
            
            {isCurrentUser && (
              <div className="absolute right-0 top-0 hidden group-hover:flex">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="group relative border-b border-[#E0E0E0] pb-4">
            <h4 className="font-semibold text-[#191919]">React.js</h4>
            <p className="text-sm text-[#666666]">5 endorsements</p>
            
            {isCurrentUser && (
              <div className="absolute right-0 top-0 hidden group-hover:flex">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="group relative pb-2">
            <h4 className="font-semibold text-[#191919]">Node.js</h4>
            <p className="text-sm text-[#666666]">2 endorsements</p>
            
            {isCurrentUser && (
              <div className="absolute right-0 top-0 hidden group-hover:flex">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <Button variant="outline" className="mt-4 text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium w-full">
          Show all 12 skills
        </Button>
      </div>
      
      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#191919]">Recommendations</h3>
            <p className="text-sm text-[#666666] mt-1">Received (2)</p>
          </div>
          {isCurrentUser && (
            <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#F3F2EF] rounded-full">
              <Plus className="h-4 w-4 mr-1" />
              <span>Ask for recommendation</span>
            </Button>
          )}
        </div>
        
        <div className="border-b border-[#E0E0E0] pb-4 mb-4">
          <div className="flex items-start">
            <Avatar className="h-12 w-12 border border-[#E0E0E0]">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#0A66C2] text-white">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1">
              <h4 className="font-semibold text-[#191919]">John Doe</h4>
              <p className="text-sm text-[#666666]">CEO at Tech Innovations</p>
              <p className="text-sm text-[#666666] mt-1">April 15, 2023</p>
              <p className="mt-2 text-[#191919] text-sm">
                An exceptional talent with great problem-solving skills. Always delivers high-quality work on time.
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-start">
            <Avatar className="h-12 w-12 border border-[#E0E0E0]">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#0A66C2] text-white">
                AS
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1">
              <h4 className="font-semibold text-[#191919]">Alice Smith</h4>
              <p className="text-sm text-[#666666]">Product Manager at Global Solutions</p>
              <p className="text-sm text-[#666666] mt-1">January 10, 2023</p>
              <p className="mt-2 text-[#191919] text-sm">
                A dedicated professional who consistently exceeds expectations. Great team player with excellent communication skills.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Accomplishments */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#191919]">Accomplishments</h3>
          {isCurrentUser && (
            <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#F3F2EF] rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-[#191919]">Publications</h4>
            <div className="mt-3 border-l-2 border-[#0A66C2] pl-4">
              <h5 className="font-medium text-[#191919]">Machine Learning Applications in Modern Business</h5>
              <p className="text-sm text-[#666666]">Published in Tech Journal • May 2022</p>
              <p className="text-sm text-[#191919] mt-2">
                Co-authored a research paper on implementing machine learning solutions for business optimization.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#191919]">Certifications</h4>
            <div className="mt-3 border-l-2 border-[#0A66C2] pl-4">
              <h5 className="font-medium text-[#191919]">AWS Certified Solutions Architect</h5>
              <p className="text-sm text-[#666666]">Amazon Web Services • Issued Dec 2021 • Expires Dec 2024</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#191919]">Activity</h3>
            <p className="text-sm text-[#666666] mt-1">{user?.name?.split(' ')[0] || 'User'} hasn't posted lately</p>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="text-[#666666] hover:bg-[#F3F2EF] rounded-full mr-1">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
              Show all activity
            </Button>
          </div>
        </div>
        
        {isLoadingPosts ? (
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
                <div className="flex items-start mb-3">
                  <Skeleton className="h-12 w-12 rounded-full bg-[#F3F2EF]" />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40 bg-[#F3F2EF]" />
                        <Skeleton className="h-3 w-24 bg-[#F3F2EF]" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full bg-[#F3F2EF]" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                  <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                  <Skeleton className="h-4 w-3/4 bg-[#F3F2EF]" />
                </div>
                <div className="mt-4 pt-2 border-t border-[#E0E0E0]">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-3 w-24 bg-[#F3F2EF]" />
                    <Skeleton className="h-3 w-16 bg-[#F3F2EF]" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-[32%] bg-[#F3F2EF] rounded-md" />
                    <Skeleton className="h-8 w-[32%] bg-[#F3F2EF] rounded-md" />
                    <Skeleton className="h-8 w-[32%] bg-[#F3F2EF] rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts && Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post: any) => (
            <ActivityItem 
              key={post.id} 
              activity={{
                id: post.id,
                content: post.content,
                createdAt: new Date(post.createdAt),
                user: {
                  id: post.userId || (profileUser?.id || otherUserProfile?.id || 0),
                  name: post.userName || (profileUser?.name || otherUserProfile?.name || 'User'),
                  avatarUrl: post.userAvatarUrl || (profileUser?.avatarUrl || otherUserProfile?.avatarUrl || undefined),
                },
              }} 
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#666666] mb-2">No posts yet</p>
            {isCurrentUser && (
              <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium">
                Create a post
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Interests */}
      <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 sm:p-6 mb-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#191919]">Interests</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#E0E0E0] rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded bg-[#F3F2EF] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#0A66C2]">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-[#191919]">TechCrunch</h4>
                <p className="text-sm text-[#666666]">3,456,789 followers</p>
              </div>
            </div>
            <Button variant="outline" className="mt-3 w-full text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
              Following
            </Button>
          </div>
          
          <div className="border border-[#E0E0E0] rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded bg-[#F3F2EF] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#0A66C2]">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-[#191919]">Harvard Business Review</h4>
                <p className="text-sm text-[#666666]">5,678,901 followers</p>
              </div>
            </div>
            <Button variant="outline" className="mt-3 w-full text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
              Following
            </Button>
          </div>
        </div>
        
        <Button variant="outline" className="mt-4 w-full text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
          Show all 12 interests
        </Button>
      </div>
    </Layout>
  );
}