import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JobType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import JobItem from "./job-item";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobList() {
  const { user } = useAuth();
  const [jobType, setJobType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["/api/jobs"],
    select: (data) => {
      // First filter by job type if selected
      let filteredJobs = jobType !== "all" 
        ? data.filter((job: any) => job.jobType === jobType)
        : data;
      
      // Then filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredJobs = filteredJobs.filter((job: any) => 
          job.title.toLowerCase().includes(term) || 
          job.company.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term)
        );
      }
      
      return filteredJobs;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Jobs</h1>
        
        {user && (
          <Link href="/jobs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
          </Link>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex items-center">
          <Filter className="mr-2 h-5 w-5 text-muted-foreground" />
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={JobType.FULL_TIME}>Full Time</SelectItem>
              <SelectItem value={JobType.PART_TIME}>Part Time</SelectItem>
              <SelectItem value={JobType.CONTRACT}>Contract</SelectItem>
              <SelectItem value={JobType.INTERNSHIP}>Internship</SelectItem>
              <SelectItem value={JobType.FREELANCE}>Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <JobItem key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || jobType !== "all" 
              ? "Try adjusting your filters or search term" 
              : "Be the first to post a job opportunity"}
          </p>
          {user && (
            <Link href="/jobs/create">
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Post Job
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}