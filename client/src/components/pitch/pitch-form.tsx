import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { PitchCategory, PitchStage, PitchStatus, BusinessPitch } from "@/types/pitch";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Briefcase, 
  Target, 
  Users, 
  DollarSign, 
  LineChart, 
  BarChart4, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle2, 
  Image as ImageIcon,
  Upload,
  Save,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle
} from "lucide-react";

// Define the form schema with Zod
const pitchFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(150, "Tagline must be less than 150 characters"),
  category: z.string(),
  stage: z.string(),
  status: z.string(),
  isPublic: z.boolean().default(false),
  
  // Elevator pitch sections (required)
  problem: z.string().min(50, "Problem statement must be at least 50 characters"),
  solution: z.string().min(50, "Solution description must be at least 50 characters"),
  targetMarket: z.string().min(30, "Target market must be at least 30 characters"),
  uniqueSellingPoint: z.string().min(30, "Unique selling point must be at least 30 characters"),
  
  // Detailed pitch sections (optional)
  businessModel: z.string().optional(),
  marketOpportunity: z.string().optional(),
  competitiveLandscape: z.string().optional(),
  revenueModel: z.string().optional(),
  goToMarketStrategy: z.string().optional(),
  traction: z.string().optional(),
  teamBackground: z.string().optional(),
  financialProjections: z.string().optional(),
  fundingNeeds: z.string().optional(),
  milestones: z.string().optional(),
  
  // Additional details
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  location: z.string().optional(),
  teamSize: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  fundingGoal: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  currentFunding: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
});

type PitchFormValues = z.infer<typeof pitchFormSchema>;

interface PitchFormProps {
  initialData?: BusinessPitch;
  isEditing?: boolean;
}

export default function PitchForm({ initialData, isEditing = false }: PitchFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("elevator-pitch");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Initialize form with default values or existing pitch data
  const form = useForm<PitchFormValues>({
    resolver: zodResolver(pitchFormSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      tagline: initialData.tagline,
      category: initialData.category,
      stage: initialData.stage,
      status: initialData.status,
      isPublic: initialData.isPublic,
      problem: initialData.problem,
      solution: initialData.solution,
      targetMarket: initialData.targetMarket,
      uniqueSellingPoint: initialData.uniqueSellingPoint,
      businessModel: initialData.businessModel || "",
      marketOpportunity: initialData.marketOpportunity || "",
      competitiveLandscape: initialData.competitiveLandscape || "",
      revenueModel: initialData.revenueModel || "",
      goToMarketStrategy: initialData.goToMarketStrategy || "",
      traction: initialData.traction || "",
      teamBackground: initialData.teamBackground || "",
      financialProjections: initialData.financialProjections || "",
      fundingNeeds: initialData.fundingNeeds || "",
      milestones: initialData.milestones || "",
      website: initialData.website || "",
      location: initialData.location || "",
      teamSize: initialData.teamSize?.toString() || "",
      fundingGoal: initialData.fundingGoal?.toString() || "",
      currentFunding: initialData.currentFunding?.toString() || "",
    } : {
      title: "",
      tagline: "",
      category: "Other",
      stage: "Idea",
      status: "Draft",
      isPublic: false,
      problem: "",
      solution: "",
      targetMarket: "",
      uniqueSellingPoint: "",
      businessModel: "",
      marketOpportunity: "",
      competitiveLandscape: "",
      revenueModel: "",
      goToMarketStrategy: "",
      traction: "",
      teamBackground: "",
      financialProjections: "",
      fundingNeeds: "",
      milestones: "",
      website: "",
      location: "",
      teamSize: "",
      fundingGoal: "",
      currentFunding: "",
    }
  });
  
  // Set image previews if editing an existing pitch
  useEffect(() => {
    if (initialData) {
      if (initialData.coverImage) {
        setCoverImagePreview(initialData.coverImage);
      }
      if (initialData.logo) {
        setLogoPreview(initialData.logo);
      }
    }
  }, [initialData]);
  
  // Calculate completion percentage based on filled fields
  useEffect(() => {
    const values = form.getValues();
    const requiredFields = ['title', 'tagline', 'category', 'stage', 'problem', 'solution', 'targetMarket', 'uniqueSellingPoint'];
    const optionalFields = [
      'businessModel', 'marketOpportunity', 'competitiveLandscape', 'revenueModel', 
      'goToMarketStrategy', 'traction', 'teamBackground', 'financialProjections', 
      'fundingNeeds', 'milestones', 'website', 'location', 'teamSize', 'fundingGoal', 'currentFunding'
    ];
    
    // Count filled required fields
    const filledRequired = requiredFields.filter(field => 
      values[field as keyof PitchFormValues] && 
      String(values[field as keyof PitchFormValues]).trim().length > 0
    ).length;
    
    // Count filled optional fields
    const filledOptional = optionalFields.filter(field => 
      values[field as keyof PitchFormValues] && 
      String(values[field as keyof PitchFormValues]).trim().length > 0
    ).length;
    
    // Calculate percentage (required fields have more weight)
    const requiredWeight = 0.7;
    const optionalWeight = 0.3;
    
    const requiredPercentage = (filledRequired / requiredFields.length) * requiredWeight * 100;
    const optionalPercentage = (filledOptional / optionalFields.length) * optionalWeight * 100;
    
    const totalPercentage = Math.min(100, Math.round(requiredPercentage + optionalPercentage));
    setCompletionPercentage(totalPercentage);
  }, [form.watch()]);
  
  // Handle cover image upload
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle logo upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Create or update pitch mutation
  const pitchMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const url = isEditing 
        ? `/api/pitches/${initialData?.id}` 
        : '/api/pitches';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save pitch");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pitches'] });
      toast({
        title: isEditing ? "Pitch updated" : "Pitch created",
        description: isEditing 
          ? "Your pitch has been successfully updated" 
          : "Your pitch has been successfully created",
      });
      
      // Redirect to the pitch page
      router.push(`/pitches/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save pitch. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: PitchFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create or edit a pitch",
        variant: "destructive",
      });
      return;
    }
    
    // Create FormData for file uploads
    const formData = new FormData();
    
    // Add all form values
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Add user ID
    formData.append('userId', String(user.id));
    
    // Add files if present
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    
    if (logo) {
      formData.append('logo', logo);
    }
    
    // Submit the form
    pitchMutation.mutate(formData);
  };
  
  // Categories for the select dropdown
  const pitchCategories: PitchCategory[] = [
    'Fintech', 
    'E-commerce', 
    'AgriTech', 
    'HealthTech', 
    'EdTech', 
    'CleanTech', 
    'AI/ML', 
    'SaaS', 
    'Hardware', 
    'Marketplace', 
    'Consumer', 
    'Enterprise', 
    'Other'
  ];
  
  // Stages for the select dropdown
  const pitchStages: PitchStage[] = [
    'Idea', 
    'Prototype', 
    'MVP', 
    'Pre-seed', 
    'Seed', 
    'Series A', 
    'Series B+', 
    'Profitable'
  ];
  
  // Statuses for the select dropdown
  const pitchStatuses: PitchStatus[] = [
    'Draft', 
    'Published', 
    'Seeking Feedback', 
    'Seeking Investment', 
    'Archived'
  ];
  
  return (
    <div className="max-w-5xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header with completion progress */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Your Pitch" : "Create a New Pitch"}
              </h1>
              <p className="text-gray-500 mt-1">
                {isEditing 
                  ? "Update your business pitch details" 
                  : "Share your business idea with potential investors and get feedback"}
              </p>
            </div>
            
            <div className="flex flex-col items-end space-y-2 min-w-[200px]">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-gray-700">Completion</span>
                <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="w-full" />
            </div>
          </div>
          
          {/* Main form content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left column - Basic info */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2 text-primary" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about your startup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Startup Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TechInnovate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Revolutionizing fintech with AI" {...field} />
                        </FormControl>
                        <FormDescription>
                          A short, catchy phrase that describes your business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pitchCategories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stage*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pitchStages.map((stage) => (
                                <SelectItem key={stage} value={stage}>
                                  {stage}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pitchStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              {field.value ? (
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1 text-green-600" />
                                  Public
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <EyeOff className="h-4 w-4 mr-1 text-gray-600" />
                                  Private
                                </span>
                              )}
                            </FormLabel>
                            <FormDescription>
                              {field.value 
                                ? "Visible to all users" 
                                : "Only visible to you"}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="coverImage">Cover Image</Label>
                      <div className="mt-1 flex items-center">
                        {coverImagePreview ? (
                          <div className="relative w-full h-32 rounded-md overflow-hidden">
                            <img 
                              src={coverImagePreview} 
                              alt="Cover preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setCoverImage(null);
                                setCoverImagePreview(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="cover-upload" 
                            className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                          >
                            <div className="space-y-1 text-center">
                              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="text-sm text-gray-600">
                                <span className="font-medium text-primary hover:underline">
                                  Upload a cover image
                                </span>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, GIF up to 5MB
                                </p>
                              </div>
                            </div>
                            <input
                              id="cover-upload"
                              name="coverImage"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleCoverImageChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="logo">Logo</Label>
                      <div className="mt-1 flex items-center">
                        {logoPreview ? (
                          <div className="relative w-24 h-24 rounded-md overflow-hidden">
                            <img 
                              src={logoPreview} 
                              alt="Logo preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={() => {
                                setLogo(null);
                                setLogoPreview(null);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="logo-upload" 
                            className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                          >
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-6 w-6 text-gray-400" />
                              <div className="text-xs text-gray-500">
                                Upload logo
                              </div>
                            </div>
                            <input
                              id="logo-upload"
                              name="logo"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleLogoChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mumbai, India" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="e.g., 5" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fundingGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Funding Goal (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="e.g., 1000000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="currentFunding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Funding (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="e.g., 500000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Pitch details */}
            <div className="md:col-span-2 space-y-6">
              <Tabs 
                defaultValue="elevator-pitch" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="elevator-pitch" className="flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Elevator Pitch
                  </TabsTrigger>
                  <TabsTrigger value="detailed-pitch" className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Detailed Pitch
                  </TabsTrigger>
                </TabsList>
                
                {/* Elevator Pitch Tab */}
                <TabsContent value="elevator-pitch" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-primary" />
                        Problem Statement*
                      </CardTitle>
                      <CardDescription>
                        What problem are you solving? Why is it important?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="problem"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the problem your startup is addressing..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                        Solution*
                      </CardTitle>
                      <CardDescription>
                        How does your product or service solve this problem?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="solution"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain your solution..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2 text-primary" />
                        Target Market*
                      </CardTitle>
                      <CardDescription>
                        Who are your customers? What is your market size?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="targetMarket"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your target market..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Unique Selling Point*
                      </CardTitle>
                      <CardDescription>
                        What makes your solution unique? Why will customers choose you?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="uniqueSellingPoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain what makes your solution stand out..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("detailed-pitch")}
                    >
                      Next: Detailed Pitch
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Detailed Pitch Tab */}
                <TabsContent value="detailed-pitch" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-primary" />
                        Business Model
                      </CardTitle>
                      <CardDescription>
                        How does your business create, deliver, and capture value?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="businessModel"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your business model..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                        Market Opportunity
                      </CardTitle>
                      <CardDescription>
                        What is the size and growth potential of your market?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="marketOpportunity"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the market opportunity..." 
                                className="min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Users className="h-5 w-5 mr-2 text-primary" />
                          Competitive Landscape
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="competitiveLandscape"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Who are your competitors? How do you differentiate?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <DollarSign className="h-5 w-5 mr-2 text-primary" />
                          Revenue Model
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="revenueModel"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="How will you make money? What are your revenue streams?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Target className="h-5 w-5 mr-2 text-primary" />
                          Go-to-Market Strategy
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="goToMarketStrategy"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="How will you reach your customers?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                          Traction
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="traction"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="What progress have you made so far? Any key metrics or milestones?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Users className="h-5 w-5 mr-2 text-primary" />
                          Team Background
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="teamBackground"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Who is on your team? What relevant experience do they have?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <LineChart className="h-5 w-5 mr-2 text-primary" />
                          Financial Projections
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="financialProjections"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="What are your financial projections for the next 1-3 years?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <DollarSign className="h-5 w-5 mr-2 text-primary" />
                          Funding Needs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="fundingNeeds"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="How much funding do you need and how will you use it?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                          Milestones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="milestones"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="What are your key milestones for the next 6-18 months?" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-between space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("elevator-pitch")}
                    >
                      Back: Elevator Pitch
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to discard changes?")) {
                      router.back();
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const formValues = form.getValues();
                  const formData = new FormData();
                  
                  Object.entries(formValues).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                      formData.append(key, String(value));
                    }
                  });
                  
                  formData.append('userId', String(user?.id));
                  formData.append('status', 'Draft');
                  
                  if (coverImage) {
                    formData.append('coverImage', coverImage);
                  }
                  
                  if (logo) {
                    formData.append('logo', logo);
                  }
                  
                  pitchMutation.mutate(formData);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              
              <Button 
                type="submit" 
                disabled={pitchMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {pitchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEditing ? "Update Pitch" : "Create Pitch"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}