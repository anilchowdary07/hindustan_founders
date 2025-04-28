import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Briefcase, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Globe, 
  MapPin, 
  Share2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobLocationType, JobTypeType } from "@shared/schema";
import { Loader2 } from "lucide-react";

const getJobTypeColor = (jobType: JobTypeType) => {
  switch (jobType) {
    case "full_time":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    case "part_time":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
    case "contract":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
    case "internship":
      return "bg-green-100 text-green-800 hover:bg-green-100/80";
    case "freelance":
      return "bg-orange-100 text-orange-800 hover:bg-orange-100/80";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
  }
};

const formatJobType = (jobType: JobTypeType) => {
  switch (jobType) {
    case "full_time":
      return "Full Time";
    case "part_time":
      return "Part Time";
    case "contract":
      return "Contract";
    case "internship":
      return "Internship";
    case "freelance":
      return "Freelance";
    default:
      return jobType;
  }
};

const formatLocationType = (locationType: JobLocationType) => {
  switch (locationType) {
    case "remote":
      return "Remote";
    case "on_site":
      return "On-site";
    case "hybrid":
      return "Hybrid";
    default:
      return locationType;
  }
};

export default function JobDetail() {
  const { jobId } = useParams();
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false);
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${jobId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }
      
      return await response.json();
    },
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareTooltipOpen(true);
    setTimeout(() => setShareTooltipOpen(false), 2000);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="bg-muted/30 rounded-lg p-10 text-center">
        <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/jobs">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const createdDateText = job && job.createdAt ? formatDate(job.createdAt) : "";
  const expiresDateText = job && job.expiresAt ? `Expires on ${formatDate(job.expiresAt)}` : "No expiration date";
  
  return (
    <div>
      <div className="mb-6">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> 
            Back to Jobs
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            {job.logo ? (
              <img
                src={job.logo}
                alt={`${job.company} logo`}
                className="w-16 h-16 rounded-md object-cover"
              />
            ) : (
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {job.company?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
            
            <div className="flex items-center gap-1 mb-4">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{job.company}</span>
              
              <Badge variant="outline" className={`ml-2 ${getJobTypeColor(job.jobType)}`}>
                {formatJobType(job.jobType)}
              </Badge>
              
              <Badge variant="outline" className="ml-1">
                {formatLocationType(job.locationType)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Posted on {createdDateText}</span>
              </div>
              
              {job.salary && (
                <div className="flex items-center gap-1 font-medium">
                  <span>{job.salary}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
            {job.applicationLink && (
              <a 
                href={job.applicationLink}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full">
                  Apply Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}
            
            <TooltipProvider>
              <Tooltip open={shareTooltipOpen}>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={copyShareLink}
                    className="w-full"
                  >
                    Share
                    <Share2 className="ml-2 h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Link copied!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Job Description</h2>
              <div className="prose prose-zinc max-w-none">
                <p>{job.description}</p>
              </div>
            </div>
            
            {job.responsibilities && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Responsibilities</h2>
                <div className="prose prose-zinc max-w-none">
                  <p>{job.responsibilities}</p>
                </div>
              </div>
            )}
            
            {job.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <div className="prose prose-zinc max-w-none">
                  <p>{job.requirements}</p>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <div className="bg-muted/20 rounded-lg p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Job Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Job Type</p>
                      <p className="text-sm text-muted-foreground">{formatJobType(job.jobType)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location Type</p>
                      <p className="text-sm text-muted-foreground">{formatLocationType(job.locationType)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Salary</p>
                        <p className="text-sm text-muted-foreground">{job.salary}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Posting Date</p>
                      <p className="text-sm text-muted-foreground">{createdDateText}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {job.user && (
                <div>
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Posted By</h3>
                  
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {job.user.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium">{job.user.name}</p>
                      {job.user.isVerified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Application</h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Apply for this {job.title} position at {job.company} by clicking the button below.</p>
                  
                  {job.applicationLink ? (
                    <a 
                      href={job.applicationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button className="w-full gap-2">
                        Apply Now
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No direct application link available. Please contact the company directly.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}