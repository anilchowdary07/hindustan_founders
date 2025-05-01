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
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, Users, Briefcase, Calendar, BookOpen } from "lucide-react";

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
  
  // Listen for tab switch events from child components
  useEffect(() => {
    const handleSwitchTab = (event: any) => {
      if (event.detail === 'articles' || event.detail === 'events' || event.detail === 'feed') {
        setActiveTab(event.detail);
      }
    };
    
    window.addEventListener('switchTab', handleSwitchTab);
    
    return () => {
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, []);

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
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6 mb-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'User'}</span>!
            </h1>
            <p className="text-gray-600 mt-2 max-w-xl">
              Connect with fellow founders, investors, and professionals in the Indian startup ecosystem.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="default" className="shadow-md" asChild>
              <a href="/pitch-room">
                <TrendingUp className="mr-2 h-4 w-4" />
                Pitch Room
              </a>
            </Button>
            <Button variant="outline" className="bg-white shadow-sm" asChild>
              <a href="/network">
                <Users className="mr-2 h-4 w-4" />
                Network
              </a>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ProfileCard />
          </motion.div>
          
          {/* Quick Links Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold mb-3 flex items-center text-gray-800">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              Quick Links
            </h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                <a href="/pitch-room">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Pitch Room
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                <a href="/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Job Board
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                <a href="/network">
                  <Users className="mr-2 h-4 w-4" />
                  Network
                </a>
              </Button>
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                <a href="/events">
                  <Calendar className="mr-2 h-4 w-4" />
                  Events
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Your Feed</h2>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-gray-100/80 p-1">
              <TabsTrigger value="feed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="articles" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BookOpen className="mr-2 h-4 w-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="events" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="mr-2 h-4 w-4" />
                Events
              </TabsTrigger>
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
        </motion.div>
        
        {/* Right Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden lg:block lg:col-span-1 space-y-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              Upload Documents
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-2">Share documents with your network</p>
                <Button className="w-full mb-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all" onClick={() => {
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
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              People You May Know
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-primary flex-shrink-0 flex items-center justify-center font-medium text-white">RK</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Raj Kumar</p>
                  <p className="text-xs text-gray-500">Founder, TechSolutions</p>
                </div>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white transition-colors" onClick={() => {
                  alert('Connection request sent to Raj Kumar');
                }}>
                  Connect
                </Button>
              </div>
              <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center font-medium text-white">AP</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Ananya Patel</p>
                  <p className="text-xs text-gray-500">Product Manager, InnoTech</p>
                </div>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white transition-colors" onClick={() => {
                  alert('Connection request sent to Ananya Patel');
                }}>
                  Connect
                </Button>
              </div>
              <div className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex-shrink-0 flex items-center justify-center font-medium text-white">VS</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Vikram Singh</p>
                  <p className="text-xs text-gray-500">Investor, VentureX</p>
                </div>
                <Button size="sm" variant="outline" className="hover:bg-primary hover:text-white transition-colors" onClick={() => {
                  alert('Connection request sent to Vikram Singh');
                }}>
                  Connect
                </Button>
              </div>
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" className="text-primary hover:text-primary/80 transition-colors" asChild>
                  <a href="/network">View More Connections</a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              <div className="border-l-2 border-primary pl-3 p-2 rounded-r-lg hover:bg-blue-50 transition-colors">
                <p className="text-sm font-medium">Startup India Summit 2025</p>
                <p className="text-xs text-gray-500">May 15, 2025 • New Delhi</p>
              </div>
              <div className="border-l-2 border-primary pl-3 p-2 rounded-r-lg hover:bg-blue-50 transition-colors">
                <p className="text-sm font-medium">Venture Capital Masterclass</p>
                <p className="text-xs text-gray-500">May 20, 2025 • Online</p>
              </div>
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" className="text-primary hover:text-primary/80 transition-colors" onClick={() => setActiveTab("events")}>
                  View All Events
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
