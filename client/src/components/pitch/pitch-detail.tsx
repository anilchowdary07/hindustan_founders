import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BusinessPitch, PitchFeedback } from "@/types/pitch";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  Briefcase, 
  Target, 
  Users, 
  DollarSign, 
  LineChart, 
  BarChart4, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  Share2,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle,
  Star,
  Send,
  ChevronDown
} from "lucide-react";

interface PitchDetailProps {
  pitch: BusinessPitch;
  isLoading?: boolean;
}

export default function PitchDetail({ pitch, isLoading = false }: PitchDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackCategory, setFeedbackCategory] = useState<string>("general");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  
  const isOwner = user?.id === pitch.userId;
  
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
  
  // Like pitch mutation
  const likePitchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/pitches/${pitch.id}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to like pitch");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pitches/${pitch.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pitches'] });
      toast({
        title: "Success",
        description: "Pitch liked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like pitch. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Bookmark pitch mutation
  const bookmarkPitchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/pitches/${pitch.id}/bookmark`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to bookmark pitch");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pitches/${pitch.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pitches'] });
      toast({
        title: "Success",
        description: "Pitch bookmarked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to bookmark pitch. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Share pitch mutation
  const sharePitchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/pitches/${pitch.id}/share`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to record share");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pitches/${pitch.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pitches'] });
    },
    onError: (error) => {
      console.error("Error recording share:", error);
      // Silent error - don't show toast to user as this is a background operation
    },
  });
  
  // Contact founder mutation
  const contactFounderMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      if (!user) {
        throw new Error("You must be logged in to contact the founder");
      }
      
      const response = await fetch(`/api/pitches/${pitch.id}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setShowContactModal(false);
      setContactMessage("");
      setContactSubject("");
      toast({
        title: "Message sent",
        description: "Your message has been sent to the founder",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: { content: string; rating?: number; category?: string }) => {
      if (!user) {
        throw new Error("You must be logged in to submit feedback");
      }
      
      const response = await fetch(`/api/pitches/${pitch.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      
      return await response.json();
    },
    onMutate: () => {
      // Optimistic update could be added here
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/pitches/${pitch.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pitches'] });
      
      // Reset form
      setFeedbackText("");
      setFeedbackRating(0);
      setFeedbackCategory("general");
      
      // Show success message
      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully",
      });
      
      // Scroll to the feedback section
      const feedbackSection = document.getElementById('feedback-list');
      if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete pitch mutation
  const deletePitchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/pitches/${pitch.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete pitch");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pitches'] });
      router.push('/pitches');
      toast({
        title: "Success",
        description: "Pitch deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete pitch. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle feedback submission
  const handleSubmitFeedback = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit feedback",
        variant: "default"
      });
      return;
    }
    
    if (!feedbackText.trim()) {
      toast({
        title: "Error",
        description: "Please enter feedback text",
        variant: "destructive",
      });
      return;
    }
    
    submitFeedbackMutation.mutate({
      content: feedbackText,
      rating: feedbackRating > 0 ? feedbackRating : undefined,
      category: feedbackCategory
    });
  };
  
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
  
  return (
    <div className="max-w-5xl mx-auto">
      {/* Pitch Header */}
      <div className="relative">
        {pitch.coverImage && (
          <div className="w-full h-48 md:h-64 rounded-t-lg overflow-hidden">
            <img 
              src={pitch.coverImage} 
              alt={pitch.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${pitch.coverImage ? 'rounded-t-none -mt-12 relative z-10' : ''}`}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                {pitch.logo ? (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden border border-gray-200 bg-white mr-4 flex-shrink-0">
                    <img 
                      src={pitch.logo} 
                      alt={`${pitch.title} logo`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-4 flex-shrink-0">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
                
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getCategoryColor(pitch.category)}>
                      {pitch.category}
                    </Badge>
                    <Badge className={getStageColor(pitch.stage)}>
                      {pitch.stage}
                    </Badge>
                    <Badge className={getStatusColor(pitch.status)}>
                      {pitch.status}
                    </Badge>
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {pitch.title}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {pitch.tagline}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => likePitchMutation.mutate()}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{pitch.likes || 0}</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => setActiveTab("feedback")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{pitch.feedback?.length || 0}</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => bookmarkPitchMutation.mutate()}
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>{pitch.bookmarks || 0}</span>
                  </Button>
                  
                  {!isOwner && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-1 bg-primary hover:bg-primary/90"
                      onClick={() => setShowContactModal(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Contact Founder</span>
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {
                        // Share functionality
                        if (navigator.share) {
                          navigator.share({
                            title: pitch.title,
                            text: pitch.tagline,
                            url: window.location.href,
                          })
                          .then(() => {
                            // Track share event
                            sharePitchMutation.mutate();
                          })
                          .catch((error) => {
                            console.error("Error sharing:", error);
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link copied",
                            description: "Pitch link copied to clipboard",
                          });
                          // Track share event
                          sharePitchMutation.mutate();
                        }
                      }}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      
                      {isOwner && (
                        <>
                          <DropdownMenuItem onClick={() => router.push(`/pitches/edit/${pitch.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this pitch? This action cannot be undone.")) {
                                deletePitchMutation.mutate();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {!isOwner && (
                        <DropdownMenuItem onClick={() => {
                          toast({
                            title: "Report submitted",
                            description: "Thank you for your feedback. We'll review this pitch.",
                          });
                        }}>
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {formatDate(pitch.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={pitch.user?.avatarUrl} />
                  <AvatarFallback className="bg-primary text-white">
                    {getInitials(pitch.user?.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{pitch.user?.name}</div>
                  <div className="text-sm text-gray-500">{pitch.user?.title || "Founder"}</div>
                </div>
              </div>
              
              <div className="flex-1 md:ml-6 space-y-2">
                <div className="flex flex-wrap gap-4">
                  {pitch.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{pitch.location}</span>
                    </div>
                  )}
                  
                  {pitch.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ExternalLink className="h-4 w-4 mr-1 text-gray-400" />
                      <a 
                        href={pitch.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline"
                      >
                        {pitch.website.replace(/^https?:\/\/(www\.)?/, '')}
                      </a>
                    </div>
                  )}
                  
                  {pitch.teamSize && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{pitch.teamSize} team members</span>
                    </div>
                  )}
                </div>
                
                {pitch.fundingGoal && (
                  <div className="pt-2">
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
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pitch Content */}
      <div className="mt-6">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
              {pitch.feedback && pitch.feedback.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pitch.feedback.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                    Problem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {pitch.problem}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                    Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {pitch.solution}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Target Market
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {pitch.targetMarket}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Unique Selling Point
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {pitch.uniqueSellingPoint}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Call to Action */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {pitch.status === 'Seeking Investment' 
                        ? 'Interested in investing?' 
                        : pitch.status === 'Seeking Feedback' 
                          ? 'Have feedback on this pitch?' 
                          : 'Interested in this startup?'}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {pitch.status === 'Seeking Investment' 
                        ? 'Connect with the founder to discuss investment opportunities.' 
                        : pitch.status === 'Seeking Feedback' 
                          ? 'Share your thoughts and help improve this pitch.' 
                          : 'Connect with the founder to learn more.'}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    {pitch.status === 'Seeking Feedback' ? (
                      <Button 
                        onClick={() => setActiveTab("feedback")}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Give Feedback
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          // In a real app, this would open a chat or contact form
                          toast({
                            title: "Contact initiated",
                            description: `A message has been sent to ${pitch.user?.name}`,
                          });
                        }}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Contact Founder
                      </Button>
                    )}
                    
                    {isOwner && (
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/pitches/edit/${pitch.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Pitch
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 gap-6">
              {pitch.businessModel && (
                <Card className="overflow-hidden">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2 text-primary" />
                            Business Model
                          </CardTitle>
                          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-line">
                          {pitch.businessModel}
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
              
              {pitch.marketOpportunity && (
                <Card className="overflow-hidden">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                            Market Opportunity
                          </CardTitle>
                          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-line">
                          {pitch.marketOpportunity}
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pitch.competitiveLandscape && (
                  <Card className="overflow-hidden">
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-base">
                              <Users className="h-5 w-5 mr-2 text-primary" />
                              Competitive Landscape
                            </CardTitle>
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <p className="text-gray-700 whitespace-pre-line">
                            {pitch.competitiveLandscape}
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
                
                {pitch.revenueModel && (
                  <Card className="overflow-hidden">
                    <Collapsible>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-base">
                              <DollarSign className="h-5 w-5 mr-2 text-primary" />
                              Revenue Model
                            </CardTitle>
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent>
                          <p className="text-gray-700 whitespace-pre-line">
                            {pitch.revenueModel}
                          </p>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pitch.goToMarketStrategy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base">
                        <Target className="h-5 w-5 mr-2 text-primary" />
                        Go-to-Market Strategy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {pitch.goToMarketStrategy}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {pitch.traction && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Traction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {pitch.traction}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pitch.teamBackground && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        Team Background
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {pitch.teamBackground}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {pitch.financialProjections && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base">
                        <LineChart className="h-5 w-5 mr-2 text-primary" />
                        Financial Projections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {pitch.financialProjections}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pitch.fundingNeeds && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base">
                        <DollarSign className="h-5 w-5 mr-2 text-primary" />
                        Funding Needs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {pitch.fundingNeeds}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {pitch.milestones && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                        Milestones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">
                        {pitch.milestones}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6 mt-6" id="feedback-section">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Feedback ({pitch.feedback?.length || 0})
              </h3>
              
              {!isOwner && (
                <Button 
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  variant={showFeedbackForm ? "outline" : "default"}
                  className={showFeedbackForm ? "bg-gray-100" : "bg-primary hover:bg-primary/90"}
                >
                  {showFeedbackForm ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Give Feedback
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {showFeedbackForm && !isOwner && (
              <Card className="border-primary/20 shadow-md animate-in fade-in-50 duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Share Your Feedback</CardTitle>
                  <CardDescription>
                    Your insights can help the founder improve their pitch and business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Rating (optional)
                        </label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              className="focus:outline-none transition-all duration-150"
                              onClick={() => setFeedbackRating(rating)}
                            >
                              <Star 
                                className={`h-6 w-6 ${
                                  rating <= feedbackRating 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-gray-300 hover:text-yellow-200'
                                }`} 
                              />
                            </button>
                          ))}
                          {feedbackRating > 0 && (
                            <button 
                              className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                              onClick={() => setFeedbackRating(0)}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                          Feedback Category
                        </label>
                        <select
                          className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          value={feedbackCategory}
                          onChange={(e) => setFeedbackCategory(e.target.value)}
                        >
                          <option value="general">General Feedback</option>
                          <option value="product">Product/Solution</option>
                          <option value="market">Market/Opportunity</option>
                          <option value="business">Business Model</option>
                          <option value="team">Team</option>
                          <option value="financials">Financials/Funding</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Your Feedback
                      </label>
                      <Textarea
                        placeholder="Share your thoughts, suggestions, or questions about this pitch..."
                        className="min-h-[150px] resize-y"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Be constructive and specific in your feedback to help the founder improve.
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSubmitFeedback}
                        disabled={!feedbackText.trim() || submitFeedbackMutation.isPending}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {submitFeedbackMutation.isPending ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </div>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Feedback
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="space-y-4" id="feedback-list">
              
              {pitch.feedback && pitch.feedback.length > 0 ? (
                <div className="space-y-4">
                  {pitch.feedback.map((feedback: PitchFeedback) => (
                    <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={feedback.user?.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(feedback.user?.name || "")}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                              <div>
                                <div className="font-medium">{feedback.user?.name}</div>
                                <div className="text-sm text-gray-500 flex flex-wrap items-center gap-1">
                                  <span>{feedback.user?.title || "Member"}</span>
                                  <span>•</span>
                                  <span>{formatDate(feedback.createdAt)}</span>
                                  {feedback.category && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs font-normal">
                                        {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {feedback.rating && (
                                <div className="flex mt-1 sm:mt-0">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= feedback.rating! 
                                          ? 'text-yellow-400 fill-yellow-400' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-2 text-gray-700 whitespace-pre-line">
                              {feedback.content}
                            </div>
                            
                            {isOwner && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Reply
                                </Button>
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  Thank
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <div className="flex flex-col items-center justify-center py-4">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No feedback yet</h3>
                      <p className="text-gray-500 mb-4 max-w-md">
                        {isOwner 
                          ? "Your pitch hasn't received any feedback yet. Share it with others to get insights."
                          : "Be the first to provide feedback on this pitch"}
                      </p>
                      
                      {!isOwner && !showFeedbackForm && (
                        <Button 
                          onClick={() => setShowFeedbackForm(true)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Give Feedback
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Contact Founder Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Founder</DialogTitle>
            <DialogDescription>
              Send a message to the founder of {pitch.title}. They will receive your message via email and can respond directly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <input
                id="subject"
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Interested in your pitch"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Write your message here..."
                className="min-h-[150px]"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Be specific about why you're reaching out. This helps the founder understand your interest.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowContactModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!contactMessage.trim()) {
                  toast({
                    title: "Error",
                    description: "Please enter a message",
                    variant: "destructive",
                  });
                  return;
                }
                
                contactFounderMutation.mutate({
                  subject: contactSubject.trim() || `Message about ${pitch.title}`,
                  message: contactMessage
                });
              }}
              disabled={contactFounderMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {contactFounderMutation.isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}