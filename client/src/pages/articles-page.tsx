import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { Search, Filter, BookmarkCheck } from "lucide-react";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample articles data
const articlesData = [
  {
    id: "1",
    title: "10 Essential Strategies for Startup Success in India",
    excerpt: "Starting a business in India presents unique challenges and opportunities. The startup ecosystem has evolved dramatically over the past decade, with cities like Bangalore, Mumbai, and Hyderabad becoming vibrant hubs of innovation and entrepreneurship.",
    author: {
      id: 101,
      name: "Vikram Malhotra",
      title: "Serial Entrepreneur",
      avatarUrl: "/avatars/vikram.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    readTime: "8 min read",
    category: "Entrepreneurship",
    tags: ["startup", "business", "strategy", "india"],
    likes: 245,
    comments: 37,
    isBookmarked: false,
    featured: true
  },
  {
    id: "2",
    title: "The Future of Fintech in India: Opportunities and Challenges",
    excerpt: "India's fintech landscape has undergone a remarkable transformation in recent years. From digital payments to lending platforms, insurance tech to wealth management solutions, fintech innovations are reshaping how Indians access and interact with financial services.",
    author: {
      id: 102,
      name: "Priya Sharma",
      title: "Fintech Analyst",
      avatarUrl: "/avatars/priya.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    readTime: "10 min read",
    category: "Fintech",
    tags: ["fintech", "digital payments", "banking", "financial inclusion"],
    likes: 189,
    comments: 23,
    isBookmarked: true,
    featured: true
  },
  {
    id: "3",
    title: "Building a Sustainable Business: Environmental Practices for Indian Startups",
    excerpt: "As climate concerns grow globally, Indian startups have a unique opportunity to build sustainability into their core business models from day one. This article explores practical approaches to environmental responsibility for early-stage companies.",
    author: {
      id: 103,
      name: "Arjun Kapoor",
      title: "Sustainability Consultant",
      avatarUrl: "/avatars/arjun.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    readTime: "12 min read",
    category: "Sustainability",
    tags: ["sustainability", "environment", "green business", "social impact"],
    likes: 156,
    comments: 18,
    isBookmarked: false,
    featured: false
  },
  {
    id: "4",
    title: "Navigating Regulatory Challenges for Tech Startups in India",
    excerpt: "India's regulatory landscape for technology companies is evolving rapidly. From data protection to sector-specific regulations, founders need to stay informed about compliance requirements that may impact their business models.",
    author: {
      id: 104,
      name: "Neha Gupta",
      title: "Legal Advisor",
      avatarUrl: "/avatars/neha.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    readTime: "9 min read",
    category: "Legal",
    tags: ["legal", "compliance", "regulations", "policy"],
    likes: 132,
    comments: 27,
    isBookmarked: false,
    featured: false
  },
  {
    id: "5",
    title: "Fundraising Strategies for Early-Stage Startups in India",
    excerpt: "Securing funding is a critical milestone for most startups. This comprehensive guide explores various funding options available to Indian entrepreneurs, from angel investors and venture capital to government grants and bootstrapping.",
    author: {
      id: 105,
      name: "Rahul Mehta",
      title: "Venture Capitalist",
      avatarUrl: "/avatars/rahul.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
    readTime: "11 min read",
    category: "Fundraising",
    tags: ["fundraising", "venture capital", "angel investors", "pitch deck"],
    likes: 278,
    comments: 42,
    isBookmarked: true,
    featured: true
  },
  {
    id: "6",
    title: "Building a Strong Company Culture in Remote-First Organizations",
    excerpt: "As remote work becomes the norm for many Indian startups, building and maintaining a strong company culture presents new challenges. This article shares best practices from founders who have successfully built cohesive remote teams.",
    author: {
      id: 106,
      name: "Ananya Patel",
      title: "HR Consultant",
      avatarUrl: "/avatars/ananya.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
    readTime: "7 min read",
    category: "Culture",
    tags: ["remote work", "company culture", "team building", "hr"],
    likes: 165,
    comments: 31,
    isBookmarked: false,
    featured: false
  }
];

// Categories for filtering
const categories = [
  "All Categories",
  "Entrepreneurship",
  "Fintech",
  "Sustainability",
  "Legal",
  "Fundraising",
  "Culture",
  "Technology",
  "Marketing"
];

export default function ArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");
  
  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Filter and sort articles
  const filteredArticles = articlesData.filter(article => {
    // Filter by search query
    const matchesSearch = 
      searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = 
      selectedCategory === "All Categories" || 
      article.category === selectedCategory;
    
    // Filter by tab
    const matchesTab = 
      (activeTab === "all") ||
      (activeTab === "featured" && article.featured) ||
      (activeTab === "bookmarked" && article.isBookmarked);
    
    return matchesSearch && matchesCategory && matchesTab;
  }).sort((a, b) => {
    // Sort by selected criteria
    if (sortBy === "recent") {
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    } else if (sortBy === "popular") {
      return b.likes - a.likes;
    } else if (sortBy === "comments") {
      return b.comments - a.comments;
    }
    return 0;
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Articles</h1>
            <p className="text-gray-500 mt-1">Insights and knowledge from the Hindustan Founders community</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button variant="outline" className="mr-2">
              Write an Article
            </Button>
            <Button>
              Submit for Review
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Articles</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search articles..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="comments">Most Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Articles list */}
            {filteredArticles.length > 0 ? (
              <div className="space-y-6">
                {filteredArticles.map(article => (
                  <Card key={article.id} className="overflow-hidden">
                    <CardHeader className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            {article.category}
                          </Badge>
                          <span className="text-gray-500 text-sm">{article.readTime}</span>
                          <span className="text-gray-500 text-sm">•</span>
                          <span className="text-gray-500 text-sm">{getTimeAgo(article.publishedAt)}</span>
                        </div>
                        
                        {article.isBookmarked && (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      
                      <CardTitle className="text-xl mb-2">
                        <Link href={`/article/${article.id}`} className="hover:text-primary transition-colors">
                          {article.title}
                        </Link>
                      </CardTitle>
                      
                      <CardDescription className="text-gray-700">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardFooter className="p-6 pt-0 flex justify-between items-center border-t">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={article.author.avatarUrl} />
                          <AvatarFallback>{getInitials(article.author.name)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-2">
                          <p className="text-sm font-medium">{article.author.name}</p>
                          <p className="text-xs text-gray-500">{article.author.title}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{article.likes} likes</span>
                        <span>{article.comments} comments</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-gray-500 mb-2">No articles found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(articlesData.flatMap(a => a.tags))).map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                      onClick={() => setSearchQuery(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Featured authors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Featured Authors</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {Array.from(new Set(articlesData.map(a => a.author.id))).slice(0, 5).map(authorId => {
                    const author = articlesData.find(a => a.author.id === authorId)?.author;
                    if (!author) return null;
                    
                    return (
                      <div key={author.id} className="flex items-center p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={author.avatarUrl} />
                          <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{author.name}</p>
                          <p className="text-sm text-gray-500">{author.title}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Writing guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Writing Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    <span>Focus on providing valuable insights for the founder community</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    <span>Share personal experiences and lessons learned</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    <span>Include actionable advice and practical tips</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                    <span>Respect intellectual property and cite sources</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/20 text-primary rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                    <span>Be respectful and constructive in your writing</span>
                  </li>
                </ul>
                
                <Separator className="my-4" />
                
                <Button variant="outline" className="w-full">
                  View Full Guidelines
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
