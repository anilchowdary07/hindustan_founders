import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ChevronRight, Filter } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  location: string;
  online: boolean;
  category: string;
  organizer: string;
  imageUrl?: string;
}

export default function EventsSection() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Startup India Summit 2025",
      description: "The largest startup event in India, featuring top entrepreneurs, investors, and industry leaders.",
      date: new Date('2025-05-15T09:00:00'),
      location: "New Delhi",
      online: false,
      category: "Conference",
      organizer: "Startup India",
    },
    {
      id: 2,
      title: "Venture Capital Masterclass",
      description: "Learn how to raise venture capital for your startup from leading VCs.",
      date: new Date('2025-05-20T14:00:00'),
      location: "Online",
      online: true,
      category: "Workshop",
      organizer: "Indian Venture Capital Association",
    },
    {
      id: 3,
      title: "Bengaluru Tech Meetup",
      description: "Monthly networking event for tech professionals and founders.",
      date: new Date('2025-05-10T18:00:00'),
      location: "Bengaluru",
      online: false,
      category: "Networking",
      organizer: "TechBLR Community",
    },
  ]);
  
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };
  
  const formatTime = (date: Date) => {
    return format(date, 'hh:mm a');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Upcoming Events</h2>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>
      
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className={`bg-primary h-auto w-full sm:w-32 flex items-center justify-center p-4 text-white ${!event.imageUrl ? '' : 'hidden'}`}>
                <Calendar className="h-10 w-10" />
              </div>
              {event.imageUrl && (
                <div className="h-auto w-full sm:w-32 bg-gray-200">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{event.title}</CardTitle>
                      <div className="text-xs font-medium text-gray-500 mt-1">
                        Organized by {event.organizer}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.category}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-2">
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  <div className="flex items-center mt-3 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.date)} • {formatTime(event.date)}</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.location}</span>
                    {event.online && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Virtual</span>}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 flex justify-end">
                  <Button variant="outline" size="sm">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="outline" className="w-full">
          View All Events
        </Button>
      </div>
    </div>
  );
}