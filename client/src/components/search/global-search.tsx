import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Search, 
  X, 
  User, 
  Briefcase, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare,
  Clock,
  Bookmark,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSearch, SearchResult, SearchFilters } from '@/hooks/use-search';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';

export function GlobalSearch() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    suggestions,
    isLoading,
    savedSearches,
    recentSearches,
    saveSearch,
    deleteSavedSearch,
    clearRecentSearches,
    applySavedSearch
  } = useSearch();
  
  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  
  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      setIsOpen(false);
      
      // Navigate to search results page with query and filters
      const searchParams = new URLSearchParams();
      searchParams.append('q', query);
      
      if (filters.type && filters.type.length > 0) {
        searchParams.append('types', filters.type.join(','));
      }
      
      if (filters.tags && filters.tags.length > 0) {
        searchParams.append('tags', filters.tags.join(','));
      }
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };
  
  // Handle clicking on a search result
  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    navigate(result.url);
  };
  
  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };
  
  // Handle saving current search
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
  
  // Handle applying a saved search
  const handleApplySavedSearch = (id: string) => {
    const success = applySavedSearch(id);
    if (success) {
      setShowSavedSearches(false);
    }
  };
  
  // Handle deleting a saved search
  const handleDeleteSavedSearch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSavedSearch(id);
    toast({
      title: "Search deleted",
      description: "The saved search has been removed."
    });
  };
  
  // Filter results based on active tab
  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab);
  
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
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
  
  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="w-full justify-between bg-[#EEF3F8] text-[#191919] rounded-md py-1.5 pl-10 pr-4 border-none focus-visible:ring-1 focus-visible:ring-[#0077B5] hover:bg-[#EEF3F8]"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center">
          <Search className="h-4 w-4 text-[#666666] mr-2" />
          <span className="text-[#666666]">Search</span>
        </div>
        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      {/* Search Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[10vh]">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
            {/* Search Header */}
            <div className="p-4 border-b flex items-center gap-2">
              <Search className="h-5 w-5 text-[#666666]" />
              <Input
                ref={searchInputRef}
                className="flex-1 border-none focus-visible:ring-0 text-lg placeholder:text-[#666666]"
                placeholder="Search for people, jobs, events, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuery('')}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 px-1.5 bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2] text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Filter by type</h4>
                    <div className="grid grid-cols-2 gap-2">
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
                    
                    <Separator />
                    
                    <h4 className="font-medium text-sm">Filter by tags</h4>
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
                    
                    <div className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearFilters}
                      >
                        Clear All
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setShowAdvancedFilters(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Search Body */}
            <div className="flex-1 overflow-auto">
              {/* Recent Searches and Suggestions */}
              {!query && (
                <div className="p-4 space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[#666666]">Recent Searches</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={clearRecentSearches}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.slice(0, 5).map((search, index) => (
                          <div 
                            key={index}
                            className="flex items-center p-2 rounded-md hover:bg-[#F3F2EF] cursor-pointer"
                            onClick={() => setQuery(search)}
                          >
                            <Clock className="h-4 w-4 text-[#666666] mr-2" />
                            <span className="text-sm">{search}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Saved Searches */}
                  {savedSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[#666666]">Saved Searches</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs"
                          onClick={() => setShowSavedSearches(!showSavedSearches)}
                        >
                          {showSavedSearches ? 'Hide' : 'Show All'}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {(showSavedSearches ? savedSearches : savedSearches.slice(0, 3)).map((search) => (
                          <div 
                            key={search.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-[#F3F2EF] cursor-pointer"
                            onClick={() => handleApplySavedSearch(search.id)}
                          >
                            <div className="flex items-center">
                              <Bookmark className="h-4 w-4 text-[#666666] mr-2" />
                              <div>
                                <span className="text-sm">{search.query}</span>
                                {Object.keys(search.filters).length > 0 && (
                                  <div className="text-xs text-[#666666] mt-0.5">
                                    With filters: {Object.keys(search.filters).length} active
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              onClick={(e) => handleDeleteSavedSearch(search.id, e)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Search Suggestions */}
              {query && suggestions.length > 0 && !results.length && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-[#666666] mb-2">Suggestions</h3>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-2 rounded-md hover:bg-[#F3F2EF] cursor-pointer"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-4 w-4 text-[#666666] mr-2" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Search Results */}
              {query && results.length > 0 && (
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
                            className="p-4 hover:bg-[#F3F2EF] cursor-pointer"
                            onClick={() => handleResultClick(result)}
                          >
                            <ResultItem result={result} />
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
                                className="p-4 hover:bg-[#F3F2EF] cursor-pointer"
                                onClick={() => handleResultClick(result)}
                              >
                                <ResultItem result={result} />
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
              
              {/* Loading State */}
              {isLoading && (
                <div className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-[#0077B5] border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-2 text-[#666666]">Searching...</p>
                </div>
              )}
              
              {/* No Results */}
              {query && !isLoading && results.length === 0 && suggestions.length === 0 && (
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
              )}
            </div>
            
            {/* Search Footer */}
            {query && (
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm text-[#666666]">
                  {results.length > 0 ? (
                    <span>Showing {filteredResults.length} results</span>
                  ) : (
                    <span>No results found</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSaveSearch}
                    className="gap-1"
                  >
                    <Bookmark className="h-4 w-4" />
                    Save Search
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSearch}
                  >
                    View All Results
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Result Item Component
function ResultItem({ result }: { result: SearchResult }) {
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
        <Avatar className="h-12 w-12 mr-3">
          <AvatarImage src={result.imageUrl} />
          <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2]">
            {result.title.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="h-12 w-12 mr-3 rounded-md bg-[#F3F2EF] flex items-center justify-center">
          {getResultIcon(result.type)}
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-center">
          <h4 className="font-medium text-[#191919]">{result.title}</h4>
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
      
      <ChevronRight className="h-5 w-5 text-[#666666] self-center" />
    </div>
  );
}