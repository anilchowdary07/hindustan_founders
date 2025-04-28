import { Link } from "wouter";
import { Briefcase, Building, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { JobLocationType, JobTypeType } from "@shared/schema";

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

export default function JobItem({ job }: JobItemProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-shrink-0">
          {job.logo ? (
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="w-12 h-12 rounded-md object-cover"
            />
          ) : (
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {job.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div>
              <Link href={`/jobs/${job.id}`}>
                <h3 className="text-xl font-bold hover:text-primary transition-colors">
                  {job.title}
                </h3>
              </Link>
              
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
                {job.user?.isVerified && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">
                    Verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-y-2 gap-x-4 mt-3">
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location} • {job.locationType === "remote" ? "Remote" : job.locationType === "hybrid" ? "Hybrid" : "On-site"}</span>
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>{formatJobType(job.jobType)}</span>
                </div>
                
                {job.salary && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm font-medium">
                    {job.salary}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={`${getJobTypeColor(job.jobType)}`}>
                {formatJobType(job.jobType)}
              </Badge>
              
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(new Date(job.createdAt))}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Link href={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}