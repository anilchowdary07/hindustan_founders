import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/components/events/event-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Share2,
  ArrowLeft,
  CalendarPlus,
  CalendarCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Fetch event details
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/events/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }
      
      const data = await response.json();
      setIsRegistered(data.isRegistered || false);
      return data;
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch event attendees
  const { data: attendees, isLoading: isLoadingAttendees } = useQuery({
    queryKey: [`/api/events/${id}/attendees`],
    queryFn: async () => {
      if (!id) return [];
      
      const response = await fetch(`/api/events/${id}/attendees`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch attendees");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch event comments
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/events/${id}/comments`],
    queryFn: async () => {
      if (!id) return [];
      
      const response = await fetch(`/api/events/${id}/comments`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
  
  // Register for event mutation
  const registerEventMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Event ID is required");
      if (!user) throw new Error("You must be logged in to register");
      
      const response = await fetch(`/api/events/${id}/register`, {
        method: isRegistered ? 'DELETE' : 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update registration status");
      }
      
      return await response.json();
    },
    onMutate: () => {
      // Optimistic update
      setIsRegistered(!isRegistered);
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsRegistered(!isRegistered);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update registration status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/attendees`] });
      
      toast({
        title: isRegistered ? "Registration canceled" : "Registration successful",
        description: isRegistered 
          ? "You have canceled your registration for this event" 
          : "You have successfully registered for this event",
      });
    },
  });
  
  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!id) throw new Error("Event ID is required");
      if (!user) throw new Error("You must be logged in to comment");
      
      const response = await fetch(`/api/events/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setCommentText("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
      
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/events/${id}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  // Check if event is upcoming
  const isUpcoming = (event: Event) => {
    return new Date(event.startDate) > new Date();
  };
  
  // Check if event is happening now
  const isHappeningNow = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  };
  
  // Share event
  const shareEvent = async () => {
    if (!event) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      
      toast({
        title: "Link copied",
        description: "Event link has been copied to clipboard",
      });
    }
  };
  
  // Add to calendar
  const addToCalendar = () => {
    if (!event) return;
    
    // Google Calendar URL format
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDateFormatted = formatDateForCalendar(startDate);
    const endDateFormatted = formatDateForCalendar(endDate);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
  };
  
  // Handle registration
  const handleRegistration = () => {
    if (!event) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to register for events",
        variant: "default",
      });
      return;
    }
    
    if (!isUpcoming(event) && !isHappeningNow(event)) {
      toast({
        title: "Registration closed",
        description: "This event has already ended",
        variant: "default",
      });
      return;
    }
    
    registerEventMutation.mutate();
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to post comments",
        variant: "default",
      });
      return;
    }
    
    postCommentMutation.mutate(commentText);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Button>
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-6">
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push('/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Button>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading event</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                {error instanceof Error ? error.message : "The event you're looking for could not be found or has been removed."}
              </p>
              <Button 
                onClick={() => router.push('/events')}
                variant="outline"
              >
                Browse Other Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.push('/events')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {event.coverImage && (
              <div 
                className="h-64 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url(${event.coverImage})` }}
              >
                {event.isFeatured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-400 text-yellow-900">
                      <Star className="h-3 w-3 mr-1" />
                      Featured Event
                    </Badge>
                  </div>
                )}
              </div>
            )}
            
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {isHappeningNow(event) ? (
                  <Badge className="bg-green-100 text-green-800">Happening Now</Badge>
                ) : isUpcoming(event) ? (
                  <Badge variant="outline">Upcoming</Badge>
                ) : (
                  <Badge variant="secondary">Past Event</Badge>
                )}
                
                {event.categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant="outline"
                    className="ml-2"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              
              <CardTitle className="text-3xl">{event.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-gray-600">
                        {formatDate(event.startDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Time</div>
                      <div className="text-gray-600">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="text-gray-600">
                        {event.isVirtual ? 'Virtual Event' : event.location}
                        {event.isVirtual && event.meetingUrl && isRegistered && (
                          <div className="mt-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(event.meetingUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Join Meeting
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Attendees</div>
                      <div className="text-gray-600">
                        {event.attendeeCount} {event.attendeeCount === 1 ? 'person' : 'people'} attending
                        {event.maxAttendees && ` (${event.maxAttendees - event.attendeeCount} spots left)`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-3">About this event</h3>
                <div className="prose max-w-none">
                  <p>{event.description}</p>
                  {/* In a real app, this would be a rich text field with more details */}
                  <p>Join us for this exciting event where you'll have the opportunity to connect with other founders, learn from industry experts, and gain valuable insights to help grow your startup.</p>
                  <p>Whether you're just starting out or looking to scale your business, this event offers something for everyone in the startup ecosystem.</p>
                </div>
              </div>
              
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {event.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline"
                      className="text-xs"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                  <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Organized by</div>
                  <div className="text-sm">{event.organizer.name}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={shareEvent}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={addToCalendar}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
                
                <Button 
                  variant={isRegistered ? "outline" : "default"}
                  size="sm"
                  className={`flex items-center ${isRegistered ? 'border-green-500 text-green-600' : 'bg-primary hover:bg-primary/90'}`}
                  onClick={handleRegistration}
                  disabled={!isUpcoming(event) && !isHappeningNow(event) || registerEventMutation.isPending}
                >
                  {registerEventMutation.isPending ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isRegistered ? 'Canceling...' : 'Registering...'}
                    </div>
                  ) : isRegistered ? (
                    <>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Registered
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Comments Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Discussion</CardTitle>
                <CardDescription>
                  Join the conversation about this event
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="mb-6">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Ask a question or leave a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="mb-2"
                        />
                        <Button 
                          type="submit"
                          disabled={postCommentMutation.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {postCommentMutation.isPending ? (
                            <div className="flex items-center">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Posting...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Send className="h-4 w-4 mr-2" />
                              Post Comment
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-gray-600">
                      Please <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>sign in</Button> to join the discussion.
                    </p>
                  </div>
                )}
                
                {isLoadingComments ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-gray-600">Loading comments...</span>
                  </div>
                ) : comments?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet. Be the first to start the discussion!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments?.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <div className="font-medium">{comment.author.name}</div>
                            <div className="text-xs text-gray-500 ml-2">
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                          <div className="mt-1 text-gray-700">{comment.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleRegistration}
                disabled={!isUpcoming(event) && !isHappeningNow(event) || registerEventMutation.isPending}
              >
                {registerEventMutation.isPending ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isRegistered ? 'Canceling...' : 'Registering...'}
                  </div>
                ) : isRegistered ? (
                  <>
                    <CalendarCheck className="h-4 w-4 mr-2" />
                    Cancel Registration
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Register Now
                  </>
                )}
              </Button>
              
              <div className="text-sm text-gray-500 text-center">
                {event.maxAttendees && (
                  <div>
                    {event.maxAttendees - event.attendeeCount} spots left out of {event.maxAttendees}
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{event.isVirtual ? 'Virtual Event' : event.location}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={shareEvent}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={addToCalendar}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendees ({event.attendeeCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAttendees ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600 text-sm">Loading...</span>
                </div>
              ) : attendees?.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No attendees yet. Be the first to register!
                </div>
              ) : (
                <div className="space-y-3">
                  {attendees?.slice(0, 5).map((attendee: any) => (
                    <div key={attendee.id} className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={attendee.avatar} alt={attendee.name} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-medium">{attendee.name}</div>
                    </div>
                  ))}
                  
                  {attendees?.length > 5 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                    >
                      View all {event.attendeeCount} attendees
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                  <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg">{event.organizer.name}</div>
                  <div className="text-sm text-gray-500">Event Organizer</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Experienced event organizer specializing in startup and tech community gatherings.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/profile/${event.organizer.id}`)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}