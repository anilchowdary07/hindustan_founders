import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ArticleCard, { Article } from "@/components/resources/article-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Clock,
  Calendar,
  Eye,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [commentText, setCommentText] = useState("");
  
  // Fetch article details
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/resources/articles/${id}`],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/resources/articles/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch article");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch article comments
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: [`/api/resources/articles/${id}/comments`],
    queryFn: async () => {
      if (!id) return [];
      
      const response = await fetch(`/api/resources/articles/${id}/comments`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
  
  // Fetch related articles
  const { data: relatedArticles } = useQuery<Article[]>({
    queryKey: [`/api/resources/articles/${id}/related`],
    queryFn: async () => {
      if (!id) return [];
      
      const response = await fetch(`/api/resources/articles/${id}/related`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch related articles");
      }
      
      return await response.json();
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
  
  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!id) throw new Error("Article ID is required");
      if (!user) throw new Error("You must be logged in to comment");
      
      const response = await fetch(`/api/resources/articles/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to post comment");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      setCommentText("");
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
      
      // Invalidate and refetch comments
      queryClient.invalidateQueries({ queryKey: [`/api/resources/articles/${id}/comments`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });
  
  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to post comments",
        variant: "default",
      });
      return;
    }
    
    postCommentMutation.mutate(commentText);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push('/resources')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resources
          </Button>
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-6">
          <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.push('/resources')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resources
          </Button>
          <h1 className="text-2xl font-bold">Article Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading article</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                {error instanceof Error ? error.message : "The article you're looking for could not be found or has been removed."}
              </p>
              <Button 
                onClick={() => router.push('/resources')}
                variant="outline"
              >
                Browse Other Articles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2"
          onClick={() => router.push('/resources')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Resources
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {article.coverImage && (
              <div 
                className="h-64 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${article.coverImage})` }}
              />
            )}
            
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {article.categories.map((category) => (
                  <Button 
                    key={category} 
                    variant="outline" 
                    size="sm"
                    className="rounded-full"
                    onClick={() => router.push(`/resources?category=${category}`)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
              
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={article.author.avatar} alt={article.author.name} />
                  <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{article.author.name}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(article.publishedAt)}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{article.readTime} min read</span>
                  </div>
                </div>
              </div>
              
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
              
              <div className="flex flex-wrap gap-2 mt-6">
                {article.tags.map((tag) => (
                  <Button 
                    key={tag} 
                    variant="outline" 
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => router.push(`/resources?tag=${tag}`)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => {
                      // Like functionality would be implemented here
                      toast({
                        title: "Feature coming soon",
                        description: "The like feature will be available soon",
                      });
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center"
                    onClick={() => {
                      // Bookmark functionality would be implemented here
                      toast({
                        title: "Feature coming soon",
                        description: "The bookmark feature will be available soon",
                      });
                    }}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmark
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: article.title,
                        text: article.excerpt,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied",
                        description: "Article link has been copied to clipboard",
                      });
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </article>
          
          {/* Comments Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden p-6">
            <h2 className="text-xl font-bold mb-4">Comments</h2>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="mb-2"
                    />
                    <Button 
                      type="submit"
                      disabled={postCommentMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {postCommentMutation.isPending ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Posting...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Post Comment
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm text-gray-600">
                  Please <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>sign in</Button> to post a comment.
                </p>
              </div>
            )}
            
            {isLoadingComments ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading comments...</span>
              </div>
            ) : comments?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-6">
                {comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium">{comment.author.name}</div>
                        <div className="text-xs text-gray-500 ml-2">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                      <div className="mt-1 text-gray-700">{comment.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About the Author</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={article.author.avatar} alt={article.author.name} />
                  <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg">{article.author.name}</div>
                  <div className="text-sm text-gray-500">Founder & Writer</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Expert in startup growth and product development with over 10 years of experience in the tech industry.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/profile/${article.author.id}`)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
          
          {relatedArticles && relatedArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Articles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <div 
                    key={relatedArticle.id} 
                    className="flex gap-3 cursor-pointer"
                    onClick={() => router.push(`/resources/articles/${relatedArticle.id}`)}
                  >
                    {relatedArticle.coverImage ? (
                      <div 
                        className="h-16 w-16 rounded bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${relatedArticle.coverImage})` }}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <BookmarkCheck className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium hover:text-primary line-clamp-2">
                        {relatedArticle.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{relatedArticle.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/resources')}
                >
                  View All Articles
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {article.tags.concat(['startup', 'funding', 'growth', 'product']).slice(0, 10).map((tag) => (
                  <Button 
                    key={tag} 
                    variant="outline" 
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => router.push(`/resources?tag=${tag}`)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}