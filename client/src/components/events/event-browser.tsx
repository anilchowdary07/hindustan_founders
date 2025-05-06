import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import EventCard, { Event } from "./event-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search,
  Calendar,
  CalendarCheck,
  Star,
  Clock,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

// Categories
const EVENT_CATEGORIES = [
  "All Categories",
  "Networking",
  "Workshop",
  "Conference",
  "Webinar",
  "Hackathon",
  "Meetup",
  "Panel Discussion",
  "Pitch Event",
  "Demo Day",
];

// Event types
const EVENT_TYPES = [
  "All Types",
  "In-Person",
  "Virtual",
  "Hybrid",
];

interface EventBrowserProps {
  initialTab?: string;
  initialCategory?: string;
  showCreateButton?: boolean;
}

export default function EventBrowser({
  initialTab = "upcoming",
  initialCategory = "All Categories",
  showCreateButton = true,
}: EventBrowserProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [dateFilter, setDateFilter] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Fetch events
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events', activeTab, debouncedSearchQuery, categoryFilter, typeFilter, dateFilter],
    queryFn: async () => {
      let url = '/api/events?';
      
      if (activeTab === "registered" && user) {
        url += 'registered=true&';
      } else if (activeTab === "featured") {
        url += 'featured=true&';
      } else if (activeTab === "past") {
        url += 'past=true&';
      } else {
        // Default to upcoming
        url += 'upcoming=true&';
      }
      
      if (debouncedSearchQuery) {
        url += `search=${encodeURIComponent(debouncedSearchQuery)}&`;
      }
      
      if (categoryFilter !== "All Categories") {
        url += `category=${encodeURIComponent(categoryFilter)}&`;
      }
      
      if (typeFilter !== "All Types") {
        url += `type=${encodeURIComponent(typeFilter)}&`;
      }
      
      if (dateFilter !== "any") {
        url += `date=${encodeURIComponent(dateFilter)}&`;
      }
      
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
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be updated in the useQuery hook
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setTypeFilter("All Types");
    setDateFilter("any");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Events & Meetups</h2>
          <p className="text-gray-600 mt-1">
            Connect with the community at these upcoming events
          </p>
        </div>
        
        <div className="flex gap-2">
          {user && (
            <Button 
              variant="outline"
              onClick={() => router.push('/events/calendar')}
              className="hidden md:flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          )}
          
          {showCreateButton && user && (
            <Button 
              onClick={() => router.push('/events/create')}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Host an Event
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events by title, organizer, or location..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Search
              </Button>
            </div>
          </form>
          
          {showFilters && (
            <div className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="category-filter" className="text-sm font-medium block mb-1">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="type-filter" className="text-sm font-medium block mb-1">
                    Event Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="date-filter" className="text-sm font-medium block mb-1">
                    Date
                  </label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger id="date-filter">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="this-week">This week</SelectItem>
                      <SelectItem value="this-weekend">This weekend</SelectItem>
                      <SelectItem value="next-week">Next week</SelectItem>
                      <SelectItem value="this-month">This month</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="location-filter" className="text-sm font-medium block mb-1">
                    Location
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input 
                        id="location-filter" 
                        placeholder="City or region..."
                        className="w-full"
                      />
                    </div>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline"
                      title="Use my current location"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <div className="flex flex-wrap gap-2">
                  {categoryFilter !== "All Categories" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Category: {categoryFilter}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setCategoryFilter("All Categories")}
                      />
                    </Badge>
                  )}
                  {typeFilter !== "All Types" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {typeFilter}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setTypeFilter("All Types")}
                      />
                    </Badge>
                  )}
                  {dateFilter !== "any" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Date: {dateFilter.replace(/-/g, ' ')}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setDateFilter("any")}
                      />
                    </Badge>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="upcoming" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="registered" className="flex items-center">
            <CalendarCheck className="h-4 w-4 mr-2" />
            Registered
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Past
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading events...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
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
              </CardContent>
            </Card>
          ) : activeTab === "registered" && !user ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <CalendarCheck className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view your events</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You need to be logged in to see your registered events
                  </p>
                  <Button 
                    onClick={() => router.push('/login')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : events?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {activeTab === "registered" 
                      ? "You haven't registered for any events yet. Browse upcoming events and register for the ones you're interested in."
                      : activeTab === "past"
                        ? "No past events match your current filters."
                        : "No upcoming events match your current filters."}
                  </p>
                  {activeTab === "registered" ? (
                    <Button 
                      onClick={() => setActiveTab("upcoming")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Browse Events
                    </Button>
                  ) : (
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events?.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}