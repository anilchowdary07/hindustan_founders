import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import SavePostButton from "@/components/common/save-post-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ActivityItemProps {
  activity: {
    id: number;
    content: string;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      avatarUrl?: string;
    };
  };
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [commentCount, setCommentCount] = useState(8);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };
  
  const handleComment = () => {
    setIsCommentDialogOpen(true);
  };
  
  const handleShare = () => {
    setIsShareDialogOpen(true);
  };
  
  const submitComment = () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setCommentCount(prev => prev + 1);
    toast({
      title: "Comment added",
      description: "Your comment has been added successfully"
    });
    setCommentText("");
    setIsCommentDialogOpen(false);
  };
  
  const handleShareSubmit = () => {
    toast({
      title: "Post shared",
      description: "The post has been shared successfully"
    });
    setIsShareDialogOpen(false);
  };

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <Avatar className="h-12 w-12 border border-[#E0E0E0]">
          <AvatarImage src={activity.user.avatarUrl || ""} />
          <AvatarFallback className="bg-[#0A66C2] text-white">
            {getInitials(activity.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#191919] font-medium">
                {activity.user.name}
              </p>
              <p className="text-[#666666] text-sm">Shared a post • {getTimeAgo(activity.createdAt)}</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-[#191919] text-sm whitespace-pre-line">{activity.content}</p>
      </div>
      
      <div className="mt-4 pt-1 border-t border-[#E0E0E0]">
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center text-xs text-[#666666]">
            <div className="flex -space-x-1 mr-1">
              <div className="h-4 w-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
                <ThumbsUp className="h-2 w-2 text-white" />
              </div>
            </div>
            <span>You and {likeCount} others</span>
          </div>
          <div className="text-xs text-[#666666]">
            {commentCount} comments
          </div>
        </div>
        
        <div className="flex justify-between mt-1 pt-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex-1 min-w-[25%] flex items-center justify-center ${isLiked ? 'text-[#0A66C2]' : 'text-[#666666]'} hover:bg-[#F3F2EF] rounded-md text-xs md:text-sm`}
            onClick={handleLike}
          >
            <ThumbsUp className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">{isLiked ? 'Liked' : 'Like'}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 min-w-[25%] flex items-center justify-center text-[#666666] hover:bg-[#F3F2EF] rounded-md text-xs md:text-sm"
            onClick={handleComment}
          >
            <MessageSquare className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Comment</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 min-w-[25%] flex items-center justify-center text-[#666666] hover:bg-[#F3F2EF] rounded-md text-xs md:text-sm"
            onClick={handleShare}
          >
            <Share2 className="md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Share</span>
          </Button>
          <SavePostButton postId={activity.id} variant="ghost" size="sm" className="flex-1 min-w-[25%] text-xs md:text-sm" />
        </div>
      </div>
      
      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">Add a comment</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Share your thoughts on this post
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Write your comment here..." 
              className="min-h-[100px] border-[#E0E0E0] focus:border-[#0A66C2] focus:ring-[#0A66C2]"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCommentDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={submitComment}
              className="bg-[#0A66C2] hover:bg-[#004182] text-white"
            >
              Post Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">Share this post</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Choose how you want to share this post
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#0A66C2]">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              Share on Facebook
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#1DA1F2]">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
              Share on Twitter
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 text-[#0A66C2]">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
              Share on LinkedIn
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left"
              onClick={handleShareSubmit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
