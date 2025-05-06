import { useState } from "react";
import { useLocation, useNavigate } from "wouter";
import { BusinessPitch } from "@/types/pitch";
import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  ThumbsUp, 
  MessageSquare, 
  Bookmark, 
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  DollarSign
} from "lucide-react";

interface PitchCardProps {
  pitch: BusinessPitch;
  variant?: "default" | "compact";
}

export default function PitchCard({ pitch, variant = "default" }: PitchCardProps) {
  const [location, navigate] = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "FN";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Calculate funding progress percentage
  const fundingProgressPercentage = pitch.fundingGoal && pitch.currentFunding
    ? Math.min(100, Math.round((pitch.currentFunding / pitch.fundingGoal) * 100))
    : 0;
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Fintech': 'bg-blue-100 text-blue-800',
      'E-commerce': 'bg-green-100 text-green-800',
      'AgriTech': 'bg-lime-100 text-lime-800',
      'HealthTech': 'bg-red-100 text-red-800',
      'EdTech': 'bg-purple-100 text-purple-800',
      'CleanTech': 'bg-teal-100 text-teal-800',
      'AI/ML': 'bg-indigo-100 text-indigo-800',
      'SaaS': 'bg-sky-100 text-sky-800',
      'Hardware': 'bg-gray-100 text-gray-800',
      'Marketplace': 'bg-amber-100 text-amber-800',
      'Consumer': 'bg-pink-100 text-pink-800',
      'Enterprise': 'bg-violet-100 text-violet-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  };
  
  // Get stage badge color
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Idea': 'bg-gray-100 text-gray-800',
      'Prototype': 'bg-blue-100 text-blue-800',
      'MVP': 'bg-indigo-100 text-indigo-800',
      'Pre-seed': 'bg-purple-100 text-purple-800',
      'Seed': 'bg-green-100 text-green-800',
      'Series A': 'bg-emerald-100 text-emerald-800',
      'Series B+': 'bg-teal-100 text-teal-800',
      'Profitable': 'bg-amber-100 text-amber-800',
    };
    
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Published': 'bg-green-100 text-green-800',
      'Seeking Feedback': 'bg-blue-100 text-blue-800',
      'Seeking Investment': 'bg-amber-100 text-amber-800',
      'Archived': 'bg-red-100 text-red-800',
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Handle card click
  const handleCardClick = () => {
    navigate(`/pitches/${pitch.id}`);
  };
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${
        isHovered ? 'shadow-md transform -translate-y-1' : 'shadow-sm'
      } cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {pitch.coverImage && variant === "default" && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={pitch.coverImage} 
            alt={pitch.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardContent className={`${variant === "default" ? 'pt-6' : 'pt-4'} pb-4`}>
        <div className="flex items-start">
          {pitch.logo ? (
            <div className={`${variant === "default" ? 'h-14 w-14' : 'h-10 w-10'} rounded-lg overflow-hidden border border-gray-200 bg-white mr-3 flex-shrink-0`}>
              <img 
                src={pitch.logo} 
                alt={`${pitch.title} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className={`${variant === "default" ? 'h-14 w-14' : 'h-10 w-10'} rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0`}>
              <Building2 className={`${variant === "default" ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1">
              <Badge className={`${getCategoryColor(pitch.category)} text-xs`}>
                {pitch.category}
              </Badge>
              <Badge className={`${getStageColor(pitch.stage)} text-xs`}>
                {pitch.stage}
              </Badge>
              {variant === "default" && (
                <Badge className={`${getStatusColor(pitch.status)} text-xs`}>
                  {pitch.status}
                </Badge>
              )}
            </div>
            
            <h3 className={`font-bold text-gray-900 truncate ${variant === "default" ? 'text-lg' : 'text-base'}`}>
              {pitch.title}
            </h3>
            
            {variant === "default" && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {pitch.tagline}
              </p>
            )}
          </div>
        </div>
        
        {variant === "default" && (
          <>
            <div className="mt-4">
              <p className="text-gray-700 text-sm line-clamp-3">
                {pitch.problem}
              </p>
            </div>
            
            {pitch.fundingGoal && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Funding Progress</span>
                  <span className="text-gray-600">
                    {pitch.currentFunding ? `₹${pitch.currentFunding.toLocaleString()}` : '₹0'} 
                    {' of '} 
                    ₹{pitch.fundingGoal.toLocaleString()}
                  </span>
                </div>
                <Progress value={fundingProgressPercentage} className="h-2" />
                <div className="text-xs text-right mt-1 text-gray-500">
                  {fundingProgressPercentage}% of goal
                </div>
              </div>
            )}
          </>
        )}
        
        <div className={`flex items-center ${variant === "default" ? 'mt-4' : 'mt-2'}`}>
          <Avatar className={`${variant === "default" ? 'h-8 w-8' : 'h-6 w-6'} mr-2`}>
            <AvatarImage src={pitch.user?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(pitch.user?.name || "")}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-gray-900 truncate ${variant === "compact" ? 'text-sm' : ''}`}>
              {pitch.user?.name}
            </div>
            {variant === "default" && pitch.user?.title && (
              <div className="text-xs text-gray-500 truncate">
                {pitch.user.title}
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(pitch.createdAt)}
          </div>
        </div>
        
        {variant === "compact" && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            {pitch.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate max-w-[100px]">{pitch.location}</span>
              </div>
            )}
            
            {pitch.teamSize && (
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>{pitch.teamSize}</span>
              </div>
            )}
            
            {pitch.fundingGoal && (
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                <span>₹{pitch.fundingGoal.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {variant === "default" && (
        <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center text-gray-500 text-sm">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{pitch.likes || 0}</span>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{pitch.feedback?.length || 0}</span>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm">
              <Bookmark className="h-4 w-4 mr-1" />
              <span>{pitch.bookmarks || 0}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/90 hover:bg-primary/10 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/pitches/${pitch.id}`);
            }}
          >
            View Details
            <ExternalLink className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}