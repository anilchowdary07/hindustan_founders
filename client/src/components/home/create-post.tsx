import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, PlayCircle, CalendarDays, FileText } from "lucide-react";

export default function CreatePost() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/posts", { 
        content,
        userId: user?.id,
      });
      return await res.json();
    },
    onSuccess: () => {
      setContent("");
      setIsExpanded(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created",
        description: "Your post has been successfully published",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (content.trim()) {
      createPostMutation.mutate(content);
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
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-primary text-white">{getInitials()}</AvatarFallback>
          </Avatar>
          
          {!isExpanded ? (
            <button 
              className="flex-1 ml-3 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-left hover:bg-gray-200"
              onClick={() => setIsExpanded(true)}
            >
              Start a post
            </button>
          ) : (
            <div className="flex-1 ml-3">
              <Textarea
                placeholder="What's on your mind?"
                className="w-full resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button 
                  disabled={!content.trim() || createPostMutation.isPending} 
                  onClick={handleSubmit}
                >
                  {createPostMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between mt-3">
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
            <Image className="mr-2 h-4 w-4 text-blue-500" />
            <span>Photo</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
            <PlayCircle className="mr-2 h-4 w-4 text-green-500" />
            <span>Video</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
            <CalendarDays className="mr-2 h-4 w-4 text-orange-500" />
            <span>Event</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            <span>Article</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
