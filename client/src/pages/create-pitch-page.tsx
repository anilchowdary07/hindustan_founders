import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PitchStatus } from "@shared/schema";
import { ArrowLeft, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CreatePitchPage() {
  const [, params] = useRoute("/pitch/edit/:id");
  const pitchId = params?.id ? parseInt(params.id) : null;
  const isEditMode = !!pitchId;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    category: "",
    status: PitchStatus.IDEA,
    websiteLink: "",
    companyRegistrationStatus: "",
    elevatorPitch: {
      problem: "",
      solution: ""
    },
    businessModel: "",
    marketOpportunity: "",
    revenue: {
      model: "",
      growth: ""
    },
    fundingStage: ""
  });
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch pitch data if in edit mode
  const { isLoading: isPitchLoading } = useQuery({
    queryKey: [`/api/pitches/${pitchId}`],
    queryFn: () => apiRequest(`/api/pitches/${pitchId}`),
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
          category: data.category || "",
          status: data.status || PitchStatus.IDEA,
          websiteLink: data.websiteLink || "",
          companyRegistrationStatus: data.companyRegistrationStatus || "",
          elevatorPitch: {
            problem: data.elevatorPitch?.problem || "",
            solution: data.elevatorPitch?.solution || ""
          },
          businessModel: data.businessModel || "",
          marketOpportunity: data.marketOpportunity || "",
          revenue: {
            model: data.revenue?.model || "",
            growth: data.revenue?.growth || ""
          },
          fundingStage: data.fundingStage || ""
        });
      }
    }
  });
  
  // Create pitch mutation
  const createPitchMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/pitches", {
      method: "POST",
      data
    }),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your pitch has been created successfully.",
      });
      navigate(`/pitch/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create your pitch. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });
  
  // Update pitch mutation
  const updatePitchMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/pitches/${pitchId}`, {
      method: "PUT",
      data
    }),
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your pitch has been updated successfully.",
      });
      navigate(`/pitch/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update your pitch. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate required fields
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setActiveTab("basic");
      setIsSubmitting(false);
      return;
    }
    
    if (isEditMode) {
      updatePitchMutation.mutate(formData);
    } else {
      createPitchMutation.mutate(formData);
    }
  };
  
  const isFormComplete = () => {
    const requiredFields = ['name', 'description', 'location', 'category', 'status'];
    return requiredFields.every(field => !!formData[field as keyof typeof formData]);
  };
  
  if (isPitchLoading && isEditMode) {
    return (
      <Layout>
        <div className="flex items-center mb-6">
          <Link href="/pitch-room">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Pitch</h1>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Link href="/pitch-room">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Pitch Room
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Pitch" : "Create New Pitch"}</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pitch Information</CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Update your pitch details below" 
                : "Tell us about your startup or business idea"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="elevator">Elevator Pitch</TabsTrigger>
                <TabsTrigger value="business">Business Details</TabsTrigger>
                <TabsTrigger value="market">Market & Revenue</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    Pitch Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., EduTech Solutions"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">
                    Short Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe your startup or idea in 1-2 sentences"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Bangalore"
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="EdTech">EdTech</SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="SaaS">SaaS</SelectItem>
                        <SelectItem value="AI">AI/ML</SelectItem>
                        <SelectItem value="AgriTech">AgriTech</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PitchStatus.IDEA}>Idea Stage</SelectItem>
                        <SelectItem value={PitchStatus.REGISTERED}>Registered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="websiteLink">Website (if any)</Label>
                    <Input
                      id="websiteLink"
                      name="websiteLink"
                      value={formData.websiteLink}
                      onChange={handleInputChange}
                      placeholder="e.g., https://example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="companyRegistrationStatus">Company Registration Status</Label>
                  <Select 
                    value={formData.companyRegistrationStatus} 
                    onValueChange={(value) => handleSelectChange("companyRegistrationStatus", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select registration status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Registered">Not Registered</SelectItem>
                      <SelectItem value="In Process">In Process</SelectItem>
                      <SelectItem value="Registered">Registered</SelectItem>
                      <SelectItem value="Incorporated">Incorporated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("elevator")}
                  >
                    Next: Elevator Pitch
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="elevator" className="space-y-4">
                <div>
                  <Label htmlFor="elevatorPitch.problem">Problem Statement</Label>
                  <Textarea
                    id="elevatorPitch.problem"
                    name="elevatorPitch.problem"
                    value={formData.elevatorPitch.problem}
                    onChange={handleInputChange}
                    placeholder="What problem are you solving?"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="elevatorPitch.solution">Solution</Label>
                  <Textarea
                    id="elevatorPitch.solution"
                    name="elevatorPitch.solution"
                    value={formData.elevatorPitch.solution}
                    onChange={handleInputChange}
                    placeholder="How does your product/service solve this problem?"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("basic")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("business")}
                  >
                    Next: Business Details
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="business" className="space-y-4">
                <div>
                  <Label htmlFor="businessModel">Business Model</Label>
                  <Textarea
                    id="businessModel"
                    name="businessModel"
                    value={formData.businessModel}
                    onChange={handleInputChange}
                    placeholder="Describe your business model"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fundingStage">Funding Stage</Label>
                  <Select 
                    value={formData.fundingStage} 
                    onValueChange={(value) => handleSelectChange("fundingStage", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select funding stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                      <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B+">Series B+</SelectItem>
                      <SelectItem value="Profitable">Profitable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("elevator")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("market")}
                  >
                    Next: Market & Revenue
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="market" className="space-y-4">
                <div>
                  <Label htmlFor="marketOpportunity">Market Opportunity</Label>
                  <Textarea
                    id="marketOpportunity"
                    name="marketOpportunity"
                    value={formData.marketOpportunity}
                    onChange={handleInputChange}
                    placeholder="Describe your target market and its size"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="revenue.model">Revenue Model</Label>
                  <Input
                    id="revenue.model"
                    name="revenue.model"
                    value={formData.revenue.model}
                    onChange={handleInputChange}
                    placeholder="e.g., Subscription, Transactional, Freemium"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="revenue.growth">Growth Metrics</Label>
                  <Input
                    id="revenue.growth"
                    name="revenue.growth"
                    value={formData.revenue.growth}
                    onChange={handleInputChange}
                    placeholder="e.g., Current revenue or growth projections"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("business")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting || !isFormComplete()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? "Update Pitch" : "Create Pitch"}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-gray-500">
              {isFormComplete() ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  All required fields completed
                </span>
              ) : (
                "* Required fields must be filled"
              )}
            </div>
            
            <Button 
              type="submit"
              disabled={isSubmitting || !isFormComplete()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Pitch" : "Create Pitch"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Layout>
  );
}