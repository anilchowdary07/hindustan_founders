import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Share2,
  MoreHorizontal,
  ExternalLink,
  CalendarPlus,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  meetingUrl?: string;
  coverImage?: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendeeCount: number;
  maxAttendees?: number;
  categories: string[];
  tags: string[];
  isRegistered?: boolean;
  isFeatured?: boolean;
  url: string;
}

interface EventCardProps {
  event: Event;
  isDetailed?: boolean;
}

export default function EventCard({ event, isDetailed = false }: EventCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isRegistered, setIsRegistered] = useState(event.isRegistered || false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
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
  const isUpcoming = () => {
    return new Date(event.startDate) > new Date();
  };
  
  // Check if event is happening now
  const isHappeningNow = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  };
  
  // Get event status badge
  const getEventStatusBadge = () => {
    if (isHappeningNow()) {
      return <Badge className="bg-green-100 text-green-800">Happening Now</Badge>;
    } else if (isUpcoming()) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else {
      return <Badge variant="secondary">Past Event</Badge>;
    }
  };
  
  // Register for event mutation
  const registerEventMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to register for events");
      }
      
      const response = await fetch(`/api/events/${event.id}/register`, {
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
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      toast({
        title: isRegistered ? "Registration canceled" : "Registration successful",
        description: isRegistered 
          ? "You have canceled your registration for this event" 
          : "You have successfully registered for this event",
      });
    },
  });
  
  // Share event
  const shareEvent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: event.url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(event.url);
      
      toast({
        title: "Link copied",
        description: "Event link has been copied to clipboard",
      });
    }
  };
  
  // Add to calendar with multiple calendar options
  const addToCalendar = (calendarType: string = 'google') => {
    // Format dates for calendar
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDateFormatted = formatDateForCalendar(startDate);
    const endDateFormatted = formatDateForCalendar(endDate);
    
    // Create calendar URLs based on type
    let calendarUrl = '';
    
    switch (calendarType) {
      case 'google':
        calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
        break;
      case 'outlook':
        calendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
        break;
      case 'yahoo':
        // Yahoo uses different format
        const yahooStartDate = startDateFormatted;
        const yahooEndDate = endDateFormatted;
        calendarUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(event.title)}&st=${yahooStartDate}&et=${yahooEndDate}&desc=${encodeURIComponent(event.description)}&in_loc=${encodeURIComponent(event.location)}`;
        break;
      case 'ical':
        // For iCal, we'll generate a downloadable .ics file
        const icalContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `SUMMARY:${event.title}`,
          `DTSTART:${startDateFormatted}`,
          `DTEND:${endDateFormatted}`,
          `DESCRIPTION:${event.description}`,
          `LOCATION:${event.location}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\n');
        
        const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.replace(/\s+/g, '-')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return; // Don't open a new window for iCal
    }
    
    if (calendarUrl) {
      window.open(calendarUrl, '_blank');
    }
  };
  
  // Handle registration
  const handleRegistration = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to register for events",
        variant: "default",
      });
      return;
    }
    
    if (!isUpcoming() && !isHappeningNow()) {
      toast({
        title: "Registration closed",
        description: "This event has already ended",
        variant: "default",
      });
      return;
    }
    
    registerEventMutation.mutate();
  };
  
  // Navigate to event
  const navigateToEvent = () => {
    router.push(`/events/${event.id}`);
  };
  
  return (
    <Card className="overflow-hidden">
      {event.coverImage && (
        <div 
          className="h-48 w-full bg-cover bg-center cursor-pointer relative"
          style={{ backgroundImage: `url(${event.coverImage})` }}
          onClick={navigateToEvent}
        >
          {event.isFeatured && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-400 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className={event.coverImage ? "pt-4" : ""}>
        <div className="flex justify-between items-start">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {getEventStatusBadge()}
              
              {event.categories.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {event.categories[0]}
                </Badge>
              )}
            </div>
            
            <CardTitle 
              className="text-xl hover:text-primary cursor-pointer"
              onClick={navigateToEvent}
            >
              {event.title}
            </CardTitle>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem>
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Add to Calendar
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right">
                  <DropdownMenuItem onClick={() => addToCalendar('google')}>
                    Google Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addToCalendar('outlook')}>
                    Outlook Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addToCalendar('yahoo')}>
                    Yahoo Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addToCalendar('ical')}>
                    Download .ICS File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenuItem onClick={shareEvent}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Event
              </DropdownMenuItem>
              {event.isVirtual && event.meetingUrl && isRegistered && (
                <DropdownMenuItem onClick={() => window.open(event.meetingUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Meeting
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription>
          {event.description}
        </CardDescription>
      </CardHeader>
      
      {isDetailed && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Date & Time</div>
                <div className="text-sm text-gray-600">
                  {formatDate(event.startDate)} • {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-sm text-gray-600">
                  {event.isVirtual ? 'Virtual Event' : event.location}
                </div>
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
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
            <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{event.organizer.name}</p>
            <div className="flex items-center text-xs text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              <span>
                {event.attendeeCount} {event.attendeeCount === 1 ? 'attendee' : 'attendees'}
                {event.maxAttendees && ` / ${event.maxAttendees}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isDetailed && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center"
              onClick={navigateToEvent}
            >
              Details
            </Button>
          )}
          
          <Button 
            variant={isRegistered ? "outline" : "default"}
            size="sm"
            className={`flex items-center ${isRegistered ? 'border-green-500 text-green-600' : 'bg-primary hover:bg-primary/90'}`}
            onClick={handleRegistration}
            disabled={!isUpcoming() && !isHappeningNow()}
          >
            {isRegistered ? (
              <>
                <CalendarCheck className="h-4 w-4 mr-1" />
                Registered
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4 mr-1" />
                Register
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}