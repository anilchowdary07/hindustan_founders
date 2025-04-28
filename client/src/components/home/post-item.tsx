import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2, Send, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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

export default function PostItem({ post }: PostItemProps) {
  const [liked, setLiked] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
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
                <AvatarImage src={post.user.avatarUrl || ""} />
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
                    src={post.media} 
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
                  src={post.media} 
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>Comment</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Textarea 
                placeholder="Write a comment..." 
                className="min-h-[100px]"
                onChange={(e) => console.log(e.target.value)}
              />
              <Button 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Comment posted",
                    description: "Your comment has been posted successfully",
                  });
                }}
              >
                Post Comment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center text-gray-600"
          onClick={() => {
            const postUrl = `${window.location.origin}/post/${post.id}`;
            navigator.clipboard.writeText(postUrl);
            toast({
              title: "Link copied!",
              description: "Post link has been copied to clipboard",
            });
          }}
        >
          <Share2 className="mr-1 h-4 w-4" />
          <span>Share</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
          <Send className="mr-1 h-4 w-4" />
          <span>Send</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
