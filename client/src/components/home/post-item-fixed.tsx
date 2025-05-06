import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2, Send, ZoomIn, Twitter, Linkedin, Facebook, Copy, Mail, CheckCircle, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PostItemProps {
  post: {
    id: number;
    content: string;
    createdAt: Date;
    media?: string | null;
    user: {
      id: number;
      name: string;
      username: string;
      role: string;
      company?: string;
      title?: string;
      avatarUrl?: string;
      isVerified: boolean;
    };
  };
}

interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
}

export default function PostItem({ post }: PostItemProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 5); // Random like count for demo
  const [imageOpen, setImageOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendToEmail, setSendToEmail] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      content: "Great post! Looking forward to connecting.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: {
        id: 101,
        name: "Vikram Malhotra",
        avatarUrl: "/avatars/vikram.jpg"
      }
    },
    {
      id: 2,
      content: "This is really insightful. Thanks for sharing your perspective.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      user: {
        id: 102,
        name: "Priya Sharma",
        avatarUrl: "/avatars/priya.jpg"
      }
    }
  ]);
  
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Check if the current user is the post author
  const isCurrentUser = user?.id === post.user.id;
  
  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest<Response>("POST", `/api/users/${post.user.id}/follow`);
        if (!res.ok) throw new Error('Failed to follow user');
        return await res.json();
      } catch (error) {
        console.error("Follow API error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsFollowing(true);
      toast({
        title: "Success",
        description: `You are now following ${post.user.name}`
      });
      // Invalidate user queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to follow user: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest<Response>("DELETE", `/api/users/${post.user.id}/follow`);
        if (!res.ok) throw new Error('Failed to unfollow user');
        return await res.json();
      } catch (error) {
        console.error("Unfollow API error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsFollowing(false);
      toast({
        title: "Success",
        description: `You have unfollowed ${post.user.name}`
      });
      // Invalidate user queries to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to unfollow user: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest<Response>("POST", `/api/posts/${post.id}/like`);
      return await res.json();
    },
    onSuccess: () => {
      setLiked(true);
      setLikeCount(likeCount + 1);
      toast({
        title: "Post liked",
        description: "You have liked this post",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to like post: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Unlike post mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest<Response>("DELETE", `/api/posts/${post.id}/like`);
      return await res.json();
    },
    onSuccess: () => {
      setLiked(false);
      setLikeCount(likeCount - 1);
      toast({
        title: "Like removed",
        description: "You have removed your like from this post",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to unlike post: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest<Response>("POST", `/api/posts/${post.id}/comments`, { content });
      return await res.json();
    },
    onSuccess: (newComment) => {
      setComments([...comments, newComment]);
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been added to the post",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Send post mutation
  const sendPostMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest<Response>("POST", `/api/posts/${post.id}/share`, { email });
      return await res.json();
    },
    onSuccess: () => {
      setSendToEmail("");
      setSendDialogOpen(false);
      toast({
        title: "Post sent",
        description: "Your post has been sent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send post: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Share post mutation
  const sharePostMutation = useMutation({
    mutationFn: async (platform: string) => {
      const res = await apiRequest<Response>("POST", `/api/posts/${post.id}/share/platform`, { platform });
      return await res.json();
    },
    onSuccess: () => {
      setShareDialogOpen(false);
      toast({
        title: "Post shared",
        description: "Your post has been shared successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to share post: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Check if we have user data
  const hasUserData = !!post.user && !!post.user.name;
  
  return (
    <Card className="mb-4 overflow-hidden border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start space-x-3 mb-3">
          {/* Avatar */}
          {hasUserData ? (
            <Link href={`/profile/${post.user.id}`}>
              <Avatar className="h-10 w-10 md:h-12 md:w-12 cursor-pointer border border-[#E0E0E0]">
                <AvatarImage src={post.user.avatarUrl || ""} />
                <AvatarFallback className="bg-[#0077B5] text-white">
                  {getInitials(post.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-10 w-10 md:h-12 md:w-12 border border-[#E0E0E0]">
              <AvatarFallback className="bg-[#0077B5] text-white">HF</AvatarFallback>
            </Avatar>
          )}
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center">
              {hasUserData ? (
                <>
                  <Link href={`/profile/${post.user.id}`}>
                    <span className="font-medium hover:underline cursor-pointer text-sm md:text-base text-[#191919] mr-1">{post.user.name}</span>
                  </Link>
                  <span className="text-[#666666] text-xs md:text-sm whitespace-nowrap">• {getRoleDisplay(post.user.role)}</span>
                </>
              ) : (
                <span className="font-medium text-[#666666] text-sm md:text-base">Unknown User</span>
              )}
              {hasUserData && post.user.isVerified && (
                <div className="ml-1 text-[#0077B5]" title="Verified Account">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 fill-[#E5F5FC] stroke-[#0077B5]" />
                </div>
              )}
            </div>
            {hasUserData ? (
              <p className="text-[#666666] text-xs md:text-sm truncate">{post.user.title || post.user.company || ""}</p>
            ) : (
              <p className="text-[#666666] text-xs md:text-sm">Unknown</p>
            )}
            <p className="text-[#666666] text-[10px] md:text-xs">{getTimeAgo(post.createdAt)}</p>
          </div>
          
          {/* Follow Button (if not current user) */}
          {hasUserData && !isCurrentUser && user && (
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full h-8 px-3 text-xs font-medium",
                isFollowing 
                  ? "bg-[#E5F5FC] text-[#0077B5] border-[#0077B5] hover:bg-[#D1EBFC]" 
                  : "border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC]"
              )}
              onClick={handleFollowToggle}
              disabled={followMutation.isPending || unfollowMutation.isPending}
            >
              {followMutation.isPending || unfollowMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Post Content */}
        <div className="mb-3">
          <p className="text-[#191919] text-sm md:text-base whitespace-pre-line">{post.content}</p>
        </div>
        
        {/* Post Media */}
        {post.media && (
          <div className="mt-3 mb-3 relative">
            <img 
              src={post.media} 
              alt="Post media" 
              className="w-full rounded-md cursor-pointer" 
              onClick={() => setImageOpen(true)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute bottom-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 p-0"
              onClick={() => setImageOpen(true)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Post Stats */}
        <div className="flex items-center justify-between text-xs text-[#666666] mt-3">
          <div className="flex items-center">
            {likeCount > 0 && (
              <div className="flex items-center">
                <ThumbsUp className="h-3 w-3 text-[#0077B5] fill-[#0077B5]" />
                <span className="ml-1">{likeCount}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {comments.length > 0 && (
              <span className="cursor-pointer hover:underline" onClick={() => setCommentsOpen(true)}>
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Action Buttons */}
      <CardFooter className="px-0 py-0 border-t border-[#E0E0E0] flex justify-between">
        <div className="flex w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-none py-2 text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
            onClick={() => {
              if (liked) {
                unlikeMutation.mutate();
              } else {
                likeMutation.mutate();
              }
            }}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
          >
            {likeMutation.isPending || unlikeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className={`mr-2 h-4 w-4 ${liked ? 'text-[#0077B5] fill-[#0077B5]' : ''}`} />
            )}
            <span className={liked ? 'text-[#0077B5]' : ''}>{liked ? 'Liked' : 'Like'}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-none py-2 text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
            onClick={() => setCommentsOpen(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Comment</span>
            <span className="ml-1 text-xs">{comments.length > 0 ? `(${comments.length})` : ''}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-none py-2 text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-none py-2 text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
            onClick={() => setSendDialogOpen(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            <span>Send</span>
          </Button>
        </div>
      </CardFooter>
      
      {/* Image Dialog */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black rounded-lg overflow-hidden">
          <div className="relative">
            <img 
              src={post.media || ""} 
              alt="Post media" 
              className="w-full h-auto max-h-[80vh] object-contain" 
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 p-0"
              onClick={() => setImageOpen(false)}
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">Share Post</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Share this post with your network
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border border-[#E0E0E0] rounded-md p-3 bg-[#F3F2EF]">
              <p className="line-clamp-3 text-sm text-[#191919]">{post.content}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2]/10"
                onClick={() => sharePostMutation.mutate("twitter")}
                disabled={sharePostMutation.isPending}
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10"
                onClick={() => sharePostMutation.mutate("linkedin")}
                disabled={sharePostMutation.isPending}
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10"
                onClick={() => sharePostMutation.mutate("facebook")}
                disabled={sharePostMutation.isPending}
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center space-x-2 border-[#666666] text-[#666666] hover:bg-[#666666]/10"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
                  toast({
                    title: "Link copied",
                    description: "Post link copied to clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">Send Post</DialogTitle>
            <DialogDescription className="text-[#666666]">
              Send this post to someone via email
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border border-[#E0E0E0] rounded-md p-3 bg-[#F3F2EF]">
              <p className="line-clamp-3 text-sm text-[#191919]">{post.content}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#191919]">
                Recipient Email
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter email address" 
                className="border-[#E0E0E0] focus:ring-[#0077B5] focus:border-[#0077B5]"
                value={sendToEmail}
                onChange={(e) => setSendToEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-[#666666] text-[#666666] hover:bg-[#666666]/10"
              onClick={() => setSendDialogOpen(false)}
            >
              Cancel
            </Button>
            
            <Button 
              className="bg-[#0077B5] hover:bg-[#006097] text-white"
              onClick={() => sendPostMutation.mutate(sendToEmail)}
              disabled={!sendToEmail.trim() || sendPostMutation.isPending}
            >
              {sendPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Comments Dialog */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="sm:max-w-md rounded-lg shadow-lg border border-[#E0E0E0]">
          <DialogHeader>
            <DialogTitle className="text-[#191919] text-xl font-semibold">Comments</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {/* Post summary */}
            <div className="flex items-start space-x-3 mb-4">
              <Avatar className="h-8 w-8 border border-[#E0E0E0]">
                <AvatarImage src={post.user.avatarUrl || ""} />
                <AvatarFallback className="bg-[#0077B5] text-white text-xs">
                  {getInitials(post.user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-sm text-[#191919]">{post.user.name}</span>
                  {post.user.isVerified && (
                    <div className="ml-1 text-[#0077B5]" title="Verified Account">
                      <CheckCircle className="h-3 w-3 fill-[#E5F5FC]" />
                    </div>
                  )}
                </div>
                <p className="text-[#666666] text-xs">{getTimeAgo(post.createdAt)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-[#191919]">{post.content}</p>
              </div>
            </div>
            
            <Separator className="my-4 bg-[#E0E0E0]" />
            
            {/* Comments list */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 text-[#191919]">All Comments ({comments.length})</h3>
              
              <ScrollArea className="h-[250px] rounded-md border border-[#E0E0E0] p-4">
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex items-start">
                        <Avatar className="h-8 w-8 flex-shrink-0 border border-[#E0E0E0]">
                          <AvatarImage src={comment.user.avatarUrl || ""} />
                          <AvatarFallback className="bg-[#0077B5] text-white text-xs">
                            {getInitials(comment.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-2 flex-1">
                          <div className="bg-[#F3F2EF] rounded-md p-3">
                            <div className="flex items-center">
                              <span className="font-medium text-sm text-[#191919]">{comment.user.name}</span>
                              <span className="text-[#666666] text-xs ml-2">{getTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm mt-1 text-[#191919]">{comment.content}</p>
                          </div>
                          
                          <div className="flex items-center mt-1 text-xs text-[#666666] space-x-3">
                            <button className="hover:text-[#0077B5]" onClick={() => alert('Liked!')}>Like</button>
                            <button className="hover:text-[#0077B5]" onClick={() => alert('Replied!')}>Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#666666]">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-[#666666]" />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to comment on this post</p>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Add comment */}
            <div className="space-y-4">
              <Textarea 
                ref={commentInputRef}
                placeholder="Write a comment..." 
                className="min-h-[80px] border-[#E0E0E0] focus:ring-[#0077B5] focus:border-[#0077B5]"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              
              <Button 
                className="w-full bg-[#0077B5] hover:bg-[#006097] text-white rounded-full"
                disabled={!commentText.trim() || commentMutation.isPending}
                onClick={() => {
                  if (!commentText.trim()) return;
                  commentMutation.mutate(commentText);
                }}
              >
                {commentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
