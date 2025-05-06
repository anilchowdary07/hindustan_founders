import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { JobListing } from "./job-listing";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Download,
} from "lucide-react";

interface JobManagementDashboardProps {
  initialTab?: string;
}

export default function JobManagementDashboard({ initialTab = "active" }: JobManagementDashboardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteJobId, setConfirmDeleteJobId] = useState<string | null>(null);
  const [viewApplicationsJobId, setViewApplicationsJobId] = useState<string | null>(null);
  
  // Fetch user's job listings
  const { data: jobListings, isLoading, error } = useQuery({
    queryKey: ['/api/jobs/manage', activeTab, searchQuery],
    queryFn: async () => {
      if (!user) {
        throw new Error("Authentication required");
      }
      
      let url = `/api/jobs/manage?status=${activeTab}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch job listings");
      }
      
      return await response.json();
    },
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch applications for a specific job
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/jobs/applications', viewApplicationsJobId],
    queryFn: async () => {
      if (!viewApplicationsJobId) {
        return [];
      }
      
      const response = await fetch(`/api/jobs/${viewApplicationsJobId}/applications`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      
      return await response.json();
    },
    enabled: !!viewApplicationsJobId,
    staleTime: 60000, // 1 minute
  });
  
  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete job listing");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job deleted",
        description: "The job listing has been successfully deleted",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/manage'] });
      setConfirmDeleteJobId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job listing",
        variant: "destructive",
      });
    },
  });
  
  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update application status");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "The application status has been updated",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/jobs/applications', viewApplicationsJobId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    },
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be updated in the useQuery hook
  };
  
  // Handle job deletion
  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };
  
  // Handle application status update
  const handleUpdateApplicationStatus = (applicationId: string, status: string) => {
    updateApplicationStatusMutation.mutate({ applicationId, status });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Expired</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Draft</Badge>;
      case 'closed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get application status badge
  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'reviewing':
        return <Badge className="bg-blue-100 text-blue-800">Reviewing</Badge>;
      case 'shortlisted':
        return <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'hired':
        return <Badge className="bg-purple-100 text-purple-800">Hired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Management</h2>
          <p className="text-gray-500">Manage your job listings and applications</p>
        </div>
        
        <Button 
          onClick={() => router.push('/jobs/post')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your job listings..."
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading job listings...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading job listings</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {error instanceof Error ? error.message : "There was an error loading your job listings. Please try again."}
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
          ) : jobListings?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No job listings found</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {activeTab === 'active' && "You don't have any active job listings. Post a new job to start receiving applications."}
                    {activeTab === 'draft' && "You don't have any draft job listings. You can save jobs as drafts while working on them."}
                    {activeTab === 'closed' && "You don't have any closed job listings."}
                    {activeTab === 'expired' && "You don't have any expired job listings."}
                  </p>
                  {activeTab === 'active' && (
                    <Button 
                      onClick={() => router.push('/jobs/post')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Post a Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobListings?.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {job.companyLogo ? (
                            <div className="h-8 w-8 rounded overflow-hidden mr-3 bg-white border border-gray-200 flex items-center justify-center">
                              <img 
                                src={job.companyLogo} 
                                alt={job.company} 
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded bg-gray-100 mr-3 flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.createdAt ? formatDate(job.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{job.applicationCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/jobs/${job.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Listing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/jobs/edit/${job.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Listing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setViewApplicationsJobId(job.id)}>
                              <Users className="h-4 w-4 mr-2" />
                              View Applications
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setConfirmDeleteJobId(job.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Listing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDeleteJobId} onOpenChange={() => setConfirmDeleteJobId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDeleteJobId(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => confirmDeleteJobId && handleDeleteJob(confirmDeleteJobId)}
              disabled={deleteJobMutation.isPending}
            >
              {deleteJobMutation.isPending ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Applications Dialog */}
      <Dialog 
        open={!!viewApplicationsJobId} 
        onOpenChange={() => setViewApplicationsJobId(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Applications</DialogTitle>
            <DialogDescription>
              Review and manage applications for this job listing
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingApplications ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading applications...</span>
            </div>
          ) : applications?.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center">
                <Users className="h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
                <p className="text-gray-500 max-w-md">
                  This job listing hasn't received any applications yet. Check back later or promote your job listing to attract more candidates.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications?.map((application: any) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.applicantName}</div>
                          <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.createdAt ? formatDate(application.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getApplicationStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        {application.resumeUrl ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(application.resumeUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">Not available</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Update Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateApplicationStatus(application.id, 'reviewing')}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as Reviewing
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateApplicationStatus(application.id, 'shortlisted')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Shortlist Candidate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Application
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateApplicationStatus(application.id, 'hired')}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Mark as Hired
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setViewApplicationsJobId(null)}
            >
              Close
            </Button>
            {applications?.length > 0 && (
              <Button 
                onClick={() => {
                  // In a real app, this would generate and download a CSV of applications
                  toast({
                    title: "Export started",
                    description: "Your applications export is being prepared",
                  });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Applications
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}