import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  Heart, 
  Award
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Post {
  id: number;
  content: string;
  createdAt: Date;
  media?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  user: {
    id: number;
    name: string;
    title?: string;
    company?: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

export default function SamplePosts() {
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: "Excited to announce that we've secured our seed funding round of $1.5M led by Accel Partners! This is a big milestone for our team as we continue to build innovative solutions for small businesses across India. Looking forward to this journey! #StartupIndia #FundingNews",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      likesCount: 87,
      commentsCount: 23,
      sharesCount: 7,
      isLiked: false,
      user: {
        id: 1,
        name: "Vikram Sharma",
        title: "Founder & CEO",
        company: "PaySync Technologies",
        isVerified: true,
      }
    },
    {
      id: 2,
      content: "Just published my article on 'Building a Tech Startup in India's Competitive Landscape'. Sharing insights from my journey and the key challenges we faced. Would love to hear your thoughts and experiences!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      media: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGVjaHxlbnwwfHwwfHx8MA%3D%3D",
      likesCount: 142,
      commentsCount: 38,
      sharesCount: 22,
      isLiked: true,
      user: {
        id: 2,
        name: "Priya Mehta",
        title: "Co-Founder",
        company: "EduTech Solutions",
        isVerified: true,
      }
    },
    {
      id: 3,
      content: "We're hiring! Looking for talented developers to join our growing team. If you're passionate about building products that make a difference, check out our job openings. Remote options available. #Hiring #TechJobs #RemoteWork",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      likesCount: 56,
      commentsCount: 12,
      sharesCount: 15,
      isLiked: false,
      user: {
        id: 3,
        name: "Raj Kumar",
        title: "HR Director",
        company: "InnoTech India",
        isVerified: false,
      }
    },
  ]);
  
  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.isLiked;
        return {
          ...post,
          isLiked: newIsLiked,
          likesCount: newIsLiked ? post.likesCount + 1 : post.likesCount - 1
        };
      }
      return post;
    }));
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
          {/* Post Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                {post.user.avatarUrl && <AvatarImage src={post.user.avatarUrl} />}
              </Avatar>
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold text-sm">{post.user.name}</h3>
                  {post.user.isVerified && (
                    <Award className="h-3.5 w-3.5 text-blue-500 ml-1" />
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {post.user.title}
                  {post.user.title && post.user.company && ' at '}
                  {post.user.company}
                </div>
                <div className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Save post</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Follow {post.user.name}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Report post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Post Content */}
          <div className="mb-3">
            <p className="text-sm whitespace-pre-line">{post.content}</p>
          </div>
          
          {/* Post Media */}
          {post.media && (
            <div className="mb-3 rounded-md overflow-hidden">
              <img 
                src={post.media} 
                alt="Post attachment" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {/* Post Stats */}
          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
            <div className="flex items-center">
              <div className="flex -space-x-1 mr-1">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <ThumbsUp className="h-3 w-3 text-white" />
                </div>
                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </div>
              </div>
              <span>{post.likesCount}</span>
            </div>
            <div className="flex space-x-2">
              <span>{post.commentsCount} comments</span>
              <span>•</span>
              <span>{post.sharesCount} shares</span>
            </div>
          </div>
          
          {/* Post Actions */}
          <div className="flex border-t pt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`flex-1 ${post.isLiked ? 'text-primary' : ''}`}
              onClick={() => toggleLike(post.id)}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-primary' : ''}`} />
              Like
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comment
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
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Post shared",
                  description: "You can now share this post with your network",
                });
              }}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}