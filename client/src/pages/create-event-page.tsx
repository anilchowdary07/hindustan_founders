import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Event schema
const createEventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  date: z.date({
    required_error: "Event date is required",
  }),
  time: z.string().min(1, "Event time is required"),
  location: z.string().min(2, "Location is required"),
  type: z.string().min(1, "Event type is required"),
  organizer: z.string().min(2, "Organizer name is required"),
  price: z.string().optional(),
  maxAttendees: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  registrationLink: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type CreateEventValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      time: "",
      location: "",
      type: "meetup",
      organizer: "",
      price: "",
      maxAttendees: "",
      imageUrl: "",
      registrationLink: "",
      tags: "",
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (values: CreateEventValues) => {
      // In a real app, this would be an API call to create an event
      // For now, we'll simulate it with a timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Math.floor(Math.random() * 1000), ...values });
        }, 1000);
      });
      
      // Real implementation would be:
      // const res = await apiRequest("POST", "/api/events", values);
      // const data = await res.json();
      // return data;
    },
    onSuccess: (data) => {
      // In a real app, we would invalidate the events query
      // queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Event Created",
        description: "Your event has been created successfully",
      });
      
      navigate("/events");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  async function onSubmit(values: CreateEventValues) {
    // Format tags as an array
    const formattedValues = {
      ...values,
      tags: values.tags ? values.tags.split(",").map(tag => tag.trim()) : [],
    };
    
    mutation.mutate(formattedValues as any);
  }
  
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="mb-6">
          <Link href="/events">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> 
              Back to Events
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a New Event</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to create and publish a new event on Hindustan Founders.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the title of your event" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 6:00 PM - 9:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Physical address or 'Online'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="conference">Conference</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="meetup">Meetup</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                          <SelectItem value="hackathon">Hackathon</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about your event" 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizer</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of the organizing company/person" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Free, ₹500, or ₹1,000 - ₹2,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Leave blank if unlimited" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="registrationLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Link (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/register" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="startup, networking, tech (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/events")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}