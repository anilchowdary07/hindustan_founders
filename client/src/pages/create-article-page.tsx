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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Article schema
const createArticleSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  excerpt: z.string().min(20, "Excerpt must be at least 20 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  category: z.string().min(1, "Category is required"),
  coverImageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
});

type CreateArticleValues = z.infer<typeof createArticleSchema>;

export default function CreateArticlePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<CreateArticleValues>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      category: "entrepreneurship",
      coverImageUrl: "",
      tags: "",
    }
  });
  
  const mutation = useMutation({
    mutationFn: async (values: CreateArticleValues) => {
      // In a real app, this would be an API call to create an article
      // For now, we'll simulate it with a timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Math.floor(Math.random() * 1000), ...values });
        }, 1000);
      });
      
      // Real implementation would be:
      // const res = await apiRequest("POST", "/api/articles", values);
      // const data = await res.json();
      // return data;
    },
    onSuccess: (data) => {
      // In a real app, we would invalidate the articles query
      // queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      
      toast({
        title: "Article Created",
        description: "Your article has been created successfully",
      });
      
      navigate("/articles");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  async function onSubmit(values: CreateArticleValues) {
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
          <Link href="/articles">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> 
              Back to Articles
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Write a New Article</h1>
          <p className="text-muted-foreground mt-2">
            Share your knowledge and insights with the Hindustan Founders community
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
                    <FormLabel>Article Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a compelling title for your article" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                          <SelectItem value="funding">Funding & Investment</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="marketing">Marketing & Growth</SelectItem>
                          <SelectItem value="operations">Operations & Management</SelectItem>
                          <SelectItem value="legal">Legal & Compliance</SelectItem>
                          <SelectItem value="finance">Finance & Accounting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="startup, funding, advice (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="coverImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a brief summary of your article (will appear in previews)" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Article Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your full article here..." 
                        className="min-h-[300px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/articles")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Publishing..." : "Publish Article"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}