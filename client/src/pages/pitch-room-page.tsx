import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout/layout";
import PitchItem from "@/components/pitch/pitch-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PitchStatus, PitchStatusType } from "@shared/schema";
import { Bell, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  });
  
  const createPitchMutation = useMutation({
    mutationFn: async (data: typeof pitchData) => {
      const res = await apiRequest("POST", "/api/pitches", data);
      return await res.json();
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
        </div>
      ));
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          Failed to load pitches. Please try again later.
        </div>
      );
    }

    if (!pitches || !Array.isArray(pitches) || pitches.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mb-4">
          <h3 className="text-lg font-medium mb-2">No pitches found</h3>
          <p className="text-gray-600">
            There are no pitches in this category yet.
          </p>
        </div>
      );
    }

    return (pitches as any[]).map((pitch: any) => (
      <PitchItem key={pitch.id} pitch={pitch} />
    ));
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pitch Room</h1>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Pitch Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        <Button 
          variant={activeTab === PitchStatus.IDEA ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setActiveTab(PitchStatus.IDEA)}
        >
          Ideas
        </Button>
        <Button 
          variant={activeTab === PitchStatus.REGISTERED ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setActiveTab(PitchStatus.REGISTERED)}
        >
          Registered
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="rounded-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              Pitch yours
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Pitch Your Startup</DialogTitle>
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
                className="w-full"
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
      
      {/* Alert Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Get notified about startups you're interested in</h2>
        <Button variant="link" className="p-0 h-auto text-primary font-medium">Create alert</Button>
      </div>
      
      {/* Pitches */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-lg font-medium">Find your next pitch</h2>
            <p className="text-sm text-gray-500">
              Based on your profile, activity like applications, searches, and saves
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="mr-1">Filter</span> <span className="text-xs">▼</span>
          </Button>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
            <h3 className="font-medium mb-3">Filter Startups</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filter-city">Select City:</Label>
                <Select 
                  value={filters.city} 
                  onValueChange={(value) => setFilters({...filters, city: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label htmlFor="filter-industry">Select Industry:</Label>
                <Select 
                  value={filters.industry} 
                  onValueChange={(value) => setFilters({...filters, industry: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select an industry" />
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
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full">Apply Filters</Button>
            </div>
          </div>
        )}
        
        {renderPitches()}
        
        <Button 
          variant="ghost" 
          className="text-center w-full text-primary font-medium py-2"
        >
          Show all
        </Button>
      </div>
    </Layout>
  );
}
