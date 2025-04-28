import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, MapPin, CalendarDays, ExternalLink } from "lucide-react";
import { JobLocationType, JobTypeType } from "@shared/schema";
import { format, formatDistanceToNow } from "date-fns";

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

const getJobTypeColor = (jobType: JobTypeType) => {
  switch (jobType) {
    case "FULL_TIME":
      return "bg-green-100 text-green-800";
    case "PART_TIME":
      return "bg-blue-100 text-blue-800";
    case "CONTRACT":
      return "bg-orange-100 text-orange-800";
    case "INTERNSHIP":
      return "bg-purple-100 text-purple-800";
    case "FREELANCE":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatJobType = (jobType: JobTypeType) => {
  const formatted = jobType.replace("_", " ").toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export default function JobItem({ job }: JobItemProps) {
  // Convert string date to Date object if needed
  const createdAt = job.createdAt instanceof Date 
    ? job.createdAt 
    : new Date(job.createdAt);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0">
            {job.logo ? (
              <img 
                src={job.logo} 
                alt={`${job.company} logo`} 
                className="w-12 h-12 object-contain rounded"
              />
            ) : (
              <Avatar className="w-12 h-12 bg-primary/10">
                <AvatarFallback className="text-primary">
                  {job.company.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <Link href={`/jobs/${job.id}`}>
                <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                  {job.title}
                </h3>
              </Link>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getJobTypeColor(job.jobType)}>
                  <Briefcase className="mr-1 h-3 w-3" />
                  {formatJobType(job.jobType)}
                </Badge>
                
                {job.locationType && (
                  <Badge variant="outline" className="bg-slate-100">
                    <MapPin className="mr-1 h-3 w-3" />
                    {job.locationType.charAt(0) + job.locationType.slice(1).toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{job.company}</span>
              {job.location && (
                <span className="inline-flex items-center ml-2">
                  <MapPin className="h-3 w-3 mr-1" /> {job.location}
                </span>
              )}
            </div>
            
            {job.salary && (
              <div className="text-sm font-medium text-green-600">
                {job.salary}
              </div>
            )}
            
            <div className="flex items-center text-xs text-muted-foreground pt-2">
              <CalendarDays className="h-3 w-3 mr-1" />
              <span>Posted {formatDistanceToNow(createdAt, { addSuffix: true })}</span>
              
              {job.expiresAt && (
                <span className="ml-4">
                  Expires on {format(
                    job.expiresAt instanceof Date ? job.expiresAt : new Date(job.expiresAt),
                    'MMM dd, yyyy'
                  )}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col justify-center gap-2 mt-4 md:mt-0">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" className="w-full md:w-auto">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}