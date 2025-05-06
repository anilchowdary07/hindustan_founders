import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Bookmark, 
  BookmarkPlus, 
  User, 
  Briefcase, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare,
  Filter,
  ChevronDown,
  Clock,
  X,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearch, SearchResult, SearchFilters } from '@/hooks/use-search';
import { useSavedItems } from '@/hooks/use-saved-items';

export default function SearchPage() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isLoading,
    savedSearches,
    saveSearch
  } = useSearch();
  
  const {
    isItemSaved,
    saveItem,
    removeItem
  } = useSavedItems();
  
  // Parse query parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    const queryParam = searchParams.get('q');
    const typesParam = searchParams.get('types');
    const tagsParam = searchParams.get('tags');
    
    if (queryParam) {
      setQuery(queryParam);
    }
    
    const newFilters: SearchFilters = {};
    
    if (typesParam) {
      newFilters.type = typesParam.split(',');
    }
    
    if (tagsParam) {
      newFilters.tags = tagsParam.split(',');
    }
    
    setFilters(newFilters);
  }, [location]);
  
  // Filter results based on active tab
  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab);
  
  // Handle saving a search
  const handleSaveSearch = () => {
    if (query.trim()) {
      const id = saveSearch();
      if (id) {
        toast({
          title: "Search saved",
          description: "You can access this search later from your saved searches."
        });
      }
    } else {
      toast({
        title: "Cannot save empty search",
        description: "Please enter a search query first.",
        variant: "destructive"
      });
    }
  };
  
  // Handle saving an item
  const handleSaveItem = (result: SearchResult) => {
    if (isItemSaved(result.id.toString())) {
      removeItem(result.id.toString());
      toast({
        title: "Item removed",
        description: `${result.title} has been removed from your saved items.`
      });
    } else {
      const saved = saveItem({
        id: result.id.toString(),
        type: result.type as any,
        title: result.title,
        description: result.description,
        url: result.url,
        imageUrl: result.imageUrl,
        date: result.date,
        tags: result.tags
      });
      
      if (saved) {
        toast({
          title: "Item saved",
          description: `${result.title} has been added to your saved items.`
        });
      }
    }
  };
  
  // Toggle type filter
  const toggleTypeFilter = (type: string) => {
    setFilters(prev => {
      const currentTypes = prev.type || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type];
      
      return {
        ...prev,
        type: newTypes
      };
    });
  };
  
  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setFilters(prev => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      
      return {
        ...prev,
        tags: newTags
      };
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({});
  };
  
  // Get count of active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type && filters.type.length > 0) count += filters.type.length;
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length;
    if (filters.date && (filters.date.from || filters.date.to)) count += 1;
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Search className="mr-2 h-6 w-6" />
              Search Results
            </h1>
            {query && (
              <p className="text-[#666666] mt-1">
                Showing results for "{query}"
              </p>
            )}
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="text-[#666666]"
              onClick={handleSaveSearch}
              disabled={!query}
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save Search
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
                <CardDescription>
                  Refine your search results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Content Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-people" 
                        checked={filters.type?.includes('user')}
                        onCheckedChange={() => toggleTypeFilter('user')}
                      />
                      <Label htmlFor="filter-people" className="text-sm">People</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-jobs" 
                        checked={filters.type?.includes('job')}
                        onCheckedChange={() => toggleTypeFilter('job')}
                      />
                      <Label htmlFor="filter-jobs" className="text-sm">Jobs</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-events" 
                        checked={filters.type?.includes('event')}
                        onCheckedChange={() => toggleTypeFilter('event')}
                      />
                      <Label htmlFor="filter-events" className="text-sm">Events</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-groups" 
                        checked={filters.type?.includes('group')}
                        onCheckedChange={() => toggleTypeFilter('group')}
                      />
                      <Label htmlFor="filter-groups" className="text-sm">Groups</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-articles" 
                        checked={filters.type?.includes('article')}
                        onCheckedChange={() => toggleTypeFilter('article')}
                      />
                      <Label htmlFor="filter-articles" className="text-sm">Articles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-posts" 
                        checked={filters.type?.includes('post')}
                        onCheckedChange={() => toggleTypeFilter('post')}
                      />
                      <Label htmlFor="filter-posts" className="text-sm">Posts</Label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['startup', 'funding', 'tech', 'marketing', 'remote', 'ai'].map(tag => (
                      <Badge 
                        key={tag}
                        variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleTagFilter(tag)}
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
                  disabled={activeFilterCount === 0}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] h-4 w-4" />
                    <Input
                      placeholder="Search..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10 border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                    />
                  </div>
                  <Button 
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white"
                    disabled={!query.trim()}
                  >
                    Search
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-[#0077B5] border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-[#666666]">Searching...</p>
                  </div>
                ) : !query ? (
                  <div className="p-8 text-center">
                    <Search className="h-12 w-12 text-[#E0E0E0] mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">Enter a search term</h3>
                    <p className="text-[#666666] mb-4">Start typing to search for people, jobs, events, and more</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="h-12 w-12 text-[#E0E0E0] mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No results found</h3>
                    <p className="text-[#666666] mb-4">Try adjusting your search or filters</p>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                      <div className="border-b">
                        <TabsList className="p-0 h-12 bg-transparent">
                          <TabsTrigger 
                            value="all" 
                            className="flex-1 h-12 data-[state=active]:border-b-2 data-[state=active]:border-[#0077B5] data-[state=active]:shadow-none rounded-none"
                          >
                            All Results ({results.length})
                          </TabsTrigger>
                          {['user', 'job', 'event', 'group', 'article', 'post'].map(type => {
                            const count = results.filter(r => r.type === type).length;
                            if (count === 0) return null;
                            
                            return (
                              <TabsTrigger 
                                key={type}
                                value={type} 
                                className="flex-1 h-12 data-[state=active]:border-b-2 data-[state=active]:border-[#0077B5] data-[state=active]:shadow-none rounded-none capitalize"
                              >
                                {type}s ({count})
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>
                      </div>
                      
                      <TabsContent value="all" className="mt-0">
                        <div className="divide-y">
                          {filteredResults.map((result) => (
                            <div 
                              key={`${result.type}-${result.id}`}
                              className="p-4 hover:bg-[#F3F2EF]"
                            >
                              <ResultItem 
                                result={result} 
                                isSaved={isItemSaved(result.id.toString())}
                                onSave={() => handleSaveItem(result)}
                                onNavigate={() => navigate(result.url)}
                              />
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      {['user', 'job', 'event', 'group', 'article', 'post'].map(type => (
                        <TabsContent key={type} value={type} className="mt-0">
                          <div className="divide-y">
                            {results
                              .filter(result => result.type === type)
                              .map((result) => (
                                <div 
                                  key={`${result.type}-${result.id}`}
                                  className="p-4 hover:bg-[#F3F2EF]"
                                >
                                  <ResultItem 
                                    result={result} 
                                    isSaved={isItemSaved(result.id.toString())}
                                    onSave={() => handleSaveItem(result)}
                                    onNavigate={() => navigate(result.url)}
                                  />
                                </div>
                              ))}
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Result Item Component
function ResultItem({ 
  result, 
  isSaved, 
  onSave, 
  onNavigate 
}: { 
  result: SearchResult; 
  isSaved: boolean;
  onSave: () => void;
  onNavigate: () => void;
}) {
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'post':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="flex">
      {result.type === 'user' ? (
        <Avatar className="h-12 w-12 mr-3 cursor-pointer" onClick={onNavigate}>
          <AvatarImage src={result.imageUrl} />
          <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2]">
            {result.title.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-12 w-12 mr-3 rounded-md bg-[#F3F2EF] flex items-center justify-center cursor-pointer" onClick={onNavigate}>
          {getResultIcon(result.type)}
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center">
          <h4 className="font-medium text-[#191919] cursor-pointer hover:text-[#0A66C2] hover:underline" onClick={onNavigate}>
            {result.title}
          </h4>
          <Badge 
            variant="outline" 
            className="ml-2 capitalize text-xs"
          >
            {result.type}
          </Badge>
        </div>
        
        {result.description && (
          <p className="text-sm text-[#666666] mt-1 line-clamp-2">{result.description}</p>
        )}
        
        <div className="flex items-center mt-2 text-xs text-[#666666]">
          {result.date && (
            <span className="mr-3">{formatDate(result.date)}</span>
          )}
          
          {result.tags && result.tags.length > 0 && (
            <div className="flex items-center">
              <span className="mr-1">Tags:</span>
              <div className="flex gap-1">
                {result.tags.slice(0, 3).map(tag => (
                  <Badge 
                    key={tag}
                    variant="secondary"
                    className="text-xs px-1.5 py-0 h-5"
                  >
                    {tag}
                  </Badge>
                ))}
                {result.tags.length > 3 && (
                  <span>+{result.tags.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${isSaved ? 'text-[#0A66C2]' : 'text-[#666666]'}`}
          onClick={onSave}
          title={isSaved ? "Remove from saved items" : "Save item"}
        >
          {isSaved ? <Bookmark className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#666666]"
          onClick={onNavigate}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}