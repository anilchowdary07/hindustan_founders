import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SavePostButtonProps {
  postId: number | string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  initialSaved?: boolean;
  onSave?: (postId: number | string, saved: boolean) => void;
  className?: string;
}

export default function SavePostButton({
  postId,
  variant = "ghost",
  size = "sm",
  initialSaved = false,
  onSave,
  className = ""
}: SavePostButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const { toast } = useToast();

  const handleSave = () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    
    // Call the onSave callback if provided
    if (onSave) {
      onSave(postId, newSavedState);
    }
    
    // Show toast notification
    toast({
      title: newSavedState ? "Post saved" : "Post removed from saved items",
      description: newSavedState 
        ? "You can find this post in your saved items." 
        : "This post has been removed from your saved items.",
    });
    
    // In a real app, you would make an API call here to save/unsave the post
    // Example:
    // const savePost = async () => {
    //   try {
    //     await apiRequest(
    //       newSavedState ? "POST" : "DELETE", 
    //       `/api/posts/${postId}/save`
    //     );
    //   } catch (error) {
    //     console.error("Error saving post:", error);
    //     setIsSaved(!newSavedState); // Revert on error
    //     toast({
    //       title: "Error",
    //       description: "Failed to save post. Please try again.",
    //       variant: "destructive",
    //     });
    //   }
    // };
    // savePost();
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSave}
      className={`flex items-center gap-1 ${isSaved ? "text-primary" : ""} ${className}`}
      aria-label={isSaved ? "Unsave post" : "Save post"}
    >
      <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
      {size !== "icon" && (
        <span className="hidden md:inline">{isSaved ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}