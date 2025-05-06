import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, ArrowUpRight, Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PitchRoomFixed() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ideas");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPitches, setSavedPitches] = useState<number[]>([]);

  // Mock data for UI demonstration
  const mockPitches = [
    {
      id: 1,
      title: "AI-Powered Healthcare Platform",
      tagline: "Revolutionizing patient care with predictive analytics",
      description: "Our platform uses AI to predict patient outcomes and recommend personalized treatment plans.",
      industry: "Healthcare",
      fundingStage: "Seed",
      fundingAmount: 500000,
      location: "Bangalore, India",
      user: {
        id: 1,
        name: "Rahul Sharma",
        title: "Founder & CEO",
        avatarUrl: null
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: 2,
      title: "Sustainable Fashion Marketplace",
      tagline: "Connecting eco-conscious consumers with ethical brands",
      description: "A platform that curates sustainable fashion brands and helps consumers make ethical choices.",
      industry: "Fashion",
      fundingStage: "Pre-seed",
      fundingAmount: 200000,
      location: "Mumbai, India",
      user: {
        id: 2,
        name: "Priya Patel",
        title: "Co-founder",
        avatarUrl: null
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    },
    {
      id: 3,
      title: "EdTech Platform for Skill Development",
      tagline: "Bridging the gap between education and employment",
      description: "Our platform offers personalized learning paths based on industry requirements and student goals.",
      industry: "Education",
      fundingStage: "Series A",
      fundingAmount: 2000000,
      location: "Delhi, India",
      user: {
        id: 3,
        name: "Vikram Malhotra",
        title: "Founder",
        avatarUrl: null
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) // 10 days ago
    }
  ];

  const handleSavePitch = (pitchId: number) => {
    if (savedPitches.includes(pitchId)) {
      setSavedPitches(savedPitches.filter(id => id !== pitchId));
      toast({
        title: "Pitch removed",
        description: "The pitch has been removed from your saved items."
      });
    } else {
      setSavedPitches([...savedPitches, pitchId]);
      toast({
        title: "Pitch saved",
        description: "The pitch has been saved to your profile."
      });
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    } else {
      return `₹${amount}`;
    }
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#191919]">Pitch Room</h1>
            <p className="text-[#666666] text-sm">Discover and connect with innovative startup ideas</p>
          </div>
          <Button 
            className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full"
            onClick={() => toast({
              title: "Coming soon",
              description: "This feature will be available soon."
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Pitch
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]" size={16} />
            <Input 
              placeholder="Search by title, industry, or location" 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ideas" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="seed">Seed Stage</TabsTrigger>
            <TabsTrigger value="growth">Growth Stage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ideas" className="space-y-4">
            {mockPitches.map((pitch) => (
              <Card key={pitch.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={pitch.user.avatarUrl || ""} alt={pitch.user.name} />
                        <AvatarFallback className="bg-[#0077B5] text-white">{getInitials(pitch.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{pitch.user.name}</div>
                        <div className="text-xs text-[#666666]">{pitch.user.title}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-[#E5F5FC] text-[#0077B5] border-[#0077B5]">
                      {pitch.fundingStage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <CardTitle className="text-lg mb-1">{pitch.title}</CardTitle>
                  <CardDescription className="text-[#191919] font-medium mb-2">{pitch.tagline}</CardDescription>
                  <p className="text-sm text-[#666666] mb-3 line-clamp-2">{pitch.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary" className="bg-[#F5F5F5] text-[#666666]">
                      {pitch.industry}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#F5F5F5] text-[#666666]">
                      {pitch.location}
                    </Badge>
                    <Badge variant="secondary" className="bg-[#F5F5F5] text-[#666666]">
                      {formatCurrency(pitch.fundingAmount)}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <Button variant="ghost" size="sm" className="text-[#0077B5]">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    View Details
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSavePitch(pitch.id)}
                    className={savedPitches.includes(pitch.id) ? "text-[#0077B5]" : "text-[#666666]"}
                  >
                    {savedPitches.includes(pitch.id) ? (
                      <>
                        <BookmarkCheck className="mr-1 h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-1 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="seed" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-[#666666]">No seed stage pitches available at the moment.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-[#666666]">No growth stage pitches available at the moment.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}