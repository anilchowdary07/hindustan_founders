import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import ProfileCard from "@/components/home/profile-card";
import PostItem from "@/components/home/post-item";
import ActivityFeed from "@/components/feed/activity-feed";
import PitchDiscovery from "@/components/pitch/pitch-discovery";
import WelcomeGuide from "@/components/profile/welcome-guide";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
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
  Send
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get posts - optimized query
  const { 
    data: posts, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      try {
        // Use fetch directly to ensure proper handling
        const res = await fetch("/api/posts", {
          method: "GET",
          credentials: 'include'
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        
        const data = await res.json();
        console.log("Posts data:", data);
        return data;
      } catch (error) {
        console.error("Error fetching posts:", error);
        // Return demo posts in case of error
        return [
          {
            id: 1001,
            content: "Just secured our first round of funding for my AI-powered healthcare startup! Looking forward to revolutionizing patient care with predictive analytics. #StartupLife #HealthTech #AI",
            userId: 1,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            likes: 42,
            comments: 8,
            media: null,
            user: {
              id: 1,
              name: "Demo Founder",
              role: "Founder & CEO",
              company: "HealthAI Solutions",
              isVerified: true,
              profilePicture: null
            }
          },
          {
            id: 1002,
            content: "Excited to announce that we're expanding our team! Looking for talented developers with experience in React, Node.js, and AI/ML. DM me if you're interested or know someone who might be a good fit. #Hiring #TechJobs #StartupHiring",
            userId: 2,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            likes: 28,
            comments: 15,
            media: null,
            user: {
              id: 2,
              name: "Demo Investor",
              role: "Angel Investor",
              company: "Venture Capital Partners",
              isVerified: true,
              profilePicture: null
            }
          }
        ];
      }
    },
    enabled: !!user,
  });
  
  // Function to handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  // Post creation mutation
  const createPostMutation = useMutation({
    mutationFn: async ({ content, image }: { content: string; image?: File }) => {
      try {
        // Create FormData if there's an image
        if (image) {
          const formData = new FormData();
          formData.append("content", content);
          formData.append("userId", String(user?.id));
          formData.append("image", image);
          
          const res = await fetch("/api/posts/with-image", {
            method: "POST",
            body: formData,
            credentials: 'include' // Important for session cookies
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to create post");
          }
          
          return await res.json();
        } else {
          // Standard API request without image
          const res = await fetch("/api/posts", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              content,
              userId: user?.id,
            }),
            credentials: 'include'
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to create post");
          }
          
          return await res.json();
        }
      } catch (error) {
        console.error("Post creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been successfully published",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const resetForm = () => {
    setPostContent("");
    setSelectedImage(null);
    setImagePreview(null);
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
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8 py-0 sm:py-6">
        {/* Welcome guide for new users */}
        <div className="hidden md:block">
          <WelcomeGuide />
        </div>
        
        {/* Mobile Story/Highlights Section - This is just UI enhancement, doesn't affect data */}
        <div className="block md:hidden bg-white mb-2 pt-2 pb-3 px-3 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Highlights</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary text-xs"
              onClick={() => window.location.href = '/network'}
            >
              See All
            </Button>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Your Story */}
            <div className="flex flex-col items-center min-w-[72px]">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-primary">
                  <AvatarImage src={user?.avatarUrl || ""} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(user?.name || "")}
                  </AvatarFallback>
                </Avatar>
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
                <Avatar className="h-16 w-16 border-2 border-gray-200">
                  <AvatarImage src={story.image} alt={story.name} />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {story.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs mt-1 text-gray-700 truncate w-full text-center">{story.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
          {/* Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
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
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => navigate("/jobs")}
                >
                  <Briefcase className="h-5 w-5 mr-3" />
                  <span className="font-medium">Jobs</span>
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    navigate("/events");
                  }}
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="font-medium">Events</span>
                </div>
                <div 
                  className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => {
                    navigate("/startups");
                  }}
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  <span className="font-medium">Startups</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-4">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-primary"
                  onClick={() => navigate("/network")}
                >
                  Explore Network
                </Button>
              </div>
            </Card>
            
            {/* Recent Hashtags */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Trending Hashtags</h3>
                <div className="space-y-2">
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
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 cursor-pointer mr-2 mb-2">
                    <Hash className="h-3 w-3 mr-1" />
                    airevolution
                  </Badge>
                  <Badge variant="outline" className="bg-primary/5 hover:bg-primary/10 cursor-pointer mr-2 mb-2">
                    <Hash className="h-3 w-3 mr-1" />
                    techindia
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Main Content - Full width on mobile */}
          <div className="col-span-1 lg:col-span-6 space-y-2 lg:space-y-6">
            {/* Create Post Card - Styled differently on mobile vs desktop */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-gray-200">
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
                      placeholder="Share an idea or update..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[80px] resize-none border-gray-200 focus:border-primary focus:ring-primary"
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
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5"
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
                        
                        <input
                          type="file"
                          id="video-upload"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              // Handle video upload logic here
                              toast({
                                title: "Video Uploaded",
                                description: "Your video has been uploaded successfully!"
                              });
                            }
                          }}
                        />
                        
                        <input
                          type="file"
                          id="document-upload"
                          accept=".pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              // Handle document upload logic here
                              toast({
                                title: "Document Uploaded",
                                description: "Your document has been uploaded successfully!"
                              });
                            }
                          }}
                        />
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5"
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
                          className="text-gray-600 hover:text-primary hover:bg-primary/5"
                          onClick={() => {
                            document.getElementById('document-upload')?.click();
                          }}
                        >
                          <FileText className="h-5 w-5 mr-1" />
                          <span className="text-xs">Document</span>
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
                  ) : posts && Array.isArray(posts) && posts.length > 0 ? (
                    <div className="space-y-0">
                      {posts.map((post: any) => (
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
                  ) : posts && Array.isArray(posts) && posts.length > 0 ? (
                    <div className="space-y-0">
                      {/* Show the same posts but sorted by likes/engagement */}
                      {[...posts]
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
            
            {/* Desktop Tabs - Same content, different styling */}
            <Tabs value={activeTab} className="w-full hidden md:block" onValueChange={setActiveTab}>
              <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
                <div className="px-4 pt-4 flex items-center justify-between">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="feed" className="data-[state=active]:bg-white data-[state=active]:text-primary">Feed</TabsTrigger>
                    <TabsTrigger value="network" className="data-[state=active]:bg-white data-[state=active]:text-primary">Network</TabsTrigger>
                    <TabsTrigger value="trending" className="data-[state=active]:bg-white data-[state=active]:text-primary">Trending</TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="text-gray-600"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                
                <TabsContent value="feed" className="p-4 focus:outline-none">
                  {isLoading ? (
                    // Loading skeletons for posts
                    <div className="space-y-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="shadow-sm border-gray-100 overflow-hidden">
                          <div className="p-4 space-y-4">
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
                            <div className="flex justify-between pt-2">
                              <Skeleton className="h-8 w-20" />
                              <Skeleton className="h-8 w-20" />
                              <Skeleton className="h-8 w-20" />
                            </div>
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
                  ) : posts && Array.isArray(posts) && posts.length > 0 ? (
                    <div className="space-y-6">
                      {posts.map((post: any) => (
                        <PostItem key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
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
                </TabsContent>
                
                <TabsContent value="network" className="p-4 focus:outline-none">
                  <ActivityFeed 
                    endpoint="/api/network-activity" 
                    title="Network Activity"
                    emptyMessage="No network activity yet"
                    filter="network"
                  />
                </TabsContent>
                
                <TabsContent value="trending" className="p-4 focus:outline-none">
                  <div className="space-y-6">
                    {/* Trending posts - using the same posts but with different sorting */}
                    {isLoading ? (
                      // Loading skeletons for posts
                      <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="shadow-sm border-gray-100 overflow-hidden">
                            <div className="p-4 space-y-4">
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
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-2">Failed to load trending posts</p>
                        <Button 
                          onClick={handleRefresh}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : posts && Array.isArray(posts) && posts.length > 0 ? (
                      <div className="space-y-6">
                        {/* Sort posts by likes (descending) to simulate trending */}
                        {[...posts]
                          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
                          .map((post: any) => (
                            <PostItem key={post.id} post={post} />
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
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
                  </div>
                  
                  {/* Startup Pitches Section */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <PitchDiscovery 
                      title="Discover Startups" 
                      showViewAll={true} 
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
            
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
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Search Hindustan Founders" className="pl-9 bg-white border-gray-200" />
            </div>
            
            {/* Upcoming Events */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Upcoming Events</h3>
                <ScrollArea className="h-[260px] pr-3">
                  <div className="space-y-4">
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
                      <p className="text-xs text-gray-600 mb-2">Present your startup to a panel of investors and get feedback</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">112 attendees</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10">
                          Join
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-100 text-yellow-800 border-none">
                          May 20
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Delhi NCR
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">VC Networking Breakfast</h4>
                      <p className="text-xs text-gray-600 mb-2">Meet top VCs and angel investors over breakfast</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">78 attendees</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10">
                          RSVP
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-yellow-100 text-yellow-800 border-none">
                          June 5
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Bangalore
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">AI & ML Summit</h4>
                      <p className="text-xs text-gray-600 mb-2">Learn how AI can transform your startup</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">205 attendees</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10">
                          Register
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                
                <Button variant="outline" className="w-full justify-center text-primary mt-3">
                  View all events
                </Button>
              </div>
            </Card>
            
            {/* Trending News */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Hindustan Founders News</h3>
                <ul className="space-y-3">
                  <li>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 hover:text-primary cursor-pointer">
                          Indian startups raised $2.8B in first quarter
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          2h ago • 4,218 readers
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 hover:text-primary cursor-pointer">
                          New tax benefits announced for startups
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          3h ago • 2,845 readers
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 mr-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 hover:text-primary cursor-pointer">
                          AI adoption accelerates in India
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          4h ago • 1,532 readers
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
                
                <Button variant="ghost" className="w-full justify-center text-sm text-gray-600 hover:text-primary mt-3">
                  Show more
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </div>
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
