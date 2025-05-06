import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  LinkedInCard, 
  LinkedInCardContent, 
  LinkedInCardHeader,
  LinkedInTabs,
  LinkedInTabPanel,
  LinkedInButton,
  LinkedInJobSkeleton
} from "../ui/linkedin-ui";
import { LinkedInSearch } from "../ui/linkedin-search";
import { 
  Briefcase, 
  BookmarkPlus, 
  Bell, 
  FileText, 
  CheckCircle,
  MapPin,
  Clock,
  Building2,
  ChevronRight,
  Filter
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  location: string;
  postedAt: Date;
  applicants?: number;
  isSaved?: boolean;
  isEasyApply?: boolean;
  salary?: string;
  jobType?: string;
  description?: string;
  skills?: string[];
}

interface LinkedInJobsProps {
  jobs: Job[];
  savedJobs: Job[];
  appliedJobs: Job[];
  isLoading?: boolean;
  onSaveJob?: (jobId: string) => void;
  onApplyJob?: (jobId: string) => void;
  onSearch?: (query: string) => void;
}

export function LinkedInJobs({ 
  jobs = [], 
  savedJobs = [], 
  appliedJobs = [],
  isLoading = false,
  onSaveJob,
  onApplyJob,
  onSearch
}: LinkedInJobsProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("recommended");
  
  // Job tabs
  const jobTabs = [
    { id: "recommended", label: "Recommended" },
    { id: "saved", label: "Saved", count: savedJobs.length },
    { id: "applied", label: "Applied", count: appliedJobs.length }
  ];
  
  // Get jobs based on active tab
  const getActiveJobs = () => {
    switch (activeTab) {
      case "saved":
        return savedJobs;
      case "applied":
        return appliedJobs;
      case "recommended":
      default:
        return jobs;
    }
  };
  
  const activeJobs = getActiveJobs();
  
  // Render job card
  const renderJobCard = (job: Job) => (
    <div key={job.id} className="p-4 border-b border-[#E0E0E0] hover:bg-[#F3F2EF] transition-colors">
      <div className="flex">
        <div className="mr-3">
          <div className="h-12 w-12 bg-[#EEF3F8] rounded-md flex items-center justify-center">
            {job.company.logoUrl ? (
              <img 
                src={job.company.logoUrl} 
                alt={job.company.name} 
                className="h-10 w-10 object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-[#0A66C2]" />
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 
            className="text-base font-medium text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            {job.title}
          </h3>
          
          <p 
            className="text-sm text-[#666666] hover:text-[#0A66C2] hover:underline cursor-pointer"
            onClick={() => navigate(`/company/${job.company.id}`)}
          >
            {job.company.name}
          </p>
          
          <div className="flex items-center text-xs text-[#666666] mt-1">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span>{job.location}</span>
          </div>
          
          {job.isEasyApply && (
            <div className="flex items-center text-xs text-[#057642] mt-1">
              <CheckCircle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span>Easy Apply</span>
            </div>
          )}
          
          <div className="flex items-center text-xs text-[#666666] mt-1">
            <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span>
              {new Date(job.postedAt).toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric' 
              })}
              {job.applicants && ` • ${job.applicants} applicants`}
            </span>
          </div>
          
          <div className="flex mt-3 space-x-2">
            <LinkedInButton
              variant="primary"
              size="sm"
              onClick={() => onApplyJob && onApplyJob(job.id)}
            >
              Apply
            </LinkedInButton>
            
            <LinkedInButton
              variant="secondary"
              size="sm"
              icon={<BookmarkPlus className="h-4 w-4" />}
              onClick={() => onSaveJob && onSaveJob(job.id)}
              className={job.isSaved ? "bg-[#EEF3F8]" : ""}
            >
              {job.isSaved ? "Saved" : "Save"}
            </LinkedInButton>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Search Header */}
      <div className="bg-white p-4 sticky top-14 z-10 border-b border-[#E0E0E0]">
        <LinkedInSearch
          placeholder="Search jobs"
          onSearch={onSearch}
        />
        
        <div className="flex justify-between mt-3">
          <LinkedInButton
            variant="secondary"
            size="sm"
            icon={<Filter className="h-4 w-4" />}
            onClick={() => navigate("/jobs/filters")}
          >
            Filters
          </LinkedInButton>
          
          <LinkedInButton
            variant="secondary"
            size="sm"
            icon={<Bell className="h-4 w-4" />}
            onClick={() => navigate("/jobs/alerts")}
          >
            Job alerts
          </LinkedInButton>
        </div>
      </div>
      
      {/* Tabs */}
      <LinkedInTabs
        tabs={jobTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        scrollable
        className="bg-white sticky top-[122px] z-10 mb-2"
      />
      
      {/* Job List */}
      <LinkedInTabPanel id="recommended" activeTab={activeTab}>
        {isLoading ? (
          <>
            <LinkedInJobSkeleton className="mb-2" />
            <LinkedInJobSkeleton className="mb-2" />
            <LinkedInJobSkeleton className="mb-2" />
          </>
        ) : activeJobs.length > 0 ? (
          <LinkedInCard className="p-0 rounded-none md:rounded-lg">
            <LinkedInCardHeader>
              <h2 className="text-base font-medium text-[#191919]">
                Recommended for you
              </h2>
              <p className="text-xs text-[#666666] mt-1">
                Based on your profile and search history
              </p>
            </LinkedInCardHeader>
            
            <LinkedInCardContent className="p-0">
              {activeJobs.map(renderJobCard)}
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No jobs found</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Try adjusting your search criteria or check back later
                </p>
                <LinkedInButton
                  variant="primary"
                  onClick={() => navigate("/jobs/search")}
                >
                  Search jobs
                </LinkedInButton>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="saved" activeTab={activeTab}>
        {savedJobs.length > 0 ? (
          <LinkedInCard className="p-0 rounded-none md:rounded-lg">
            <LinkedInCardHeader>
              <h2 className="text-base font-medium text-[#191919]">
                Saved jobs ({savedJobs.length})
              </h2>
            </LinkedInCardHeader>
            
            <LinkedInCardContent className="p-0">
              {savedJobs.map(renderJobCard)}
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No saved jobs</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Jobs you save will appear here
                </p>
                <LinkedInButton
                  variant="primary"
                  onClick={() => setActiveTab("recommended")}
                >
                  Find jobs
                </LinkedInButton>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="applied" activeTab={activeTab}>
        {appliedJobs.length > 0 ? (
          <LinkedInCard className="p-0 rounded-none md:rounded-lg">
            <LinkedInCardHeader>
              <h2 className="text-base font-medium text-[#191919]">
                Applied jobs ({appliedJobs.length})
              </h2>
            </LinkedInCardHeader>
            
            <LinkedInCardContent className="p-0">
              {appliedJobs.map(renderJobCard)}
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No applied jobs</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Jobs you apply to will appear here
                </p>
                <LinkedInButton
                  variant="primary"
                  onClick={() => setActiveTab("recommended")}
                >
                  Find jobs
                </LinkedInButton>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      {/* Job Resources */}
      <LinkedInCard className="mt-3">
        <LinkedInCardHeader>
          <h2 className="text-base font-medium text-[#191919]">
            Job seeking resources
          </h2>
        </LinkedInCardHeader>
        
        <LinkedInCardContent className="p-0">
          <div className="divide-y divide-[#E0E0E0]">
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
              onClick={() => navigate("/jobs/resume")}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <span className="text-sm text-[#191919] font-medium">Resume builder</span>
                  <p className="text-xs text-[#666666] mt-0.5">Create or upload your resume</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#666666]" />
            </button>
            
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
              onClick={() => navigate("/jobs/preferences")}
            >
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <span className="text-sm text-[#191919] font-medium">Job preferences</span>
                  <p className="text-xs text-[#666666] mt-0.5">Let recruiters know you're open</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#666666]" />
            </button>
            
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
              onClick={() => navigate("/jobs/alerts")}
            >
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <span className="text-sm text-[#191919] font-medium">Job alerts</span>
                  <p className="text-xs text-[#666666] mt-0.5">Get notified about new jobs</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#666666]" />
            </button>
            
            <button 
              className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
              onClick={() => navigate("/jobs/interview-prep")}
            >
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <span className="text-sm text-[#191919] font-medium">Interview prep</span>
                  <p className="text-xs text-[#666666] mt-0.5">Practice and get feedback</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#666666]" />
            </button>
          </div>
        </LinkedInCardContent>
      </LinkedInCard>
    </div>
  );
}