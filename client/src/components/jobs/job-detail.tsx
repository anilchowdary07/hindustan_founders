import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Briefcase, 
  MapPin, 
  Building, 
  Calendar, 
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { JobTypeType, JobLocationType } from "@shared/schema";

const getJobTypeColor = (jobType: JobTypeType) => {
  switch (jobType) {
    case "FULL_TIME":
      return "green";
    case "PART_TIME":
      return "blue";
    case "CONTRACT":
      return "orange";
    case "INTERNSHIP":
      return "purple";
    case "FREELANCE":
      return "yellow";
    default:
      return "gray";
  }
};

const formatJobType = (jobType: JobTypeType) => {
  return jobType.replace("_", " ").replace(/\w\S*/g, (w) => (
    w.replace(/^\w/, (c) => c.toUpperCase())
  ));
};

const formatLocationType = (locationType: JobLocationType) => {
  switch (locationType) {
    case "REMOTE":
      return "Remote";
    case "ONSITE":
      return "On-site";
    case "HYBRID":
      return "Hybrid";
    default:
      return locationType;
  }
};

export default function JobDetail() {
  const [location, navigate] = useLocation();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  
  // Extract job ID from URL
  const jobId = location.split("/").pop();

  const { data: job, isLoading, error } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> 
            <Skeleton className="h-4 w-16" />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            
            <Skeleton className="h-32 w-full" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
          
          <div className="md:w-80 space-y-4 flex-shrink-0">
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Job not found</h3>
        <p className="text-muted-foreground mt-1">
          The job listing you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
      </div>
    );
  }

  const createdAt = job.createdAt instanceof Date 
    ? job.createdAt 
    : new Date(job.createdAt);
    
  const expiresAt = job.expiresAt
    ? (job.expiresAt instanceof Date ? job.expiresAt : new Date(job.expiresAt))
    : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> 
            Back to Jobs
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              {job.logo ? (
                <img 
                  src={job.logo} 
                  alt={`${job.company} logo`} 
                  className="w-16 h-16 object-contain rounded"
                />
              ) : (
                <Avatar className="w-16 h-16 bg-primary/10">
                  <AvatarFallback className="text-primary text-xl">
                    {job.company.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                <div className="text-lg text-muted-foreground">
                  {job.company}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="outline" className={`bg-${getJobTypeColor(job.jobType)}-100 text-${getJobTypeColor(job.jobType)}-800 px-3 py-1`}>
                <Briefcase className="mr-1 h-4 w-4" />
                {formatJobType(job.jobType)}
              </Badge>
              
              <Badge variant="outline" className="px-3 py-1">
                <MapPin className="mr-1 h-4 w-4" />
                {formatLocationType(job.locationType)}
              </Badge>
              
              {job.location && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  {job.location}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Posted on {format(createdAt, 'MMM dd, yyyy')}
              </div>
            </div>
            
            {job.salary && (
              <div className="mt-4 text-lg font-medium text-green-600">
                {job.salary}
              </div>
            )}
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Job Description</h2>
            <div className="prose max-w-none">
              <p>{job.description}</p>
            </div>
          </div>
          
          {job.responsibilities && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Responsibilities</h2>
              <div className="prose max-w-none">
                <p>{job.responsibilities}</p>
              </div>
            </div>
          )}
          
          {job.requirements && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <div className="prose max-w-none">
                <p>{job.requirements}</p>
              </div>
            </div>
          )}
          
          <div className="pt-4 md:hidden">
            <Button className="w-full" onClick={() => setIsApplyDialogOpen(true)}>
              Apply Now
            </Button>
          </div>
        </div>
        
        <div className="md:w-80 space-y-4 flex-shrink-0">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Job Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Type</span>
                  <span className="font-medium">{formatJobType(job.jobType)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location Type</span>
                  <span className="font-medium">{formatLocationType(job.locationType)}</span>
                </div>
                
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                )}
                
                {job.salary && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salary</span>
                    <span className="font-medium text-green-600">{job.salary}</span>
                  </div>
                )}
                
                {expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">{format(expiresAt, 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Button className="w-full" onClick={() => setIsApplyDialogOpen(true)}>
                  Apply Now
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {job.user && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Posted by</h3>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {job.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium flex items-center">
                      {job.user.name}
                      {job.user.isVerified && (
                        <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recruiter
                    </div>
                  </div>
                </div>
                
                <Link href={`/profile/${job.user.id}`}>
                  <Button variant="ghost" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <AlertDialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply for this position</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to apply for <span className="font-medium">{job.title}</span> at <span className="font-medium">{job.company}</span>.
              {job.applicationLink ? (
                <span> You'll be redirected to the company's application page.</span>
              ) : (
                <span> Please send your resume and cover letter to the employer.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {job.applicationLink ? (
              <AlertDialogAction asChild>
                <a 
                  href={job.applicationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Continue to Application <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </AlertDialogAction>
            ) : (
              <AlertDialogAction>
                Contact Employer
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}