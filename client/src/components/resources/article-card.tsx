import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Clock,
  Eye,
} from "lucide-react";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  categories: string[];
  tags: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  url: string;
}

interface ArticleCardProps {
  article: Article;
  isDetailed?: boolean;
}

export default function ArticleCard({ article, isDetailed = false }: ArticleCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Like article mutation
  const likeArticleMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to like articles");
      }
      
      const response = await fetch(`/api/articles/${article.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update like status");
      }
      
      return await response.json();
    },
    onMutate: () => {
      // Optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
    },
  });
  
  // Bookmark article mutation
  const bookmarkArticleMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to bookmark articles");
      }
      
      const response = await fetch(`/api/articles/${article.id}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to update bookmark status");
      }
      
      return await response.json();
    },
    onMutate: () => {
      // Optimistic update
      setIsBookmarked(!isBookmarked);
    },
    onError: (error: Error) => {
      // Revert optimistic update
      setIsBookmarked(!isBookmarked);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      
      toast({
        title: isBookmarked ? "Article removed from bookmarks" : "Article bookmarked",
        description: isBookmarked 
          ? "The article has been removed from your bookmarks" 
          : "The article has been added to your bookmarks",
      });
    },
  });
  
  // Share article
  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: article.url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(article.url);
      
      toast({
        title: "Link copied",
        description: "Article link has been copied to clipboard",
      });
    }
  };
  
  // Handle like
  const handleLike = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to like articles",
        variant: "default",
      });
      return;
    }
    
    likeArticleMutation.mutate();
  };
  
  // Handle bookmark
  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to bookmark articles",
        variant: "default",
      });
      return;
    }
    
    bookmarkArticleMutation.mutate();
  };
  
  // Navigate to article
  const navigateToArticle = () => {
    router.push(`/resources/articles/${article.id}`);
  };
  
  return (
    <Card className="overflow-hidden">
      {article.coverImage && (
        <div 
          className="h-48 w-full bg-cover bg-center cursor-pointer"
          style={{ backgroundImage: `url(${article.coverImage})` }}
          onClick={navigateToArticle}
        />
      )}
      
      <CardHeader className={article.coverImage ? "pt-4" : ""}>
        <div className="flex justify-between items-start">
          <div>
            {article.categories.length > 0 && (
              <div className="mb-2">
                {article.categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant="secondary"
                    className="mr-2"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
            
            <CardTitle 
              className="text-xl hover:text-primary cursor-pointer"
              onClick={navigateToArticle}
            >
              {article.title}
            </CardTitle>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBookmark}>
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4 mr-2" />
                    Remove Bookmark
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark Article
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={shareArticle}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardDescription>
          {article.excerpt}
        </CardDescription>
      </CardHeader>
      
      {isDetailed && (
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </CardContent>
      )}
      
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={article.author.avatar} alt={article.author.name} />
            <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{article.author.name}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span>{formatDate(article.publishedAt)}</span>
              <span className="mx-1">•</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>{article.readTime} min read</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex items-center ${isLiked ? 'text-primary' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{likeCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center"
            onClick={navigateToArticle}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>{article.comments}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex items-center ${isBookmarked ? 'text-primary' : ''}`}
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}