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
} from "lucide-react";

// Categories
const CATEGORIES = [
  "Startup",
  "Funding",
  "Growth",
  "Marketing",
  "Product",
  "Technology",
  "Leadership",
  "Finance",
  "Legal",
];

// Common tags
const COMMON_TAGS = [
  "startup",
  "funding",
  "venture-capital",
  "product-market-fit",
  "growth-hacking",
  "pitch-deck",
  "saas",
  "ai",
  "blockchain",
  "remote-work",
  "hiring",
  "team-building",
  "marketing",
  "sales",
  "customer-acquisition",
  "retention",
  "bootstrapping",
  "mvp",
  "product-development",
  "user-experience",
];

export default function CreateArticlePage() {
  const router = useRouter();
  const { id } = router.query; // For edit mode
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  
  const isEditMode = !!id;
  
  // Form state
  const [activeTab, setActiveTab] = useState("content");
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: null as File | null,
    coverImageUrl: "",
    category: "",
    tags: [] as string[],
    readTime: 5,
    isDraft: true,
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fetch article data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      // In a real app, this would fetch the article data from the API
      // For now, we'll simulate it with a timeout
      const timer = setTimeout(() => {
        setFormData({
          title: "How to Create the Perfect Pitch Deck",
          excerpt: "Learn the essential elements of a compelling pitch deck that will help you secure funding for your startup.",
          content: "<p>A great pitch deck is essential for securing funding for your startup. Here's how to create one that stands out...</p><h2>1. Start with a Strong Hook</h2><p>Your opening slide should grab investors' attention immediately...</p>",
          coverImage: null,
          coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          category: "Funding",
          tags: ["pitch-deck", "funding", "startup"],
          readTime: 8,
          isDraft: false,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isEditMode, id]);
  
  // Create/update article mutation
  const articleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) {
        throw new Error("You must be logged in to publish articles");
      }
      
      const url = isEditMode ? `/api/resources/articles/${id}` : '/api/resources/articles';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: data,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} article`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Article ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      
      // Redirect to article detail page
      router.push(`/resources/articles/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} article. Please try again.`,
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
  
  // Calculate read time based on content length
  useEffect(() => {
    const wordCount = formData.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute
    setFormData((prev) => ({ ...prev, readTime }));
  }, [formData.content]);
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }
    
    if (!formData.excerpt.trim()) {
      errors.excerpt = "Excerpt is required";
    } else if (formData.excerpt.trim().length > 200) {
      errors.excerpt = "Excerpt should be less than 200 characters";
    }
    
    if (!formData.content.trim()) {
      errors.content = "Content is required";
    } else if (formData.content.trim().length < 100) {
      errors.content = "Content should be at least 100 characters";
    }
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (formData.tags.length === 0) {
      errors.tags = "At least one tag is required";
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
        description: "Please sign in to publish articles",
        variant: "default"
      });
      return;
    }
    
    // Create form data
    const data = new FormData();
    data.append("title", formData.title);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append("category", formData.category);
    data.append("tags", JSON.stringify(formData.tags));
    data.append("readTime", formData.readTime.toString());
    data.append("isDraft", (!publish).toString());
    
    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    } else if (formData.coverImageUrl && isEditMode) {
      data.append("coverImageUrl", formData.coverImageUrl);
    }
    
    // Submit form
    articleMutation.mutate(data);
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
            onClick={() => router.push('/resources')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resources
          </Button>
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Article" : "Create Article"}</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Lock className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Authentication Required</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                You need to be logged in to {isEditMode ? "edit" : "create"} articles.
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
                  onClick={() => router.push('/resources')}
                >
                  Browse Articles
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
          onClick={() => router.push('/resources')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Resources
        </Button>
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Article" : "Create Article"}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{isEditMode ? "Edit Article" : "Create New Article"}</CardTitle>
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
                  ? "Update your article content and settings" 
                  : "Share your knowledge and insights with the community"}
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
                    <h1 className="text-3xl font-bold text-gray-900">{formData.title || "Untitled Article"}</h1>
                    <p className="text-gray-600 mt-2">{formData.excerpt || "No excerpt provided"}</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formData.readTime} min read</span>
                    {formData.category && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{formData.category}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.content || "<p>No content yet</p>" }} />
                  
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
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="media">Media</TabsTrigger>
                      <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      <div>
                        <Label htmlFor="title">
                          Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter article title"
                          className={`mt-1 ${formErrors.title ? 'border-red-500' : ''}`}
                        />
                        {formErrors.title && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="excerpt">
                          Excerpt <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="excerpt"
                          name="excerpt"
                          value={formData.excerpt}
                          onChange={handleInputChange}
                          placeholder="Brief summary of your article (max 200 characters)"
                          className={`mt-1 ${formErrors.excerpt ? 'border-red-500' : ''}`}
                          rows={2}
                        />
                        {formErrors.excerpt && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.excerpt}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.excerpt.length}/200 characters
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="content">
                          Content <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="content"
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          placeholder="Write your article content here..."
                          className={`min-h-[300px] mt-1 ${formErrors.content ? 'border-red-500' : ''}`}
                        />
                        {formErrors.content && (
                          <p className="text-xs text-red-500 mt-1">{formErrors.content}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Supports HTML formatting. Estimated read time: {formData.readTime} minutes.
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("media")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Next: Media
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="media" className="space-y-4">
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
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setActiveTab("content")}
                        >
                          Back
                        </Button>
                        <Button 
                          type="button" 
                          onClick={() => setActiveTab("metadata")}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Next: Metadata
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="metadata" className="space-y-4">
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
                            {CATEGORIES.map((category) => (
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
                        <Label>
                          Tags <span className="text-red-500">*</span>
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
                        
                        {formErrors.tags && (
                          <p className="text-xs text-red-500 mb-2">{formErrors.tags}</p>
                        )}
                        
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
                          onClick={() => setActiveTab("media")}
                        >
                          Back
                        </Button>
                        <div className="space-x-2">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={(e) => handleSubmit(e, false)}
                            disabled={articleMutation.isPending}
                          >
                            {articleMutation.isPending ? (
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
                            disabled={articleMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {articleMutation.isPending ? (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Publishing...
                              </div>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
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
              <CardTitle>Article Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={formData.isDraft ? "outline" : "default"}>
                    {formData.isDraft ? "Draft" : "Published"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Read Time</span>
                  <span className="text-sm">{formData.readTime} min</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Category</span>
                  <span className="text-sm">{formData.category || "Not set"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tags</span>
                  <span className="text-sm">{formData.tags.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Use clear headings:</span> Break up your content with H2 and H3 tags.
                </p>
                <p>
                  <span className="font-medium">Keep paragraphs short:</span> Aim for 3-4 sentences per paragraph.
                </p>
                <p>
                  <span className="font-medium">Include examples:</span> Real-world examples make concepts easier to understand.
                </p>
                <p>
                  <span className="font-medium">Add value:</span> Share unique insights or actionable advice.
                </p>
                <p>
                  <span className="font-medium">Proofread:</span> Check for typos and grammatical errors before publishing.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>HTML Formatting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <code>&lt;h2&gt;Heading&lt;/h2&gt;</code> - Section heading
                </p>
                <p>
                  <code>&lt;h3&gt;Subheading&lt;/h3&gt;</code> - Subsection heading
                </p>
                <p>
                  <code>&lt;p&gt;Paragraph&lt;/p&gt;</code> - Paragraph
                </p>
                <p>
                  <code>&lt;strong&gt;Bold text&lt;/strong&gt;</code> - Bold text
                </p>
                <p>
                  <code>&lt;em&gt;Italic text&lt;/em&gt;</code> - Italic text
                </p>
                <p>
                  <code>&lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;</code> - Bulleted list
                </p>
                <p>
                  <code>&lt;ol&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ol&gt;</code> - Numbered list
                </p>
                <p>
                  <code>&lt;blockquote&gt;Quote&lt;/blockquote&gt;</code> - Blockquote
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}