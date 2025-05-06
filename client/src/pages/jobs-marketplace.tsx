import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import JobListing, { JobListing as JobListingType } from "@/components/jobs/job-listing";
import JobBrowser from "@/components/jobs/job-browser";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Building2,
  MapPin,
  Filter,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function JobsMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch user-specific jobs (saved, applied, posted)
  const { data: userJobs, isLoading, error } = useQuery<{
    saved: JobListingType[];
    applied: JobListingType[];
    posted: JobListingType[];
  }>({
    queryKey: ['/api/jobs/user'],
    queryFn: async () => {
      if (!user) {
        return { saved: [], applied: [], posted: [] };
      }
      
      const response = await fetch('/api/jobs/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user jobs");
      }
      
      return await response.json();
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Find opportunities or hire talent from the founder network
          </p>
        </div>
        
        <Button 
          onClick={() => router.push('/jobs/post')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post a Job
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="all" className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            All Jobs
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="applied" className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Applied
          </TabsTrigger>
          <TabsTrigger value="my-posts" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            My Posts
          </TabsTrigger>
        </TabsList>
        
        {/* All Jobs Tab */}
        <TabsContent value="all" className="mt-0">
          <JobBrowser />
        </TabsContent>
        
        {/* Saved Jobs Tab */}
        <TabsContent value="saved" className="mt-0">
          {!user ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view saved jobs</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You need to be logged in to see your saved jobs
                  </p>
                  <Button 
                    onClick={() => router.push('/login')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading saved jobs...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading saved jobs</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {error instanceof Error ? error.message : "There was an error loading your saved jobs. Please try again."}
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
          ) : userJobs?.saved.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No saved jobs</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You haven't saved any jobs yet. Browse jobs and bookmark the ones you're interested in.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("all")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Saved Jobs</h2>
                <p className="text-sm text-gray-500">
                  {userJobs?.saved.length} {userJobs?.saved.length === 1 ? 'job' : 'jobs'} saved
                </p>
              </div>
              
              <div className="space-y-4">
                {userJobs?.saved.map((job) => (
                  <JobListing key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Applied Jobs Tab */}
        <TabsContent value="applied" className="mt-0">
          {!user ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view applications</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You need to be logged in to see your job applications
                  </p>
                  <Button 
                    onClick={() => router.push('/login')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading applications...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading applications</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {error instanceof Error ? error.message : "There was an error loading your job applications. Please try again."}
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
          ) : userJobs?.applied.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No applications</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You haven't applied to any jobs yet. Browse jobs and apply to the ones you're interested in.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("all")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Applications</h2>
                <p className="text-sm text-gray-500">
                  {userJobs?.applied.length} {userJobs?.applied.length === 1 ? 'application' : 'applications'} submitted
                </p>
              </div>
              
              <div className="space-y-4">
                {userJobs?.applied.map((job) => (
                  <JobListing key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* My Posts Tab */}
        <TabsContent value="my-posts" className="mt-0">
          {!user ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view your job posts</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You need to be logged in to see jobs you've posted
                  </p>
                  <Button 
                    onClick={() => router.push('/login')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading your job posts...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading job posts</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {error instanceof Error ? error.message : "There was an error loading your job posts. Please try again."}
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
          ) : userJobs?.posted.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No job posts</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You haven't posted any jobs yet. Create your first job listing to attract talent.
                  </p>
                  <Button 
                    onClick={() => router.push('/jobs/post')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Job Listings</h2>
                <Button 
                  onClick={() => router.push('/jobs/post')}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
              </div>
              
              <div className="space-y-4">
                {userJobs?.posted.map((job) => (
                  <JobListing key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}