import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import PitchItem from "@/components/pitch/pitch-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PitchStatus, PitchStatusType } from "@shared/schema";
import { Bell } from "lucide-react";

export default function PitchRoomPage() {
  const [activeTab, setActiveTab] = useState<PitchStatusType>(PitchStatus.IDEA);
  
  const { 
    data: pitches, 
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/pitches", { status: activeTab }],
  });

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

    if (!pitches || pitches.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mb-4">
          <h3 className="text-lg font-medium mb-2">No pitches found</h3>
          <p className="text-gray-600">
            There are no pitches in this category yet.
          </p>
        </div>
      );
    }

    return pitches.map((pitch: any) => (
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
        <Button 
          variant="outline"
          className="rounded-full"
        >
          Pitch yours
        </Button>
      </div>
      
      {/* Alert Section */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Get notified about startups you're interested in</h2>
        <Button variant="link" className="p-0 h-auto text-primary font-medium">Create alert</Button>
      </div>
      
      {/* Pitches */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Find your next pitch</h2>
        <p className="text-sm text-gray-500 mb-4">
          Based on your profile, activity like applications, searches, and saves
        </p>
        
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
