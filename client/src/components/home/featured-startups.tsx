import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, ExternalLink, Rocket, TrendingUp, Users } from "lucide-react";
import { useLocation } from "wouter";

interface StartupProps {
  id: number;
  name: string;
  logo: string;
  description: string;
  industry: string;
  stage: string;
  location: string;
  teamSize: string;
  funding?: string;
}

interface FeaturedStartupsProps {
  title?: string;
  showViewAll?: boolean;
}

export default function FeaturedStartups({ 
  title = "Featured Startups", 
  showViewAll = true 
}: FeaturedStartupsProps) {
  const [, navigate] = useLocation();
  
  // Sample data for featured startups
  const startups: StartupProps[] = [
    {
      id: 1,
      name: "HealthTech AI",
      logo: "/logos/healthtech.png",
      description: "AI-powered diagnostics platform for early disease detection",
      industry: "Healthcare",
      stage: "Seed",
      location: "Bangalore",
      teamSize: "12-20",
      funding: "$1.2M"
    },
    {
      id: 2,
      name: "EcoFarm",
      logo: "/logos/ecofarm.png",
      description: "Sustainable farming solutions using IoT and data analytics",
      industry: "AgriTech",
      stage: "Series A",
      location: "Delhi NCR",
      teamSize: "20-50",
      funding: "$4.5M"
    },
    {
      id: 3,
      name: "FinEdge",
      logo: "/logos/finedge.png",
      description: "Next-gen financial inclusion platform for rural India",
      industry: "FinTech",
      stage: "Pre-seed",
      location: "Mumbai",
      teamSize: "5-10"
    }
  ];
  
  const getLogoFallback = (name: string) => {
    if (!name) return "FS";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "pre-seed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "seed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "series a":
        return "bg-green-50 text-green-700 border-green-200";
      case "series b":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "series c":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  return (
    <Card className="shadow-sm border-gray-100 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
          {showViewAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:bg-primary/10"
              onClick={() => navigate("/pitch-room")}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {startups.map((startup) => (
            <div 
              key={startup.id} 
              className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/pitch/${startup.id}`)}
            >
              <div className="flex items-center">
                <Avatar className="h-12 w-12 border border-gray-200">
                  <AvatarImage src={startup.logo} alt={startup.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getLogoFallback(startup.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{startup.name}</h3>
                    <Badge variant="outline" className={getStageColor(startup.stage)}>
                      {startup.stage}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{startup.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center mt-3 gap-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Rocket className="h-3 w-3 mr-1" />
                  {startup.industry}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center text-xs text-gray-500">
                  <Users className="h-3 w-3 mr-1" />
                  {startup.teamSize}
                </div>
                {startup.funding && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {startup.funding}
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-primary border-primary/30 hover:bg-primary/10 hover:text-primary rounded-full"
                >
                  View Pitch
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}