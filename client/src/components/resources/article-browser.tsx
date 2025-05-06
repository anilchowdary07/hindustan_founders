import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import ArticleCard, { Article } from "./article-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Bookmark,
  TrendingUp,
  Clock,
  Tag,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Categories
const CATEGORIES = [
  "All Categories",
  "Startup",
  "Funding",
  "Growth",
  "Marketing",
  "Product",
  "Technology",
  "Leadership",
  "Finance",
  "Legal",
];

// Tags
const POPULAR_TAGS = [
  "startup",
  "funding",
  "venture-capital",
  "product-market-fit",
  "growth-hacking",
  "pitch-deck",
  "saas",
  "ai",
  "blockchain",
  "remote-work",
];

interface ArticleBrowserProps {
  initialTab?: string;
  initialCategory?: string;
  initialTag?: string;
  showCreateButton?: boolean;
}

export default function ArticleBrowser({
  initialTab = "articles",
  initialCategory = "All Categories",
  initialTag = "",
  showCreateButton = true,
}: ArticleBrowserProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialTag ? [initialTag] : []
  );
  const [showFilters, setShowFilters] = useState(false);
  
  // Update selected tags if initialTag changes
  useEffect(() => {
    if (initialTag && !selectedTags.includes(initialTag)) {
      setSelectedTags([...selectedTags, initialTag]);
    }
  }, [initialTag]);
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Fetch articles
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/resources/articles', activeTab, debouncedSearchQuery, categoryFilter, sortBy, selectedTags],
    queryFn: async () => {
      let url = '/api/resources/articles?';
      
      if (activeTab === "bookmarked" && user) {
        url += 'bookmarked=true&';
      } else if (activeTab === "trending") {
        url += 'trending=true&';
      }
      
      if (debouncedSearchQuery) {
        url += `search=${encodeURIComponent(debouncedSearchQuery)}&`;
      }
      
      if (categoryFilter !== "All Categories") {
        url += `category=${encodeURIComponent(categoryFilter)}&`;
      }
      
      if (sortBy) {
        url += `sort=${encodeURIComponent(sortBy)}&`;
      }
      
      if (selectedTags.length > 0) {
        url += `tags=${encodeURIComponent(selectedTags.join(','))}&`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      
      return await response.json();
    },
    staleTime: 60000, // 1 minute
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be updated in the useQuery hook
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All Categories");
    setSortBy("recent");
    setSelectedTags([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Articles & Insights</h2>
          <p className="text-gray-600 mt-1">
            Discover the latest insights, guides, and resources
          </p>
        </div>
        
        {showCreateButton && user && (
          <Button 
            onClick={() => router.push('/resources/create')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles, guides, and resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Search
            </Button>
          </form>
          
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="category-filter" className="text-sm font-medium block mb-1">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="sort-by" className="text-sm font-medium block mb-1">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Selected tags:</span>
          {selectedTags.map((tag) => (
            <Badge 
              key={tag} 
              variant="default"
              className="flex items-center gap-1"
            >
              {tag}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedTags([])}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {POPULAR_TAGS.slice(0, 8).map((tag) => (
          <Badge 
            key={tag} 
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(tag)}
          >
            #{tag}
          </Badge>
        ))}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="articles" className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            All Articles
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="bookmarked" className="flex items-center">
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarked
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading articles...</span>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading articles</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {error instanceof Error ? error.message : "There was an error loading the articles. Please try again."}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : activeTab === "bookmarked" && !user ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Bookmark className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Sign in to view bookmarks</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You need to be logged in to see your bookmarked articles
                  </p>
                  <Button 
                    onClick={() => router.push('/login')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : articles?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No articles found</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    {activeTab === "bookmarked" 
                      ? "You haven't bookmarked any articles yet. Browse articles and bookmark the ones you're interested in."
                      : "No articles match your current filters. Try adjusting your search criteria."}
                  </p>
                  {activeTab === "bookmarked" ? (
                    <Button 
                      onClick={() => setActiveTab("articles")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Browse Articles
                    </Button>
                  ) : (
                    <Button 
                      onClick={clearFilters}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles?.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}