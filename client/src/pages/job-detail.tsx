import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import JobListing from "@/components/jobs/job-listing";
import JobApplicationForm from "@/components/jobs/job-application-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Briefcase,
} from "lucide-react";

export default function JobDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  
  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: [`/api/jobs/${id}`],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/jobs/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch similar jobs
  const { data: similarJobs } = useQuery({
    queryKey: ['/api/jobs/similar', id],
    queryFn: async () => {
      if (!id) return [];
      
      const response = await fetch(`/api/jobs/${id}/similar`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch similar jobs");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
  
  // Handle application success
  const handleApplicationSuccess = () => {
    // Refetch job details to update application status
    // This assumes the API returns updated application count or status
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push('/jobs')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-5 w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-3" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-3" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push('/jobs')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Jobs
          </Button>
          <h1 className="text-2xl font-bold">Job Details</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading job</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                {error instanceof Error ? error.message : "There was an error loading the job details. The job may have been removed or is no longer available."}
              </p>
              <Button 
                onClick={() => router.push('/jobs')}
                variant="outline"
              >
                Browse Other Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.push('/jobs')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold">Job Details</h1>
      </div>
      
      {/* Job Details */}
      <JobListing job={job} isDetailed />
      
      {/* Similar Jobs */}
      {similarJobs && similarJobs.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Similar Jobs</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/jobs')}
            >
              View All Jobs
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarJobs.slice(0, 3).map((similarJob) => (
              <JobListing key={similarJob.id} job={similarJob} />
            ))}
          </div>
        </div>
      )}
      
      {/* Application Form Dialog */}
      {job && (
        <JobApplicationForm
          job={job}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}