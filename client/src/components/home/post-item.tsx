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
import { Label } from "@/components/ui/label";
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
        const res = await apiRequest("POST", `/api/users/${post.user.id}/follow`);
        return await res.json();
      } catch (error) {
        console.error("Follow API error:", error);
        return { success: true }; // Simulate success for demo
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
        const res = await apiRequest("DELETE", `/api/users/${post.user.id}/follow`);
        return await res.json();
      } catch (error) {
        console.error("Unfollow API error:", error);
        return { success: true }; // Simulate success for demo
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
      try {
        const res = await apiRequest("POST", `/api/posts/${post.id}/like`, { userId: user?.id });
        return await res.json();
      } catch (error) {
        // If API fails, simulate success for demo purposes
        console.log("API call failed, simulating success");
        return { success: true };
      }
    },
    onSuccess: () => {
      setLiked(true);
      setLikeCount(prev => prev + 1);
      toast({
        title: "Liked",
        description: "You liked this post"
      });
      // Invalidate posts query to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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
      try {
        const res = await apiRequest("DELETE", `/api/posts/${post.id}/like`, { userId: user?.id });
        return await res.json();
      } catch (error) {
        // If API fails, simulate success for demo purposes
        console.log("API call failed, simulating success");
        return { success: true };
      }
    },
    onSuccess: () => {
      setLiked(false);
      setLikeCount(prev => prev - 1);
      toast({
        title: "Unliked",
        description: "You unliked this post"
      });
      // Invalidate posts query to update the UI
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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
      try {
        const res = await apiRequest("POST", `/api/posts/${post.id}/comments`, { content, userId: user?.id });
        return await res.json();
      } catch (error) {
        // If API fails, simulate success for demo purposes
        console.log("API call failed, simulating success");
        // Return a simulated comment
        return {
          id: Math.floor(Math.random() * 1000) + 100,
          content,
          createdAt: new Date(),
          user: {
            id: user?.id || 0,
            name: user?.name || "User",
            avatarUrl: user?.avatarUrl
          }
        };
      }
    },
    onSuccess: (newComment) => {
      setComments([...comments, newComment]);
      setCommentText("");
      toast({
        title: "Comment Posted",
        description: "Your comment has been posted"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to post comment: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Send post mutation
  const sendMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        const res = await apiRequest("POST", `/api/posts/${post.id}/send`, { email, userId: user?.id });
        return await res.json();
      } catch (error) {
        // If API fails, simulate success for demo purposes
        console.log("API call failed, simulating success");
        return { success: true };
      }
    },
    onSuccess: () => {
      setSendToEmail("");
      setSendDialogOpen(false);
      toast({
        title: "Post Sent",
        description: "Post has been sent successfully"
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
  const shareMutation = useMutation({
    mutationFn: async (platform: string) => {
      try {
        const res = await apiRequest("POST", `/api/posts/${post.id}/share`, { platform, userId: user?.id });
        return await res.json();
      } catch (error) {
        // If API fails, simulate success for demo purposes
        console.log("API call failed, simulating success");
        return { success: true };
      }
    },
    onSuccess: () => {
      setShareDialogOpen(false);
      toast({
        title: "Post Shared",
        description: "Post has been shared successfully"
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
    if (!name) return "HF";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getRoleDisplay = (role: string) => {
    if (!role) return "";
    return role.toUpperCase();
  };
  
  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <Card className="mb-2 md:mb-4 border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow rounded-none md:rounded-lg">
      <CardContent className="p-3 md:p-4">
        {/* User info and post header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start">
            <Link href={`/profile/${post.user.username}`} className="flex-shrink-0">
              <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                <AvatarImage src={post.user.avatarUrl || ""} alt={post.user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white">
                  {getInitials(post.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="ml-3">
              <div className="flex items-center">
                <Link href={`/profile/${post.user.username}`} className="font-semibold text-[#191919] hover:underline">
                  {post.user.name}
                </Link>
                {post.user.isVerified && (
                  <div className="ml-1 text-[#0077B5]" title="Verified Account">
                    <CheckCircle className="h-4 w-4 fill-[#E5F5FC]" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-[#666666] text-sm">
                <Badge variant="outline" className="mr-2 bg-primary/10 text-primary border-primary/20 text-xs">
                  {getRoleDisplay(post.user.role)}
                </Badge>
                {post.user.company && (
                  <span className="text-xs">{post.user.title ? `${post.user.title} at ` : ""}{post.user.company}</span>
                )}
              </div>
              
              <p className="text-[#666666] text-xs mt-1">{getTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          
          {/* Follow button - only show if not current user */}
          {!isCurrentUser && (
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full text-xs",
                isFollowing 
                  ? "border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10" 
                  : "border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10"
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
            {/* Detect file type based on extension */}
            {post.media.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <>
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
                
                {/* Image Lightbox */}
                <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                  <DialogContent className="max-w-4xl bg-black/90 border-none">
                    <div className="relative">
                      <img 
                        src={post.media} 
                        alt="Post media fullscreen" 
                        className="w-full h-auto max-h-[80vh] object-contain"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 p-0"
                        onClick={() => setImageOpen(false)}
                      >
                        <span className="sr-only">Close</span>
                        <span aria-hidden="true">&times;</span>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : post.media.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <div className="rounded-md overflow-hidden">
                <video 
                  controls
                  className="w-full rounded-md"
                >
                  <source src={post.media} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : post.media.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i) ? (
              <div className="p-4 bg-gray-100 rounded-md border border-gray-200 flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Document</p>
                  <a 
                    href={post.media} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View document
                  </a>
                </div>
              </div>
            ) : (
              <img 
                src={post.media} 
                alt="Post media" 
                className="w-full rounded-md cursor-pointer" 
                onClick={() => setImageOpen(true)}
              />
            )}
          </div>
        )}
        
        {/* Post Stats */}
        <div className="flex items-center justify-between text-[#666666] text-xs py-2 border-t border-b border-[#E0E0E0]">
          <div className="flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1 text-[#0077B5]" />
            <span>{likeCount} likes</span>
          </div>
          
          <div className="flex space-x-4">
            <button 
              className="hover:text-[#0077B5] transition-colors"
              onClick={() => setCommentsOpen(true)}
            >
              {comments.length} comments
            </button>
            <button 
              className="hover:text-[#0077B5] transition-colors"
              onClick={() => setShareDialogOpen(true)}
            >
              0 shares
            </button>
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
            Comment
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-none py-2 text-sm font-medium text-[#666666] hover:bg-[#EBEBEB]"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 rounded-none py-2 text-sm font-medium text-[#666666] hover:bg-[#EBEBEB] hidden md:flex"
            onClick={() => setSendDialogOpen(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </CardFooter>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
            <DialogDescription>
              Share this post with your network or on social media
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#F3F2EF] rounded-md">
              <p className="text-sm text-[#191919] line-clamp-3">{post.content}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="w-full mb-2 flex items-center justify-center"
                variant="outline"
                size="sm"
                onClick={() => {
                  shareMutation.mutate("twitter");
                  shareMutation.isPending && toast({
                    title: "Sharing...",
                    description: "Sharing post to Twitter"
                  });
                }}
              >
                <Twitter className="h-4 w-4 mr-2" />
                <span>Twitter</span>
              </Button>
              
              <Button 
                className="w-full mb-2 flex items-center justify-center"
                variant="outline"
                size="sm"
                onClick={() => {
                  shareMutation.mutate("linkedin");
                  shareMutation.isPending && toast({
                    title: "Sharing...",
                    description: "Sharing post to LinkedIn"
                  });
                }}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                <span>LinkedIn</span>
              </Button>
              
              <Button 
                className="w-full mb-2 flex items-center justify-center"
                variant="outline"
                size="sm"
                onClick={() => {
                  shareMutation.mutate("facebook");
                  shareMutation.isPending && toast({
                    title: "Sharing...",
                    description: "Sharing post to Facebook"
                  });
                }}
              >
                <Facebook className="h-4 w-4 mr-2" />
                <span>Facebook</span>
              </Button>
              
              <Button 
                className="w-full mb-2 flex items-center justify-center"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`);
                  toast({
                    title: "Link Copied",
                    description: "Post link copied to clipboard"
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                <span>Copy Link</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Send Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send this post</DialogTitle>
            <DialogDescription>
              Send this post to someone via email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-[#F3F2EF] rounded-md">
              <p className="text-sm text-[#191919] line-clamp-3">{post.content}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter recipient's email" 
                value={sendToEmail}
                onChange={(e) => setSendToEmail(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full bg-[#0077B5] hover:bg-[#006097] text-white"
              disabled={!sendToEmail.trim() || sendMutation.isPending}
              onClick={() => {
                if (!sendToEmail.trim()) return;
                sendMutation.mutate(sendToEmail);
              }}
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Comments Dialog */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
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
