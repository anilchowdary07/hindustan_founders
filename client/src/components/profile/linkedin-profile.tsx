import React from "react";
import { useLocation } from "wouter";
import { 
  LinkedInCard, 
  LinkedInCardContent, 
  LinkedInCardHeader,
  LinkedInCardFooter,
  LinkedInButton,
  LinkedInTabs,
  LinkedInTabPanel,
  LinkedInProfileSkeleton
} from "../ui/linkedin-ui";
import { LinkedInAvatar } from "../ui/linkedin-avatar";
import { 
  Edit, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Users, 
  Eye, 
  BarChart2,
  MessageSquare,
  Bell,
  UserPlus,
  ChevronDown,
  Linkedin
} from "lucide-react";

interface LinkedInProfileProps {
  user?: any;
  isLoading?: boolean;
  isCurrentUser?: boolean;
  isConnected?: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
  onFollow?: () => void;
}

export function LinkedInProfile({ 
  user, 
  isLoading = false, 
  isCurrentUser = false,
  isConnected = false,
  onConnect,
  onMessage,
  onFollow
}: LinkedInProfileProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = React.useState("posts");
  
  // Profile tabs
  const profileTabs = [
    { id: "posts", label: "Posts" },
    { id: "about", label: "About" },
    { id: "activity", label: "Activity" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
  ];
  
  if (isLoading || !user) {
    return <LinkedInProfileSkeleton />;
  }
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Profile Card */}
      <LinkedInCard className="mb-3 relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-[#0077B5] to-[#0A66C2] relative">
          {isCurrentUser && (
            <button 
              className="absolute right-3 bottom-3 bg-white rounded-full p-1.5 shadow-sm"
              aria-label="Edit cover photo"
            >
              <Edit className="h-5 w-5 text-[#666666]" />
            </button>
          )}
        </div>
        
        {/* Profile Picture */}
        <div className="absolute top-20 left-4 border-4 border-white rounded-full">
          <LinkedInAvatar
            src={user.avatarUrl}
            alt={user.name}
            fallback={user.name.substring(0, 2).toUpperCase()}
            size="xl"
            verified={user.verified}
          />
          
          {isCurrentUser && (
            <button 
              className="absolute right-0 bottom-0 bg-white rounded-full p-1 shadow-sm"
              aria-label="Edit profile picture"
            >
              <Edit className="h-4 w-4 text-[#666666]" />
            </button>
          )}
        </div>
        
        {/* Profile Info */}
        <LinkedInCardContent className="pt-12 pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-medium text-[#191919]">{user.name}</h1>
              <p className="text-sm text-[#666666] mt-1">{user.title}</p>
              
              <div className="flex items-center text-xs text-[#666666] mt-2">
                {user.location && (
                  <div className="flex items-center mr-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.connections && (
                  <div className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    <span>{user.connections} connections</span>
                  </div>
                )}
              </div>
              
              {user.company && (
                <div className="flex items-center text-xs mt-2">
                  <Briefcase className="h-3.5 w-3.5 mr-1 text-[#666666]" />
                  <span className="font-medium">{user.company}</span>
                </div>
              )}
              
              {user.education && (
                <div className="flex items-center text-xs mt-1">
                  <GraduationCap className="h-3.5 w-3.5 mr-1 text-[#666666]" />
                  <span className="font-medium">{user.education}</span>
                </div>
              )}
            </div>
            
            {isCurrentUser && (
              <button 
                className="text-[#666666] p-1 rounded-full hover:bg-[#F3F2EF]"
                aria-label="Edit profile"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Action Buttons */}
          {!isCurrentUser && (
            <div className="flex gap-2 mt-4">
              {isConnected ? (
                <LinkedInButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={onMessage}
                  icon={<MessageSquare className="h-4 w-4" />}
                >
                  Message
                </LinkedInButton>
              ) : (
                <LinkedInButton
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={onConnect}
                  icon={<Linkedin />}
                >
                  Connect
                </LinkedInButton>
              )}
              
              <LinkedInButton
                variant="secondary"
                size="md"
                onClick={onFollow}
                icon={<Bell className="h-4 w-4" />}
              >
                Follow
              </LinkedInButton>
              
              <LinkedInButton
                variant="secondary"
                size="md"
                icon={<ChevronDown className="h-4 w-4" />}
                aria-label="More options"
              />
            </div>
          )}
          
          {isCurrentUser && (
            <div className="flex gap-2 mt-4">
              <LinkedInButton
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate("/profile/edit")}
              >
                Edit profile
              </LinkedInButton>
              
              <LinkedInButton
                variant="secondary"
                size="md"
                onClick={() => navigate("/profile/view-as")}
              >
                View as
              </LinkedInButton>
            </div>
          )}
        </LinkedInCardContent>
      </LinkedInCard>
      
      {/* Analytics Card */}
      {isCurrentUser && (
        <LinkedInCard className="mb-3">
          <LinkedInCardHeader>
            <h2 className="text-base font-medium text-[#191919]">Analytics</h2>
            <p className="text-xs text-[#666666] mt-1">Private to you</p>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="py-2">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <p className="text-sm font-medium text-[#191919]">{user.profileViews || 0} profile views</p>
                  <p className="text-xs text-[#666666]">Discover who's viewed your profile</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-[#666666]" />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <p className="text-sm font-medium text-[#191919]">{user.postImpressions || 0} post impressions</p>
                  <p className="text-xs text-[#666666]">Check out who's engaging with your posts</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-[#666666]" />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-[#666666] mr-3" />
                <div>
                  <p className="text-sm font-medium text-[#191919]">{user.searchAppearances || 0} search appearances</p>
                  <p className="text-xs text-[#666666]">See how often you appear in search results</p>
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-[#666666]" />
            </div>
          </LinkedInCardContent>
        </LinkedInCard>
      )}
      
      {/* Tabs */}
      <LinkedInTabs
        tabs={profileTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        scrollable
        className="bg-white sticky top-14 z-10 mb-3"
      />
      
      {/* Tab Content */}
      <LinkedInTabPanel id="posts" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardContent>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-[#191919] mb-2">No posts yet</h3>
              <p className="text-sm text-[#666666] mb-4">
                {isCurrentUser 
                  ? "Share your thoughts, experiences, or work with your network"
                  : `${user.name} hasn't posted anything yet`
                }
              </p>
              {isCurrentUser && (
                <LinkedInButton
                  variant="primary"
                  onClick={() => navigate("/")}
                >
                  Create a post
                </LinkedInButton>
              )}
            </div>
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="about" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardHeader>
            <h2 className="text-base font-medium text-[#191919]">About</h2>
          </LinkedInCardHeader>
          
          <LinkedInCardContent>
            <p className="text-sm text-[#191919] whitespace-pre-line">
              {user.about || (isCurrentUser 
                ? "Add a summary about yourself to help others understand your background and interests."
                : `${user.name} hasn't added any information yet.`
              )}
            </p>
          </LinkedInCardContent>
          
          {isCurrentUser && !user.about && (
            <LinkedInCardFooter>
              <LinkedInButton
                variant="secondary"
                size="sm"
                onClick={() => navigate("/profile/edit")}
              >
                Add about
              </LinkedInButton>
            </LinkedInCardFooter>
          )}
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="activity" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardContent>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-[#191919] mb-2">No activity yet</h3>
              <p className="text-sm text-[#666666] mb-4">
                {isCurrentUser 
                  ? "Your posts, comments, and reactions will appear here"
                  : `${user.name} hasn't been active yet`
                }
              </p>
            </div>
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="experience" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardHeader className="flex justify-between items-center">
            <h2 className="text-base font-medium text-[#191919]">Experience</h2>
            {isCurrentUser && (
              <button 
                className="text-[#666666] p-1 rounded-full hover:bg-[#F3F2EF]"
                aria-label="Add experience"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </LinkedInCardHeader>
          
          <LinkedInCardContent>
            {user.experience && user.experience.length > 0 ? (
              <div className="space-y-4">
                {user.experience.map((exp: any, index: number) => (
                  <div key={index} className="flex">
                    <div className="mr-3 mt-1">
                      <div className="h-10 w-10 bg-[#EEF3F8] rounded-md flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-[#0A66C2]" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-[#191919]">{exp.title}</h3>
                      <p className="text-xs text-[#666666]">{exp.company}</p>
                      <p className="text-xs text-[#666666] mt-1">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-[#191919] mt-2 whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#666666]">
                  {isCurrentUser 
                    ? "Add your work experience to showcase your professional journey"
                    : `${user.name} hasn't added any experience yet`
                  }
                </p>
                {isCurrentUser && (
                  <LinkedInButton
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate("/profile/edit")}
                  >
                    Add experience
                  </LinkedInButton>
                )}
              </div>
            )}
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="education" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardHeader className="flex justify-between items-center">
            <h2 className="text-base font-medium text-[#191919]">Education</h2>
            {isCurrentUser && (
              <button 
                className="text-[#666666] p-1 rounded-full hover:bg-[#F3F2EF]"
                aria-label="Add education"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </LinkedInCardHeader>
          
          <LinkedInCardContent>
            {user.educationDetails && user.educationDetails.length > 0 ? (
              <div className="space-y-4">
                {user.educationDetails.map((edu: any, index: number) => (
                  <div key={index} className="flex">
                    <div className="mr-3 mt-1">
                      <div className="h-10 w-10 bg-[#EEF3F8] rounded-md flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-[#0A66C2]" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-[#191919]">{edu.school}</h3>
                      <p className="text-xs text-[#666666]">{edu.degree}</p>
                      <p className="text-xs text-[#666666] mt-1">
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </p>
                      {edu.description && (
                        <p className="text-xs text-[#191919] mt-2 whitespace-pre-line">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#666666]">
                  {isCurrentUser 
                    ? "Add your education to highlight your academic background"
                    : `${user.name} hasn't added any education yet`
                  }
                </p>
                {isCurrentUser && (
                  <LinkedInButton
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate("/profile/edit")}
                  >
                    Add education
                  </LinkedInButton>
                )}
              </div>
            )}
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
    </div>
  );
}