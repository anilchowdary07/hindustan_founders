import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, MapPin, Briefcase, Clock, BookmarkPlus, ThumbsUp, 
  Send, MoreHorizontal, Filter, Bell, ChevronDown, ArrowUpRight, Edit,
  Bookmark, BookmarkCheck, Loader2, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isCreateAlertDialogOpen, setIsCreateAlertDialogOpen] = useState(false);
  const [isJobDetailDialogOpen, setIsJobDetailDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [jobAlerts, setJobAlerts] = useState<any[]>([]);
  const [newAlertData, setNewAlertData] = useState({
    title: "",
    location: "",
    jobType: "all",
    frequency: "daily",
    skills: [] as string[],
  });
  
  // Fetch jobs
  const {
    data: jobs,
    isLoading: isLoadingJobs,
  } = useQuery({
    queryKey: ["/api/jobs", searchQuery, locationQuery],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (locationQuery) params.append("location", locationQuery);
        
        const res = await apiRequest(`/api/jobs?${params.toString()}`);
        console.log("API response for jobs:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
      }
    },
  });
  
  // Fetch saved jobs
  const {
    data: savedJobsData,
    isLoading: isLoadingSavedJobs,
  } = useQuery({
    queryKey: ["/api/jobs/saved"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await apiRequest("/api/jobs/saved");
        console.log("API response for saved jobs:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Fetch job alerts
  const {
    data: jobAlertsData,
    isLoading: isLoadingJobAlerts,
  } = useQuery({
    queryKey: ["/api/jobs/alerts"],
    queryFn: async () => {
      if (!user) return [];
      try {
        const res = await apiRequest("/api/jobs/alerts");
        console.log("API response for job alerts:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching job alerts:", error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      try {
        const response = await apiRequest(`/api/jobs/${jobId}/save`, "POST");
        if (response.error) {
          throw new Error(response.error.message || "Failed to save job");
        }
        return response.data;
      } catch (error) {
        console.error("Error saving job:", error);
        throw error;
      }
    },
    onSuccess: (data, jobId) => {
      setSavedJobs(prev => [...prev, jobId]);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/saved"] });
      toast({
        title: "Job saved",
        description: "The job has been saved to your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Unsave job mutation
  const unsaveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      try {
        const response = await apiRequest(`/api/jobs/${jobId}/save`, "DELETE");
        if (response.error) {
          throw new Error(response.error.message || "Failed to unsave job");
        }
        return response.data;
      } catch (error) {
        console.error("Error removing saved job:", error);
        throw error;
      }
    },
    onSuccess: (data, jobId) => {
      setSavedJobs(prev => prev.filter(id => id !== jobId));
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/saved"] });
      toast({
        title: "Job removed",
        description: "The job has been removed from your saved jobs.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove job. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Create job alert mutation
  const createJobAlertMutation = useMutation({
    mutationFn: async (alertData: typeof newAlertData) => {
      try {
        // In a real app, we would make an API call
        // For now, simulate a successful API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock response with the alert data and a generated ID
        const mockResponse = {
          id: Date.now(),
          ...alertData,
          createdAt: new Date(),
        };
        
        return mockResponse;
      } catch (error) {
        console.error("Error creating job alert:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setJobAlerts(prev => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/alerts"] });
      setIsCreateAlertDialogOpen(false);
      toast({
        title: "Alert created",
        description: "Your job alert has been created successfully.",
      });
      // Reset form
      setNewAlertData({
        title: "",
        location: "",
        jobType: "all",
        frequency: "daily",
        skills: [],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job alert. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Apply for job mutation
  const applyForJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      try {
        // In a real app, we would make an API call
        // For now, simulate a successful API call with a delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: "Application submitted successfully" };
      } catch (error) {
        console.error("Error applying for job:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // This will be handled in the handleApplyForJob function
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Helper functions
  const handleSaveJob = (jobId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save jobs.",
        variant: "destructive",
      });
      return;
    }
    
    if (savedJobs.includes(jobId)) {
      unsaveJobMutation.mutate(jobId);
    } else {
      saveJobMutation.mutate(jobId);
    }
  };
  
  const handleCreateAlert = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create job alerts.",
        variant: "destructive",
      });
      return;
    }
    
    createJobAlertMutation.mutate(newAlertData);
  };
  
  const handleApplyForJob = (jobId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Show a success message immediately for better user experience
      toast({
        title: "Application submitted",
        description: "Your job application has been submitted successfully.",
      });
      
      // Close the dialog
      setTimeout(() => {
        setIsJobDetailDialogOpen(false);
      }, 1000);
      
      // Then trigger the actual mutation
      applyForJobMutation.mutate(jobId);
    } catch (error) {
      console.error("Error applying for job:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleViewJobDetails = (job: any) => {
    setSelectedJob(job);
    setIsJobDetailDialogOpen(true);
  };
  
  // Update saved jobs from API data
  useEffect(() => {
    if (savedJobsData && savedJobsData.length > 0) {
      setSavedJobs(savedJobsData.map((job: any) => job.id));
    }
  }, [savedJobsData]);
  
  // Update job alerts from API data
  useEffect(() => {
    if (jobAlertsData) {
      setJobAlerts(jobAlertsData);
    }
  }, [jobAlertsData]);
  
  // Helper function to format time
  const formatTimeAgo = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Helper function to get initials
  const getInitials = (name: string) => {
    if (!name) return "JD";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Mock data for UI demonstration
  const mockJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: {
        id: 101,
        name: "Google",
        logo: "",
        location: "Bangalore, India",
      },
      type: "Full-time",
      location: "Bangalore, India (On-site)",
      salary: "₹30,00,000 - ₹50,00,000 per year",
      description: "We're looking for a Senior Software Engineer to join our team and help build the next generation of our products.",
      skills: ["JavaScript", "React", "Node.js", "AWS"],
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      applicants: 78,
      isEasyApply: true,
    },
    {
      id: 2,
      title: "Product Manager",
      company: {
        id: 102,
        name: "Microsoft",
        logo: "",
        location: "Hyderabad, India",
      },
      type: "Full-time",
      location: "Hyderabad, India (Hybrid)",
      salary: "₹25,00,000 - ₹40,00,000 per year",
      description: "Join our product team to drive the vision and strategy for our enterprise solutions.",
      skills: ["Product Management", "Agile", "User Research", "Data Analysis"],
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      applicants: 124,
      isEasyApply: false,
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: {
        id: 103,
        name: "Amazon",
        logo: "",
        location: "Remote, India",
      },
      type: "Full-time",
      location: "Remote, India",
      salary: "₹18,00,000 - ₹30,00,000 per year",
      description: "Design beautiful and intuitive user interfaces for our e-commerce platform.",
      skills: ["Figma", "UI Design", "User Research", "Prototyping"],
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      applicants: 45,
      isEasyApply: true,
    },
    {
      id: 4,
      title: "Data Scientist",
      company: {
        id: 104,
        name: "Flipkart",
        logo: "",
        location: "Bangalore, India",
      },
      type: "Full-time",
      location: "Bangalore, India (On-site)",
      salary: "₹20,00,000 - ₹35,00,000 per year",
      description: "Apply machine learning and statistical techniques to solve complex business problems.",
      skills: ["Python", "Machine Learning", "SQL", "Data Visualization"],
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      applicants: 92,
      isEasyApply: true,
    },
    {
      id: 5,
      title: "Frontend Developer",
      company: {
        id: 105,
        name: "Swiggy",
        logo: "",
        location: "Bangalore, India",
      },
      type: "Contract",
      location: "Bangalore, India (Hybrid)",
      salary: "₹15,00,000 - ₹25,00,000 per year",
      description: "Build responsive and performant user interfaces for our food delivery platform.",
      skills: ["JavaScript", "React", "CSS", "HTML"],
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
      applicants: 67,
      isEasyApply: false,
    },
  ];
  
  // Mock recommended jobs
  const mockRecommendedJobs = [
    {
      id: 6,
      title: "Senior React Developer",
      company: {
        id: 106,
        name: "Razorpay",
        logo: "",
        location: "Bangalore, India",
      },
      matchScore: 92,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: 7,
      title: "Full Stack Engineer",
      company: {
        id: 107,
        name: "Zerodha",
        logo: "",
        location: "Bangalore, India",
      },
      matchScore: 87,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
    {
      id: 8,
      title: "Node.js Developer",
      company: {
        id: 108,
        name: "CRED",
        logo: "",
        location: "Bangalore, India",
      },
      matchScore: 85,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ];
  
  // Use mock data if API data is not available
  const displayJobs = jobs || mockJobs;

  return (
    <Layout>
      {/* Mobile Search Bar - Only visible on mobile */}
      <div className="lg:hidden bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 mb-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]" size={16} />
            <Input 
              placeholder="Search by title, skill, or company" 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]" size={16} />
            <Input 
              placeholder="Location" 
              className="pl-9"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <Button 
            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white"
            onClick={() => {
              // Trigger search with current query values
              queryClient.invalidateQueries({ queryKey: ["/api/jobs", searchQuery, locationQuery] });
            }}
          >
            Search
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#191919]">Job Alerts</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]"
                onClick={() => setIsCreateAlertDialogOpen(true)}
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-[#666666] mb-3">
              Create job alert to receive notifications about new jobs that match your skills
            </p>
            <Button 
              className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium"
              onClick={() => setIsCreateAlertDialogOpen(true)}
            >
              Create Alert
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <h3 className="font-semibold text-[#191919] mb-3">Recent Searches</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-[#666666] mr-2" />
                  <span className="text-sm text-[#191919]">React Developer</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-[#666666] mr-2" />
                  <span className="text-sm text-[#191919]">Software Engineer Bangalore</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-[#666666] mr-2" />
                  <span className="text-sm text-[#191919]">Remote Node.js</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-[#0A66C2] hover:bg-[#E5F5FC] rounded-full font-medium">
              Show more
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <h3 className="font-semibold text-[#191919] mb-3">Saved Jobs</h3>
            <p className="text-sm text-[#666666] mb-3">
              {savedJobs.length > 0 
                ? `You have ${savedJobs.length} saved job${savedJobs.length > 1 ? 's' : ''}.` 
                : "You haven't saved any jobs yet. Save jobs to apply to them later."}
            </p>
            <Button 
              variant="outline" 
              className="w-full text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium"
              onClick={() => {
                // Navigate to saved jobs tab
                const savedJobsTab = document.getElementById('saved-jobs-tab');
                if (savedJobsTab) {
                  savedJobsTab.click();
                }
              }}
            >
              View saved jobs
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#F3F2EF] p-1 rounded-full">
                <TabsTrigger value="search" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#0A66C2] data-[state=active]:shadow-sm">
                  Search
                </TabsTrigger>
                <TabsTrigger value="recommended" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-[#0A66C2] data-[state=active]:shadow-sm">
                  Recommended
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="search" className="mt-0">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
                    <Input 
                      placeholder="Search by title, skill, or company" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#E0E0E0] rounded-md focus-visible:ring-[#0A66C2]" 
                    />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
                    <Input 
                      placeholder="Location" 
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="pl-10 border-[#E0E0E0] rounded-md focus-visible:ring-[#0A66C2]" 
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium">
                      Search
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recommended" className="mt-0">
                <div className="space-y-4">
                  {mockRecommendedJobs.map((job) => (
                    <div key={job.id} className="border border-[#E0E0E0] rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start">
                        <Avatar className="h-12 w-12 rounded-md border border-[#E0E0E0]">
                          <AvatarImage src={job.company.logo} />
                          <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                            {getInitials(job.company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <h4 
                              className="font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                              onClick={() => handleViewJobDetails(job)}
                            >
                              {job.title}
                            </h4>
                            <Badge className="bg-[#E7F3FF] text-[#0A66C2] hover:bg-[#D0E8FF] border-none font-normal px-2 py-1 h-6 rounded mt-1 sm:mt-0 w-fit">
                              {job.matchScore}% match
                            </Badge>
                          </div>
                          <p className="text-[#191919]">{job.company.name}</p>
                          <p className="text-sm text-[#666666]">{job.company.location}</p>
                          <p className="text-xs text-[#666666] mt-1">Posted {formatTimeAgo(job.postedAt)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium w-full sm:w-auto"
                          onClick={() => handleSaveJob(job.id)}
                          disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                        >
                          {savedJobs.includes(job.id) ? (
                            <>
                              <BookmarkCheck className="h-4 w-4 mr-2" />
                              Saved
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button 
                          className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleApplyForJob(job.id);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#191919]">Job Results</h2>
            
            {isLoadingJobs ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
                    <div className="flex items-start">
                      <Skeleton className="h-12 w-12 rounded-md bg-[#F3F2EF]" />
                      <div className="ml-3 space-y-2 flex-1">
                        <Skeleton className="h-5 w-48 bg-[#F3F2EF]" />
                        <Skeleton className="h-4 w-32 bg-[#F3F2EF]" />
                        <Skeleton className="h-4 w-40 bg-[#F3F2EF]" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full bg-[#F3F2EF]" />
                      <Skeleton className="h-4 w-3/4 bg-[#F3F2EF]" />
                    </div>
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-9 w-24 rounded-full bg-[#F3F2EF]" />
                      <Skeleton className="h-9 w-24 rounded-full bg-[#F3F2EF]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <Avatar className="h-12 w-12 rounded-md border border-[#E0E0E0]">
                        <AvatarImage src={job.company.logo} />
                        <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                          {getInitials(job.company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <h4 
                          className="font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                          onClick={() => handleViewJobDetails(job)}
                        >
                          {job.title}
                        </h4>
                        <p className="text-[#191919]">{job.company.name}</p>
                        <p className="text-sm text-[#666666]">{job.location}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="flex items-center text-xs text-[#666666]">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {job.type}
                          </div>
                          <div className="flex items-center text-xs text-[#666666]">
                            <Clock className="h-3 w-3 mr-1" />
                            Posted {formatTimeAgo(job.postedAt)}
                          </div>
                          {job.isEasyApply && (
                            <Badge className="bg-[#E7F3FF] text-[#0A66C2] hover:bg-[#D0E8FF] border-none font-normal px-2 py-0.5 h-5 rounded text-xs">
                              Easy Apply
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]"
                        onClick={() => handleSaveJob(job.id)}
                        disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                      >
                        {savedJobs.includes(job.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-[#0A66C2]" />
                        ) : (
                          <BookmarkPlus className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-sm text-[#191919] mt-3">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} className="bg-[#F3F2EF] text-[#666666] hover:bg-[#E0E0E0] border-none font-normal px-2 py-1 rounded">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-xs text-[#666666] mt-3">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>Salary: {job.salary}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
                      <p className="text-sm text-[#666666]">{job.applicants} applicants</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium w-full sm:w-auto"
                          onClick={() => {
                            // Share job functionality
                            navigator.clipboard.writeText(`Check out this job: ${job.title} at ${job.company.name}`);
                            toast({
                              title: "Link copied",
                              description: "Job link copied to clipboard",
                            });
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button 
                          className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium w-full sm:w-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleApplyForJob(job.id);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <h3 className="font-semibold text-[#191919] mb-3">Job Seeker Guidance</h3>
            <p className="text-sm text-[#666666] mb-3">
              Recommended based on your activity
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded bg-[#F3F2EF] flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2]">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-[#191919]">Get interview insights</h4>
                  <p className="text-xs text-[#666666]">Learn how to prepare for interviews</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="h-10 w-10 rounded bg-[#F3F2EF] flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2]">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-[#191919]">Improve your resume</h4>
                  <p className="text-xs text-[#666666]">Get tips to make your resume stand out</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-[#0A66C2] hover:bg-[#E5F5FC] rounded-full font-medium">
              Show more
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <h3 className="font-semibold text-[#191919] mb-3">Top Companies Hiring</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 rounded-md border border-[#E0E0E0]">
                  <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">GO</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-[#191919]">Google</h4>
                  <p className="text-xs text-[#666666]">124 open jobs</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#0A66C2] hover:bg-[#E5F5FC]">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 rounded-md border border-[#E0E0E0]">
                  <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">MS</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-[#191919]">Microsoft</h4>
                  <p className="text-xs text-[#666666]">87 open jobs</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#0A66C2] hover:bg-[#E5F5FC]">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 rounded-md border border-[#E0E0E0]">
                  <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">AM</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-medium text-[#191919]">Amazon</h4>
                  <p className="text-xs text-[#666666]">156 open jobs</p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#0A66C2] hover:bg-[#E5F5FC]">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-2 text-[#0A66C2] hover:bg-[#E5F5FC] rounded-full font-medium">
              Show all
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#191919]">Job Preferences</h3>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-[#191919]">Job titles</h4>
                <p className="text-xs text-[#666666]">Software Engineer, Frontend Developer, React Developer</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#191919]">Job types</h4>
                <p className="text-xs text-[#666666]">Full-time, Remote, Contract</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#191919]">Locations</h4>
                <p className="text-xs text-[#666666]">Bangalore, India; Remote, India</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3 text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium">
              See all preferences
            </Button>
          </div>
        </div>
      </div>
      
      {/* Job Details Dialog */}
      <Dialog open={isJobDetailDialogOpen} onOpenChange={setIsJobDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center mt-2">
                    <Avatar className="h-10 w-10 rounded-md border border-[#E0E0E0] mr-2">
                      <AvatarImage src={selectedJob.company.logo} />
                      <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                        {getInitials(selectedJob.company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[#191919] font-medium">{selectedJob.company.name}</p>
                      <p className="text-sm text-[#666666]">{selectedJob.location}</p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-[#666666]">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {selectedJob.type}
                  </div>
                  <div className="flex items-center text-sm text-[#666666]">
                    <Clock className="h-4 w-4 mr-1" />
                    Posted {formatTimeAgo(selectedJob.postedAt)}
                  </div>
                  <div className="flex items-center text-sm text-[#666666]">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Salary: {selectedJob.salary}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#191919] mb-2">Job Description</h4>
                  <p className="text-sm text-[#191919]">{selectedJob.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#191919] mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill: string, index: number) => (
                      <Badge key={index} className="bg-[#F3F2EF] text-[#666666] hover:bg-[#E0E0E0] border-none font-normal px-2 py-1 rounded">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-[#191919] mb-2">About {selectedJob.company.name}</h4>
                  <p className="text-sm text-[#191919]">{selectedJob.company.description || `${selectedJob.company.name} is a leading company in its industry with a focus on innovation and growth.`}</p>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button 
                  variant="outline" 
                  className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium"
                  onClick={() => handleSaveJob(selectedJob.id)}
                  disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                >
                  {savedJobs.includes(selectedJob.id) ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button 
                  className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleApplyForJob(selectedJob.id);
                  }}
                  disabled={applyForJobMutation.isPending}
                >
                  {applyForJobMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Job Alert Dialog */}
      <Dialog open={isCreateAlertDialogOpen} onOpenChange={setIsCreateAlertDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Job Alert</DialogTitle>
            <DialogDescription>
              Get notified when new jobs matching your criteria are posted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-title">Alert Name</Label>
              <Input 
                id="alert-title" 
                placeholder="E.g., Software Engineer in Bangalore" 
                value={newAlertData.title}
                onChange={(e) => setNewAlertData({...newAlertData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert-location">Location</Label>
              <Input 
                id="alert-location" 
                placeholder="City, State, or Country" 
                value={newAlertData.location}
                onChange={(e) => setNewAlertData({...newAlertData, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job-type">Job Type</Label>
              <Select 
                value={newAlertData.jobType}
                onValueChange={(value) => setNewAlertData({...newAlertData, jobType: value})}
              >
                <SelectTrigger id="job-type">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Alert Frequency</Label>
              <Select 
                value={newAlertData.frequency}
                onValueChange={(value) => setNewAlertData({...newAlertData, frequency: value})}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="instant">Instant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Skills (Optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {newAlertData.skills.map((skill, index) => (
                  <Badge key={index} className="bg-[#F3F2EF] text-[#666666] hover:bg-[#E0E0E0] border-none font-normal px-2 py-1 rounded flex items-center gap-1">
                    {skill}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 rounded-full hover:bg-[#E0E0E0]"
                      onClick={() => {
                        setNewAlertData({
                          ...newAlertData, 
                          skills: newAlertData.skills.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="skill-input" 
                  placeholder="Add a skill" 
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const skill = input.value.trim();
                      if (skill && !newAlertData.skills.includes(skill)) {
                        setNewAlertData({
                          ...newAlertData,
                          skills: [...newAlertData.skills, skill]
                        });
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button 
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('skill-input') as HTMLInputElement;
                    const skill = input.value.trim();
                    if (skill && !newAlertData.skills.includes(skill)) {
                      setNewAlertData({
                        ...newAlertData,
                        skills: [...newAlertData.skills, skill]
                      });
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateAlertDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#0A66C2] hover:bg-[#004182] text-white"
              onClick={handleCreateAlert}
              disabled={createJobAlertMutation.isPending || !newAlertData.title}
            >
              {createJobAlertMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Alert"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}