import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Clock, MapPin, Building, CreditCard, Users, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocation } from "wouter";

export default function PostJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState(user?.company || "");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("remote");
  const [jobType, setJobType] = useState("full-time");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [salary, setSalary] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [isPublished, setIsPublished] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Job posting mutation
  const createJobMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/jobs", formData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Job Posted Successfully",
        description: "Your job has been posted and is now live.",
        variant: "default",
      });
      navigate("/jobs");
    },
    onError: (error) => {
      console.error("Error posting job:", error);
      toast({
        title: "Error Posting Job",
        description: "There was an error posting your job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobTitle || !company || !location || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Create expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    // Create FormData
    const formData = new FormData();
    formData.append("title", jobTitle);
    formData.append("company", company);
    formData.append("location", location);
    formData.append("locationType", locationType);
    formData.append("jobType", jobType);
    formData.append("description", description);
    formData.append("responsibilities", responsibilities);
    formData.append("requirements", requirements);
    formData.append("salary", salary);
    formData.append("applicationLink", applicationLink);
    formData.append("skills", JSON.stringify(skills));
    formData.append("expiresAt", expiryDate.toISOString());
    formData.append("isPublished", isPublished.toString());
    formData.append("userId", user?.id?.toString() || "");
    
    // Add logo if exists
    if (logo) {
      formData.append("logo", logo);
    }

    createJobMutation.mutate(formData);
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-4 md:py-8 px-3 md:px-4 w-full">
          <Card className="shadow-md">
            <CardHeader className="md:px-6">
              <CardTitle className="text-xl md:text-2xl font-bold">Post a Job</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Fill in the details below to post a new job opportunity.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate("/login")}>Log In</Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-200 bg-gray-50">
            <CardTitle className="text-2xl font-bold">Post a New Job</CardTitle>
            <CardDescription>
              Create a job listing to find the perfect candidate for your company
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="jobTitle" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Software Engineer" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
                    <Input 
                      id="company" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Inc." 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input 
                      id="location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai, India" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location-type">Location Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={locationType} 
                      onValueChange={setLocationType}
                    >
                      <SelectTrigger id="location-type">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job-type">Job Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={jobType} 
                      onValueChange={setJobType}
                    >
                      <SelectTrigger id="job-type">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Optional)</Label>
                    <Input 
                      id="salary" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. ₹15,00,000 - ₹20,00,000 per year" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Job Description */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <FileText className="h-5 w-5 text-primary" />
                  Job Details
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
                    <Textarea 
                      id="description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide a detailed description of the role" 
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities</Label>
                    <Textarea 
                      id="responsibilities" 
                      value={responsibilities}
                      onChange={(e) => setResponsibilities(e.target.value)}
                      placeholder="List the main responsibilities for this role" 
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea 
                      id="requirements" 
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="List the main qualifications and skills required" 
                      rows={4}
                    />
                  </div>
                </div>
              </div>
              
              {/* Skills Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Skills
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g. JavaScript, React)" 
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddSkill}
                      variant="secondary"
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button 
                          type="button" 
                          className="ml-2 text-primary/70 hover:text-primary"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {skills.length === 0 && (
                      <div className="text-gray-500 text-sm">No skills added yet</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Application Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <Users className="h-5 w-5 text-primary" />
                  Application Details
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicationLink">Application URL <span className="text-red-500">*</span></Label>
                    <Input 
                      id="applicationLink" 
                      value={applicationLink}
                      onChange={(e) => setApplicationLink(e.target.value)}
                      placeholder="e.g. https://yourcompany.com/careers/apply" 
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Enter the URL where candidates can apply for this position
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDays">Job Posting Duration</Label>
                    <RadioGroup 
                      value={String(expiryDays)} 
                      onValueChange={(value) => setExpiryDays(parseInt(value))}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="15" id="duration-15" />
                        <Label htmlFor="duration-15" className="font-normal">15 days</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="30" id="duration-30" />
                        <Label htmlFor="duration-30" className="font-normal">30 days</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="60" id="duration-60" />
                        <Label htmlFor="duration-60" className="font-normal">60 days</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="90" id="duration-90" />
                        <Label htmlFor="duration-90" className="font-normal">90 days</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
              
              {/* Company Logo */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <Building className="h-5 w-5 text-primary" />
                  Company Logo
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Upload Company Logo (Optional)</Label>
                    <div className="flex items-center gap-4">
                      {logoPreview ? (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={logoPreview} 
                            alt="Company logo preview" 
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                            onClick={() => {
                              setLogo(null);
                              setLogoPreview(null);
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <Building className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <Input 
                        id="logo" 
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Recommended size: 400x400 pixels. Max size: 5MB.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Publish Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5 text-primary" />
                  Publish Settings
                </h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>
                <p className="text-sm text-gray-500">
                  If turned off, your job will be saved as a draft and won't be visible to candidates.
                </p>
              </div>
              
              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/jobs")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createJobMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Job'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
