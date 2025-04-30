import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import ProfileCard from "@/components/home/profile-card";
import CreatePost from "@/components/home/create-post";
import PostItem from "@/components/home/post-item";
import SamplePosts from "@/components/home/sample-posts";
import EventsSection from "@/components/home/events-section";
import ArticleSection from "@/components/home/article-section";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    data: posts, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });
  
  // Function to handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000); // Add a small delay for better UX
  };

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const renderPosts = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="ml-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ));
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          Failed to load posts. Please try again later.
        </div>
      );
    }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return <SamplePosts />;
    }

    return (posts as any[]).map((post: any) => (
      <PostItem key={post.id} post={post} />
    ));
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard />
          
          {/* Quick Links Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/pitch-room">Pitch Room</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/jobs">Job Board</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/network">Network</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/messages">Messages</a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0] || 'User'}!</h2>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="feed" className="space-y-4">
              <CreatePost />
              {renderPosts()}
            </TabsContent>
            
            <TabsContent value="articles">
              <ArticleSection />
            </TabsContent>
            
            <TabsContent value="events">
              <EventsSection />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-3">Upload Documents</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-2">Share documents with your network</p>
                <Button className="w-full mb-2" variant="outline" onClick={() => {
                  alert('Resume upload feature coming soon!');
                }}>
                  Upload Resume
                </Button>
                <Button className="w-full" variant="outline" onClick={() => {
                  alert('Business Plan upload feature coming soon!');
                }}>
                  Upload Business Plan
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-3">People You May Know</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-medium text-gray-600">RK</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Raj Kumar</p>
                  <p className="text-xs text-gray-500">Founder, TechSolutions</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  alert('Connection request sent to Raj Kumar');
                }}>
                  Connect
                </Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-medium text-gray-600">AP</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Ananya Patel</p>
                  <p className="text-xs text-gray-500">Product Manager, InnoTech</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  alert('Connection request sent to Ananya Patel');
                }}>
                  Connect
                </Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-medium text-gray-600">VS</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Vikram Singh</p>
                  <p className="text-xs text-gray-500">Investor, VentureX</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  alert('Connection request sent to Vikram Singh');
                }}>
                  Connect
                </Button>
              </div>
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" asChild>
                  <a href="/network">View More Connections</a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              <div className="border-l-2 border-primary pl-3">
                <p className="text-sm font-medium">Startup India Summit 2025</p>
                <p className="text-xs text-gray-500">May 15, 2025 • New Delhi</p>
              </div>
              <div className="border-l-2 border-primary pl-3">
                <p className="text-sm font-medium">Venture Capital Masterclass</p>
                <p className="text-xs text-gray-500">May 20, 2025 • Online</p>
              </div>
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" onClick={() => setActiveTab("events")}>
                  View All Events
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
