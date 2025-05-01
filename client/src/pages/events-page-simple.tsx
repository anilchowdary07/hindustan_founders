import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Filter, Search, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    title: "Founder's Fireside Chat",
    description: "An intimate evening with successful founders sharing their journeys, challenges, and insights in a casual setting.",
    date: "June 5, 2025",
    time: "6:30 PM - 9:00 PM",
    location: "The Leela Palace, Bengaluru",
    type: "networking",
    attendees: 100,
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "Hindustan Founders Network",
    price: "₹1,500",
    featured: false,
    tags: ["founders", "networking", "mentorship"]
  },
  {
    id: 3,
    title: "Product Development Workshop",
    description: "A hands-on workshop focused on product development methodologies, user research, and prototyping techniques.",
    date: "May 25, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "T-Hub, Hyderabad",
    type: "workshop",
    attendees: 50,
    image: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "Product Minds",
    price: "₹3,000",
    featured: false,
    tags: ["product", "design", "workshop"]
  },
  {
    id: 4,
    title: "Venture Capital Masterclass",
    description: "Learn how to approach VCs, structure your pitch, and negotiate term sheets from leading investors in the Indian ecosystem.",
    date: "July 10, 2025",
    time: "9:30 AM - 1:30 PM",
    location: "ITC Gardenia, Bengaluru",
    type: "seminar",
    attendees: 200,
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    organizer: "VC Connect",
    price: "₹5,000",
    featured: true,
    tags: ["funding", "venture capital", "pitching"]
  },
  {
    id: 5,
    title: "AI for Business Innovation Hackathon",
    description: "A 48-hour hackathon focused on developing AI solutions for real-world business challenges. Open to developers, data scientists, and business professionals.",
    date: "August 20-22, 2025",
    time: "Starts at 9:00 AM",
    location: "91springboard, Mumbai",
    type: "hackathon",
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
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("all");

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      searchTerm === "" || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      eventType === "all" || 
      event.type === eventType;
    
    return matchesSearch && matchesType;
  });

  const handleRegister = (eventId: number) => {
    toast({
      title: "Registration Successful",
      description: "You have been registered for this event",
    });
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground mt-1">
              Discover and join events in the Hindustan Founders community
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => {}}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button 
              onClick={() => navigate("/create-event")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={eventType} onValueChange={setEventType} className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="conference">Conferences</TabsTrigger>
            <TabsTrigger value="workshop">Workshops</TabsTrigger>
            <TabsTrigger value="networking">Networking</TabsTrigger>
            <TabsTrigger value="hackathon">Hackathons</TabsTrigger>
            <TabsTrigger value="seminar">Seminars</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <EventGrid 
              events={filteredEvents} 
              handleRegister={handleRegister}
            />
          </TabsContent>

          {["conference", "workshop", "networking", "hackathon", "seminar"].map(type => (
            <TabsContent key={type} value={type} className="space-y-4">
              <EventGrid 
                events={filteredEvents} 
                handleRegister={handleRegister}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}

interface EventGridProps {
  events: any[];
  handleRegister: (id: number) => void;
}

function EventGrid({ events, handleRegister }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No events found</h3>
        <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-48 overflow-hidden">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge variant={event.featured ? "default" : "outline"} className="mb-2">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </Badge>
              <div className="text-sm font-medium">{event.price}</div>
            </div>
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{event.date}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{event.description}</p>
            <div className="flex flex-col space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span>{event.attendees} attendees</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button onClick={() => handleRegister(event.id)}>
              Register
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}