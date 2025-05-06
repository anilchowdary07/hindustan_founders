import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { JobListing } from "./job-listing";
import { useDebounce } from "@/hooks/use-debounce";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Filter,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

// Job categories
const JOB_CATEGORIES = [
  "All Categories",
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "Operations",
  "Finance",
  "HR",
  "Legal",
  "Executive",
];

// Job locations
const JOB_LOCATIONS = [
  "All Locations",
  "Remote",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

// Job types
const JOB_TYPES = [
  "All Types",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
];

interface JobBrowserProps {
  initialFilters?: {
    search?: string;
    category?: string;
    location?: string;
    type?: string;
  };
}

export default function JobBrowser({ initialFilters = {} }: JobBrowserProps) {
  const router = useRouter();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || "");
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.category || "All Categories");
  const [locationFilter, setLocationFilter] = useState(initialFilters.location || "All Locations");
  const [typeFilter, setTypeFilter] = useState(initialFilters.type || "All Types");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Update active filters
  useEffect(() => {
    const filters = [];
    
    if (categoryFilter !== "All Categories") {
      filters.push(categoryFilter);
    }
    
    if (locationFilter !== "All Locations") {
      filters.push(locationFilter);
    }
    
    if (typeFilter !== "All Types") {
      filters.push(typeFilter);
    }
    
    setActiveFilters(filters);
  }, [categoryFilter, locationFilter, typeFilter]);
  
  // Fetch jobs with filters
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['/api/jobs', debouncedSearchQuery, categoryFilter, locationFilter, typeFilter],
    queryFn: async () => {
      let url = '/api/jobs?';
      
      if (debouncedSearchQuery) {
        url += `search=${encodeURIComponent(debouncedSearchQuery)}&`;
      }
      
      if (categoryFilter !== "All Categories") {
        url += `category=${encodeURIComponent(categoryFilter)}&`;
      }
      
      if (locationFilter !== "All Locations") {
        url += `location=${encodeURIComponent(locationFilter)}&`;
      }
      
      if (typeFilter !== "All Types") {
        url += `type=${encodeURIComponent(typeFilter)}&`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      return await response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be updated in the useQuery hook
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setLocationFilter("All Locations");
    setTypeFilter("All Types");
  };
  
  // Remove a specific filter
  const removeFilter = (filter: string) => {
    if (categoryFilter === filter) {
      setCategoryFilter("All Categories");
    } else if (locationFilter === filter) {
      setLocationFilter("All Locations");
    } else if (typeFilter === filter) {
      setTypeFilter("All Types");
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs by title, company, or keywords"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-[180px] text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {JOB_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="h-9 w-[180px] text-sm">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {JOB_LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-[180px] text-sm">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {activeFilters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-9 text-sm"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {filter}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
        </div>
      )}
      
      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading jobs</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  {error instanceof Error ? error.message : "There was an error loading the job listings. Please try again."}
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : jobs && jobs.length > 0 ? (
          // Results
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{jobs.length}</span> jobs
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="h-8 w-[150px] text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {jobs.map((job) => (
              <JobListing key={job.id} job={job} />
            ))}
          </>
        ) : (
          // No results
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  No job listings match your current filters. Try adjusting your search criteria.
                </p>
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}