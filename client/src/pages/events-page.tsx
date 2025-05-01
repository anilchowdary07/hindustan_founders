import { useState } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Filter, Search, Share2, Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample event data
const events = [
  {
    id: 1,
    title: "Startup India Summit 2025",
    description: "Join the largest gathering of startups, investors, and industry leaders in India to discuss the future of innovation and entrepreneurship.",
    date: "May 15, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Pragati Maidan, New Delhi",
    type: "conference",
    attendees: 1500,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "Startup India",
    price: "₹2,000",
    featured: true,
    tags: ["startup", "networking", "investment"]
  },
  {
    id: 2,
    title: "Venture Capital Masterclass",
    description: "Learn the ins and outs of venture capital funding from top investors and successful founders who have raised millions.",
    date: "May 20, 2025",
    time: "2:00 PM - 5:00 PM",
    location: "Online",
    type: "workshop",
    attendees: 500,
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "VentureX Academy",
    price: "₹1,500",
    featured: false,
    tags: ["vc", "funding", "education"]
  },
  {
    id: 3,
    title: "Tech Founders Meetup - Bangalore",
    description: "Monthly networking event for tech founders to connect, share experiences, and explore collaboration opportunities.",
    date: "May 25, 2025",
    time: "6:30 PM - 9:00 PM",
    location: "WeWork Galaxy, Bangalore",
    type: "networking",
    attendees: 150,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "Tech Founders Club",
    price: "Free",
    featured: false,
    tags: ["tech", "networking", "bangalore"]
  },
  {
    id: 4,
    title: "Women in Entrepreneurship Summit",
    description: "A platform to celebrate and support women entrepreneurs, featuring keynotes, panel discussions, and networking sessions.",
    date: "June 8, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Hyderabad International Convention Centre",
    type: "conference",
    attendees: 800,
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "Women Entrepreneurs Network",
    price: "₹1,200",
    featured: true,
    tags: ["women", "entrepreneurship", "diversity"]
  },
  {
    id: 5,
    title: "Product Management Bootcamp",
    description: "Intensive 2-day bootcamp covering product strategy, roadmapping, user research, and product analytics.",
    date: "June 15-16, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Taj Lands End, Mumbai",
    type: "workshop",
    attendees: 100,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "Product School India",
    price: "₹12,000",
    featured: false,
    tags: ["product", "management", "bootcamp"]
  },
  {
    id: 6,
    title: "AI in Business: Practical Applications",
    description: "Explore how AI is transforming businesses across industries and learn how to implement AI solutions in your organization.",
    date: "June 22, 2025",
    time: "11:00 AM - 3:00 PM",
    location: "ITC Gardenia, Bangalore",
    type: "seminar",
    attendees: 250,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "AI Business Forum",
    price: "₹3,500",
    featured: true,
    tags: ["ai", "technology", "business"]
  }
];

export default function EventsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("all");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = eventType === "all" || event.type === eventType;
    
    // Additional filters from dialog
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "upcoming" && new Date(event.date) > new Date()) ||
                       (dateFilter === "thisMonth" && new Date(event.date).getMonth() === new Date().getMonth());
    
    const matchesLocation = locationFilter === "all" || 
                           (locationFilter === "online" && event.location.toLowerCase() === "online") ||
                           (locationFilter === "inPerson" && event.location.toLowerCase() !== "online");
    
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && event.price === "Free") ||
                        (priceFilter === "paid" && event.price !== "Free");
    
    return matchesSearch && matchesType && matchesDate && matchesLocation && matchesPrice;
  });

  const handleShare = (event: any) => {
    setSelectedEvent(event);
    setShowShareDialog(true);
  };

  const shareEvent = (platform: string) => {
    if (!selectedEvent) return;
    
    const eventUrl = `https://hindustanfounders.net/events/${selectedEvent.id}`;
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=Join me at ${selectedEvent.title}&url=${encodeURIComponent(eventUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Join me at ${selectedEvent.title}: ${eventUrl}`)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(`Join me at ${selectedEvent.title}`)}&body=${encodeURIComponent(`I thought you might be interested in this event: ${selectedEvent.title}\n\n${selectedEvent.description}\n\nDate: ${selectedEvent.date}\nTime: ${selectedEvent.time}\nLocation: ${selectedEvent.location}\n\nLearn more: ${eventUrl}`)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(eventUrl)
          .then(() => {
            toast({
              title: "Link copied!",
              description: "Event link copied to clipboard",
            });
          })
          .catch(err => {
            console.error("Failed to copy link: ", err);
            toast({
              title: "Failed to copy link",
              description: "Please try again or share manually",
              variant: "destructive",
            });
          });
        setShowShareDialog(false);
        return;
    }
    
    // Open share URL in new window
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
    
    setShowShareDialog(false);
  };

  const registerForEvent = (eventId: number) => {
    toast({
      title: "Registration successful!",
      description: "You have been registered for this event.",
    });
  };

  const [, navigate] = useLocation();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-gray-600">Discover and join events in the startup ecosystem</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilterDialog(true)}
              className="sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={() => navigate("/create-event")}
              className="sm:w-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-8" onValueChange={setEventType}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="conference">Conferences</TabsTrigger>
            <TabsTrigger value="workshop">Workshops</TabsTrigger>
            <TabsTrigger value="networking">Networking</TabsTrigger>
            <TabsTrigger value="seminar">Seminars</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={() => {
                  setSearchTerm("");
                  setEventType("all");
                  setDateFilter("all");
                  setLocationFilter("all");
                  setPriceFilter("all");
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden flex flex-col h-full">
                    <div className="relative h-48">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      {event.featured && (
                        <Badge className="absolute top-2 right-2 bg-primary">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription className="text-sm">
                            By {event.organizer}
                          </CardDescription>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleShare(event)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {event.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{event.attendees} attendees</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2">
                      <div className="font-medium">{event.price}</div>
                      <Button onClick={() => registerForEvent(event.id)}>
                        Register
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="conference" className="mt-0">
            {/* Content will be filtered by the tab selection */}
          </TabsContent>
          
          <TabsContent value="workshop" className="mt-0">
            {/* Content will be filtered by the tab selection */}
          </TabsContent>
          
          <TabsContent value="networking" className="mt-0">
            {/* Content will be filtered by the tab selection */}
          </TabsContent>
          
          <TabsContent value="seminar" className="mt-0">
            {/* Content will be filtered by the tab selection */}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>
              Share this event with your network
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500">{selectedEvent.date}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button variant="outline" onClick={() => shareEvent("twitter")}>
                  Twitter
                </Button>
                <Button variant="outline" onClick={() => shareEvent("linkedin")}>
                  LinkedIn
                </Button>
                <Button variant="outline" onClick={() => shareEvent("facebook")}>
                  Facebook
                </Button>
                <Button variant="outline" onClick={() => shareEvent("whatsapp")}>
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => shareEvent("email")}>
                  Email
                </Button>
                <Button variant="outline" onClick={() => shareEvent("copy")}>
                  Copy Link
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Events</DialogTitle>
            <DialogDescription>
              Refine your event search
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Select date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="inPerson">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger id="price">
                  <SelectValue placeholder="Select price filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setDateFilter("all");
                setLocationFilter("all");
                setPriceFilter("all");
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
