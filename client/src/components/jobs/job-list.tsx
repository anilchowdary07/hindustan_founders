import { useQuery } from "@tanstack/react-query";
import { JobType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import JobItem from "./job-item";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function JobList() {
  const { toast } = useToast();
  const [jobType, setJobType] = useState<string | undefined>(undefined);
  
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["/api/jobs", jobType],
    queryFn: async ({ signal }) => {
      const queryParams = jobType ? `?type=${jobType}` : "";
      const response = await fetch(`/api/jobs${queryParams}`, { signal });
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      return response.json();
    },
  });

  // Handle job type filter change
  const handleTypeChange = (value: string) => {
    setJobType(value === "ALL" ? undefined : value);
  };

  // Show error toast if fetch fails
  if (error) {
    toast({
      title: "Error loading jobs",
      description: "There was a problem loading the job listings",
      variant: "destructive",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Job Opportunities</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select onValueChange={handleTypeChange} defaultValue="ALL">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value={JobType.FULL_TIME}>Full Time</SelectItem>
              <SelectItem value={JobType.PART_TIME}>Part Time</SelectItem>
              <SelectItem value={JobType.CONTRACT}>Contract</SelectItem>
              <SelectItem value={JobType.INTERNSHIP}>Internship</SelectItem>
              <SelectItem value={JobType.FREELANCE}>Freelance</SelectItem>
            </SelectContent>
          </Select>
          
          <Link href="/jobs/create">
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </Link>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job: any) => (
            <JobItem key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-6">
            {jobType 
              ? `There are no ${jobType.toLowerCase().replace('_', ' ')} jobs available right now.`
              : "There are no job listings available at the moment."}
          </p>
          <Link href="/jobs/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}