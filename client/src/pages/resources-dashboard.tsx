import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  ArrowLeft,
  Lock,
  FileText,
  CalendarPlus,
} from "lucide-react";

export default function ResourcesDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("articles");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<"article" | "event" | null>(null);
  
  // Fetch user's articles
  const { data: articles, isLoading: isLoadingArticles, error: articlesError } = useQuery({
    queryKey: ['/api/resources/articles/manage', searchQuery],
    queryFn: async () => {
      if (!user) {
        throw new Error("Authentication required");
      }
      
      let url = `/api/resources/articles/manage`;
      
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }
      
      return await response.json();
    },
    enabled: !!user && activeTab === "articles",
    staleTime: 60000, // 1 minute
  });
  
  // Fetch user's events
  const { data: events, isLoading: isLoadingEvents, error: eventsError } = useQuery({
    queryKey: ['/api/events/manage', searchQuery],
    queryFn: async () => {
      if (!user) {
        throw new Error("Authentication required");
      }
      
      let url = `/api/events/manage`;
      
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      
      return await response.json();
    },
    enabled: !!user && activeTab === "events",
    staleTime: 60000, // 1 minute
  });
  
  // Delete article mutation
  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const response = await fetch(`/api/resources/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete article");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/resources/articles/manage'] });
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      });
    },
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted",
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/events/manage'] });
      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be updated in the useQuery hook
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!confirmDeleteId || !confirmDeleteType) return;
    
    if (confirmDeleteType === "article") {
      deleteArticleMutation.mutate(confirmDeleteId);
    } else {
      deleteEventMutation.mutate(confirmDeleteId);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // If not authenticated, show login prompt
  if (!isAuthLoading && !user) {
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
          <h1 className="text-2xl font-bold">Content & Events Dashboard</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Lock className="h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Authentication Required</h3>
              <p className="text-gray-500 mb-4 max-w-md">
                You need to be logged in to manage your content and events.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Sign In
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/resources')}
                >
                  Browse Resources
                </Button>
              </div>
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
        <h1 className="text-2xl font-bold">Content & Events Dashboard</h1>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">My Content</h2>
            <p className="text-gray-500">Manage your articles and events</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push('/resources/create')}
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Article
            </Button>
            <Button 
              onClick={() => router.push('/events/create')}
              className="bg-primary hover:bg-primary/90"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Host Event
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search your content..."
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="articles" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="articles" className="mt-6">
            {isLoadingArticles ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading articles...</span>
              </div>
            ) : articlesError ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading articles</h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      {articlesError instanceof Error ? articlesError.message : "There was an error loading your articles. Please try again."}
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
            ) : articles?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No articles found</h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      You haven't created any articles yet. Share your knowledge and insights with the community.
                    </p>
                    <Button 
                      onClick={() => router.push('/resources/create')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Published Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles?.map((article: any) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {article.coverImage ? (
                              <div className="h-10 w-16 rounded overflow-hidden mr-3 bg-gray-100 flex items-center justify-center">
                                <img 
                                  src={article.coverImage} 
                                  alt={article.title} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-16 rounded bg-gray-100 mr-3 flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <div className="max-w-xs truncate">{article.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {article.publishedAt ? formatDate(article.publishedAt) : 'Draft'}
                        </TableCell>
                        <TableCell>
                          {article.status === 'published' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Draft
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {article.views || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/resources/articles/${article.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Article
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/resources/edit/${article.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Article
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setConfirmDeleteId(article.id);
                                  setConfirmDeleteType("article");
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Article
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            {isLoadingEvents ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading events...</span>
              </div>
            ) : eventsError ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Error loading events</h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      {eventsError instanceof Error ? eventsError.message : "There was an error loading your events. Please try again."}
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
            ) : events?.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      You haven't created any events yet. Host an event to connect with the community.
                    </p>
                    <Button 
                      onClick={() => router.push('/events/create')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Host an Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Attendees</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events?.map((event: any) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {event.coverImage ? (
                              <div className="h-10 w-16 rounded overflow-hidden mr-3 bg-gray-100 flex items-center justify-center">
                                <img 
                                  src={event.coverImage} 
                                  alt={event.title} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-16 rounded bg-gray-100 mr-3 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-gray-500" />
                              </div>
                            )}
                            <div className="max-w-xs truncate">{event.title}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(event.startDate)}
                        </TableCell>
                        <TableCell>
                          {new Date(event.startDate) > new Date() ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Upcoming
                            </span>
                          ) : new Date(event.endDate) > new Date() ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Happening Now
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Past
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {event.attendeeCount || 0}
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => router.push(`/events/${event.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Event
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/events/edit/${event.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Event
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setConfirmDeleteId(event.id);
                                  setConfirmDeleteType("event");
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!confirmDeleteId && !!confirmDeleteType} 
        onOpenChange={() => {
          setConfirmDeleteId(null);
          setConfirmDeleteType(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {confirmDeleteType}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setConfirmDeleteId(null);
                setConfirmDeleteType(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteArticleMutation.isPending || deleteEventMutation.isPending}
            >
              {deleteArticleMutation.isPending || deleteEventMutation.isPending ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}