import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PitchStatusType } from "@shared/schema";
import { 
  ArrowLeft, ExternalLink, MapPin, Calendar, Building, 
  ThumbsUp, MessageSquare, Share2, BookmarkPlus, 
  Briefcase, LineChart, Users, Landmark, Sprout, ShoppingCart, 
  Truck, HeartPulse, Brain, Laptop, Leaf, Mail
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PitchDetailPage() {
  const [, params] = useRoute("/pitch/:id");
  const pitchId = params?.id ? parseInt(params.id) : null;
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const { data: pitch, isLoading, error } = useQuery({
    queryKey: [`/api/pitches/${pitchId}`],
    queryFn: () => apiRequest(`/api/pitches/${pitchId}`),
    enabled: !!pitchId
  });

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
    if (!pitch) return <Leaf className="text-green-600 text-3xl" />;
    
    switch (pitch.category?.toLowerCase()) {
      case 'e-commerce':
        return <ShoppingCart className="text-indigo-600 text-3xl" />;
      case 'fintech':
        return <Landmark className="text-blue-600 text-3xl" />;
      case 'agritech':
        return <Sprout className="text-green-600 text-3xl" />;
      case 'logistics':
        return <Truck className="text-orange-600 text-3xl" />;
      case 'healthtech':
        return <HeartPulse className="text-red-600 text-3xl" />;
      case 'ai':
      case 'ai/ml':
        return <Brain className="text-purple-600 text-3xl" />;
      case 'saas':
        return <Laptop className="text-gray-600 text-3xl" />;
      default:
        return <Leaf className="text-green-600 text-3xl" />;
    }
  };

  const getPitchBgColor = () => {
    if (!pitch) return 'bg-green-100';
    
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

  const handleContactFounder = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the founder. They will get back to you soon.",
    });
    setIsContactDialogOpen(false);
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

  if (isLoading) {
    return (
      <Layout>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start">
            <Skeleton className="h-20 w-20 rounded-md" />
            <div className="ml-6 flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !pitch) {
    return (
      <Layout>
        <div className="flex items-center mb-6">
          <Link href="/pitch-room">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Pitch Details</h1>
        </div>
        
        <div className="bg-red-50 p-6 rounded-lg text-red-800 mb-6">
          <h3 className="text-lg font-medium mb-2">Error Loading Pitch</h3>
          <p>We couldn't find the pitch you're looking for. It may have been removed or you may have followed an invalid link.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/pitches/${pitchId}`] })}
          >
            Try Again
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/pitch-room">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pitch Room
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Pitch Details</h1>
      </div>
      
      {/* Pitch Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start">
          <div className={`h-20 w-20 ${getPitchBgColor()} rounded-md flex items-center justify-center flex-shrink-0 mb-4 md:mb-0`}>
            {getPitchIcon()}
          </div>
          
          <div className="md:ml-6 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <div>
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold">{pitch.name}</h2>
                  {pitch.websiteLink && (
                    <a 
                      href={pitch.websiteLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-gray-500 hover:text-primary"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mt-1">{pitch.description}</p>
              </div>
              
              <Badge className={`${getStatusColor(pitch.status)} mt-2 md:mt-0`}>
                {getStatusText(pitch.status)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {pitch.location}
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(pitch.createdAt)}
              </div>
              
              {pitch.companyRegistrationStatus && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {pitch.companyRegistrationStatus}
                </div>
              )}
              
              {pitch.fundingStage && (
                <Badge variant="outline" className="font-normal">
                  {pitch.fundingStage}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant={isLiked ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="text-xs md:text-sm"
              >
                <ThumbsUp className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{isLiked ? "Liked" : "Like"}</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsContactDialogOpen(true)}
                className="text-xs md:text-sm"
              >
                <MessageSquare className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Contact Founder</span>
                <span className="md:hidden">Contact</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs md:text-sm"
                onClick={handleSharePitch}
              >
                <Share2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Share</span>
              </Button>
              
              <Button 
                variant={isSaved ? "default" : "outline"} 
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
                className="text-xs md:text-sm"
              >
                <BookmarkPlus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{isSaved ? "Saved" : "Save"}</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Founder Info */}
        {pitch.user && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium mb-3">Founder</h3>
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={pitch.user.profilePicture} />
                <AvatarFallback className="bg-gray-200">
                  {getInitials(pitch.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="font-medium">{pitch.user.name}</p>
                  {pitch.user.isVerified && (
                    <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                  )}
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary text-sm"
                  onClick={() => setIsContactDialogOpen(true)}
                >
                  Contact
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Pitch Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-4 w-full flex justify-between">
            <TabsTrigger value="overview" className="text-xs md:text-sm flex-1">Overview</TabsTrigger>
            <TabsTrigger value="business" className="text-xs md:text-sm flex-1">
              <span className="hidden md:inline">Business Model</span>
              <span className="md:hidden">Business</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs md:text-sm flex-1">Market</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {pitch.elevatorPitch && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Elevator Pitch</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div>
                    <p className="font-medium text-gray-700">Problem</p>
                    <p className="mt-1">{pitch.elevatorPitch.problem}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Solution</p>
                    <p className="mt-1">{pitch.elevatorPitch.solution}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium">Company Status</h3>
                </div>
                <p>{pitch.companyRegistrationStatus || "Not specified"}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <LineChart className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium">Funding Stage</h3>
                </div>
                <p>{pitch.fundingStage || "Not specified"}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="business">
            {pitch.businessModel && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium">Business Model</h3>
                </div>
                <p className="whitespace-pre-line">{pitch.businessModel}</p>
              </div>
            )}
            
            {pitch.revenue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {pitch.revenue.model && (
                  <div>
                    <div className="flex items-center mb-2">
                      <LineChart className="h-5 w-5 text-gray-500 mr-2" />
                      <h3 className="text-lg font-medium">Revenue Model</h3>
                    </div>
                    <p>{pitch.revenue.model}</p>
                  </div>
                )}
                
                {pitch.revenue.growth && (
                  <div>
                    <div className="flex items-center mb-2">
                      <LineChart className="h-5 w-5 text-gray-500 mr-2" />
                      <h3 className="text-lg font-medium">Growth</h3>
                    </div>
                    <p>{pitch.revenue.growth}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="market">
            {pitch.marketOpportunity && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-medium">Market Opportunity</h3>
                </div>
                <p className="whitespace-pre-line">{pitch.marketOpportunity}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Similar Pitches */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium mb-4">You might also be interested in</h3>
        <p className="text-gray-500">
          Similar pitches will appear here as more founders join the platform.
        </p>
      </div>
      
      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {pitch.user?.name || "Founder"}</DialogTitle>
            <DialogDescription>
              Send a message to the founder about their pitch.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Your message</p>
              <Textarea 
                placeholder="Hi, I'm interested in your pitch and would like to learn more..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleContactFounder}>
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
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
    </Layout>
  );
}