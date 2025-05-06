import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import ProfileCard from "@/components/home/profile-card";
import PostItem from "@/components/home/post-item";
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
        const res = await apiRequest("GET", "/api/posts");
        return await res.json();
      } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
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
          });
          
          if (!res.ok) {
            throw new Error("Failed to create post");
          }
          
          return await res.json();
        } else {
          // Standard API request without image
          const res = await apiRequest("POST", "/api/posts", { 
            content,
            userId: user?.id,
          });
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
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <ProfileCard />
            
            {/* Quick Navigation */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer">
                  <Users className="h-5 w-5 mr-3" />
                  <span className="font-medium">My Network</span>
                </div>
                <div className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer">
                  <Briefcase className="h-5 w-5 mr-3" />
                  <span className="font-medium">Jobs</span>
                </div>
                <div className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span className="font-medium">Events</span>
                </div>
                <div className="flex items-center text-gray-800 hover:text-primary hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer">
                  <TrendingUp className="h-5 w-5 mr-3" />
                  <span className="font-medium">Startups</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-4">
                <Button variant="ghost" className="w-full justify-center text-primary">
                  View more
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
          
          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post Card */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={user?.avatarUrl || ""} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(user?.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
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
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5"
                        >
                          <Video className="h-5 w-5 mr-1" />
                          <span className="text-xs">Video</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-primary hover:bg-primary/5"
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
            
            {/* Tabs */}
            <Tabs defaultValue="feed" className="w-full" onValueChange={setActiveTab}>
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
                  <div className="text-center py-12">
                    <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Connect with founders</h3>
                    <p className="text-gray-600 mb-6">Build your network with other founders and entrepreneurs</p>
                    <Button className="bg-primary hover:bg-primary/90 rounded-full">
                      Explore Network
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="trending" className="p-4 focus:outline-none">
                  <div className="text-center py-12">
                    <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Trending Topics</h3>
                    <p className="text-gray-600 mb-6">Discover what's trending in the startup ecosystem</p>
                    <Button className="bg-primary hover:bg-primary/90 rounded-full">
                      Explore Trends
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
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
