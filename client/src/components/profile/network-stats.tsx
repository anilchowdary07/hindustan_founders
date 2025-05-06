import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Eye, Award, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface NetworkStatsProps {
  userId?: number;
  isOwnProfile?: boolean;
}

export default function NetworkStats({ userId, isOwnProfile = false }: NetworkStatsProps) {
  const [, navigate] = useLocation();
  
  // Demo stats - in a real app, these would come from an API
  const stats = {
    connections: 248,
    profileViews: isOwnProfile ? 42 : undefined,
    postImpressions: isOwnProfile ? 1243 : undefined,
    mutualConnections: isOwnProfile ? undefined : 12,
    endorsements: 18
  };
  
  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">
          {isOwnProfile ? "Your Network" : "Network"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">Connections</span>
          </div>
          <span className="font-semibold text-gray-800">{stats.connections}</span>
        </div>
        
        {isOwnProfile && stats.profileViews !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Eye className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">Profile views</span>
            </div>
            <span className="font-semibold text-gray-800">{stats.profileViews}</span>
          </div>
        )}
        
        {isOwnProfile && stats.postImpressions !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">Post impressions</span>
            </div>
            <span className="font-semibold text-gray-800">{stats.postImpressions}</span>
          </div>
        )}
        
        {!isOwnProfile && stats.mutualConnections !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">Mutual connections</span>
            </div>
            <span className="font-semibold text-gray-800">{stats.mutualConnections}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600">
            <Award className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">Endorsements</span>
          </div>
          <span className="font-semibold text-gray-800">{stats.endorsements}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-center text-primary mt-2"
          onClick={() => navigate("/network")}
        >
          {isOwnProfile ? "Grow Your Network" : "View Full Network"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}