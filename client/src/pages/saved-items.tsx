import { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Bookmark, 
  BookmarkX, 
  User, 
  Briefcase, 
  Calendar, 
  Users, 
  FileText, 
  MessageSquare,
  Filter,
  ChevronDown,
  Clock,
  Trash2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSavedItems, SavedItemType } from '@/hooks/use-saved-items';

export default function SavedItemsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SavedItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'alphabetical'>('recent');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  const {
    savedItems,
    isLoading,
    removeItem,
    clearAllItems,
    getItemTypeCounts
  } = useSavedItems();
  
  const typeCounts = getItemTypeCounts();
  
  // Filter items based on active tab and search query
  const filteredItems = savedItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesTab && matchesSearch;
  });
  
  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });
  
  // Handle removing an item
  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast({
      title: "Item removed",
      description: "The item has been removed from your saved items."
    });
  };
  
  // Handle clearing all items
  const handleClearAllItems = () => {
    clearAllItems();
    setIsDeleteDialogOpen(false);
    toast({
      title: "All items cleared",
      description: "All saved items have been removed."
    });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get icon for item type
  const getItemIcon = (type: SavedItemType) => {
    switch (type) {
      case 'profile':
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
        return <Bookmark className="h-4 w-4" />;
    }
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Bookmark className="mr-2 h-6 w-6" />
              Saved Items
            </h1>
            <p className="text-[#666666] mt-1">
              Access your saved content in one place
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="text-[#666666]"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={savedItems.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
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
                  Browse your saved items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div 
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${activeTab === 'all' ? 'bg-[#E8F3FF] text-[#0A66C2]' : 'hover:bg-[#F3F2EF]'}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <div className="flex items-center">
                      <Bookmark className="h-4 w-4 mr-2" />
                      <span>All Items</span>
                    </div>
                    <Badge variant="secondary">{savedItems.length}</Badge>
                  </div>
                  
                  {Object.entries(typeCounts).map(([type, count]) => {
                    if (count === 0) return null;
                    
                    return (
                      <div 
                        key={type}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${activeTab === type ? 'bg-[#E8F3FF] text-[#0A66C2]' : 'hover:bg-[#F3F2EF]'}`}
                        onClick={() => setActiveTab(type as SavedItemType)}
                      >
                        <div className="flex items-center">
                          {getItemIcon(type as SavedItemType)}
                          <span className="ml-2 capitalize">{type}s</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Sort By</h3>
                  <div className="space-y-1">
                    <div 
                      className={`flex items-center p-2 rounded-md cursor-pointer ${sortBy === 'recent' ? 'bg-[#E8F3FF] text-[#0A66C2]' : 'hover:bg-[#F3F2EF]'}`}
                      onClick={() => setSortBy('recent')}
                    >
                      <span className="text-sm">Recently Saved</span>
                    </div>
                    <div 
                      className={`flex items-center p-2 rounded-md cursor-pointer ${sortBy === 'oldest' ? 'bg-[#E8F3FF] text-[#0A66C2]' : 'hover:bg-[#F3F2EF]'}`}
                      onClick={() => setSortBy('oldest')}
                    >
                      <span className="text-sm">Oldest First</span>
                    </div>
                    <div 
                      className={`flex items-center p-2 rounded-md cursor-pointer ${sortBy === 'alphabetical' ? 'bg-[#E8F3FF] text-[#0A66C2]' : 'hover:bg-[#F3F2EF]'}`}
                      onClick={() => setSortBy('alphabetical')}
                    >
                      <span className="text-sm">Alphabetical</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Help & Support Card */}
            <Card className="bg-[#F3F9FF] border-[#D0E7FF]">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-[#0A66C2]">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#0A66C2] mb-1">Help & Support</h3>
                    <p className="text-sm text-[#333333] mb-2">
                      You can save posts, pitches, jobs, and articles for quick access later. 
                      Items you save will appear here organized by type.
                    </p>
                    <Button 
                      variant="link" 
                      className="text-[#0A66C2] p-0 h-auto text-sm"
                      onClick={() => navigate('/help')}
                    >
                      Learn more about saved items
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Search Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] h-4 w-4" />
                    <Input
                      placeholder="Search saved items"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-md"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-[#0077B5] border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-[#666666]">Loading saved items...</p>
                  </div>
                ) : savedItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <BookmarkX className="h-12 w-12 text-[#E0E0E0] mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No saved items</h3>
                    <p className="text-[#666666] mb-4">Items you save will appear here</p>
                    <Button onClick={() => navigate('/')}>
                      Browse Content
                    </Button>
                  </div>
                ) : sortedItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Search className="h-12 w-12 text-[#E0E0E0] mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No matching items</h3>
                    <p className="text-[#666666] mb-4">Try adjusting your search or filters</p>
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('');
                      setActiveTab('all');
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedItems.map((item) => (
                      <div 
                        key={item.id}
                        className="border border-[#E0E0E0] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          <div className="flex items-start">
                            {item.type === 'profile' ? (
                              <Avatar className="h-12 w-12 mr-3">
                                <AvatarImage src={item.imageUrl} />
                                <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2]">
                                  {item.title.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-12 w-12 mr-3 rounded-md bg-[#F3F2EF] flex items-center justify-center">
                                {getItemIcon(item.type)}
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-[#191919]">{item.title}</h4>
                                    <Badge 
                                      variant="outline" 
                                      className="ml-2 capitalize text-xs"
                                    >
                                      {item.type}
                                    </Badge>
                                  </div>
                                  
                                  {item.description && (
                                    <p className="text-sm text-[#666666] mt-1 line-clamp-2">{item.description}</p>
                                  )}
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#666666] hover:text-red-500"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <BookmarkX className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center mt-2 text-xs text-[#666666]">
                                <Clock className="h-3 w-3 mr-1" />
                                <span className="mr-3">Saved {formatDate(item.savedAt)}</span>
                                
                                {item.date && (
                                  <span className="mr-3">• {formatDate(item.date)}</span>
                                )}
                                
                                {item.tags && item.tags.length > 0 && (
                                  <div className="flex items-center">
                                    <span className="mr-1">•</span>
                                    <div className="flex gap-1">
                                      {item.tags.slice(0, 3).map(tag => (
                                        <Badge 
                                          key={tag}
                                          variant="secondary"
                                          className="text-xs px-1.5 py-0 h-5"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <span>+{item.tags.length - 3} more</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-[#F9F9F9] px-4 py-2 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#0A66C2]"
                            onClick={() => navigate(item.url)}
                          >
                            View {item.type}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all saved items?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete all your saved items.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-[#FFF4F5] border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              You are about to remove {savedItems.length} saved items. This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAllItems}>
              Clear All Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}