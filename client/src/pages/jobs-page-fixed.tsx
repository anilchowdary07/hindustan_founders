import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, MapPin, Briefcase, Clock, BookmarkPlus, 
  Filter, Bell, BookmarkCheck, Loader2, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  const [newAlertData, setNewAlertData] = useState({
    title: "",
    location: "",
    jobType: "all",
    frequency: "daily",
    skills: [] as string[],
  });
  
  // Mock data for UI demonstration
  const mockJobs = [
    {
      id: 1,
      title: "Senior Software Engineer",
      company: "Google",
      location: "Bangalore, India (On-site)",
      jobType: "Full-time",
      description: "We're looking for a Senior Software Engineer to join our team and help build the next generation of our products.",
      requirements: "5+ years of experience with JavaScript, React, Node.js, and AWS",
      salaryMin: 3000000,
      salaryMax: 5000000,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      logo: "https://via.placeholder.com/150",
      isEasyApply: true,
    },
    {
      id: 2,
      title: "Product Manager",
      company: "Microsoft",
      location: "Hyderabad, India (Hybrid)",
      jobType: "Full-time",
      description: "Join our product team to drive the vision and strategy for our enterprise solutions.",
      requirements: "3+ years of product management experience in fintech",
      salaryMin: 2500000,
      salaryMax: 4000000,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      logo: "https://via.placeholder.com/150",
      isEasyApply: false,
    },
    {
      id: 3,
      title: "UI/UX Designer",
      company: "Amazon",
      location: "Remote, India",
      jobType: "Full-time",
      description: "Design beautiful and intuitive user interfaces for our e-commerce platform.",
      requirements: "Portfolio showcasing UI/UX work, experience with Figma and Adobe Creative Suite",
      salaryMin: 1800000,
      salaryMax: 3000000,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      logo: "https://via.placeholder.com/150",
      isEasyApply: true,
    },
    {
      id: 4,
      title: "Data Scientist",
      company: "Flipkart",
      location: "Bangalore, India (On-site)",
      jobType: "Full-time",
      description: "Apply machine learning and statistical techniques to solve complex business problems.",
      requirements: "Experience with Python, Machine Learning, SQL, Data Visualization",
      salaryMin: 2000000,
      salaryMax: 3500000,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
      logo: "https://via.placeholder.com/150",
      isEasyApply: true,
    },
    {
      id: 5,
      title: "Frontend Developer",
      company: "Swiggy",
      location: "Bangalore, India (Hybrid)",
      jobType: "Contract",
      description: "Build responsive and performant user interfaces for our food delivery platform.",
      requirements: "3+ years of experience with React, HTML, CSS, and JavaScript",
      salaryMin: 1500000,
      salaryMax: 2500000,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
      logo: "https://via.placeholder.com/150",
      isEasyApply: false,
    },
  ];
  
  // Mock recommended jobs
  const mockRecommendedJobs = [
    {
      id: 6,
      title: "Senior React Developer",
      company: "Razorpay",
      location: "Bangalore, India",
      matchScore: 92,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      logo: "https://via.placeholder.com/150",
    },
    {
      id: 7,
      title: "Full Stack Engineer",
      company: "Zerodha",
      location: "Bangalore, India",
      matchScore: 87,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      logo: "https://via.placeholder.com/150",
    },
    {
      id: 8,
      title: "Node.js Developer",
      company: "CRED",
      location: "Bangalore, India",
      matchScore: 85,
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      logo: "https://via.placeholder.com/150",
    },
  ];
  
  // Simulate loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Save job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (data, jobId) => {
      setSavedJobs(prev => [...prev, jobId]);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (data, jobId) => {
      setSavedJobs(prev => prev.filter(id => id !== jobId));
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
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

  // Simulate search functionality
  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

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
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar - Only visible on desktop */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
            <h3 className="font-semibold text-[#191919] mb-3">Job Alerts</h3>
            <p className="text-sm text-[#666666] mb-3">
              Get notified when new jobs match your search criteria.
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
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#666666] mr-2" />
                <span className="text-sm text-[#191919]">React Developer</span>
              </div>
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#666666] mr-2" />
                <span className="text-sm text-[#191919]">Software Engineer Bangalore</span>
              </div>
              <div className="flex items-center">
                <Search className="h-4 w-4 text-[#666666] mr-2" />
                <span className="text-sm text-[#191919]">Remote Node.js</span>
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
                    <Button 
                      variant="outline" 
                      className="text-[#666666] border-[#E0E0E0] hover:bg-[#F3F2EF] hover:text-[#191919] rounded-full"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <Button 
                      className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full"
                      onClick={handleSearch}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recommended" className="mt-0">
                <div className="space-y-4">
                  {mockRecommendedJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border border-[#E0E0E0] rounded-lg hover:bg-[#F3F2EF] transition-colors">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 rounded-md border border-[#E0E0E0]">
                          <AvatarImage src={job.logo} />
                          <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                            {getInitials(job.company)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h4 className="font-semibold text-[#0A66C2] hover:underline cursor-pointer">
                            {job.title}
                          </h4>
                          <p className="text-[#191919]">
                            {job.company}
                          </p>
                          <div className="flex items-center text-xs text-[#666666]">
                            <span className="text-[#0A66C2] font-medium mr-1">
                              {job.matchScore}%
                            </span>
                            match for you
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium"
                        onClick={() => {
                          // View job details
                          const fullJob = {
                            ...job,
                            jobType: "Full-time",
                            description: "This is a recommended job based on your profile.",
                            requirements: "Skills matching your profile.",
                            salaryMin: 2000000,
                            salaryMax: 3500000,
                            isEasyApply: true,
                          };
                          handleViewJobDetails(fullJob);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#191919]">Job Results</h2>
            
            {isLoading ? (
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
                {mockJobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <Avatar className="h-12 w-12 rounded-md border border-[#E0E0E0]">
                        <AvatarImage src={job.logo} />
                        <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                          {getInitials(job.company)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <h4 
                          className="font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                          onClick={() => handleViewJobDetails(job)}
                        >
                          {job.title}
                        </h4>
                        <p className="text-[#191919]">{job.company}</p>
                        <p className="text-sm text-[#666666]">{job.location}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="flex items-center text-xs text-[#666666]">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {job.jobType}
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
                    <p className="text-sm text-[#666666] mt-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium"
                        onClick={() => handleSaveJob(job.id)}
                        disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                      >
                        {saveJobMutation.isPending || unsaveJobMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : savedJobs.includes(job.id) ? (
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
            )}
          </div>
        </div>
      </div>
      
      {/* Job Detail Dialog */}
      <Dialog open={isJobDetailDialogOpen} onOpenChange={setIsJobDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedJob.title}</DialogTitle>
                <DialogDescription className="text-base text-[#191919] font-medium">
                  {selectedJob.company}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm text-[#666666] space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedJob.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {selectedJob.jobType}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Posted {formatTimeAgo(selectedJob.postedAt)}
                  </div>
                </div>
                
                <div className="border-t border-[#E0E0E0] pt-4">
                  <h4 className="font-semibold text-[#191919] mb-2">Description</h4>
                  <p className="text-[#666666]">{selectedJob.description}</p>
                </div>
                
                <div className="border-t border-[#E0E0E0] pt-4">
                  <h4 className="font-semibold text-[#191919] mb-2">Requirements</h4>
                  <p className="text-[#666666]">{selectedJob.requirements}</p>
                </div>
                
                <div className="border-t border-[#E0E0E0] pt-4">
                  <h4 className="font-semibold text-[#191919] mb-2">Salary</h4>
                  <p className="text-[#666666]">
                    {selectedJob.salaryMin && selectedJob.salaryMax ? 
                      `₹${(selectedJob.salaryMin / 100000).toFixed(1)} - ₹${(selectedJob.salaryMax / 100000).toFixed(1)} LPA` : 
                      "Not disclosed"}
                  </p>
                </div>
              </div>
              
              <DialogFooter className="flex sm:justify-between">
                <Button 
                  variant="outline" 
                  className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full font-medium"
                  onClick={() => handleSaveJob(selectedJob.id)}
                  disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                >
                  {saveJobMutation.isPending || unsaveJobMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : savedJobs.includes(selectedJob.id) ? (
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
                  onClick={() => handleApplyForJob(selectedJob.id)}
                  disabled={applyForJobMutation.isPending}
                >
                  {applyForJobMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Create Alert Dialog */}
      <Dialog open={isCreateAlertDialogOpen} onOpenChange={setIsCreateAlertDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Job Alert</DialogTitle>
            <DialogDescription>
              Get notified when new jobs match your criteria.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alert-title">Job Title or Keywords</Label>
              <Input 
                id="alert-title" 
                placeholder="e.g. Software Engineer, React Developer"
                value={newAlertData.title}
                onChange={(e) => setNewAlertData({...newAlertData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert-location">Location</Label>
              <Input 
                id="alert-location" 
                placeholder="e.g. Bangalore, Remote"
                value={newAlertData.location}
                onChange={(e) => setNewAlertData({...newAlertData, location: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert-job-type">Job Type</Label>
              <Select 
                value={newAlertData.jobType}
                onValueChange={(value) => setNewAlertData({...newAlertData, jobType: value})}
              >
                <SelectTrigger id="alert-job-type">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All job types</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alert-frequency">Alert Frequency</Label>
              <Select 
                value={newAlertData.frequency}
                onValueChange={(value) => setNewAlertData({...newAlertData, frequency: value})}
              >
                <SelectTrigger id="alert-frequency">
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
                  <Badge key={index} className="bg-[#E7F3FF] text-[#0A66C2] hover:bg-[#D0E8FF] border-none">
                    {skill}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-[#0A66C2] hover:text-white"
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
                <Input 
                  placeholder="Add a skill and press Enter"
                  className="flex-1 min-w-[200px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      e.preventDefault();
                      setNewAlertData({
                        ...newAlertData,
                        skills: [...newAlertData.skills, e.currentTarget.value.trim()]
                      });
                      e.currentTarget.value = '';
                    }
                  }}
                />
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Create Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}