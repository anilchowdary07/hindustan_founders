import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Award, TrendingUp, Users, Briefcase, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HighlightsSectionProps {
  profileData: any;
  isOwnProfile: boolean;
  onAddHighlight?: () => void;
  onEditHighlight?: (highlight: any) => void;
}

export default function HighlightsSection({
  profileData,
  isOwnProfile,
  onAddHighlight,
  onEditHighlight
}: HighlightsSectionProps) {
  // Default highlights if none exist
  const highlights = profileData?.highlights || [];
  
  // Generate default highlights based on profile data
  const generateDefaultHighlights = () => {
    const defaultHighlights = [];
    
    // Add connection count highlight if available
    if (profileData?.connectionCount && profileData.connectionCount > 0) {
      defaultHighlights.push({
        id: "connections",
        icon: <Users className="h-5 w-5 text-blue-600" />,
        title: `${profileData.connectionCount}+ connections`,
        description: "Growing professional network"
      });
    }
    
    // Add experience highlight if available
    if (profileData?.experience && profileData.experience.length > 0) {
      const latestExperience = profileData.experience[0];
      defaultHighlights.push({
        id: "experience",
        icon: <Briefcase className="h-5 w-5 text-blue-600" />,
        title: latestExperience.title,
        description: `${latestExperience.company}`
      });
    }
    
    // Add skills highlight if available
    if (profileData?.skills && profileData.skills.length > 0) {
      defaultHighlights.push({
        id: "skills",
        icon: <Award className="h-5 w-5 text-blue-600" />,
        title: "Top skills",
        description: profileData.skills.slice(0, 3).join(", ")
      });
    }
    
    return defaultHighlights.length > 0 ? defaultHighlights : highlights;
  };
  
  const displayHighlights = highlights.length > 0 ? highlights : generateDefaultHighlights();
  
  if (displayHighlights.length === 0 && !isOwnProfile) {
    return null;
  }
  
  return (
    <Card className="mb-4 border border-[#E0E0E0] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-[#191919]">Highlights</CardTitle>
        {isOwnProfile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[#0A66C2] hover:text-[#0A66C2] hover:bg-[#E8F3FF]"
            onClick={onAddHighlight}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {displayHighlights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayHighlights.map((highlight: any, index: number) => (
              <div 
                key={highlight.id || index} 
                className="flex items-start p-3 rounded-md border border-[#E0E0E0] bg-[#F9FAFB] relative group"
              >
                <div className="mr-3 mt-1">
                  {highlight.icon || <TrendingUp className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[#191919]">{highlight.title}</h4>
                  <p className="text-sm text-[#666666]">{highlight.description}</p>
                  {highlight.tags && highlight.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {highlight.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2] text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-7 w-7 p-0"
                    onClick={() => onEditHighlight && onEditHighlight(highlight)}
                  >
                    <Edit className="h-3.5 w-3.5 text-[#666666]" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : isOwnProfile ? (
          <div className="text-center py-6">
            <Award className="h-12 w-12 text-[#666666] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#191919]">Add your highlights</h3>
            <p className="text-[#666666] mt-1 mb-4">Showcase your achievements, skills, and experience</p>
            <Button 
              variant="outline" 
              className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E8F3FF]"
              onClick={onAddHighlight}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add a highlight
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}