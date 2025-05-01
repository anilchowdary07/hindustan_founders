import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreateEventPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "conference",
    price: "",
    maxAttendees: "",
    isVirtual: false,
    virtualLink: "",
    tags: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.title || !formData.description || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // In a real app, this would be an API call
    setTimeout(() => {
      toast({
        title: "Event Created",
        description: "Your event has been created successfully"
      });
      setIsSubmitting(false);
      navigate("/events");
    }, 1500);
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1"
            onClick={() => navigate("/events")}
          >
            <ArrowLeft className="h-4 w-4" /> 
            Back to Events
          </Button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a New Event</h1>
          <p className="text-muted-foreground mt-2">
            Host an event for the Hindustan Founders community
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Fill in the details of your event below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="Enter a title for your event"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input 
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input 
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price (leave blank for free)</Label>
                  <Input 
                    id="price"
                    name="price"
                    placeholder="₹0"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isVirtual" 
                  checked={formData.isVirtual}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("isVirtual", checked as boolean)
                  }
                />
                <Label htmlFor="isVirtual">This is a virtual event</Label>
              </div>
              
              {formData.isVirtual ? (
                <div className="space-y-2">
                  <Label htmlFor="virtualLink">Virtual Event Link</Label>
                  <Input 
                    id="virtualLink"
                    name="virtualLink"
                    placeholder="https://zoom.us/j/123456789"
                    value={formData.virtualLink}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input 
                    id="location"
                    name="location"
                    placeholder="Enter the venue address"
                    value={formData.location}
                    onChange={handleChange}
                    required={!formData.isVirtual}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Maximum Attendees (optional)</Label>
                  <Input 
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input 
                    id="tags"
                    name="tags"
                    placeholder="startup, funding, networking"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Event Description *</Label>
                <Textarea 
                  id="description"
                  name="description"
                  placeholder="Describe your event in detail..."
                  className="min-h-[200px]"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <CardFooter className="flex justify-end space-x-4 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/events")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Event"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}