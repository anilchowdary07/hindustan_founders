import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { JobListing } from "./job-listing";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Upload,
  Paperclip,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface JobApplicationFormProps {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JobApplicationForm({
  job,
  isOpen,
  onClose,
  onSuccess,
}: JobApplicationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [availableToStart, setAvailableToStart] = useState("immediately");
  const [step, setStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Apply for job mutation
  const applyForJobMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!user) {
        throw new Error("You must be logged in to apply for jobs");
      }
      
      const response = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
      
      // Reset form
      setCoverLetter("");
      setPhone("");
      setExperience("");
      setResumeFile(null);
      setUseProfileResume(true);
      setAvailableToStart("immediately");
      setStep(1);
      
      // Close dialog and call success callback
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Resume file must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      
      setResumeFile(file);
      setUseProfileResume(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!coverLetter.trim()) {
        errors.coverLetter = "Cover letter is required";
      } else if (coverLetter.trim().length < 100) {
        errors.coverLetter = "Cover letter should be at least 100 characters";
      }
      
      if (!phone.trim()) {
        errors.phone = "Phone number is required";
      }
    } else if (step === 2) {
      if (!experience.trim()) {
        errors.experience = "Please describe your relevant experience";
      }
      
      if (!useProfileResume && !resumeFile) {
        errors.resume = "Please upload your resume or use your profile resume";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    setStep(1);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for jobs",
        variant: "default"
      });
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append("coverLetter", coverLetter);
    formData.append("phone", phone);
    formData.append("experience", experience);
    formData.append("availableToStart", availableToStart);
    formData.append("useProfileResume", useProfileResume.toString());
    
    if (!useProfileResume && resumeFile) {
      formData.append("resume", resumeFile);
    }
    
    // Submit application
    applyForJobMutation.mutate(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>
            Submit your application for {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter" className="text-sm font-medium">
                Cover Letter <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Introduce yourself and explain why you're a good fit for this role..."
                className={`min-h-[150px] ${formErrors.coverLetter ? 'border-red-500' : ''}`}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              {formErrors.coverLetter && (
                <p className="text-xs text-red-500">{formErrors.coverLetter}</p>
              )}
              <p className="text-xs text-gray-500">
                Highlight your relevant experience and why you're interested in this position.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="e.g., +91 9876543210"
                className={formErrors.phone ? 'border-red-500' : ''}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availableToStart" className="text-sm font-medium">
                When can you start?
              </Label>
              <Select 
                value={availableToStart} 
                onValueChange={setAvailableToStart}
              >
                <SelectTrigger id="availableToStart">
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediately">Immediately</SelectItem>
                  <SelectItem value="two_weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="one_month">Within 1 month</SelectItem>
                  <SelectItem value="two_months">Within 2 months</SelectItem>
                  <SelectItem value="custom">Other (specify in cover letter)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium">
                Relevant Experience <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="experience"
                placeholder="Describe your relevant experience for this role..."
                className={`min-h-[100px] ${formErrors.experience ? 'border-red-500' : ''}`}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
              {formErrors.experience && (
                <p className="text-xs text-red-500">{formErrors.experience}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Resume <span className="text-red-500">*</span>
              </Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useProfileResume" 
                  checked={useProfileResume}
                  onCheckedChange={(checked) => {
                    setUseProfileResume(checked as boolean);
                    if (checked) setResumeFile(null);
                  }}
                />
                <label
                  htmlFor="useProfileResume"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use resume from my profile
                </label>
              </div>
              
              {!useProfileResume && (
                <div className="mt-2">
                  {resumeFile ? (
                    <div className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm truncate max-w-[200px]">
                          {resumeFile.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResumeFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-md border-gray-300">
                      <label
                        htmlFor="resume-upload"
                        className="flex flex-col items-center cursor-pointer"
                      >
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">
                          Upload Resume
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF or Word, max 5MB
                        </span>
                        <input
                          id="resume-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                  
                  {formErrors.resume && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.resume}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Important Note</p>
                  <p className="mt-1">
                    By submitting this application, you agree that the information provided is accurate and complete. 
                    The employer may contact you via email or phone regarding this application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {step === 1 ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNextStep}
                className="bg-primary hover:bg-primary/90"
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={applyForJobMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {applyForJobMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}