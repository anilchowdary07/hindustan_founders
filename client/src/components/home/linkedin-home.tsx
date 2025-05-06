import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  LinkedInCard, 
  LinkedInCardContent, 
  LinkedInPostCard,
  LinkedInTabs,
  LinkedInTabPanel,
  LinkedInButton,
  LinkedInPostSkeleton
} from "../ui/linkedin-ui";
import { LinkedInAvatar } from "../ui/linkedin-avatar";
import { Image, Video, FileText, BarChart2 } from "lucide-react";

interface LinkedInHomeProps {
  posts: any[];
  isLoading?: boolean;
  onCreatePost?: () => void;
}

export function LinkedInHome({ posts = [], isLoading = false, onCreatePost }: LinkedInHomeProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  
  // Sample tabs for the feed
  const feedTabs = [
    { id: "home", label: "Home" },
    { id: "network", label: "My Network" },
    { id: "trending", label: "Trending" },
  ];
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Tabs */}
      <LinkedInTabs
        tabs={feedTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        scrollable
        className="bg-white sticky top-14 z-10 mb-2"
      />
      
      {/* Create Post Card */}
      <LinkedInCard className="mb-3">
        <div className="p-4">
          <div className="flex items-center">
            <LinkedInAvatar
              src="/path/to/avatar.jpg"
              alt="Your Name"
              fallback="YN"
              size="md"
              onClick={() => navigate("/profile")}
            />
            
            <button
              className="flex-1 ml-3 text-left bg-[#EEF3F8] hover:bg-[#DCE6F1] text-[#666666] rounded-full py-2.5 px-4 transition-colors"
              onClick={onCreatePost}
            >
              <span className="text-sm">Start a post</span>
            </button>
          </div>
          
          <div className="flex justify-between mt-3">
            <LinkedInButton
              variant="ghost"
              size="sm"
              icon={<Image className="h-5 w-5 text-[#378FE9]" />}
              className="flex-1"
            >
              <span className="text-xs">Photo</span>
            </LinkedInButton>
            
            <LinkedInButton
              variant="ghost"
              size="sm"
              icon={<Video className="h-5 w-5 text-[#5F9B41]" />}
              className="flex-1"
            >
              <span className="text-xs">Video</span>
            </LinkedInButton>
            
            <LinkedInButton
              variant="ghost"
              size="sm"
              icon={<FileText className="h-5 w-5 text-[#C37D16]" />}
              className="flex-1"
            >
              <span className="text-xs">Document</span>
            </LinkedInButton>
            
            <LinkedInButton
              variant="ghost"
              size="sm"
              icon={<BarChart2 className="h-5 w-5 text-[#E16745]" />}
              className="flex-1"
            >
              <span className="text-xs">Poll</span>
            </LinkedInButton>
          </div>
        </div>
      </LinkedInCard>
      
      {/* Feed Divider */}
      <div className="flex items-center mb-3">
        <div className="flex-1 h-px bg-[#E0E0E0]"></div>
        <span className="px-3 text-xs text-[#666666]">Sort by: Recent</span>
      </div>
      
      {/* Posts */}
      <LinkedInTabPanel id="home" activeTab={activeTab}>
        {isLoading ? (
          // Show skeletons while loading
          <>
            <LinkedInPostSkeleton className="mb-3" />
            <LinkedInPostSkeleton className="mb-3" />
            <LinkedInPostSkeleton className="mb-3" />
          </>
        ) : posts.length > 0 ? (
          // Show actual posts
          posts.map((post) => (
            <LinkedInPostCard
              key={post.id}
              author={{
                name: post.author.name,
                title: post.author.title,
                avatarUrl: post.author.avatarUrl,
                verified: post.author.verified
              }}
              content={post.content}
              timestamp={new Date(post.createdAt)}
              likes={post.likes}
              comments={post.comments?.length || 0}
              shares={post.shares || 0}
              images={post.images || []}
              video={post.video}
              className="mb-3"
              onLike={() => console.log("Like post", post.id)}
              onComment={() => console.log("Comment on post", post.id)}
              onShare={() => console.log("Share post", post.id)}
              onSend={() => console.log("Send post", post.id)}
              onMore={() => console.log("More options for post", post.id)}
              onAuthorClick={() => navigate(`/profile/${post.author.id}`)}
            />
          ))
        ) : (
          // Show empty state
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No posts yet</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Connect with more people to see their updates in your feed
                </p>
                <LinkedInButton
                  variant="primary"
                  onClick={() => navigate("/network")}
                >
                  Find connections
                </LinkedInButton>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      {/* Network Tab */}
      <LinkedInTabPanel id="network" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardContent>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-[#191919] mb-2">My Network</h3>
              <p className="text-sm text-[#666666] mb-4">
                Grow your network to discover new opportunities
              </p>
              <LinkedInButton
                variant="primary"
                onClick={() => navigate("/network")}
              >
                Find connections
              </LinkedInButton>
            </div>
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      {/* Trending Tab */}
      <LinkedInTabPanel id="trending" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardContent>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-[#191919] mb-2">Trending Topics</h3>
              <p className="text-sm text-[#666666] mb-4">
                See what's trending in your industry
              </p>
              <LinkedInButton
                variant="primary"
                onClick={() => navigate("/trending")}
              >
                Explore trending
              </LinkedInButton>
            </div>
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
    </div>
  );
}