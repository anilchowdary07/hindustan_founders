import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, ChevronRight, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  publishedDate: Date;
  readTime: number;
  category: string;
  author: {
    id: number;
    name: string;
    title: string;
    avatarUrl?: string;
  };
  likes: number;
  comments: number;
  imageUrl?: string;
  saved: boolean;
}

export default function ArticleSection() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: 1,
      title: "How to Build a Successful Startup in India's Tech Ecosystem",
      summary: "Key insights and strategies for navigating India's competitive tech landscape",
      content: "",
      publishedDate: new Date('2025-04-12'),
      readTime: 8,
      category: "Entrepreneurship",
      author: {
        id: 1,
        name: "Rahul Sharma",
        title: "Founder & CEO at TechPioneers",
      },
      likes: 256,
      comments: 42,
      saved: false,
    },
    {
      id: 2,
      title: "Securing Seed Funding for Your Startup: A Comprehensive Guide",
      summary: "Everything you need to know about raising your first round of capital in India",
      content: "",
      publishedDate: new Date('2025-04-20'),
      readTime: 12,
      category: "Finance",
      author: {
        id: 2,
        name: "Priya Mehta",
        title: "Investment Partner at NextGen Ventures",
      },
      likes: 189,
      comments: 35,
      imageUrl: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGludmVzdG1lbnR8ZW58MHx8MHx8fDA%3D",
      saved: true,
    },
    {
      id: 3,
      title: "The Rise of Deep Tech Startups in India",
      summary: "How AI, ML, and blockchain are transforming India's startup ecosystem",
      content: "",
      publishedDate: new Date('2025-04-25'),
      readTime: 10,
      category: "Technology",
      author: {
        id: 3,
        name: "Vikram Joshi",
        title: "Tech Analyst at Innovation Hub",
      },
      likes: 312,
      comments: 57,
      imageUrl: "https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dGVjaG5vbG9neXxlbnwwfHwwfHx8MA%3D%3D",
      saved: false,
    },
  ]);
  
  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };
  
  const toggleSaved = (id: number) => {
    setArticles(articles.map(article => 
      article.id === id ? { ...article, saved: !article.saved } : article
    ));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Featured Articles</h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>
      
      <div className="space-y-6">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <div className="flex flex-col">
              {article.imageUrl && (
                <div className="h-40 w-full bg-gray-200">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between">
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{article.author.name.charAt(0)}</AvatarFallback>
                      {article.author.avatarUrl && <AvatarImage src={article.author.avatarUrl} />}
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{article.author.name}</div>
                      <div className="text-xs text-gray-500">{article.author.title}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleSaved(article.id)}
                  >
                    <Bookmark className={`h-5 w-5 ${article.saved ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-2 pb-2">
                <CardTitle className="text-lg font-bold mb-2 line-clamp-2">
                  {article.title}
                </CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {article.summary}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <span>{formatDate(article.publishedDate)}</span>
                  <span className="mx-1">•</span>
                  <span>{article.readTime} min read</span>
                  <span className="mx-1">•</span>
                  <span>{article.category}</span>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-3 flex justify-between border-t">
                <div className="flex space-x-4">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">{article.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-xs">{article.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="h-8">
                  Read More
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}