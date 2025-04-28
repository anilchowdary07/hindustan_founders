import { JobTypeType, JobLocationType } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Building2, MapPin, CalendarDays, Clock } from "lucide-react";
import { Link } from "wouter";

interface JobItemProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    locationType: JobLocationType;
    jobType: JobTypeType;
    salary?: string;
    createdAt: Date;
    expiresAt?: Date;
    logo?: string;
    user?: {
      id: number;
      name: string;
      isVerified: boolean;
    };
  };
}

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

export default function JobItem({ job }: JobItemProps) {
  // Format the date
  const postedDate = job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : "";
  
  return (
    <Card className="overflow-hidden border-border/40 hover:border-border/80 transition-all duration-200">
      <Link href={`/jobs/${job.id}`}>
        <a className="block">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{job.company}</span>
                  {job.user?.isVerified && (
                    <Badge variant="secondary" className="ml-1 py-0 px-1.5">Verified</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant={getJobTypeColor(job.jobType)} className="rounded-full">
                    {formatJobType(job.jobType)}
                  </Badge>
                  
                  <Badge variant="outline" className="rounded-full flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.locationType === "REMOTE" ? "Remote" : job.location}
                  </Badge>
                  
                  {job.salary && (
                    <Badge variant="outline" className="rounded-full">
                      {job.salary}
                    </Badge>
                  )}
                </div>
              </div>
              
              {job.logo && (
                <div className="h-14 w-14 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden ml-4">
                  <img src={job.logo} alt={`${job.company} logo`} className="h-full w-full object-cover" />
                </div>
              )}
              
              {!job.logo && (
                <div className="h-14 w-14 bg-primary/10 rounded-md flex items-center justify-center overflow-hidden ml-4">
                  <Building2 className="h-7 w-7 text-primary/60" />
                </div>
              )}
            </div>
          </CardContent>
        </a>
      </Link>
      
      <CardFooter className="bg-muted/20 px-6 py-3 border-t flex justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Posted {postedDate}</span>
        </div>
        
        {job.expiresAt && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Apply by {new Date(job.expiresAt).toLocaleDateString()}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}