import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Eye,
  Clock,
  Image,
  Tag,
  Loader2,
  AlertCircle,
  Lock,
  Calendar,
  MapPin,
  Users,
  CalendarPlus,
} from "lucide-react";

// Categories
const EVENT_CATEGORIES = [
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

// Common tags
const COMMON_TAGS = [
  "startup",
  "funding",
  "networking",
  "tech",
  "innovation",
  "entrepreneurship",
  "product",
  "marketing",
  "design",
  "ai",
  "blockchain",
  "remote",
  "virtual",
  "community",
  "founders",
];

export default function CreateEventPage() {
  const router = useRouter();
  const { id } = router.query; // For edit mode
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  const isEditMode = !!id;
  
  // Form state
  const [activeTab, setActiveTab] = useState("details");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    isVirtual: false,
    meetingUrl: "",
    coverImage: null as File | null,
    coverImageUrl: "",
    category: "",
    tags: [] as string[],
    maxAttendees: "",
    isDraft: true,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      // In a real app, this would fetch the event data from the API
      // For now, we'll simulate it with a timeout
      const timer = setTimeout(() => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const formatDateForInput = (date: Date) => {
          return date.toISOString().split('T')[0];
        };
        
        const formatTimeForInput = (date: Date) => {
          return date.toTimeString().split(' ')[0].substring(0, 5);
        };
        
        setFormData({
          title: "Founder Networking Mixer",
          description: "Join us for an evening of networking with fellow founders and investors. Share your experiences, learn from others, and make valuable connections.",
          startDate: formatDateForInput(tomorrow),
          startTime: "18:00",
          endDate: formatDateForInput(tomorrow),
          endTime: "21:00",
          location: "Tech Hub, 123 Startup Street, San Francisco, CA",
          isVirtual: false,
          meetingUrl: "",
          coverImage: null,
          coverImageUrl: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "Networking",
          tags: ["networking", "founders", "startup"],
          maxAttendees: "50",
          isDraft: false,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isEditMode, id]);
  
  // Create/update event mutation
  const eventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) {
        throw new Error("You must be logged in to create events");
      }
      
      const url = isEditMode ? `/api/events/${id}` : '/api/events';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} event`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Event ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      
      // Redirect to event detail page
      router.push(`/events/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} event. Please try again.`,
        variant: "destructive",
      });
    },
  });
  
  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Cover image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, GIF, or WebP image",
          variant: "destructive",
        });
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        coverImage: file,
        coverImageUrl: URL.createObjectURL(file),
      }));
    }
  };
  
  // Remove cover image
  const removeCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: null,
      coverImageUrl: "",
    }));
  };
  
  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };
  
  // Add common tag
  const addCommonTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };
  
  // Remove tag
  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }
    
    if (!formData.startTime) {
      errors.startTime = "Start time is required";
    }
    
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    }
    
    if (!formData.endTime) {
      errors.endTime = "End time is required";
    }
    
    // Check if end date/time is after start date/time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (endDateTime <= startDateTime) {
      errors.endDate = "End date/time must be after start date/time";
    }
    
    if (!formData.isVirtual && !formData.location.trim()) {
      errors.location = "Location is required for in-person events";
    }
    
    if (formData.isVirtual && !formData.meetingUrl.trim()) {
      errors.meetingUrl = "Meeting URL is required for virtual events";
    }
    
    if (formData.isVirtual && formData.meetingUrl.trim()) {
      try {
        new URL(formData.meetingUrl);
      } catch (e) {
        errors.meetingUrl = "Please enter a valid URL";
      }
    }
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (formData.maxAttendees && isNaN(Number(formData.maxAttendees))) {
      errors.maxAttendees = "Maximum attendees must be a number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show error toast
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create events",
        variant: "default"
      });
      return;
    }
    
    // Create form data
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    
    // Combine date and time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    data.append("startDate", startDateTime.toISOString());
    data.append("endDate", endDateTime.toISOString());
    
    data.append("isVirtual", formData.isVirtual.toString());
    
    if (formData.isVirtual) {
      data.append("meetingUrl", formData.meetingUrl);
    } else {
      data.append("location", formData.location);
    }
    
    data.append("category", formData.category);
    data.append("tags", JSON.stringify(formData.tags));
    
    if (formData.maxAttendees) {
      data.append("maxAttendees", formData.maxAttendees);
    }
    
    data.append("isDraft", (!publish).toString());
    
    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    } else if (formData.coverImageUrl && isEditMode) {
      data.append("coverImageUrl", formData.coverImageUrl);
    }
    
    // Submit form
    eventMutation.mutate(data);
  };
  
  // If not authenticated, show login prompt
  if (!isAuthLoading && !user) {
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
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Event" : "Create Event"}</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Lock className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Authentication Required</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                You need to be logged in to {isEditMode ? "edit" : "create"} events.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/events')}
                >
                  Browse Events
                </Button>
              </div>
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
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Event" : "Create Event"}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{isEditMode ? "Edit Event" : "Create New Event"}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Edit Mode
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>
                {isEditMode 
                  ? "Update your event details and settings" 
                  : "Create a new event to connect with the community"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {previewMode ? (
                <div className="space-y-6">
                  {formData.coverImageUrl && (
                    <div 
                      className="h-64 w-full bg-cover bg-center rounded-md"
                      style={{ backgroundImage: `url(${formData.coverImageUrl})` }}
                    />
                  )}
                  
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{formData.title || "Untitled Event"}</h1>
                    <p className="text-gray-600 mt-2">{formData.description || "No description provided"}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Date</div>
                          <div className="text-gray-600">
                            {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : "Not set"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Time</div>
                          <div className="text-gray-600">
                            {formData.startTime || "Not set"} - {formData.endTime || "Not set"}
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
                            {formData.isVirtual 
                              ? 'Virtual Event' 
                              : (formData.location || "Location not set")}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <div className="font-medium">Attendees</div>
                          <div className="text-gray-600">
                            {formData.maxAttendees 
                              ? `Limited to ${formData.maxAttendees} attendees` 
                              : "Unlimited attendees"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-6">
                      {formData.tags.map((tag) => (
                        <div 
                          key={tag} 
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={(e) => handleSubmit(e, false)}>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="details">Basic Details</TabsTrigger>
                      <TabsTrigger value="datetime">Date & Time</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="additional">Additional Info</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <Label htmlFor="title">
                          Event Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter event title"
                          className={`mt-1 ${formErrors.title ? 'border-red-500' : ''}`}
                        />
                        {formErrors.title && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="description">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe your event"
                          className={`mt-1 min-h-[120px] ${formErrors.description ? 'border-red-500' : ''}`}
                        />
                        {formErrors.description && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="category">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => handleSelectChange("category", value)}
                        >
                          <SelectTrigger id="category" className={`mt-1 ${formErrors.category ? 'border-red-500' : ''}`}>
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
                        {formErrors.category && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Cover Image</Label>
                        <div className="mt-1">
                          {formData.coverImageUrl ? (
                            <div className="space-y-2">
                              <div 
                                className="h-48 w-full bg-cover bg-center rounded-md"
                                style={{ backgroundImage: `url(${formData.coverImageUrl})` }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeCoverImage}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove Image
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md border-gray-300">
                              <label
                                htmlFor="cover-image-upload"
                                className="flex flex-col items-center cursor-pointer"
                              >
                                <Image className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm font-medium text-gray-700">
                                  Upload Cover Image
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                  JPG, PNG, GIF or WebP, max 5MB
                                </span>
                                <input
                                  id="cover-image-upload"
                                  type="file"
                                  className="hidden"
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  onChange={handleFileChange}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("datetime")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Next: Date & Time
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="datetime" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">
                            Start Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className={`mt-1 ${formErrors.startDate ? 'border-red-500' : ''}`}
                          />
                          {formErrors.startDate && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.startDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="startTime">
                            Start Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="startTime"
                            name="startTime"
                            type="time"
                            value={formData.startTime}
                            onChange={handleInputChange}
                            className={`mt-1 ${formErrors.startTime ? 'border-red-500' : ''}`}
                          />
                          {formErrors.startTime && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.startTime}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="endDate">
                            End Date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className={`mt-1 ${formErrors.endDate ? 'border-red-500' : ''}`}
                          />
                          {formErrors.endDate && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.endDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="endTime">
                            End Time <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="endTime"
                            name="endTime"
                            type="time"
                            value={formData.endTime}
                            onChange={handleInputChange}
                            className={`mt-1 ${formErrors.endTime ? 'border-red-500' : ''}`}
                          />
                          {formErrors.endTime && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.endTime}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("details")}
                        >
                          Back
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("location")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Next: Location
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="location" className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox 
                          id="isVirtual" 
                          checked={formData.isVirtual}
                          onCheckedChange={(checked) => 
                            handleCheckboxChange("isVirtual", checked as boolean)
                          }
                        />
                        <label
                          htmlFor="isVirtual"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          This is a virtual event
                        </label>
                      </div>
                      
                      {formData.isVirtual ? (
                        <div>
                          <Label htmlFor="meetingUrl">
                            Meeting URL <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="meetingUrl"
                            name="meetingUrl"
                            type="url"
                            value={formData.meetingUrl}
                            onChange={handleInputChange}
                            placeholder="https://zoom.us/j/123456789"
                            className={`mt-1 ${formErrors.meetingUrl ? 'border-red-500' : ''}`}
                          />
                          {formErrors.meetingUrl && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.meetingUrl}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Attendees will receive this link after registering
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="location">
                            Location <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Enter event location"
                            className={`mt-1 ${formErrors.location ? 'border-red-500' : ''}`}
                          />
                          {formErrors.location && (
                            <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("datetime")}
                        >
                          Back
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("additional")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Next: Additional Info
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="additional" className="space-y-4">
                      <div>
                        <Label htmlFor="maxAttendees">
                          Maximum Attendees
                        </Label>
                        <Input
                          id="maxAttendees"
                          name="maxAttendees"
                          type="number"
                          min="1"
                          value={formData.maxAttendees}
                          onChange={handleInputChange}
                          placeholder="Leave blank for unlimited"
                          className={`mt-1 ${formErrors.maxAttendees ? 'border-red-500' : ''}`}
                        />
                        {formErrors.maxAttendees && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.maxAttendees}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Set a limit for the number of attendees, or leave blank for unlimited
                        </p>
                      </div>
                      
                      <div>
                        <Label>
                          Tags
                        </Label>
                        <div className="flex mt-1 mb-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag and press Enter"
                            className="mr-2"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={addTag}
                            className="bg-primary hover:bg-primary/90"
                          >
                            Add
                          </Button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {formData.tags.map((tag) => (
                            <div 
                              key={tag} 
                              className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center text-sm"
                            >
                              #{tag}
                              <X 
                                className="h-3.5 w-3.5 ml-1.5 cursor-pointer text-gray-500 hover:text-gray-700" 
                                onClick={() => removeTag(tag)}
                              />
                            </div>
                          ))}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Common Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {COMMON_TAGS.filter(tag => !formData.tags.includes(tag)).slice(0, 10).map((tag) => (
                              <div 
                                key={tag} 
                                className="bg-gray-50 text-gray-700 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-gray-100"
                                onClick={() => addCommonTag(tag)}
                              >
                                + {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("location")}
                        >
                          Back
                        </Button>
                        <div className="space-x-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={eventMutation.isPending}
                          >
                            {eventMutation.isPending ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </div>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save as Draft
                              </>
                            )}
                          </Button>
                          <Button 
                            type="button"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={eventMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {eventMutation.isPending ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Publishing...
                              </div>
                            ) : (
                              <>
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Publish Event
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm">{formData.isDraft ? "Draft" : "Published"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Event Type</span>
                  <span className="text-sm">{formData.isVirtual ? "Virtual" : "In-Person"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Category</span>
                  <span className="text-sm">{formData.category || "Not set"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Attendee Limit</span>
                  <span className="text-sm">{formData.maxAttendees || "Unlimited"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Event Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Clear description:</span> Make sure your event description clearly explains what attendees can expect.
                </p>
                <p>
                  <span className="font-medium">Engaging title:</span> Create a title that captures attention and conveys the value of your event.
                </p>
                <p>
                  <span className="font-medium">Timing:</span> Choose a date and time that works well for your target audience.
                </p>
                <p>
                  <span className="font-medium">Location details:</span> Provide clear instructions for finding your venue or joining virtually.
                </p>
                <p>
                  <span className="font-medium">Promote early:</span> Start promoting your event at least 2-3 weeks in advance.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hosting Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Checkbox id="checklist-1" className="mr-2" />
                  <label htmlFor="checklist-1">Create event with clear details</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="checklist-2" className="mr-2" />
                  <label htmlFor="checklist-2">Add an engaging cover image</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="checklist-3" className="mr-2" />
                  <label htmlFor="checklist-3">Set appropriate date and time</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="checklist-4" className="mr-2" />
                  <label htmlFor="checklist-4">Provide location/meeting details</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="checklist-5" className="mr-2" />
                  <label htmlFor="checklist-5">Add relevant tags for discoverability</label>
                </div>
                <div className="flex items-center">
                  <Checkbox id="checklist-6" className="mr-2" />
                  <label htmlFor="checklist-6">Share event with your network</label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}