import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2, Send, ZoomIn, Twitter, Linkedin, Facebook, Copy, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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
  const [imageOpen, setImageOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
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
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
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

  const hasMedia = post.media && post.media.length > 0;

  // Check if user data exists
  const hasUserData = post.user && post.user.id;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start">
          {hasUserData ? (
            <Link href={`/profile/${post.user.id}`}>
              <Avatar className="h-12 w-12 cursor-pointer flex-shrink-0">
                <AvatarImage src={post.user.avatarUrl || ""} alt={post.user.name} />
                <AvatarFallback className="bg-primary text-white">
                  {getInitials(post.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarFallback className="bg-gray-300 text-gray-600">
                ?
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className="ml-3">
            <div className="flex items-center">
              {hasUserData ? (
                <>
                  <Link href={`/profile/${post.user.id}`}>
                    <span className="font-medium hover:underline cursor-pointer">{post.user.name}</span>
                  </Link>
                  <span className="text-primary ml-1 text-sm">• {getRoleDisplay(post.user.role)}</span>
                </>
              ) : (
                <span className="font-medium text-gray-500">Unknown User</span>
              )}
              {hasUserData && post.user.isVerified && (
                <Badge variant="outline" className="ml-1 bg-blue-50 text-primary text-xs py-0 px-1 border-primary">
                  Verified
                </Badge>
              )}
            </div>
            {hasUserData ? (
              <p className="text-gray-500 text-sm">{post.user.title || post.user.company || ""}</p>
            ) : (
              <p className="text-gray-500 text-sm">Unknown</p>
            )}
            <p className="text-gray-500 text-xs">{getTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        
        <div className="mt-3 whitespace-pre-wrap">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i} className="text-gray-700 mb-2">{paragraph}</p>
          ))}
        </div>

        {hasMedia && (
          <div className="mt-3 relative">
            <Dialog open={imageOpen} onOpenChange={setImageOpen}>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <img 
                    src={post.media || ""} 
                    alt="Post media" 
                    className="w-full rounded-md max-h-96 object-contain bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all group-hover:bg-opacity-20">
                    <ZoomIn className="text-white scale-0 group-hover:scale-100 transition-all" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-2 bg-black bg-opacity-90">
                <img 
                  src={post.media || ""} 
                  alt="Post media" 
                  className="w-full h-full object-contain"
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 py-1 border-t flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center ${liked ? 'text-primary' : 'text-gray-600'}`}
          onClick={() => setLiked(!liked)}
        >
          <ThumbsUp className="mr-1 h-4 w-4" />
          <span>Like</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-gray-600"
          onClick={() => setCommentsOpen(true)}
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          <span>Comment</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-gray-600"
          onClick={() => setShareDialogOpen(true)}
        >
          <Share2 className="mr-1 h-4 w-4" />
          <span>Share</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
          <Send className="mr-1 h-4 w-4" />
          <span>Send</span>
        </Button>
      </CardFooter>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>
              Share this post with your network
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="line-clamp-3 text-sm">{post.content}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content.substring(0, 100) + '...')}&url=${encodeURIComponent(postUrl)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`;
                  window.open(`mailto:?subject=${encodeURIComponent('Check out this post on Hindustan Founders Network')}&body=${encodeURIComponent(`I thought you might be interested in this post:\n\n"${post.content.substring(0, 150)}..."\n\nRead more: ${postUrl}`)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                onClick={() => {
                  const postUrl = `${window.location.origin}/post/${post.id}`;
                  navigator.clipboard.writeText(postUrl);
                  toast({
                    title: "Link copied!",
                    description: "Post link has been copied to clipboard",
                  });
                  setShareDialogOpen(false);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Comments Dialog */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {/* Post preview */}
            <div className="flex items-start mb-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={post.user?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary text-white">
                  {post.user?.name ? getInitials(post.user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="font-medium">{post.user?.name || "Unknown User"}</span>
                  <span className="text-primary ml-1 text-sm">• {post.user?.role ? getRoleDisplay(post.user.role) : ""}</span>
                </div>
                <p className="text-gray-500 text-xs">{getTimeAgo(post.createdAt)}</p>
                <p className="mt-2 line-clamp-2 text-sm">{post.content}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Comments list */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">All Comments ({comments.length})</h3>
              
              <ScrollArea className="h-[250px] rounded-md border p-4">
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex items-start">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.user.avatarUrl || ""} />
                          <AvatarFallback className="bg-primary text-white text-xs">
                            {getInitials(comment.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="ml-2 flex-1">
                          <div className="bg-gray-50 rounded-md p-3">
                            <div className="flex items-center">
                              <span className="font-medium text-sm">{comment.user.name}</span>
                              <span className="text-gray-500 text-xs ml-2">{getTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                          
                          <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                            <button className="hover:text-gray-700">Like</button>
                            <button className="hover:text-gray-700">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
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
                className="min-h-[80px]"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              
              <Button 
                className="w-full"
                disabled={!commentText.trim() || isSubmittingComment}
                onClick={() => {
                  if (!commentText.trim()) return;
                  
                  setIsSubmittingComment(true);
                  
                  // Simulate API call
                  setTimeout(() => {
                    // Add new comment to the list
                    const newComment: Comment = {
                      id: Math.max(...comments.map(c => c.id), 0) + 1,
                      content: commentText,
                      createdAt: new Date(),
                      user: {
                        id: post.user?.id || 0,
                        name: post.user?.name || "You",
                        avatarUrl: post.user?.avatarUrl
                      }
                    };
                    
                    setComments([...comments, newComment]);
                    setCommentText("");
                    setIsSubmittingComment(false);
                    
                    toast({
                      title: "Comment posted",
                      description: "Your comment has been posted successfully",
                    });
                  }, 1000);
                }}
              >
                {isSubmittingComment ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
