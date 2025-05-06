import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  Calendar,
  DollarSign,
  Share2,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Send
} from "lucide-react";

export interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedAt: Date;
  deadline?: Date;
  pitchId?: number;
  userId: number;
  companyLogo?: string;
  applicationUrl?: string;
  skills: string[];
  experience: string;
  bookmarks?: number;
  applications?: number;
  user?: {
    id: number;
    name: string;
    avatarUrl?: string;
    title?: string;
  };
}

interface JobListingProps {
  job: JobListing;
  isDetailed?: boolean;
}

export default function JobListing({ job, isDetailed = false }: JobListingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const isOwner = user?.id === job.userId;
  
  // Format date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "FN";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Bookmark job mutation
  const bookmarkJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${job.id}/bookmark`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to bookmark job");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setIsBookmarked(true);
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${job.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Success",
        description: "Job bookmarked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to bookmark job. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Apply for job mutation
  const applyForJobMutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      if (!user) {
        throw new Error("You must be logged in to apply for jobs");
      }
      
      const response = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setShowApplyModal(false);
      setApplicationMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${job.id}`] });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete job");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      router.push('/jobs');
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle application submission
  const handleSubmitApplication = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs",
        variant: "default"
      });
      return;
    }
    
    if (!applicationMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to the employer",
        variant: "destructive",
      });
      return;
    }
    
    applyForJobMutation.mutate({
      message: applicationMessage
    });
  };
  
  // Get job type badge color
  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Full-time': 'bg-green-100 text-green-800',
      'Part-time': 'bg-blue-100 text-blue-800',
      'Contract': 'bg-purple-100 text-purple-800',
      'Internship': 'bg-amber-100 text-amber-800',
      'Remote': 'bg-indigo-100 text-indigo-800',
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  
  if (isDetailed) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Job Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                {job.companyLogo ? (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                    <img 
                      src={job.companyLogo} 
                      alt={`${job.company} logo`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                    <div className="flex items-center mt-1">
                      <span className="text-gray-700 font-medium">{job.company}</span>
                      {job.applicationUrl && (
                        <a 
                          href={job.applicationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getJobTypeColor(job.type)}>
                        {job.type}
                      </Badge>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      
                      {job.salary && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        <span>Posted {formatDate(job.postedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                    {!isOwner && (
                      <Button 
                        onClick={() => setShowApplyModal(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Apply Now
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => bookmarkJobMutation.mutate()}
                      className={isBookmarked ? "text-primary" : ""}
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: job.title,
                            text: `${job.title} at ${job.company}`,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link copied",
                            description: "Job link copied to clipboard",
                          });
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    {isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/jobs/edit/${job.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this job listing?")) {
                                deleteJobMutation.mutate();
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Job Type</h4>
                      <p className="text-gray-600">{job.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Location</h4>
                      <p className="text-gray-600">{job.location}</p>
                    </div>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Salary</h4>
                        <p className="text-gray-600">{job.salary}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Experience</h4>
                      <p className="text-gray-600">{job.experience}</p>
                    </div>
                  </div>
                  
                  {job.deadline && (
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Application Deadline</h4>
                        <p className="text-gray-600">{job.deadline.toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {job.user && (
              <Card>
                <CardHeader>
                  <CardTitle>Posted By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={job.user.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(job.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{job.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {job.user.title || "Recruiter"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!isOwner && (
              <Button 
                onClick={() => setShowApplyModal(true)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Apply for this position
              </Button>
            )}
          </div>
        </div>
        
        {/* Apply Modal */}
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Apply for {job.title}</DialogTitle>
              <DialogDescription>
                Submit your application for {job.title} at {job.company}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message to Employer
                </label>
                <Textarea
                  id="message"
                  placeholder="Introduce yourself and explain why you're a good fit for this role..."
                  className="min-h-[150px]"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your profile information and resume will be attached to this application.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowApplyModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitApplication}
                disabled={applyForJobMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {applyForJobMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Card view for job listings
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {job.companyLogo ? (
            <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 bg-white flex-shrink-0">
              <img 
                src={job.companyLogo} 
                alt={`${job.company} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 hover:text-primary cursor-pointer" onClick={() => router.push(`/jobs/${job.id}`)}>
                  {job.title}
                </h3>
                <p className="text-gray-700">{job.company}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className={getJobTypeColor(job.type)}>
                    {job.type}
                  </Badge>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span>{job.location}</span>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => bookmarkJobMutation.mutate()}
                  className={isBookmarked ? "text-primary" : ""}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  View Job
                </Button>
              </div>
            </div>
            
            <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {job.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 3 && (
                <Badge variant="secondary" className="bg-gray-100 text-xs">
                  +{job.skills.length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mt-3">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>Posted {formatDate(job.postedAt)}</span>
              
              {job.deadline && (
                <>
                  <span className="mx-2">•</span>
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Apply by {job.deadline.toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}