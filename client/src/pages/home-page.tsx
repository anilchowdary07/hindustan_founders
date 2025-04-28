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
  
  const { 
    data: posts, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

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
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
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
                <Button className="w-full mb-2" variant="outline">
                  Upload Resume
                </Button>
                <Button className="w-full" variant="outline">
                  Upload Business Plan
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-3">People You May Know</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Raj Kumar</p>
                  <p className="text-xs text-gray-500">Founder, TechSolutions</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Ananya Patel</p>
                  <p className="text-xs text-gray-500">Product Manager, InnoTech</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Vikram Singh</p>
                  <p className="text-xs text-gray-500">Investor, VentureX</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
