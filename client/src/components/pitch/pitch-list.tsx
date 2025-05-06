import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { BusinessPitch, PitchCategory, PitchStage, PitchStatus, PitchFilters } from "@/types/pitch";
import PitchCard from "./pitch-card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RefreshCw, 
  Plus, 
  ArrowUpDown,
  Loader2,
  Building2
} from "lucide-react";

interface PitchListProps {
  endpoint?: string;
  title?: string;
  showFilters?: boolean;
  showCreate?: boolean;
  initialFilters?: Partial<PitchFilters>;
  variant?: "default" | "compact";
  columns?: 1 | 2 | 3 | 4;
  limit?: number;
}

export default function PitchList({
  endpoint = "/api/pitches",
  title = "Pitches",
  showFilters = true,
  showCreate = true,
  initialFilters = {},
  variant = "default",
  columns = 3,
  limit
}: PitchListProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<PitchFilters>({
    category: initialFilters.category || 'All',
    stage: initialFilters.stage || 'All',
    status: initialFilters.status || 'All',
    search: initialFilters.search || '',
    sort: initialFilters.sort || 'newest',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
      }));
    }
  }, [initialFilters]);
  
  // Fetch pitches
  const {
    data: pitches,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [endpoint, filters],
    queryFn: async () => {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      
      if (filters.category && filters.category !== 'All') {
        queryParams.append('category', filters.category);
      }
      
      if (filters.stage && filters.stage !== 'All') {
        queryParams.append('stage', filters.stage);
      }
      
      if (filters.status && filters.status !== 'All') {
        queryParams.append('status', filters.status);
      }
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters.sort) {
        queryParams.append('sort', filters.sort);
      }
      
      if (limit) {
        queryParams.append('limit', limit.toString());
      }
      
      const queryString = queryParams.toString();
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      try {
        const response = await fetch(url, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch pitches");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching pitches:", error);
        // Return mock data for demonstration
        return getMockPitches();
      }
    }
  });
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };
  
  // Handle filter change
  const handleFilterChange = (key: keyof PitchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Categories for the filter dropdown
  const pitchCategories: PitchCategory[] = [
    'Fintech', 
    'E-commerce', 
    'AgriTech', 
    'HealthTech', 
    'EdTech', 
    'CleanTech', 
    'AI/ML', 
    'SaaS', 
    'Hardware', 
    'Marketplace', 
    'Consumer', 
    'Enterprise', 
    'Other'
  ];
  
  // Stages for the filter dropdown
  const pitchStages: PitchStage[] = [
    'Idea', 
    'Prototype', 
    'MVP', 
    'Pre-seed', 
    'Seed', 
    'Series A', 
    'Series B+', 
    'Profitable'
  ];
  
  // Statuses for the filter dropdown
  const pitchStatuses: PitchStatus[] = [
    'Draft', 
    'Published', 
    'Seeking Feedback', 
    'Seeking Investment', 
    'Archived'
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'funding', label: 'Highest Funding' },
  ];
  
  // Get column class based on columns prop
  const getColumnClass = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };
  
  // Get display pitches
  const displayPitches = pitches?.data || pitches || [];
  
  return (
    <div className="space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {!isLoading && (
            <p className="text-gray-500 mt-1">
              {displayPitches.length} {displayPitches.length === 1 ? 'pitch' : 'pitches'} found
            </p>
          )}
        </div>
        
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
          
          {showCreate && (
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => router.push('/pitches/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pitch
            </Button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search pitches..." 
              className="pl-10"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select 
              value={filters.category} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {pitchCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.stage} 
              onValueChange={(value) => handleFilterChange('stage', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Stages</SelectItem>
                {pitchStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={filters.status === 'All' ? 'bg-primary/10 text-primary' : ''}
                  onClick={() => handleFilterChange('status', 'All')}
                >
                  All Statuses
                </DropdownMenuItem>
                {pitchStatuses.map((status) => (
                  <DropdownMenuItem 
                    key={status}
                    className={filters.status === status ? 'bg-primary/10 text-primary' : ''}
                    onClick={() => handleFilterChange('status', status)}
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOptions.find(option => option.value === filters.sort)?.label || 'Sort'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    className={filters.sort === option.value ? 'bg-primary/10 text-primary' : ''}
                    onClick={() => handleFilterChange('sort', option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      
      {/* Pitch Grid */}
      {isLoading ? (
        <div className={`grid ${getColumnClass()} gap-6`}>
          {Array.from({ length: 6 }).map((_, i) => (
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
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
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
        <div className={`grid ${getColumnClass()} gap-6`}>
          {displayPitches.map((pitch: BusinessPitch) => (
            <PitchCard 
              key={pitch.id} 
              pitch={pitch} 
              variant={variant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No pitches found</h3>
          <p className="text-gray-500 mb-4">
            {filters.search || filters.category !== 'All' || filters.stage !== 'All' || filters.status !== 'All'
              ? "Try adjusting your filters or search terms"
              : "Be the first to create a pitch"}
          </p>
          {showCreate && (
            <Button 
              onClick={() => router.push('/pitches/create')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Pitch
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Mock data for demonstration
function getMockPitches(): BusinessPitch[] {
  return [
    {
      id: 1,
      userId: 1,
      title: "FinTech Revolution",
      tagline: "Transforming financial services with AI-powered solutions",
      category: "Fintech",
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
      businessModel: "Freemium model with basic services free and premium features available through subscription. We also generate revenue through partnership commissions.",
      marketOpportunity: "The Indian fintech market is projected to reach $150 billion by 2025, growing at a CAGR of 20%.",
      competitiveLandscape: "While there are several digital banking solutions, none offer our comprehensive suite of services with AI-powered personalization at our price point.",
      revenueModel: "Multiple revenue streams including subscription fees, transaction fees, and partnership commissions with financial institutions.",
      likes: 42,
      comments: 12,
      views: 350,
      bookmarks: 28,
      user: {
        id: 1,
        name: "Vikram Malhotra",
        title: "Founder & CEO",
        avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      feedback: [
        {
          id: 101,
          userId: 2,
          pitchId: 1,
          content: "Very impressive solution to a real problem. I'd like to see more details about your customer acquisition strategy.",
          rating: 4,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
          user: {
            id: 2,
            name: "Priya Sharma",
            title: "Angel Investor",
            avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
          }
        },
        {
          id: 102,
          userId: 3,
          pitchId: 1,
          content: "The market size is compelling, but I'm concerned about regulatory challenges. How are you addressing compliance?",
          rating: 3,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
          user: {
            id: 3,
            name: "Rajiv Kumar",
            title: "VC Partner",
            avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg"
          }
        }
      ]
    },
    {
      id: 2,
      userId: 4,
      title: "FarmTech Solutions",
      tagline: "Empowering farmers with data-driven agriculture technology",
      category: "AgriTech",
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
      category: "EdTech",
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
      category: "HealthTech",
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
      category: "CleanTech",
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
      category: "AI/ML",
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
}