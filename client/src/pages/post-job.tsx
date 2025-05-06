import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import JobPostingForm from "@/components/jobs/job-posting-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  AlertCircle,
  Lock,
} from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const { id } = router.query; // For edit mode
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const isEditMode = !!id;
  
  // Fetch job details if in edit mode
  const { data: jobData, isLoading: isJobLoading, error } = useQuery({
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
    enabled: isEditMode,
    staleTime: 60000, // 1 minute
  });
  
  // Check if user is authorized to edit this job
  const isAuthorized = !isEditMode || (jobData && user && jobData.userId === user.id);
  
  if (isAuthLoading || (isEditMode && isJobLoading)) {
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
        
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If not logged in
  if (!user) {
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
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Job Listing" : "Post a New Job"}
          </h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Lock className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Authentication Required</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                You need to be logged in to {isEditMode ? "edit" : "post"} job listings.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/jobs')}
                >
                  Browse Jobs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If error loading job or not authorized to edit
  if ((isEditMode && error) || !isAuthorized) {
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
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Job Listing" : "Post a New Job"}
          </h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {!isAuthorized 
                  ? "Not Authorized" 
                  : "Error Loading Job"}
              </h3>
              <p className="text-gray-500 mb-4 max-w-md">
                {!isAuthorized 
                  ? "You don't have permission to edit this job listing." 
                  : error instanceof Error 
                    ? error.message 
                    : "There was an error loading the job details. The job may have been removed."}
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/jobs')}
                >
                  Browse Jobs
                </Button>
                {!isEditMode && (
                  <Button 
                    onClick={() => router.push('/jobs/post')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Post a New Job
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <JobPostingForm 
        initialData={isEditMode ? jobData : undefined}
        isEditMode={isEditMode}
      />
    </div>
  );
}