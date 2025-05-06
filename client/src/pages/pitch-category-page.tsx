import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout/layout";
import PitchItem from "@/components/pitch/pitch-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PitchStatus } from "@shared/schema";
import { 
  ArrowLeft, Filter, Leaf, Landmark, Sprout, ShoppingCart, 
  Truck, HeartPulse, Brain, Laptop, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "wouter";

export default function PitchCategoryPage() {
  const [, params] = useRoute("/pitch/category/:category");
  const category = params?.category || "";
  const decodedCategory = decodeURIComponent(category);
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    fundingStage: ""
  });
  
  const { data: pitches, isLoading, error } = useQuery({
    queryKey: ["/api/pitches", { category: decodedCategory }],
    queryFn: () => apiRequest(`/api/pitches?category=${encodeURIComponent(decodedCategory)}`),
  });
  
  const getCategoryIcon = () => {
    switch (decodedCategory.toLowerCase()) {
      case 'e-commerce':
        return <ShoppingCart className="text-indigo-600 text-2xl" />;
      case 'fintech':
        return <Landmark className="text-blue-600 text-2xl" />;
      case 'agritech':
        return <Sprout className="text-green-600 text-2xl" />;
      case 'logistics':
        return <Truck className="text-orange-600 text-2xl" />;
      case 'healthtech':
        return <HeartPulse className="text-red-600 text-2xl" />;
      case 'ai':
      case 'ai/ml':
        return <Brain className="text-purple-600 text-2xl" />;
      case 'saas':
        return <Laptop className="text-gray-600 text-2xl" />;
      default:
        return <Leaf className="text-green-600 text-2xl" />;
    }
  };
  
  const getCategoryBgColor = () => {
    switch (decodedCategory.toLowerCase()) {
      case 'e-commerce':
        return 'bg-indigo-100';
      case 'fintech':
        return 'bg-blue-100';
      case 'agritech':
        return 'bg-green-100';
      case 'logistics':
        return 'bg-orange-100';
      case 'healthtech':
        return 'bg-red-100';
      case 'ai':
      case 'ai/ml':
        return 'bg-purple-100';
      case 'saas':
        return 'bg-gray-100';
      default:
        return 'bg-green-100';
    }
  };
  
  const getCategoryDescription = () => {
    switch (decodedCategory.toLowerCase()) {
      case 'e-commerce':
        return 'Online retail and marketplace startups';
      case 'fintech':
        return 'Financial technology solutions and services';
      case 'agritech':
        return 'Agricultural technology and farming innovations';
      case 'logistics':
        return 'Supply chain, delivery, and transportation solutions';
      case 'healthtech':
        return 'Healthcare technology and wellness innovations';
      case 'ai':
      case 'ai/ml':
        return 'Artificial intelligence and machine learning applications';
      case 'saas':
        return 'Software-as-a-Service platforms and solutions';
      case 'edtech':
        return 'Educational technology and learning platforms';
      default:
        return 'Innovative startups and business ideas';
    }
  };
  
  const renderPitches = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
          <div className="flex items-start">
            <Skeleton className="h-14 w-14 rounded-md flex-shrink-0" />
            <div className="ml-4 flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </div>
      ));
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          <div className="flex items-center">
            <div className="mr-3 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Error Loading Pitches</h3>
              <p className="text-sm">Failed to load pitches. Please try again later.</p>
            </div>
          </div>
        </div>
      );
    }

    // Apply filters
    let filteredPitches = pitches as any[] || [];
    
    if (filters.city && filters.city !== "") {
      filteredPitches = filteredPitches.filter(pitch => 
        pitch.location.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    if (filters.fundingStage && filters.fundingStage !== "") {
      filteredPitches = filteredPitches.filter(pitch => 
        pitch.fundingStage === filters.fundingStage
      );
    }
    
    // Filter by active tab (status)
    if (activeTab !== "all") {
      filteredPitches = filteredPitches.filter(pitch => pitch.status === activeTab);
    }

    if (!filteredPitches || !Array.isArray(filteredPitches) || filteredPitches.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mb-4">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No pitches found</h3>
            <p className="text-gray-600 mb-4 text-center max-w-md">
              {(filters.city || filters.fundingStage) 
                ? "No pitches match your current filters. Try adjusting your filters or check back later."
                : `There are no ${decodedCategory} pitches yet. Be the first to add one!`}
            </p>
            {(filters.city || filters.fundingStage) && (
              <Button 
                variant="outline" 
                onClick={() => setFilters({ city: "", fundingStage: "" })}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      );
    }

    return filteredPitches.map((pitch: any) => (
      <PitchItem key={pitch.id} pitch={pitch} />
    ));
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/pitch-room">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pitch Room
          </Button>
        </Link>
      </div>
      
      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center">
          <div className={`h-16 w-16 ${getCategoryBgColor()} rounded-md flex items-center justify-center flex-shrink-0`}>
            {getCategoryIcon()}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">{decodedCategory} Startups</h1>
            <p className="text-gray-600">{getCategoryDescription()}</p>
          </div>
        </div>
      </div>
      
      {/* Pitch Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={activeTab === "all" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setActiveTab("all")}
        >
          All
        </Button>
        <Button 
          variant={activeTab === PitchStatus.IDEA ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setActiveTab(PitchStatus.IDEA)}
        >
          <Sprout className="h-4 w-4 mr-2" />
          Ideas
        </Button>
        <Button 
          variant={activeTab === PitchStatus.REGISTERED ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setActiveTab(PitchStatus.REGISTERED)}
        >
          <Landmark className="h-4 w-4 mr-2" />
          Registered
        </Button>
      </div>
      
      {/* Pitches Section with Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-medium">Browse {decodedCategory} Startups</h2>
            <p className="text-sm text-gray-500">
              Discover innovative {decodedCategory.toLowerCase()} startups and ideas
            </p>
          </div>
          <div className="flex items-center space-x-2 self-end md:self-auto">
            {(filters.city || filters.fundingStage) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilters({ city: "", fundingStage: "" })}
                className="text-xs"
              >
                Clear Filters
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-gray-100" : ""}
            >
              <Filter className="h-4 w-4 mr-1" />
              <span className="mr-1">Filter</span> 
              {showFilters ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filter-city" className="text-sm font-medium">Location</Label>
                <Select 
                  value={filters.city} 
                  onValueChange={(value) => setFilters({...filters, city: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filter-funding" className="text-sm font-medium">Funding Stage</Label>
                <Select 
                  value={filters.fundingStage} 
                  onValueChange={(value) => setFilters({...filters, fundingStage: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All funding stages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All funding stages</SelectItem>
                    <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B+">Series B+</SelectItem>
                    <SelectItem value="Profitable">Profitable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                {activeTab === "all" 
                  ? `Showing all ${decodedCategory} startups` 
                  : activeTab === PitchStatus.IDEA 
                    ? `Showing ${decodedCategory} ideas` 
                    : `Showing registered ${decodedCategory} startups`}
                {filters.city && ` in ${filters.city}`}
                {filters.fundingStage && ` at ${filters.fundingStage} stage`}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary"
                onClick={() => setShowFilters(false)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
        
        {renderPitches()}
        
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            className="text-center text-primary font-medium"
          >
            <span className="mr-2">Show more pitches</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        </div>
      </div>
    </Layout>
  );
}