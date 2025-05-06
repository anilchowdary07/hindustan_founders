import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  coverLetter: string;
  resumeUrl?: string;
  appliedAt: Date;
  updatedAt: Date;
  answers?: Record<string, string>;
}

export interface JobApplicationForm {
  coverLetter: string;
  resume?: File;
  answers?: Record<string, string>;
}

export function useJobApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all applications for the current user
  const {
    data: myApplications,
    isLoading: isLoadingMyApplications,
    error: myApplicationsError,
    refetch: refetchMyApplications,
  } = useQuery({
    queryKey: ['jobApplications', 'my'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await apiRequest('GET', '/api/job-applications/my');
        return response || [];
      } catch (error) {
        console.error('Error fetching my job applications:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get applications for a specific job (for job posters)
  const getJobApplications = useCallback((jobId: string) => {
    return useQuery({
      queryKey: ['jobApplications', jobId],
      queryFn: async () => {
        if (!user) return [];
        try {
          const response = await apiRequest('GET', `/api/jobs/${jobId}/applications`);
          return response || [];
        } catch (error) {
          console.error(`Error fetching applications for job ${jobId}:`, error);
          return [];
        }
      },
      enabled: !!user && !!jobId,
    });
  }, [user]);

  // Check if user has already applied to a job
  const hasApplied = useCallback((jobId: string) => {
    if (!myApplications || !Array.isArray(myApplications)) return false;
    return myApplications.some(app => app.jobId === jobId);
  }, [myApplications]);

  // Get application status for a specific job
  const getApplicationStatus = useCallback((jobId: string) => {
    if (!myApplications || !Array.isArray(myApplications)) return null;
    const application = myApplications.find(app => app.jobId === jobId);
    return application ? application.status : null;
  }, [myApplications]);

  // Submit a job application
  const submitApplication = useCallback(async (jobId: string, applicationData: JobApplicationForm) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to apply for jobs',
        variant: 'destructive',
      });
      return null;
    }

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('coverLetter', applicationData.coverLetter);
      
      if (applicationData.resume) {
        formData.append('resume', applicationData.resume);
      }
      
      if (applicationData.answers) {
        formData.append('answers', JSON.stringify(applicationData.answers));
      }

      // Make API request
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['jobApplications', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      toast({
        title: 'Application submitted',
        description: 'Your job application has been submitted successfully',
      });
      
      return result;
    } catch (error) {
      console.error('Error submitting job application:', error);
      
      toast({
        title: 'Application failed',
        description: error instanceof Error ? error.message : 'Failed to submit your application. Please try again.',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, queryClient]);

  // Update application status (for job posters)
  const updateApplicationStatus = useMutation({
    mutationFn: async ({ 
      applicationId, 
      status 
    }: { 
      applicationId: string; 
      status: JobApplication['status']; 
    }) => {
      const response = await apiRequest('PATCH', `/api/job-applications/${applicationId}`, { status });
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['jobApplications', variables.applicationId] });
      
      toast({
        title: 'Status updated',
        description: `Application status updated to ${variables.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update application status',
        variant: 'destructive',
      });
    },
  });

  // Withdraw an application
  const withdrawApplication = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await apiRequest('DELETE', `/api/job-applications/${applicationId}`);
      return response;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['jobApplications', 'my'] });
      
      toast({
        title: 'Application withdrawn',
        description: 'Your job application has been withdrawn',
      });
    },
    onError: (error) => {
      toast({
        title: 'Withdrawal failed',
        description: error instanceof Error ? error.message : 'Failed to withdraw your application',
        variant: 'destructive',
      });
    },
  });

  return {
    myApplications,
    isLoadingMyApplications,
    myApplicationsError,
    refetchMyApplications,
    getJobApplications,
    hasApplied,
    getApplicationStatus,
    submitApplication,
    updateApplicationStatus,
    withdrawApplication,
    isSubmitting,
  };
}