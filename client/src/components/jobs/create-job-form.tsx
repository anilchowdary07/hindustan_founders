import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JobType, JobLocation, insertJobSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
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
import { CalendarIcon } from "lucide-react";
import { useLocation } from "wouter";

// Extend job schema with custom validation
const createJobSchema = insertJobSchema
  .omit({ userId: true })
  .extend({
    expiresAt: z.date().optional(),
  });

type CreateJobValues = z.infer<typeof createJobSchema>;

export default function CreateJobForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<CreateJobValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      description: "",
      jobType: JobType.FULL_TIME,
      locationType: JobLocation.ONSITE,
      responsibilities: "",
      requirements: "",
      salary: "",
      applicationUrl: "",
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (values: CreateJobValues) => {
      const formattedValues = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
      };
      
      const res = await apiRequest("POST", "/api/jobs", formattedValues);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create job posting");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Job posting created",
        description: "Your job has been successfully posted",
      });
      // Reset form and redirect to jobs page
      form.reset();
      // Invalidate jobs cache
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      // Redirect to jobs page
      setLocation("/jobs");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating job posting",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  async function onSubmit(values: CreateJobValues) {
    setIsSubmitting(true);
    createJobMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Senior Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Hindustan Tech" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="jobType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={JobType.FULL_TIME}>Full Time</SelectItem>
                    <SelectItem value={JobType.PART_TIME}>Part Time</SelectItem>
                    <SelectItem value={JobType.CONTRACT}>Contract</SelectItem>
                    <SelectItem value={JobType.INTERNSHIP}>Internship</SelectItem>
                    <SelectItem value={JobType.FREELANCE}>Freelance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Type*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={JobLocation.ONSITE}>On-site</SelectItem>
                    <SelectItem value={JobLocation.REMOTE}>Remote</SelectItem>
                    <SelectItem value={JobLocation.HYBRID}>Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location*</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bangalore, Karnataka" {...field} />
              </FormControl>
              <FormDescription>
                Specify city, state or "Remote" if it's a remote position
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Range</FormLabel>
              <FormControl>
                <Input placeholder="e.g. ₹15-20 LPA" {...field} />
              </FormControl>
              <FormDescription>
                Optional, but recommended for better applications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description*</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the role, company culture, and what you're looking for in candidates"
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
            name="responsibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsibilities</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List the key responsibilities for this role"
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requirements</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List the required skills, experience and qualifications"
                    className="min-h-[150px]"
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
          name="applicationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application URL</FormLabel>
              <FormControl>
                <Input placeholder="https://yourcompany.com/careers/apply" {...field} />
              </FormControl>
              <FormDescription>
                Where candidates should apply for this position
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Application Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
              <FormDescription>
                When applications for this job will close
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}