import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import ProfileCard from "@/components/home/profile-card";
import PostItem from "@/components/home/post-item";
import ActivityFeed from "@/components/feed/activity-feed";
import PitchDiscovery from "@/components/pitch/pitch-discovery";
import FeaturedStartups from "@/components/home/featured-startups";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Calendar, 
  Image, 
  Video, 
  FileText, 
  Plus, 
  ChevronDown,
  Hash,
  Search,
  Bell,
  Globe,
  MoreHorizontal,
  Loader2,
  X,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Bookmark,
  CheckCircle,
  MapPin,
  Building,
  Zap,
  Award,
  Sparkles,
  Newspaper,
  Lightbulb,
  Rocket,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePageImproved() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts
  const { 
    data: posts, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/posts");
        return res;
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
      }
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false
  });
  
  // Demo posts if no posts are returned from API
  const postsWithFallback = posts && posts.length > 0 ? posts : [
    {
      id: 1001,
      content: "Just closed our seed round of $1.5M! Excited to build the future of fintech in India. #startupfunding #fintech",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likes: 42,
      comments: 12,
      user: {
        id: 101,
        name: "Vikram Malhotra",
        username: "vikram",
        role: "Founder",
        company: "PayEase",
        title: "CEO & Co-founder",
        avatarUrl: "/avatars/vikram.jpg",
        isVerified: true
      }
    },
    {
      id: 1002,
      content: "Looking for senior React developers to join our growing team. Remote work possible. DM if interested! #hiring #reactjs",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      likes: 28,
      comments: 8,
      user: {
        id: 102,
        name: "Priya Sharma",
        username: "priya",
        role: "Founder",
        company: "TechSolutions",
        title: "CTO & Co-founder",
        avatarUrl: "/avatars/priya.jpg",
        isVerified: true
      }
    },
    {
      id: 1003,
      content: "Excited to announce that we've been selected for the Y Combinator Winter 2023 batch! #YC #startup",
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      likes: 76,
      comments: 24,
      user: {
        id: 103,
        name: "Arjun Kumar",
        username: "arjun",
        role: "Founder",
        company: "HealthTech AI",
        title: "Founder & CEO",
        avatarUrl: "/avatars/arjun.jpg",
        isVerified: true
      }
    }
  ];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, image }: { content: string, image?: File }) => {
      try {
        if (image) {
          // Handle image upload
          const formData = new FormData();
          formData.append('image', image);
          formData.append('content', content);
          
          const response = await apiRequest("/api/posts/with-image", "POST", formData, "multipart/form-data");
          if (response.error) {
            throw new Error(response.error.message || "Failed to create post with image");
          }
          return response.data;
        } else {
          // Create post without image
          const response = await apiRequest("/api/posts", "POST", { content });
          if (response.error) {
            throw new Error(response.error.message || "Failed to create post");
          }
          return response.data;
        }
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    },
    onSuccess: (newPost) => {
      // Add the new post to the posts list
      queryClient.setQueryData(["/api/posts"], (oldPosts: any) => {
        return [newPost, ...(oldPosts || [])];
      });
      
      // Reset form
      setPostContent("");
      setSelectedImage(null);
      setImagePreview(null);
      
      // Show success toast
      toast({
        title: "Post created",
        description: "Your post has been published successfully!"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  const handleSubmit = () => {
    if (postContent.trim()) {
      createPostMutation.mutate({ content: postContent, image: selectedImage || undefined });
    }
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "HF";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Trending topics for the week
  const trendingTopics = [
    { id: 1, name: "AI in Startups", count: "4,328 posts" },
    { id: 2, name: "Funding Strategies", count: "2,156 posts" },
    { id: 3, name: "Remote Work", count: "1,872 posts" },
    { id: 4, name: "Fintech Innovation", count: "1,543 posts" },
    { id: 5, name: "Sustainable Business", count: "1,209 posts" }
  ];

  // Upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Founder Pitch Night",
      date: "May 15",
      location: "Online",
      attendees: 112,
      description: "Present your startup to a panel of investors and get feedback",
      type: "online"
    },
    {
      id: 2,
      title: "VC Networking Breakfast",
      date: "May 20",
      location: "Delhi NCR",
      attendees: 78,
      description: "Meet top VCs and angel investors over breakfast",
      type: "in-person"
    },
    {
      id: 3,
      title: "AI & ML Summit",
      date: "June 5",
      location: "Bangalore",
      attendees: 205,
      description: "Learn how AI can transform your startup",
      type: "in-person"
    }
  ];

  // News articles
  const newsArticles = [
    {
      id: 1,
      title: "Indian startups raised $2.8B in first quarter",
      timeAgo: "2h ago",
      readers: "4,218"
    },
    {
      id: 2,
      title: "New tax benefits announced for startups",
      timeAgo: "3h ago",
      readers: "2,845"
    },
    {
      id: 3,
      title: "AI adoption accelerates in India",
      timeAgo: "4h ago",
      readers: "1,532"
    }
  ];

  // People you may know
  const suggestedConnections = [
    {
      id: 101,
      name: "Priya Sharma",
      title: "Co-founder & CEO at TechSolutions",
      avatarUrl: "/avatars/priya.jpg",
      mutualConnections: 12
    },
    {
      id: 102,
      name: "Vikram Malhotra",
      title: "Angel Investor | Former CTO at PayTech",
      avatarUrl: "/avatars/vikram.jpg",
      mutualConnections: 8
    },
    {
      id: 103,
      name: "Neha Gupta",
      title: "Product Lead at GrowthBox",
      avatarUrl: "/avatars/neha.jpg",
      mutualConnections: 5
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8 py-0 sm:py-6">
        {/* Mobile Story/Highlights Section - This is just UI enhancement, doesn't affect data */}
        <div className="block md:hidden bg-white mb-2 pt-2 pb-3 px-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Highlights</h3>
            <Button variant="ghost" size="sm" className="text-primary text-xs">
              See All
            </Button>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Your Story */}
            <div className="flex flex-col items-center min-w-[72px]">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-primary overflow-hidden">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center text-white font-semibold">
                      {getInitials(user?.name || "")}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                  <Plus className="h-3 w-3" />
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-700">Your story</span>
            </div>
            
            {/* Other Stories - These are the same network connections shown elsewhere */}
            {[
              { name: "Priya S.", image: "/avatars/priya.jpg" },
              { name: "Vikram M.", image: "/avatars/vikram.jpg" },
              { name: "Arjun K.", image: "/avatars/arjun.jpg" },
              { name: "Neha G.", image: "/avatars/neha.jpg" },
              { name: "Rajiv M.", image: "/avatars/rajiv.jpg" }
            ].map((story, index) => (
              <div key={index} className="flex flex-col items-center min-w-[72px]">
                <div className="h-16 w-16 rounded-full border-2 border-gray-200 overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="%23666">${story.name.charAt(0)}</text></svg>`;
                    }}
                  />
                </div>
                <span className="text-xs mt-1 text-gray-700 truncate w-full text-center">{story.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Profile Card */}
            <ProfileCard />
            
            {/* Quick Navigation */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-4 space-y-3">
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate("/network")}
                >
                  <Users className="h-5 w-5 mr-3" />
                  <span className="font-medium">My Network</span>
                  <span className="ml-auto text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                    12 new
                  </span>
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate("/jobs")}
                >
                  <Briefcase className="h-5 w-5 mr-3" />
                  <span className="font-medium">Jobs</span>
                  <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    8 new
                  </span>
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate("/events")}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="font-medium">Events</span>
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate("/pitch-room")}
                >
                  <Rocket className="h-5 w-5 mr-3" />
                  <span className="font-medium">Pitch Room</span>
                  <span className="ml-auto text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                    New
                  </span>
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate("/saved-posts")}
                >
                  <Bookmark className="h-5 w-5 mr-3" />
                  <span className="font-medium">Saved Items</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-primary"
                  onClick={() => navigate("/network")}
                >
                  Grow Your Network
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </Card>
            
            {/* Trending Topics */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {trendingTopics.map((topic) => (
                    <div 
                      key={topic.id}
                      className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-md cursor-pointer transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{topic.name}</p>
                          <p className="text-xs text-gray-500">{topic.count}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button variant="link" className="w-full justify-center text-primary mt-2 text-sm">
                  Show more
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content - Full width on mobile */}
          <div className="col-span-1 lg:col-span-6 space-y-4">
            {/* Create Post Card - Styled differently on mobile vs desktop */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 md:h-12 md:w-12 border border-gray-200">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Mobile version - just a clickable div */}
                  <div 
                    className="bg-gray-100 rounded-full px-4 py-2 flex-1 text-gray-500 text-sm flex items-center md:hidden"
                    onClick={() => {
                      const createPostEvent = new CustomEvent('openCreatePost');
                      window.dispatchEvent(createPostEvent);
                    }}
                  >
                    What's on your mind?
                  </div>
                  
                  {/* Desktop version - full textarea */}
                  <div className="flex-1 hidden md:block">
                    <Textarea
                      placeholder="What's on your mind?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[80px] resize-none border-gray-200 focus:border-primary focus:ring-primary rounded-lg"
                    />
                    
                    {imagePreview && (
                      <div className="relative mt-3 rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-48 rounded-md object-cover" 
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Image className="h-5 w-5 mr-1" />
                          <span className="text-xs">Photo</span>
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full"
                          onClick={() => {
                            document.getElementById('video-upload')?.click();
                          }}
                        >
                          <Video className="h-5 w-5 mr-1" />
                          <span className="text-xs">Video</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full"
                          onClick={() => {
                            document.getElementById('document-upload')?.click();
                          }}
                        >
                          <FileText className="h-5 w-5 mr-1" />
                          <span className="text-xs">Document</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-full"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <Button 
                        className="rounded-full bg-primary hover:bg-primary/90"
                        disabled={!postContent.trim() || createPostMutation.isPending}
                        onClick={handleSubmit}
                      >
                        {createPostMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : "Post"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Mobile Tabs - Same functionality as desktop, different styling */}
            <div className="block md:hidden bg-white mb-2 border-b">
              <div className="flex overflow-x-auto scrollbar-hide">
                <Button variant={activeTab === "feed" ? "default" : "ghost"} 
                  className={`rounded-none flex-1 h-10 ${activeTab === "feed" ? 'border-b-2 border-primary' : ''}`}
                  onClick={() => setActiveTab("feed")}
                >
                  Feed
                </Button>
                <Button variant={activeTab === "network" ? "default" : "ghost"} 
                  className={`rounded-none flex-1 h-10 ${activeTab === "network" ? 'border-b-2 border-primary' : ''}`}
                  onClick={() => setActiveTab("network")}
                >
                  Network
                </Button>
                <Button variant={activeTab === "trending" ? "default" : "ghost"} 
                  className={`rounded-none flex-1 h-10 ${activeTab === "trending" ? 'border-b-2 border-primary' : ''}`}
                  onClick={() => setActiveTab("trending")}
                >
                  Trending
                </Button>
              </div>
            </div>
            
            {/* Desktop Content Filters - Only visible on desktop */}
            <div className="hidden md:flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2">
                <Button 
                  variant={activeTab === "feed" ? "default" : "ghost"} 
                  size="sm"
                  className="rounded-full"
                  onClick={() => setActiveTab("feed")}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  All Posts
                </Button>
                <Button 
                  variant={activeTab === "network" ? "default" : "ghost"} 
                  size="sm"
                  className="rounded-full"
                  onClick={() => setActiveTab("network")}
                >
                  <Users className="h-4 w-4 mr-1" />
                  My Network
                </Button>
                <Button 
                  variant={activeTab === "trending" ? "default" : "ghost"} 
                  size="sm"
                  className="rounded-full"
                  onClick={() => setActiveTab("trending")}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Trending
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-600 rounded-full whitespace-nowrap"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
            
            {/* Mobile Tab Content - Only visible on mobile */}
            <div className="block md:hidden">
              {/* Feed Tab Content */}
              {activeTab === "feed" && (
                <div className="bg-white">
                  {isLoading ? (
                    <div className="space-y-6 p-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-4 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <Skeleton className="h-48 w-full rounded-md" />
                        </Card>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-2">Failed to load posts</p>
                      <Button 
                        onClick={handleRefresh}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : postsWithFallback && Array.isArray(postsWithFallback) && postsWithFallback.length > 0 ? (
                    <div className="space-y-0">
                      {postsWithFallback.map((post: any) => (
                        <PostItem key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">No posts yet</h3>
                      <p className="text-gray-600 mb-4 text-sm">Be the first to share your thoughts</p>
                      <Button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-primary hover:bg-primary/90 rounded-full"
                      >
                        Create a Post
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Network Tab Content */}
              {activeTab === "network" && (
                <div className="bg-white p-4">
                  <div className="text-center py-8">
                    <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Connect with founders</h3>
                    <p className="text-gray-600 mb-4 text-sm">Build your network with other founders</p>
                    <Button className="bg-primary hover:bg-primary/90 rounded-full">
                      Explore Network
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Trending Tab Content */}
              {activeTab === "trending" && (
                <div className="bg-white">
                  {isLoading ? (
                    <div className="space-y-6 p-3">
                      {[1, 2].map((i) => (
                        <Card key={i} className="p-4 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : postsWithFallback && Array.isArray(postsWithFallback) && postsWithFallback.length > 0 ? (
                    <div className="space-y-0">
                      {/* Show the same posts but sorted by likes/engagement */}
                      {[...postsWithFallback]
                        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                        .slice(0, 5)
                        .map((post: any) => (
                          <PostItem key={post.id} post={post} />
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">No trending posts yet</h3>
                      <p className="text-gray-600 mb-4 text-sm">Check back later for trending content</p>
                      <Button 
                        onClick={handleRefresh}
                        className="bg-primary hover:bg-primary/90 rounded-full"
                      >
                        Refresh
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Desktop Featured Content - Only show on feed tab and desktop */}
            {activeTab === "feed" && (
              <div className="hidden md:block">
                <Card className="shadow-sm border-gray-100 overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-800">Featured: Startup Funding Masterclass</h3>
                        <p className="text-sm text-blue-700 mt-1">Learn how to secure funding for your startup from top VCs and angel investors.</p>
                        <div className="mt-3">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          >
                            Register Now
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Desktop Main Content Tabs - Only visible on desktop */}
            <div className="hidden md:block space-y-4">
              {/* Feed Tab Content */}
              {activeTab === "feed" && (
                <div>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-4 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <Skeleton className="h-48 w-full rounded-md" />
                          <div className="flex justify-between pt-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-2">Failed to load posts</p>
                      <Button 
                        onClick={handleRefresh}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : postsWithFallback && Array.isArray(postsWithFallback) && postsWithFallback.length > 0 ? (
                    <div className="space-y-4">
                      {postsWithFallback.slice(0, 2).map((post: any) => (
                        <PostItem key={post.id} post={post} />
                      ))}
                      
                      {/* Featured Startups in Feed */}
                      <FeaturedStartups title="Startups You Might Be Interested In" />
                      
                      {postsWithFallback.slice(2).map((post: any) => (
                        <PostItem key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No posts yet</h3>
                      <p className="text-gray-600 mb-6">Be the first to share your thoughts with the community</p>
                      <Button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-primary hover:bg-primary/90 rounded-full"
                      >
                        Create a Post
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Network Tab Content */}
              {activeTab === "network" && (
                <div>
                  <ActivityFeed 
                    endpoint="/api/network-activity" 
                    title="Network Activity"
                    emptyMessage="No network activity yet"
                    filter="network"
                  />
                </div>
              )}
              
              {/* Trending Tab Content */}
              {activeTab === "trending" && (
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-4 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <Skeleton className="h-48 w-full rounded-md" />
                        </Card>
                      ))}
                    </div>
                  ) : postsWithFallback && Array.isArray(postsWithFallback) && postsWithFallback.length > 0 ? (
                    <div className="space-y-4">
                      {/* Sort posts by likes (descending) to simulate trending */}
                      {[...postsWithFallback]
                        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                        .map((post: any) => (
                          <PostItem key={post.id} post={post} />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">No trending posts yet</h3>
                      <p className="text-gray-600 mb-6">Check back later for trending content</p>
                      <Button 
                        onClick={handleRefresh}
                        className="bg-primary hover:bg-primary/90 rounded-full"
                      >
                        Refresh
                      </Button>
                    </div>
                  )}
                  
                  {/* Featured Startups Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <FeaturedStartups 
                      title="Trending Startups" 
                      showViewAll={true} 
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile version of right sidebar content - Only visible on mobile */}
            <div className="block md:hidden space-y-4 mt-2 mb-16">
              {/* Mobile Search */}
              <div className="relative px-3">
                <Search className="absolute left-6 top-3 h-4 w-4 text-gray-400" />
                <Input placeholder="Search Hindustan Founders" className="pl-9 bg-white border-gray-200" />
              </div>
              
              {/* Mobile Upcoming Events */}
              <div className="bg-white p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Upcoming Events</h3>
                  <Button variant="ghost" size="sm" className="text-primary text-xs">
                    See All
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-yellow-100 text-yellow-800 border-none">
                        May 15
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Online
                      </Badge>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">Founder Pitch Night</h4>
                    <p className="text-xs text-gray-600 mb-2">Present your startup to a panel of investors</p>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10 w-full">
                      Join
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Mobile Trending Hashtags */}
              <div className="bg-white p-3">
                <h3 className="font-semibold text-gray-800 mb-3">Trending Hashtags</h3>
                <div>
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 cursor-pointer mr-2 mb-2">
                    <Hash className="h-3 w-3 mr-1" />
                    startupindia
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 cursor-pointer mr-2 mb-2">
                    <Hash className="h-3 w-3 mr-1" />
                    entrepreneurship
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 cursor-pointer mr-2 mb-2">
                    <Hash className="h-3 w-3 mr-1" />
                    venturecapital
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search Hindustan Founders" 
                className="pl-9 bg-white border-gray-200 rounded-full" 
              />
            </div>
            
            {/* People You May Know */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-gray-800">People you may know</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {suggestedConnections.map((connection) => (
                    <div key={connection.id} className="flex items-start">
                      <Avatar className="h-12 w-12 border border-gray-200">
                        <AvatarImage src={connection.avatarUrl} alt={connection.name} />
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(connection.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3 flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">{connection.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{connection.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">{connection.mutualConnections}</span> mutual connections
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 h-8 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary rounded-full"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="link" className="w-full justify-center text-primary mt-2 text-sm">
                  Show more
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            
            {/* Upcoming Events */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-800">Upcoming Events</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/10 p-0">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[260px] pr-3">
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-yellow-100 text-yellow-800 border-none">
                            {event.date}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              event.type === "online" 
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            )}
                          >
                            {event.location}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-1">{event.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{event.attendees} attendees</span>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10 rounded-full">
                            {event.type === "online" ? "Join" : "RSVP"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-center text-primary mt-3 rounded-full"
                  onClick={() => navigate("/events")}
                >
                  View all events
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            
            {/* Trending News */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-800">Hindustan Founders News</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/10 p-0">
                    <Newspaper className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {newsArticles.map((article) => (
                    <li key={article.id}>
                      <div className="flex items-start">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 hover:text-primary cursor-pointer">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {article.timeAgo} • {article.readers} readers
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <Button variant="ghost" className="w-full justify-center text-sm text-gray-600 hover:text-primary mt-3">
                  Show more
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
            
            {/* Footer */}
            <div className="p-4">
              <div className="flex flex-wrap justify-center text-xs text-gray-500">
                <Button variant="link" size="sm" className="text-gray-500 hover:text-primary h-6 px-2">
                  About
                </Button>
                <Button variant="link" size="sm" className="text-gray-500 hover:text-primary h-6 px-2">
                  Help
                </Button>
                <Button variant="link" size="sm" className="text-gray-500 hover:text-primary h-6 px-2">
                  Privacy
                </Button>
                <Button variant="link" size="sm" className="text-gray-500 hover:text-primary h-6 px-2">
                  Terms
                </Button>
              </div>
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Hindustan Founders</span> © 2023
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}