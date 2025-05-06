import { useState } from "react";
import { useLocation, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { PitchCategory, BusinessPitch } from '../../types';
import PitchCard from "./pitch-card";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  Lightbulb, 
  DollarSign, 
  Rocket, 
  ChevronRight,
  Building2,
  RefreshCw
} from "lucide-react";

interface PitchDiscoveryProps {
  title?: string;
  showViewAll?: boolean;
}

export default function PitchDiscovery({ 
  title = "Discover Startups", 
  showViewAll = true 
}: PitchDiscoveryProps) {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("trending");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch pitches
  const {
    data: pitches,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/pitches/discover', activeTab],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/pitches/discover?category=${activeTab}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch pitches");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching pitches:", error);
        // Return mock data for demonstration
        return getMockPitches(activeTab);
      }
    }
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  // Get display pitches
  const displayPitches = pitches?.data || pitches || [];
  
  // Featured categories
  const featuredCategories: PitchCategory[] = [
    'fintech',
    'healthtech',
    'edtech',
    'ai_ml',
    'cleantech',
    'agritech',
    'ecommerce',
    'saas'
  ];
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 mr-2" />;
      case 'featured':
        return <Lightbulb className="h-4 w-4 mr-2" />;
      case 'investment':
        return <DollarSign className="h-4 w-4 mr-2" />;
      case 'early':
        return <Rocket className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-600"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {showViewAll && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary"
              onClick={() => navigate('/pitches')}
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Discovery Tabs */}
      <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="trending" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Seeking Investment
          </TabsTrigger>
          <TabsTrigger value="early" className="flex items-center">
            <Rocket className="h-4 w-4 mr-2" />
            Early Stage
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Content */}
        <TabsContent value={activeTab} className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="h-40 bg-gray-100" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-red-500 mb-2">Failed to load pitches</div>
              <Button 
                onClick={handleRefresh}
                className="bg-primary hover:bg-primary/90"
              >
                Try Again
              </Button>
            </div>
          ) : displayPitches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayPitches.slice(0, 3).map((pitch: BusinessPitch) => (
                <PitchCard 
                  key={pitch.id} 
                  pitch={pitch} 
                  variant="default"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No pitches found</h3>
              <p className="text-gray-500 mb-4">
                Check back later for new pitches in this category
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Featured Categories */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Browse by Category</h3>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-4">
            {featuredCategories.map((category) => (
              <Card 
                key={category} 
                className="min-w-[200px] cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/pitches?category=${category}`)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-${getCategoryColor(category)}-100`}>
                    {getCategoryEmoji(category)}
                  </div>
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {getCategoryDescription(category)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'fintech': 'blue',
    'ecommerce': 'green',
    'agritech': 'lime',
    'healthtech': 'red',
    'edtech': 'purple',
    'cleantech': 'teal',
    'ai_ml': 'indigo',
    'saas': 'sky',
  };
  
  return colors[category] || 'gray';
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    'fintech': '💰',
    'ecommerce': '🛒',
    'agritech': '🌾',
    'healthtech': '⚕️',
    'edtech': '🎓',
    'cleantech': '♻️',
    'ai_ml': '🤖',
    'saas': '☁️',
  };
  
  return emojis[category] || '🚀';
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'fintech': 'Financial technology solutions',
    'ecommerce': 'Online retail innovations',
    'agritech': 'Agricultural technology',
    'healthtech': 'Healthcare innovations',
    'edtech': 'Educational technology',
    'cleantech': 'Sustainable solutions',
    'ai_ml': 'Artificial intelligence',
    'saas': 'Software as a service',
  };
  
  return descriptions[category] || 'Innovative startups';
}

// Mock data for demonstration
function getMockPitches(category: string): BusinessPitch[] {
  const allPitches = [
    {
      id: 1,
      userId: 1,
      title: "FinTech Revolution",
      tagline: "Transforming financial services with AI-powered solutions",
      category: "fintech",
      stage: "Seed",
      status: "Seeking Investment",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
      logo: "https://placehold.co/200x200/4F46E5/FFFFFF?text=FR",
      website: "https://fintechrevolution.example.com",
      location: "Mumbai, India",
      teamSize: 8,
      fundingGoal: 5000000,
      currentFunding: 2000000,
      problem: "Traditional banking systems are slow, expensive, and inaccessible to millions of Indians. Financial inclusion remains a significant challenge with complex paperwork and high fees creating barriers for average citizens.",
      solution: "We're building an AI-powered financial platform that simplifies banking, investments, and insurance through a single, easy-to-use mobile application with minimal paperwork and fees.",
      targetMarket: "Our primary target is the 300M+ smartphone users in India who are underserved by traditional banking, particularly young professionals and small business owners.",
      uniqueSellingPoint: "Our proprietary AI algorithm provides personalized financial recommendations while our blockchain-based infrastructure reduces costs by 80% compared to traditional banks.",
      likes: 42,
      comments: 12,
      views: 350,
      bookmarks: 28,
      user: {
        id: 1,
        name: "Vikram Malhotra",
        title: "Founder & CEO",
        avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    },
    {
      id: 2,
      userId: 4,
      title: "FarmTech Solutions",
      tagline: "Empowering farmers with data-driven agriculture technology",
      category: "agritech",
      stage: "MVP",
      status: "Seeking Feedback",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop",
      logo: "https://placehold.co/200x200/10B981/FFFFFF?text=FT",
      website: "https://farmtech.example.com",
      location: "Pune, India",
      teamSize: 5,
      fundingGoal: 2000000,
      currentFunding: 500000,
      problem: "Small and medium-sized farmers in India lack access to modern agricultural techniques and data, resulting in lower crop yields and reduced income.",
      solution: "Our IoT sensors and mobile app provide real-time data on soil conditions, weather patterns, and crop health, enabling farmers to make data-driven decisions.",
      targetMarket: "The 120 million small and medium-sized farmers across India who currently rely on traditional farming methods.",
      uniqueSellingPoint: "Our technology is specifically designed for Indian agricultural conditions and comes at a price point accessible to small farmers.",
      likes: 36,
      comments: 8,
      views: 280,
      bookmarks: 22,
      user: {
        id: 4,
        name: "Anjali Desai",
        title: "Co-founder & CTO",
        avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg"
      }
    },
    {
      id: 3,
      userId: 5,
      title: "EduLearn Platform",
      tagline: "Personalized learning for every student in India",
      category: "edtech",
      stage: "Series A",
      status: "Published",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
      logo: "https://placehold.co/200x200/8B5CF6/FFFFFF?text=EL",
      website: "https://edulearn.example.com",
      location: "Bangalore, India",
      teamSize: 15,
      fundingGoal: 10000000,
      currentFunding: 8000000,
      problem: "The Indian education system struggles with a one-size-fits-all approach that doesn't address individual learning needs, leading to high dropout rates and poor learning outcomes.",
      solution: "Our adaptive learning platform uses AI to create personalized learning paths for each student, focusing on their strengths and addressing their weaknesses.",
      targetMarket: "K-12 students across India, with a focus on both urban and rural areas, reaching over 250 million potential users.",
      uniqueSellingPoint: "Our platform works online and offline, making it accessible even in areas with limited internet connectivity.",
      likes: 78,
      comments: 24,
      views: 620,
      bookmarks: 45,
      user: {
        id: 5,
        name: "Arjun Singh",
        title: "Founder & CEO",
        avatarUrl: "https://randomuser.me/api/portraits/men/45.jpg"
      }
    },
    {
      id: 4,
      userId: 6,
      title: "HealthTech Connect",
      tagline: "Bridging the healthcare gap in rural India",
      category: "healthtech",
      stage: "Pre-seed",
      status: "Seeking Investment",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop",
      logo: "https://placehold.co/200x200/EF4444/FFFFFF?text=HC",
      website: "https://healthconnect.example.com",
      location: "Chennai, India",
      teamSize: 6,
      fundingGoal: 3000000,
      currentFunding: 500000,
      problem: "Over 700 million Indians in rural areas have limited access to quality healthcare, with doctor shortages and long travel distances to medical facilities.",
      solution: "Our telemedicine platform connects rural patients with urban doctors through video consultations, supported by local health workers equipped with diagnostic tools.",
      targetMarket: "Rural communities across India with limited access to healthcare facilities, focusing initially on five states with the largest rural populations.",
      uniqueSellingPoint: "Our hybrid model combines technology with a network of trained local health workers who facilitate consultations and follow-up care.",
      likes: 52,
      comments: 18,
      views: 410,
      bookmarks: 34,
      user: {
        id: 6,
        name: "Neha Gupta",
        title: "Co-founder & COO",
        avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg"
      }
    },
    {
      id: 5,
      userId: 7,
      title: "EcoPackage",
      tagline: "Sustainable packaging solutions for a greener India",
      category: "cleantech",
      stage: "Prototype",
      status: "Seeking Feedback",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?q=80&w=2070&auto=format&fit=crop",
      logo: "https://placehold.co/200x200/14B8A6/FFFFFF?text=EP",
      website: "https://ecopackage.example.com",
      location: "Delhi, India",
      teamSize: 4,
      fundingGoal: 1500000,
      currentFunding: 200000,
      problem: "India generates over 9.4 million tonnes of plastic waste annually, with packaging being a major contributor. Most packaging is non-biodegradable and ends up in landfills or oceans.",
      solution: "We've developed biodegradable packaging materials made from agricultural waste that decompose naturally within 180 days while matching the durability and cost of plastic alternatives.",
      targetMarket: "E-commerce companies, food delivery services, and consumer goods manufacturers in India, a market currently using over 5 million tonnes of packaging materials annually.",
      uniqueSellingPoint: "Our materials are made from locally sourced agricultural waste, creating a circular economy while being cost-competitive with traditional packaging.",
      likes: 44,
      comments: 15,
      views: 320,
      bookmarks: 29,
      user: {
        id: 7,
        name: "Rahul Verma",
        title: "Founder & CEO",
        avatarUrl: "https://randomuser.me/api/portraits/men/36.jpg"
      }
    },
    {
      id: 6,
      userId: 8,
      title: "RetailAI",
      tagline: "AI-powered inventory management for small retailers",
      category: "ai_ml",
      stage: "Seed",
      status: "Published",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      isPublic: true,
      coverImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
      logo: "https://placehold.co/200x200/6366F1/FFFFFF?text=RA",
      website: "https://retailai.example.com",
      location: "Hyderabad, India",
      teamSize: 10,
      fundingGoal: 4000000,
      currentFunding: 2500000,
      problem: "India's 12 million small retailers struggle with inventory management, often resulting in stockouts or excess inventory that ties up capital and reduces profitability.",
      solution: "Our AI-powered mobile app uses computer vision to track inventory levels and sales patterns, providing automated reordering suggestions and demand forecasting.",
      targetMarket: "Small to medium-sized retail stores across India, particularly in urban and semi-urban areas with smartphone access.",
      uniqueSellingPoint: "Our solution requires only a smartphone camera and works without expensive hardware or complex integration, making it accessible to even the smallest retailers.",
      likes: 63,
      comments: 21,
      views: 480,
      bookmarks: 37,
      user: {
        id: 8,
        name: "Sanjay Patel",
        title: "Co-founder & CTO",
        avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg"
      }
    }
  ];
  
  // Filter pitches based on category
  const activeFilters: PitchCategory[] = [];
  const filteredPitches = allPitches.filter(pitch => {
    const category = pitch.category.toLowerCase() as PitchCategory;
    return activeFilters.includes(category);
  });
  
  return filteredPitches;
}