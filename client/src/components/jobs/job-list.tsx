import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PlusCircle } from "lucide-react";
import { JobType, JobLocation } from "@shared/schema";
import JobItem from "./job-item";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function JobList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["/api/jobs", selectedType],
    queryFn: async ({ queryKey }) => {
      const type = queryKey[1];
      const url = type && type !== "all" ? `/api/jobs?type=${type}` : "/api/jobs";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      return await response.json();
    },
  });
  
  const filteredJobs = jobs?.filter((job: any) => {
    const matchesSearch = 
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = 
      locationFilter === "" || 
      locationFilter === "all" ||
      job.locationType === locationFilter;
    
    return matchesSearch && matchesLocation;
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Jobs</h1>
          <p className="text-muted-foreground">
            Find the perfect opportunity in India's startup ecosystem
          </p>
        </div>
        
        {user && (
          <Link href="/jobs/create">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Input
            placeholder="Search by title, company, or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Job Type" />
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
        
        <div>
          <Select
            value={locationFilter}
            onValueChange={setLocationFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Location Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value={JobLocation.REMOTE}>Remote</SelectItem>
              <SelectItem value={JobLocation.HYBRID}>Hybrid</SelectItem>
              <SelectItem value={JobLocation.ON_SITE}>On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredJobs && filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job: any) => (
            <JobItem key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-2">No jobs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search filters or check back later
          </p>
        </div>
      )}
    </div>
  );
}