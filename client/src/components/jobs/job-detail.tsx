import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useParams, Link } from "wouter";
import { JobTypeType, JobLocationType } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Function to determine job type badge color
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

// Function to format job type display
const formatJobType = (jobType: JobTypeType) => {
  return jobType.replace("_", " ").toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Function to format location type display
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
  const { jobId } = useParams();
  const { toast } = useToast();
  
  const { data: job, isLoading, error } = useQuery({
    queryKey: ["/api/jobs", jobId],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/jobs/${jobId}`, { signal });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch job details");
      }
      return response.json();
    },
  });

  // Show error toast if fetch fails
  if (error) {
    toast({
      title: "Error loading job details",
      description: (error as Error).message,
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job posting you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/jobs">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <Building2 className="h-4 w-4 mr-2" />
                <span className="font-medium">{job.company}</span>
                {job.user?.isVerified && (
                  <Badge variant="secondary" className="ml-2 py-0 px-1.5">Verified</Badge>
                )}
              </CardDescription>
            </div>
            
            {job.logo && (
              <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                <img src={job.logo} alt={`${job.company} logo`} className="h-full w-full object-cover" />
              </div>
            )}
            
            {!job.logo && (
              <div className="h-16 w-16 bg-primary/10 rounded-md flex items-center justify-center overflow-hidden">
                <Building2 className="h-8 w-8 text-primary/60" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant={getJobTypeColor(job.jobType)} className="rounded-full">
              {formatJobType(job.jobType)}
            </Badge>
            
            <Badge variant="outline" className="rounded-full flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {formatLocationType(job.locationType)} {job.locationType !== "REMOTE" && `• ${job.location}`}
            </Badge>
            
            {job.salary && (
              <Badge variant="outline" className="rounded-full">
                {job.salary}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Posted on {formatDate(job.createdAt)}</span>
            </div>
            
            {job.expiresAt && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Apply by {formatDate(job.expiresAt)}</span>
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Description
              </h3>
              <div className="mt-3 whitespace-pre-line">{job.description}</div>
            </div>
            
            {job.responsibilities && (
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Responsibilities
                </h3>
                <div className="mt-3 whitespace-pre-line">{job.responsibilities}</div>
              </div>
            )}
            
            {job.requirements && (
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Requirements
                </h3>
                <div className="mt-3 whitespace-pre-line">{job.requirements}</div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <div>
            {job.user && (
              <div className="text-sm text-muted-foreground">
                Posted by {job.user.name}
              </div>
            )}
          </div>
          
          {job.applicationUrl && (
            <Link href={job.applicationUrl.startsWith('http') ? job.applicationUrl : `https://${job.applicationUrl}`} target="_blank">
              <Button>
                Apply Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}