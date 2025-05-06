import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/api";
import Layout from "@/components/layout/layout";
import PitchItem from "@/components/pitch/pitch-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PitchStatus, PitchStatusType } from "@shared/schema";
import { 
  Bell, Plus, Loader2, ChevronDown, ChevronUp, 
  Sprout, Landmark, Search, Filter
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function PitchRoomPage() {
  const [activeTab, setActiveTab] = useState<PitchStatusType>(PitchStatus.IDEA);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    industry: ""
  });
  const [pitchData, setPitchData] = useState({
    name: "",
    description: "",
    location: "",
    category: "",
    status: PitchStatus.IDEA as PitchStatusType,
    // Additional fields for the enhanced form
    websiteLink: "",
    companyRegistrationStatus: "",
    elevatorPitch: {
      problem: "",
      solution: ""
    },
    businessModel: "",
    marketOpportunity: "",
    revenue: {
      model: "",
      growth: ""
    },
    fundingStage: ""
  });
  const { toast } = useToast();
  
  const { 
    data: pitches, 
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/pitches", { status: activeTab }],
    queryFn: async () => {
      try {
        const res = await apiRequest(`/api/pitches?status=${activeTab}`);
        console.log("API response for pitches:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (err) {
        console.error("Error fetching pitches:", err);
        return [];
      }
    }
  });
  
  const createPitchMutation = useMutation({
    mutationFn: async (data: typeof pitchData) => {
      const res = await apiRequest("POST", "/api/pitches", data);
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your pitch has been created successfully",
      });
      setIsDialogOpen(false);
      setPitchData({
        name: "",
        description: "",
        location: "",
        category: "",
        status: PitchStatus.IDEA as PitchStatusType,
        websiteLink: "",
        companyRegistrationStatus: "",
        elevatorPitch: {
          problem: "",
          solution: ""
        },
        businessModel: "",
        marketOpportunity: "",
        revenue: {
          model: "",
          growth: ""
        },
        fundingStage: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pitches"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create pitch: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handlePitchSubmit = () => {
    if (!pitchData.name || !pitchData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    createPitchMutation.mutate(pitchData);
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
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/pitches"] })}
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Retry
          </Button>
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
    
    if (filters.industry && filters.industry !== "") {
      filteredPitches = filteredPitches.filter(pitch => 
        pitch.category.toLowerCase() === filters.industry.toLowerCase()
      );
    }
    
    // Filter by active tab (status)
    filteredPitches = filteredPitches.filter(pitch => pitch.status === activeTab);

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
              {filters.city || filters.industry 
                ? "No pitches match your current filters. Try adjusting your filters or check back later."
                : "There are no pitches in this category yet. Be the first to add one!"}
            </p>
            {(filters.city || filters.industry) && (
              <Button 
                variant="outline" 
                onClick={() => setFilters({ city: "", industry: "" })}
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
      {/* Mobile-optimized header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#191919]">Pitch Room</h1>
          <p className="text-[#666666] text-sm mt-1 mb-3 md:mb-0">Discover and connect with innovative startups</p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial mr-2 md:mr-0">
            <Input
              type="search"
              placeholder="Search pitches..."
              className="pl-8 pr-4 py-2 w-full md:w-[200px] rounded-full text-sm"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC] rounded-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
          <Link href="/pitch/create">
            <Button 
              size="sm" 
              className="bg-[#0077B5] hover:bg-[#006097] text-white rounded-full"
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Add Your Pitch</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Pitch Tabs - Mobile Optimized */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6 pb-1">
        <Button 
          variant={activeTab === PitchStatus.IDEA ? "default" : "outline"}
          className={`rounded-full font-medium whitespace-nowrap ${
            activeTab === PitchStatus.IDEA 
              ? "bg-[#0077B5] text-white hover:bg-[#006097]" 
              : "border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC]"
          }`}
          onClick={() => setActiveTab(PitchStatus.IDEA)}
        >
          <Sprout className="h-4 w-4 mr-2" />
          Ideas
        </Button>
        <Button 
          variant={activeTab === PitchStatus.REGISTERED ? "default" : "outline"}
          className={`rounded-full font-medium whitespace-nowrap ${
            activeTab === PitchStatus.REGISTERED 
              ? "bg-[#0077B5] text-white hover:bg-[#006097]" 
              : "border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC]"
          }`}
          onClick={() => setActiveTab(PitchStatus.REGISTERED)}
        >
          <Landmark className="h-4 w-4 mr-2" />
          Registered
        </Button>
        <Button 
          variant="outline"
          className="rounded-full whitespace-nowrap border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC]"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild className="hidden">
            <Button 
              variant="outline" 
              className="rounded-full border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Pitch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto rounded-lg shadow-lg border border-[#E0E0E0]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#191919]">Pitch Your Startup</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-3">
                <Label htmlFor="logo-upload">Upload Logo (Optional)</Label>
                <Input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="pitch-name">Startup Name*</Label>
                <Input 
                  id="pitch-name" 
                  value={pitchData.name}
                  onChange={(e) => setPitchData({...pitchData, name: e.target.value})}
                  placeholder="Your startup name"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="website-link">Website Link (Optional)</Label>
                <Input 
                  id="website-link" 
                  value={pitchData.websiteLink}
                  onChange={(e) => setPitchData({...pitchData, websiteLink: e.target.value})}
                  placeholder="https://yourstartup.com"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="company-status">Company Registration Status</Label>
                <Select 
                  value={pitchData.companyRegistrationStatus} 
                  onValueChange={(value) => setPitchData({...pitchData, companyRegistrationStatus: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Registered">Not Registered</SelectItem>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Registered">Registered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                <h3 className="font-semibold">Elevator Pitch</h3>
                <div className="grid gap-3">
                  <Label htmlFor="pitch-problem">Problem*</Label>
                  <Textarea 
                    id="pitch-problem" 
                    value={pitchData.elevatorPitch.problem}
                    onChange={(e) => setPitchData({
                      ...pitchData, 
                      elevatorPitch: {
                        ...pitchData.elevatorPitch,
                        problem: e.target.value
                      }
                    })}
                    placeholder="What problem are you solving?"
                    rows={2}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="pitch-solution">Solution*</Label>
                  <Textarea 
                    id="pitch-solution" 
                    value={pitchData.elevatorPitch.solution}
                    onChange={(e) => setPitchData({
                      ...pitchData, 
                      elevatorPitch: {
                        ...pitchData.elevatorPitch,
                        solution: e.target.value
                      }
                    })}
                    placeholder="How are you solving this problem?"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="business-model">Business Model*</Label>
                <Textarea 
                  id="business-model" 
                  value={pitchData.businessModel}
                  onChange={(e) => setPitchData({...pitchData, businessModel: e.target.value})}
                  placeholder="How will you make money?"
                  rows={2}
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="market-opportunity">Market Opportunity/Size*</Label>
                <Textarea 
                  id="market-opportunity" 
                  value={pitchData.marketOpportunity}
                  onChange={(e) => setPitchData({...pitchData, marketOpportunity: e.target.value})}
                  placeholder="What is the size of the market you're targeting?"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="revenue-model">Revenue Model</Label>
                  <Select 
                    value={pitchData.revenue.model} 
                    onValueChange={(value) => setPitchData({
                      ...pitchData, 
                      revenue: {
                        ...pitchData.revenue,
                        model: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Subscription">Subscription</SelectItem>
                      <SelectItem value="Transactional">Transactional</SelectItem>
                      <SelectItem value="Advertising">Advertising</SelectItem>
                      <SelectItem value="Freemium">Freemium</SelectItem>
                      <SelectItem value="Marketplace">Marketplace</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="revenue-growth">Growth & Key</Label>
                  <Input 
                    id="revenue-growth" 
                    value={pitchData.revenue.growth}
                    onChange={(e) => setPitchData({
                      ...pitchData, 
                      revenue: {
                        ...pitchData.revenue,
                        growth: e.target.value
                      }
                    })}
                    placeholder="Growth metrics"
                  />
                </div>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="funding-stage">Funding Stage</Label>
                <Select 
                  value={pitchData.fundingStage} 
                  onValueChange={(value) => setPitchData({...pitchData, fundingStage: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B+">Series B+</SelectItem>
                    <SelectItem value="Profitable">Profitable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="pitch-location">Location*</Label>
                <Input 
                  id="pitch-location" 
                  value={pitchData.location}
                  onChange={(e) => setPitchData({...pitchData, location: e.target.value})}
                  placeholder="e.g. Bangalore, Delhi, Remote"
                />
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="pitch-category">Category/Industry*</Label>
                <Select 
                  value={pitchData.category} 
                  onValueChange={(value) => setPitchData({...pitchData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="AI">AI/ML</SelectItem>
                    <SelectItem value="AgriTech">AgriTech</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="pitch-status">Pitch Type*</Label>
                <Select 
                  value={pitchData.status} 
                  onValueChange={(value: PitchStatusType) => setPitchData({...pitchData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PitchStatus.IDEA}>Idea Stage</SelectItem>
                    <SelectItem value={PitchStatus.REGISTERED}>Registered Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handlePitchSubmit}
                disabled={createPitchMutation.isPending}
                className="w-full bg-[#0077B5] hover:bg-[#006097] text-white rounded-full font-medium"
              >
                {createPitchMutation.isPending ? 
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Pitch...
                  </div> 
                  : 'Submit Pitch'
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Pitches Section with Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <div>
            <h2 className="text-lg font-medium text-[#191919]">Find your next opportunity</h2>
            <p className="text-sm text-[#666666]">
              Discover startups that match your interests and expertise
            </p>
          </div>
          <div className="flex items-center space-x-2 self-end md:self-auto">
            {(filters.city || filters.industry) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilters({ city: "", industry: "" })}
                className="text-xs text-[#0077B5] hover:bg-[#E5F5FC] rounded-md"
              >
                Clear Filters
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-md border-[#E0E0E0] text-[#191919] ${showFilters ? "bg-[#EBEBEB]" : "hover:bg-[#EBEBEB]"}`}
            >
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
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-[#E0E0E0] animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filter-city" className="text-sm font-medium text-[#191919]">Location</Label>
                <Select 
                  value={filters.city} 
                  onValueChange={(value) => setFilters({...filters, city: value})}
                >
                  <SelectTrigger className="mt-1 border-[#E0E0E0] focus:ring-[#0077B5] focus:border-[#0077B5]">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent className="border-[#E0E0E0] shadow-md">
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
                <Label htmlFor="filter-industry" className="text-sm font-medium text-[#191919]">Industry</Label>
                <Select 
                  value={filters.industry} 
                  onValueChange={(value) => setFilters({...filters, industry: value})}
                >
                  <SelectTrigger className="mt-1 border-[#E0E0E0] focus:ring-[#0077B5] focus:border-[#0077B5]">
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent className="border-[#E0E0E0] shadow-md">
                    <SelectItem value="">All industries</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="FinTech">FinTech</SelectItem>
                    <SelectItem value="EdTech">EdTech</SelectItem>
                    <SelectItem value="HealthTech">HealthTech</SelectItem>
                    <SelectItem value="SaaS">SaaS</SelectItem>
                    <SelectItem value="AI">AI/ML</SelectItem>
                    <SelectItem value="AgriTech">AgriTech</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E0E0E0]">
              <div className="text-sm text-[#666666]">
                {activeTab === PitchStatus.IDEA ? "Showing idea-stage startups" : "Showing registered companies"}
                {filters.city && ` in ${filters.city}`}
                {filters.industry && ` in ${filters.industry}`}
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#0077B5] hover:bg-[#E5F5FC] rounded-md"
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
