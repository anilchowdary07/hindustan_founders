import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, PlayCircle, CalendarDays, FileText, X } from "lucide-react";
import { useLocation } from "wouter";

export default function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | 'document' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async ({ content, file, fileType }: { content: string; file?: File; fileType?: string }) => {
      // Create FormData if there's a file
      if (file) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("userId", String(user?.id));
        
        // Add file type information
        formData.append("fileType", fileType || 'image');
        
        // Always use 'file' as the field name for better semantics
        formData.append("file", file);
        
        // Use our improved upload function
        const response = await fetch("/api/posts/with-image", {
          method: "POST",
          body: formData,
          credentials: "include", // Important for cookies
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error:", errorText);
          throw new Error(`Failed to create post with ${fileType}: ${errorText}`);
        }
        
        try {
          return await response.json();
        } catch (e) {
          console.error("Error parsing response:", e);
          return { success: true };
        }
      } else {
        // Standard API request without file
        const response = await apiRequest("POST", "/api/posts", { 
          content,
          userId: user?.id,
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        return response.data;
      }
    },
    onSuccess: () => {
      resetForm();
      setIsUploading(false);
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been successfully published",
      });
    },
    onError: () => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setContent("");
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setIsExpanded(false);
    
    // Reset file inputs
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (content.trim()) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // If there's a file, we'll handle the upload with progress
      if (selectedFile) {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("userId", String(user?.id));
        formData.append("fileType", fileType || 'image');
        formData.append("file", selectedFile);
        
        // Create an XMLHttpRequest to track upload progress
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });
        
        xhr.onload = function() {
          setIsUploading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
            toast({
              title: "Post created",
              description: "Your post has been successfully published",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to create post. Please try again.",
              variant: "destructive",
            });
          }
        };
        
        xhr.onerror = function() {
          setIsUploading(false);
          toast({
            title: "Error",
            description: "Network error during upload. Please try again.",
            variant: "destructive",
          });
        };
        
        xhr.open('POST', '/api/posts/with-image', true);
        xhr.withCredentials = true; // Include cookies for authentication
        xhr.send(formData);
      } else {
        // No file, use the regular mutation
        createPostMutation.mutate({ 
          content, 
          file: undefined,
          fileType: undefined
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileType(type);
      
      // Create preview URL for images and videos
      if (type === 'image' || type === 'video') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For documents, just show the filename
        setFilePreview(file.name);
      }
      
      // Expand the form if not already expanded
      if (!isExpanded) {
        setIsExpanded(true);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    
    // Reset the appropriate input based on file type
    if (fileType === 'image' && imageInputRef.current) {
      imageInputRef.current.value = "";
    } else if (fileType === 'video' && videoInputRef.current) {
      videoInputRef.current.value = "";
    } else if (fileType === 'document' && documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  if (!user) return null;

  const getInitials = () => {
    if (!user.name) return "HF";
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="mb-4 shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow overflow-hidden rounded-lg bg-white">
      <CardContent className="p-4">
        <div className="flex">
          <Avatar className="h-12 w-12 border border-[#E0E0E0]">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-[#0077B5] text-white">{getInitials()}</AvatarFallback>
          </Avatar>
          
          {!isExpanded ? (
            <button 
              className="flex-1 ml-3 px-4 py-2 bg-[#F3F2EF] text-[#666666] rounded-full text-left hover:bg-[#EBEBEB] border border-[#E0E0E0] shadow-sm transition-all"
              onClick={() => setIsExpanded(true)}
            >
              What's on your mind, {user.name?.split(' ')[0]}?
            </button>
          ) : (
            <div className="flex-1 ml-3">
              <Textarea
                placeholder={`Share your thoughts, ideas, or questions with the community...`}
                className="w-full resize-none focus:ring-[#0077B5] focus:border-[#0077B5] border-[#E0E0E0]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
              
              {filePreview && (
                <div className="relative mt-2 inline-block group">
                  {fileType === 'image' && (
                    <div className="relative">
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="max-h-60 max-w-full rounded-md border border-[#E0E0E0] shadow-sm" 
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-md">
                          <div className="text-white text-sm font-medium">{uploadProgress}%</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {fileType === 'video' && (
                    <div className="flex items-center p-3 bg-gray-100 rounded-md border border-[#E0E0E0]">
                      <PlayCircle className="h-8 w-8 text-[#0077B5] mr-2" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">Video: {selectedFile?.name}</span>
                        {isUploading && (
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-full bg-[#0077B5] rounded-full" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {fileType === 'document' && (
                    <div className="flex items-center p-3 bg-gray-100 rounded-md border border-[#E0E0E0]">
                      <FileText className="h-8 w-8 text-[#0077B5] mr-2" />
                      <span className="text-sm font-medium">Document: {filePreview}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-[#191919] bg-opacity-70 rounded-full p-1.5 text-white hover:bg-opacity-100 opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="hover:bg-[#EBEBEB] transition-colors border-[#E0E0E0] text-[#666666] rounded-full"
                >
                  Cancel
                </Button>
                <Button 
                  disabled={!content.trim() || createPostMutation.isPending || isUploading} 
                  onClick={handleSubmit}
                  className="bg-[#0077B5] hover:bg-[#006097] text-white rounded-full transition-colors"
                >
                  {createPostMutation.isPending || isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isUploading ? `Uploading ${uploadProgress}%` : 'Post'}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-3 border-t border-[#E0E0E0] pt-3">
          {/* Image input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageInputRef}
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          
          {/* Video input */}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            ref={videoInputRef}
            onChange={(e) => handleFileSelect(e, 'video')}
          />
          
          {/* Document input */}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
            className="hidden"
            ref={documentInputRef}
            onChange={(e) => handleFileSelect(e, 'document')}
          />
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-[#666666] hover:bg-[#E5F5FC] hover:text-[#0077B5] transition-colors rounded-md"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="mr-2 h-4 w-4 text-[#0077B5]" />
            <span>Photo</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-[#666666] hover:bg-[#E5F5FC] hover:text-[#0077B5] transition-colors rounded-md"
            onClick={() => videoInputRef.current?.click()}
          >
            <PlayCircle className="mr-2 h-4 w-4 text-[#0077B5]" />
            <span>Video</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-[#666666] hover:bg-[#E5F5FC] hover:text-[#0077B5] transition-colors rounded-md"
            onClick={() => {
              navigate("/create-event");
              toast({
                title: "Create Event",
                description: "Redirected to event creation page",
              });
            }}
          >
            <CalendarDays className="mr-2 h-4 w-4 text-[#0077B5]" />
            <span>Event</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-[#666666] hover:bg-[#E5F5FC] hover:text-[#0077B5] transition-colors rounded-md"
            onClick={() => documentInputRef.current?.click()}
          >
            <FileText className="mr-2 h-4 w-4 text-[#0077B5]" />
            <span>Document</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
