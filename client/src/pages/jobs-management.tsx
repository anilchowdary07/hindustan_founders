import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import JobManagementDashboard from "@/components/jobs/job-management-dashboard";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Lock,
  ArrowLeft,
} from "lucide-react";

export default function JobsManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { tab } = router.query;
  
  // If not authenticated, show login prompt
  if (!isLoading && !user) {
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
          <h1 className="text-2xl font-bold">Job Management</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Lock className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Authentication Required</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                You need to be logged in to manage job listings.
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
      </div>
      
      <JobManagementDashboard 
        initialTab={typeof tab === 'string' ? tab : 'active'} 
      />
    </div>
  );
}