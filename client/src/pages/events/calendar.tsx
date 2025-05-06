import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  AlertCircle,
  Plus,
  ArrowLeft,
  MapPin,
  Users,
  List,
} from "lucide-react";

// Days of the week
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Months
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function EventCalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Fetch events
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events', 'calendar', currentMonth, currentYear],
    queryFn: async () => {
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
      
      const url = `/api/events?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      return await response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Previous month days to show
    const prevMonthDays = [];
    if (startingDayOfWeek > 0) {
      const prevMonth = new Date(currentYear, currentMonth, 0);
      const prevMonthDaysCount = prevMonth.getDate();
      
      for (let i = prevMonthDaysCount - startingDayOfWeek + 1; i <= prevMonthDaysCount; i++) {
        prevMonthDays.push({
          date: new Date(currentYear, currentMonth - 1, i),
          isCurrentMonth: false,
          events: []
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      
      // Find events for this day
      const dayEvents = events?.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.getDate() === i && 
               eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear;
      }) || [];
      
      currentMonthDays.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    
    // Next month days to fill the grid
    const nextMonthDays = [];
    const totalDaysShown = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDaysShown; // 6 rows of 7 days
    
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
        events: []
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Get events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate || !events) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
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
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Calendar days
  const calendarDays = generateCalendarDays();
  
  // Selected date events
  const selectedDateEvents = selectedDate ? getEventsForSelectedDate() : [];
  
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
        <h1 className="text-2xl font-bold">Event Calendar</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={goToPreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-bold mx-2">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={goToNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={goToToday}
                  >
                    Today
                  </Button>
                  <Tabs 
                    value={calendarView} 
                    onValueChange={(value) => setCalendarView(value as "month" | "week" | "day")}
                    className="hidden md:block"
                  >
                    <TabsList>
                      <TabsTrigger value="month">Month</TabsTrigger>
                      <TabsTrigger value="week">Week</TabsTrigger>
                      <TabsTrigger value="day">Day</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => router.push('/events')}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-gray-600">Loading events...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading events</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {error instanceof Error ? error.message : "There was an error loading the events. Please try again."}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="mt-4">
                  {/* Calendar header - days of week */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAYS_OF_WEEK.map((day) => (
                      <div 
                        key={day} 
                        className="text-center text-sm font-medium text-gray-500 py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <div 
                        key={index}
                        className={`
                          min-h-[100px] p-1 border rounded-md cursor-pointer transition-colors
                          ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                          ${isToday(day.date) ? 'border-primary' : 'border-gray-200'}
                          ${selectedDate && day.date.getDate() === selectedDate.getDate() && 
                            day.date.getMonth() === selectedDate.getMonth() && 
                            day.date.getFullYear() === selectedDate.getFullYear() 
                              ? 'ring-2 ring-primary ring-offset-2' : ''}
                          hover:bg-gray-50
                        `}
                        onClick={() => handleDateSelect(day.date)}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`
                            text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center
                            ${isToday(day.date) ? 'bg-primary text-white' : ''}
                          `}>
                            {day.date.getDate()}
                          </span>
                          
                          {day.events.length > 0 && (
                            <Badge className="text-xs">{day.events.length}</Badge>
                          )}
                        </div>
                        
                        <div className="mt-1 space-y-1 max-h-[80px] overflow-hidden">
                          {day.events.slice(0, 2).map((event) => (
                            <div 
                              key={event.id}
                              className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                              title={event.title}
                            >
                              {formatTime(event.startDate)} {event.title}
                            </div>
                          ))}
                          
                          {day.events.length > 2 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{day.events.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? formatDate(selectedDate) : "Select a date"}
              </CardTitle>
              {selectedDate && (
                <CardDescription>
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent>
              {!selectedDate ? (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    Select a date to view events
                  </p>
                </div>
              ) : selectedDateEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">
                    No events scheduled for this day
                  </p>
                  {user && (
                    <Button 
                      onClick={() => router.push('/events/create')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <h3 className="font-medium mb-1">{event.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{event.isVirtual ? 'Virtual Event' : event.location}</span>
                      </div>
                      
                      {event.isRegistered ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
                          <CalendarCheck className="h-3 w-3 mr-1" />
                          Registered
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            {user && selectedDate && (
              <CardFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => router.push('/events/create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}