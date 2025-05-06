import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import ArticleCard, { Article } from "@/components/resources/article-card";
import { useDebounce } from "@/hooks/use-debounce";

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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  BookOpen,
  Bookmark,
  TrendingUp,
  Clock,
  Tag,
  Loader2,
  AlertCircle,
  Plus,
  X,
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

export default function ResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Fetch articles
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/resources/articles', activeTab, debouncedSearchQuery, categoryFilter, sortBy, selectedTags],
    queryFn: async () => {
      let url = '/api/resources/articles?';
      
      if (activeTab === "bookmarked" && user) {
        url += 'bookmarked=true&';
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mt-1">
            Articles, guides, and resources to help you build and grow your startup
          </p>
        </div>
        
        {user && (
          <Button 
            onClick={() => router.push('/resources/create')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
              <CardDescription>
                Refine your search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <div>
                <label className="text-sm font-medium block mb-2">
                  Popular Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedTags.includes(tag) ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium hover:text-primary cursor-pointer">
                  How to Create the Perfect Pitch Deck
                </div>
                <div className="text-sm font-medium hover:text-primary cursor-pointer">
                  10 Fundraising Mistakes to Avoid
                </div>
                <div className="text-sm font-medium hover:text-primary cursor-pointer">
                  Building a Minimum Viable Product
                </div>
                <div className="text-sm font-medium hover:text-primary cursor-pointer">
                  Finding Your First Customers
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3 space-y-6">
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
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Search
                </Button>
              </form>
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="articles" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Articles
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
                  <span className="ml-2 text-gray-600">Loading resources...</span>
                </div>
              ) : error ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading resources</h3>
                      <p className="text-gray-500 mb-4 max-w-md">
                        {error instanceof Error ? error.message : "There was an error loading the resources. Please try again."}
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
      </div>
    </div>
  );
}