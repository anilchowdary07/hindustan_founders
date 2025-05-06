import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PitchStatusType } from "@shared/schema";
import { 
  Leaf, Landmark, Sprout, ShoppingCart, Truck, HeartPulse, 
  Brain, Laptop, ExternalLink, MapPin, Calendar, 
  ThumbsUp, MessageSquare, Share2, BookmarkPlus, ChevronDown, ChevronUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface PitchItemProps {
  pitch: {
    id: number;
    name: string;
    description: string;
    location: string;
    status: PitchStatusType;
    category: string;
    userId: number;
    createdAt: string;
    websiteLink?: string;
    companyRegistrationStatus?: string;
    elevatorPitch?: {
      problem: string;
      solution: string;
    };
    businessModel?: string;
    marketOpportunity?: string;
    revenue?: {
      model: string;
      growth: string;
    };
    fundingStage?: string;
    user?: {
      id: number;
      name: string;
      isVerified: boolean;
      profilePicture?: string;
    };
  };
}

export default function PitchItem({ pitch }: PitchItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();
  
  const getStatusColor = (status: PitchStatusType) => {
    return status === "idea" 
      ? "bg-green-100 text-green-800" 
      : "bg-blue-100 text-blue-800";
  };

  const getStatusText = (status: PitchStatusType) => {
    return status === "idea" 
      ? "Idea Stage" 
      : "Registered";
  };

  const getPitchIcon = () => {
    switch (pitch.category?.toLowerCase()) {
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

  const getPitchBgColor = () => {
    switch (pitch.category?.toLowerCase()) {
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
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "recently";
    }
  };
  
  const handleSharePitch = () => {
    setIsShareDialogOpen(true);
  };
  
  const handleShareSubmit = () => {
    toast({
      title: "Pitch shared",
      description: "The pitch has been shared successfully"
    });
    setIsShareDialogOpen(false);
  };
  
  const submitComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Comment added",
      description: "Your comment has been added successfully"
    });
    setCommentText("");
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card className="mb-4 border border-[#E0E0E0] hover:shadow-md transition-shadow rounded-lg bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <div className={`h-14 w-14 ${getPitchBgColor()} rounded-md flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0`}>
              {getPitchIcon()}
            </div>
            <div className="sm:ml-4 flex-1">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:justify-start">
                    <div className="flex items-center">
                      <Link href={`/pitch/${pitch.id}`}>
                        <h3 className="font-medium text-lg hover:text-[#0077B5] hover:underline cursor-pointer text-[#191919]">{pitch.name}</h3>
                      </Link>
                      {pitch.websiteLink && (
                        <a 
                          href={pitch.websiteLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 text-[#666666] hover:text-[#0077B5]"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(pitch.status)} rounded-full px-3 py-1 text-xs font-medium sm:hidden`}>
                      {getStatusText(pitch.status)}
                    </Badge>
                  </div>
                  <p className="text-[#666666] mt-1 line-clamp-2 sm:line-clamp-none">{pitch.description}</p>
                  <div className="flex items-center text-[#666666] text-sm mt-2 flex-wrap gap-2">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {pitch.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(pitch.createdAt)}
                    </div>
                    {pitch.fundingStage && (
                      <Badge variant="outline" className="font-normal border-[#0077B5] text-[#0077B5]">
                        {pitch.fundingStage}
                      </Badge>
                    )}
                  </div>
                  {pitch.user && (
                    <div className="flex items-center mt-2 sm:hidden">
                      <span className="text-xs text-[#666666] mr-1">by</span>
                      <Avatar className="h-5 w-5 border border-[#E0E0E0]">
                        <AvatarImage src={pitch.user.profilePicture} />
                        <AvatarFallback className="text-[8px] bg-[#0077B5] text-white">
                          {getInitials(pitch.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium ml-1 text-[#191919] hover:text-[#0077B5] hover:underline cursor-pointer">{pitch.user.name}</span>
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <Badge className={`${getStatusColor(pitch.status)} rounded-full px-3 py-1 text-xs font-medium`}>
                    {getStatusText(pitch.status)}
                  </Badge>
                  {pitch.user && (
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-[#666666] mr-1">by</span>
                      <Avatar className="h-5 w-5 border border-[#E0E0E0]">
                        <AvatarImage src={pitch.user.profilePicture} />
                        <AvatarFallback className="text-[8px] bg-[#0077B5] text-white">
                          {getInitials(pitch.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium ml-1 text-[#191919] hover:text-[#0077B5] hover:underline cursor-pointer">{pitch.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-[#E0E0E0] pt-3 text-sm">
                  {pitch.elevatorPitch && (
                    <div>
                      <h4 className="font-medium text-[#191919]">Elevator Pitch</h4>
                      <div className="mt-1 space-y-2 text-[#666666]">
                        <p><span className="font-medium text-[#191919]">Problem:</span> {pitch.elevatorPitch.problem}</p>
                        <p><span className="font-medium text-[#191919]">Solution:</span> {pitch.elevatorPitch.solution}</p>
                      </div>
                    </div>
                  )}
                  
                  {pitch.businessModel && (
                    <div>
                      <h4 className="font-medium text-[#191919]">Business Model</h4>
                      <p className="mt-1 text-[#666666]">{pitch.businessModel}</p>
                    </div>
                  )}
                  
                  {pitch.marketOpportunity && (
                    <div>
                      <h4 className="font-medium text-[#191919]">Market Opportunity</h4>
                      <p className="mt-1 text-[#666666]">{pitch.marketOpportunity}</p>
                    </div>
                  )}
                  
                  {pitch.revenue && (
                    <div className="flex flex-wrap gap-4">
                      {pitch.revenue.model && (
                        <div>
                          <h4 className="font-medium text-[#191919]">Revenue Model</h4>
                          <p className="mt-1 text-[#666666]">{pitch.revenue.model}</p>
                        </div>
                      )}
                      
                      {pitch.revenue.growth && (
                        <div>
                          <h4 className="font-medium text-[#191919]">Growth</h4>
                          <p className="mt-1 text-[#666666]">{pitch.revenue.growth}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-0 border-t border-[#E0E0E0] flex justify-between">
          <div className="flex w-full flex-wrap">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 min-w-[20%] rounded-none py-2 text-xs md:text-sm font-medium ${isLiked ? 'text-[#0077B5]' : 'text-[#666666]'} hover:bg-[#EBEBEB]`}
              onClick={() => setIsLiked(!isLiked)}
            >
              <ThumbsUp className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Like</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 min-w-[20%] rounded-none py-2 text-xs md:text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
              onClick={() => setIsDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Comment</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 min-w-[20%] rounded-none py-2 text-xs md:text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
              onClick={handleSharePitch}
            >
              <Share2 className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Share</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 min-w-[20%] rounded-none py-2 text-xs md:text-sm font-medium ${isSaved ? 'text-[#0077B5]' : 'text-[#666666]'} hover:bg-[#EBEBEB]`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <BookmarkPlus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Save</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 min-w-[20%] rounded-none py-2 text-xs md:text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 md:mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 md:mr-2" />
              )}
              <span className="hidden md:inline">{isExpanded ? "Less" : "More"}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Comment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">{pitch.name}</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Connect with the founder and discuss this pitch
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Share your thoughts on this pitch..." 
              className="min-h-[100px] border-[#E0E0E0] focus:border-[#0A66C2] focus:ring-[#0A66C2]"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitComment}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white"
            >
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">Share this pitch</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Choose how you want to share this pitch
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#0A66C2]">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              Share on Facebook
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#1DA1F2]">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
              Share on Twitter
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#0A66C2]">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              Share on LinkedIn
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
