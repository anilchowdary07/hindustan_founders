import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { JobListing } from "./job-listing";

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
import { Checkbox } from "@/components/ui/checkbox";
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
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Job types
const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
];

// Experience levels
const EXPERIENCE_LEVELS = [
  "Entry Level",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

// Common skills
const COMMON_SKILLS = [
  "React",
  "Node.js",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
  "UI/UX Design",
  "Product Management",
  "Marketing",
  "Sales",
  "Customer Support",
  "Data Analysis",
  "Machine Learning",
  "Project Management",
];

interface JobPostingFormProps {
  initialData?: Partial<JobListing>;
  isEditMode?: boolean;
}

export default function JobPostingForm({
  initialData,
  isEditMode = false,
}: JobPostingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // Form state
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time" as JobListing["type"],
    salary: "",
    description: "",
    requirements: [""],
    responsibilities: [""],
    deadline: "",
    applicationUrl: "",
    skills: [] as string[],
    experience: "Entry Level",
    companyLogo: null as File | null,
    companyLogoUrl: "",
    linkToPitch: false,
    pitchId: "",
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [skillInput, setSkillInput] = useState("");
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        company: initialData.company || "",
        location: initialData.location || "",
        type: initialData.type || "Full-time",
        salary: initialData.salary || "",
        description: initialData.description || "",
        requirements: initialData.requirements?.length ? initialData.requirements : [""],
        responsibilities: initialData.responsibilities?.length ? initialData.responsibilities : [""],
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : "",
        applicationUrl: initialData.applicationUrl || "",
        skills: initialData.skills || [],
        experience: initialData.experience || "Entry Level",
        companyLogo: null,
        companyLogoUrl: initialData.companyLogo || "",
        linkToPitch: !!initialData.pitchId,
        pitchId: initialData.pitchId?.toString() || "",
      });
    }
  }, [initialData]);
  
  // Create/update job mutation
  const jobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) {
        throw new Error("You must be logged in to post jobs");
      }
      
      const url = isEditMode && initialData?.id
        ? `/api/jobs/${initialData.id}`
        : '/api/jobs';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} job listing`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Job listing ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      
      // Redirect to job detail page
      router.push(`/jobs/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} job listing. Please try again.`,
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
  
  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  // Handle array item change (requirements, responsibilities)
  const handleArrayItemChange = (
    arrayName: 'requirements' | 'responsibilities',
    index: number,
    value: string
  ) => {
    setFormData((prev) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = value;
      return { ...prev, [arrayName]: newArray };
    });
  };
  
  // Add array item (requirements, responsibilities)
  const addArrayItem = (arrayName: 'requirements' | 'responsibilities') => {
    setFormData((prev) => {
      const newArray = [...prev[arrayName], ""];
      return { ...prev, [arrayName]: newArray };
    });
  };
  
  // Remove array item (requirements, responsibilities)
  const removeArrayItem = (arrayName: 'requirements' | 'responsibilities', index: number) => {
    setFormData((prev) => {
      const newArray = [...prev[arrayName]];
      newArray.splice(index, 1);
      return { ...prev, [arrayName]: newArray.length ? newArray : [""] };
    });
  };
  
  // Add skill
  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setSkillInput("");
    }
  };
  
  // Add common skill
  const addCommonSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
  };
  
  // Remove skill
  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Company logo must be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, GIF, or SVG image",
          variant: "destructive",
        });
        return;
      }
      
      setFormData((prev) => ({
        ...prev,
        companyLogo: file,
        companyLogoUrl: URL.createObjectURL(file),
      }));
    }
  };
  
  // Remove logo
  const removeLogo = () => {
    setFormData((prev) => ({
      ...prev,
      companyLogo: null,
      companyLogoUrl: "",
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Basic info validation
    if (!formData.title.trim()) {
      errors.title = "Job title is required";
    }
    
    if (!formData.company.trim()) {
      errors.company = "Company name is required";
    }
    
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Job description is required";
    } else if (formData.description.trim().length < 100) {
      errors.description = "Job description should be at least 100 characters";
    }
    
    // Requirements validation
    if (formData.requirements.some(req => !req.trim())) {
      errors.requirements = "All requirements must be filled";
    }
    
    // Responsibilities validation
    if (formData.responsibilities.some(resp => !resp.trim())) {
      errors.responsibilities = "All responsibilities must be filled";
    }
    
    // Skills validation
    if (formData.skills.length === 0) {
      errors.skills = "At least one skill is required";
    }
    
    // Pitch validation
    if (formData.linkToPitch && !formData.pitchId) {
      errors.pitchId = "Please select a pitch to link";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
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
        description: "Please sign in to post jobs",
        variant: "default"
      });
      return;
    }
    
    // Create form data
    const data = new FormData();
    data.append("title", formData.title);
    data.append("company", formData.company);
    data.append("location", formData.location);
    data.append("type", formData.type);
    data.append("salary", formData.salary);
    data.append("description", formData.description);
    data.append("requirements", JSON.stringify(formData.requirements.filter(req => req.trim())));
    data.append("responsibilities", JSON.stringify(formData.responsibilities.filter(resp => resp.trim())));
    data.append("experience", formData.experience);
    data.append("skills", JSON.stringify(formData.skills));
    
    if (formData.deadline) {
      data.append("deadline", formData.deadline);
    }
    
    if (formData.applicationUrl) {
      data.append("applicationUrl", formData.applicationUrl);
    }
    
    if (formData.linkToPitch && formData.pitchId) {
      data.append("pitchId", formData.pitchId);
    }
    
    if (formData.companyLogo) {
      data.append("companyLogo", formData.companyLogo);
    }
    
    // Submit form
    jobMutation.mutate(data);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.push('/jobs')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Jobs
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Job Listing" : "Post a New Job"}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
            <CardDescription>
              {isEditMode 
                ? "Update your job listing details" 
                : "Provide details about the job you're posting"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="company">Company Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="title">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Frontend Developer"
                    className={`mt-1 ${formErrors.title ? 'border-red-500' : ''}`}
                  />
                  {formErrors.title && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g., Acme Inc."
                      className={`mt-1 ${formErrors.company ? 'border-red-500' : ''}`}
                    />
                    {formErrors.company && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.company}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Bangalore or Remote"
                      className={`mt-1 ${formErrors.location ? 'border-red-500' : ''}`}
                    />
                    {formErrors.location && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">
                      Job Type <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => handleSelectChange("type", value)}
                    >
                      <SelectTrigger id="type" className="mt-1">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="salary">
                      Salary Range
                    </Label>
                    <Input
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g., ₹15-20 LPA or $80,000-100,000"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Including salary ranges increases application rates
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experience">
                      Experience Level <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.experience} 
                      onValueChange={(value) => handleSelectChange("experience", value)}
                    >
                      <SelectTrigger id="experience" className="mt-1">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline">
                      Application Deadline
                    </Label>
                    <div className="relative mt-1">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="applicationUrl">
                    External Application URL
                  </Label>
                  <Input
                    id="applicationUrl"
                    name="applicationUrl"
                    value={formData.applicationUrl}
                    onChange={handleInputChange}
                    placeholder="e.g., https://yourcompany.com/careers/job123"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: If you want candidates to apply through an external site
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab("details")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Next: Job Details
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="description">
                    Job Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the job..."
                    className={`min-h-[200px] mt-1 ${formErrors.description ? 'border-red-500' : ''}`}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Include information about the role, team, and what the candidate will be doing
                  </p>
                </div>
                
                <div>
                  <Label>
                    Skills Required <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex mt-1 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill and press Enter"
                      className="mr-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={addSkill}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formErrors.skills && (
                    <p className="text-xs text-red-500 mb-2">{formErrors.skills}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill) => (
                      <div 
                        key={skill} 
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center text-sm"
                      >
                        {skill}
                        <X 
                          className="h-3.5 w-3.5 ml-1.5 cursor-pointer text-gray-500 hover:text-gray-700" 
                          onClick={() => removeSkill(skill)}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Common Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_SKILLS.filter(skill => !formData.skills.includes(skill)).slice(0, 10).map((skill) => (
                        <div 
                          key={skill} 
                          className="bg-gray-50 text-gray-700 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-gray-100"
                          onClick={() => addCommonSkill(skill)}
                        >
                          + {skill}
                        </div>
                      ))}
                    </div>
                  </div>
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
                    onClick={() => setActiveTab("requirements")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Next: Requirements
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>
                      Requirements <span className="text-red-500">*</span>
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addArrayItem('requirements')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Requirement
                    </Button>
                  </div>
                  
                  {formErrors.requirements && (
                    <p className="text-xs text-red-500 mb-2">{formErrors.requirements}</p>
                  )}
                  
                  <div className="space-y-2">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={req}
                          onChange={(e) => handleArrayItemChange('requirements', index, e.target.value)}
                          placeholder={`Requirement ${index + 1}`}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeArrayItem('requirements', index)}
                          disabled={formData.requirements.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>
                      Responsibilities <span className="text-red-500">*</span>
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => addArrayItem('responsibilities')}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Responsibility
                    </Button>
                  </div>
                  
                  {formErrors.responsibilities && (
                    <p className="text-xs text-red-500 mb-2">{formErrors.responsibilities}</p>
                  )}
                  
                  <div className="space-y-2">
                    {formData.responsibilities.map((resp, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={resp}
                          onChange={(e) => handleArrayItemChange('responsibilities', index, e.target.value)}
                          placeholder={`Responsibility ${index + 1}`}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeArrayItem('responsibilities', index)}
                          disabled={formData.responsibilities.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    ))}
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
                    onClick={() => setActiveTab("company")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Next: Company Info
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="company" className="space-y-4">
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-1">
                    {formData.companyLogoUrl ? (
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-white">
                          <img 
                            src={formData.companyLogoUrl} 
                            alt="Company logo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeLogo}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md border-gray-300">
                        <label
                          htmlFor="logo-upload"
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <Upload className="h-6 w-6 text-gray-400 mb-2" />
                          <span className="text-sm font-medium text-gray-700">
                            Upload Company Logo
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            JPG, PNG, GIF or SVG, max 2MB
                          </span>
                          <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,image/svg+xml"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="linkToPitch" 
                      checked={formData.linkToPitch}
                      onCheckedChange={(checked) => handleCheckboxChange("linkToPitch", checked as boolean)}
                    />
                    <label
                      htmlFor="linkToPitch"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Link to one of my pitches
                    </label>
                  </div>
                  
                  {formData.linkToPitch && (
                    <div className="mt-2">
                      <Label htmlFor="pitchId">
                        Select Pitch <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.pitchId} 
                        onValueChange={(value) => handleSelectChange("pitchId", value)}
                      >
                        <SelectTrigger id="pitchId" className="mt-1">
                          <SelectValue placeholder="Select a pitch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Pitch 1 (Demo)</SelectItem>
                          <SelectItem value="2">Pitch 2 (Demo)</SelectItem>
                          <SelectItem value="3">Pitch 3 (Demo)</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.pitchId && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.pitchId}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Linking to a pitch helps candidates learn more about your company
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Before you submit</p>
                      <p className="mt-1">
                        Make sure your job listing complies with our community guidelines. 
                        Job listings that discriminate based on race, gender, age, or other protected characteristics will be removed.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setActiveTab("requirements")}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={jobMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {jobMutation.isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? "Updating..." : "Posting..."}
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? "Update Job" : "Post Job"}
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}