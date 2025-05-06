import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, MapPin, Briefcase, UserPlus, Users, Filter, 
  MessageSquare, Bell, ChevronDown, ArrowUpRight, X
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function NetworkPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Fetch connections
  const {
    data: connections,
    isLoading: isLoadingConnections,
  } = useQuery({
    queryKey: ["/api/connections", searchQuery, filterType],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("q", searchQuery);
        if (filterType !== "all") params.append("type", filterType);
        
        const res = await apiRequest(`/api/connections?${params.toString()}`);
        console.log("API response for connections:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
      }
    },
  });
  
  // Fetch connection requests
  const {
    data: connectionRequests,
    isLoading: isLoadingRequests,
  } = useQuery({
    queryKey: ["/api/connections/requests"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/connections/requests");
        console.log("API response for connection requests:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching connection requests:", error);
        return [];
      }
    },
  });
  
  // Fetch suggestions
  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
  } = useQuery({
    queryKey: ["/api/connections/suggestions"],
    queryFn: async () => {
      try {
        const res = await apiRequest("/api/connections/suggestions");
        console.log("API response for suggestions:", res);
        
        // Ensure we always return an array
        if (res.data) {
          return Array.isArray(res.data) ? res.data : [res.data];
        } else {
          return [];
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
      }
    },
    // Disable automatic refetching for now to avoid API errors
    refetchOnWindowFocus: false,
  });
  
  // Mock data for UI demonstration
  const mockConnections = [
    {
      id: 1,
      name: "Alex Johnson",
      title: "Software Engineer at Google",
      avatarUrl: "/avatars/alex.jpg",
      mutualConnections: 12,
      isVerified: true,
    },
    {
      id: 2,
      name: "Sarah Williams",
      title: "Product Manager at Microsoft",
      avatarUrl: "/avatars/sarah.jpg",
      mutualConnections: 8,
      isVerified: true,
    },
    {
      id: 3,
      name: "Michael Chen",
      title: "Startup Founder & CEO",
      avatarUrl: "/avatars/michael.jpg",
      mutualConnections: 5,
      isVerified: false,
    },
    {
      id: 4,
      name: "Priya Patel",
      title: "UX Designer at Adobe",
      avatarUrl: "/avatars/priya.jpg",
      mutualConnections: 15,
      isVerified: true,
    },
    {
      id: 5,
      name: "David Kim",
      title: "Angel Investor",
      avatarUrl: "/avatars/david.jpg",
      mutualConnections: 3,
      isVerified: true,
    },
  ];
  
  const mockRequests = [
    {
      id: 101,
      name: "Emma Wilson",
      title: "Marketing Director at Salesforce",
      avatarUrl: "/avatars/emma.jpg",
      mutualConnections: 7,
      isVerified: true,
      message: "Hi, I'd love to connect and discuss potential collaborations!",
    },
    {
      id: 102,
      name: "James Rodriguez",
      title: "Venture Capitalist at Sequoia",
      avatarUrl: "/avatars/james.jpg",
      mutualConnections: 4,
      isVerified: true,
      message: "Looking to expand my network with founders in the AI space.",
    },
  ];
  
  const mockSuggestions = [
    {
      id: 201,
      name: "Olivia Taylor",
      title: "CTO at Fintech Startup",
      avatarUrl: "/avatars/olivia.jpg",
      mutualConnections: 9,
      isVerified: true,
    },
    {
      id: 202,
      name: "Noah Garcia",
      title: "Blockchain Developer",
      avatarUrl: "/avatars/noah.jpg",
      mutualConnections: 6,
      isVerified: false,
    },
    {
      id: 203,
      name: "Sophia Lee",
      title: "Data Scientist at Amazon",
      avatarUrl: "/avatars/sophia.jpg",
      mutualConnections: 11,
      isVerified: true,
    },
  ];
  
  // Use API data with fallback to mock data
  let displayConnections = connections?.data?.length > 0 ? connections.data : mockConnections;
  const displayRequests = connectionRequests?.data?.length > 0 ? connectionRequests.data : mockRequests;
  
  // Ensure suggestions is always an array
  const displaySuggestions = suggestions?.data?.length > 0 ? suggestions.data : mockSuggestions;
  
  // Log for debugging
  console.log("Suggestions data:", suggestions);
  console.log("Display suggestions:", displaySuggestions);
  
  // Apply filters to connections
  if (searchQuery) {
    displayConnections = displayConnections.filter(conn => 
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conn.title && conn.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }
  
  if (locationFilter) {
    // For location, we should check if the location appears in the title
    // In a real app, we would have a dedicated location field
    displayConnections = displayConnections.filter(conn => 
      conn.title && conn.title.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }
  
  if (roleFilter) {
    // For role, we should check if the role appears in the title
    // In a real app, we would have a dedicated role field
    displayConnections = displayConnections.filter(conn => 
      conn.title && conn.title.toLowerCase().includes(roleFilter.toLowerCase())
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4 mb-6">
              <h1 className="text-2xl font-bold text-[#191919] mb-4">My Network</h1>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] h-4 w-4" />
                  <Input
                    placeholder="Search connections"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#E0E0E0] focus:ring-[#0A66C2] focus:border-[#0A66C2] rounded-full"
                  />
                </div>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 border-[#E0E0E0] text-[#666666] rounded-full"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                    {(locationFilter || roleFilter) && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2] text-xs">
                        {(locationFilter && roleFilter) ? '2' : '1'}
                      </Badge>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-[#E0E0E0] p-4">
                      <h4 className="font-medium text-[#191919] mb-3">Filter Connections</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-[#666666] mb-1">Location</label>
                          <Input 
                            placeholder="City or Country" 
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-[#666666] mt-1">
                            Filter connections by their location
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-[#666666] mb-1">Role</label>
                          <select 
                            className="w-full p-2 border border-[#E0E0E0] rounded-md"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                          >
                            <option value="">All Roles</option>
                            <option value="founder">Founder</option>
                            <option value="investor">Investor</option>
                            <option value="developer">Developer</option>
                            <option value="designer">Designer</option>
                            <option value="marketer">Marketer</option>
                          </select>
                          <p className="text-xs text-[#666666] mt-1">
                            Filter connections by their professional role
                          </p>
                        </div>
                        
                        <div className="flex justify-between pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setLocationFilter("");
                              setRoleFilter("");
                              // Apply filters immediately when clearing
                              setShowFilterMenu(false);
                            }}
                          >
                            Clear All
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => {
                              // Apply filters
                              setShowFilterMenu(false);
                              
                              // Show a toast if filters are applied
                              if (locationFilter || roleFilter) {
                                toast({
                                  title: "Filters applied",
                                  description: `Showing connections filtered by ${[
                                    locationFilter && "location",
                                    roleFilter && "role"
                                  ].filter(Boolean).join(" and ")}`,
                                });
                              }
                            }}
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Tabs defaultValue="connections" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="connections" className="data-[state=active]:bg-[#E8F3FF] data-[state=active]:text-[#0A66C2]">
                    Connections
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="data-[state=active]:bg-[#E8F3FF] data-[state=active]:text-[#0A66C2]">
                    Requests
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="data-[state=active]:bg-[#E8F3FF] data-[state=active]:text-[#0A66C2]">
                    Suggestions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="connections" className="mt-0">
                  {isLoadingConnections ? (
                    <div className="space-y-4">
                      {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center p-4 border border-[#E0E0E0] rounded-lg">
                          <Skeleton className="h-12 w-12 rounded-full bg-[#F3F2EF]" />
                          <div className="ml-4 space-y-2 flex-1">
                            <Skeleton className="h-4 w-32 bg-[#F3F2EF]" />
                            <Skeleton className="h-3 w-48 bg-[#F3F2EF]" />
                          </div>
                          <Skeleton className="h-9 w-24 bg-[#F3F2EF] rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayConnections.map((connection) => (
                        <div key={connection.id} className="flex flex-col sm:flex-row sm:items-center p-4 border border-[#E0E0E0] rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center flex-1">
                            <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                              <AvatarImage src={connection.avatarUrl} alt={connection.name || 'User'} />
                              <AvatarFallback>{connection.name ? connection.name.charAt(0) : 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-[#191919]">{connection.name || 'Unknown User'}</h3>
                                {connection.isVerified && (
                                  <Badge variant="outline" className="ml-2 bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2] text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#666666]">{connection.title || 'No title'}</p>
                              <p className="text-xs text-[#666666] mt-1">
                                <span className="font-medium">{connection.mutualConnections || 0}</span> mutual connections
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3 sm:mt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-[#E0E0E0] text-[#666666] hover:bg-gray-50"
                              onClick={() => {
                                toast({
                                  title: "Message sent",
                                  description: `You can now chat with ${connection.name || 'this user'}`,
                                });
                                navigate("/messages");
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-[#E0E0E0] text-[#666666] hover:bg-gray-50"
                              onClick={() => {
                                // Show a confirmation dialog
                                if (window.confirm(`Are you sure you want to remove ${connection.name || 'this user'} from your connections? This action cannot be undone.`)) {
                                  (async () => {
                                    try {
                                      // In a real app, we would make an API call to remove the connection
                                      // const res = await apiRequest(`/api/connections/${connection.id}`, "DELETE");
                                      // if (res.error) throw new Error(res.error.message);
                                      
                                      // For now, just show a toast
                                      toast({
                                        title: "Connection removed",
                                        description: `You are no longer connected with ${connection.name}`,
                                      });
                                      
                                      // Invalidate the connections query to refresh the list
                                      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
                                    } catch (error) {
                                      toast({
                                        title: "Error",
                                        description: "Failed to remove connection. Please try again.",
                                        variant: "destructive",
                                      });
                                    }
                                  })();
                                }
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="requests" className="mt-0">
                  {isLoadingRequests ? (
                    <div className="space-y-4">
                      {Array(2).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center p-4 border border-[#E0E0E0] rounded-lg">
                          <Skeleton className="h-12 w-12 rounded-full bg-[#F3F2EF]" />
                          <div className="ml-4 space-y-2 flex-1">
                            <Skeleton className="h-4 w-32 bg-[#F3F2EF]" />
                            <Skeleton className="h-3 w-48 bg-[#F3F2EF]" />
                            <Skeleton className="h-3 w-64 bg-[#F3F2EF]" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-9 w-20 bg-[#F3F2EF] rounded-md" />
                            <Skeleton className="h-9 w-20 bg-[#F3F2EF] rounded-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayRequests.length > 0 ? (
                    <div className="space-y-4">
                      {displayRequests.map((request) => (
                        <div key={request.id} className="flex flex-col p-4 border border-[#E0E0E0] rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                              <AvatarImage src={request.avatarUrl} alt={request.name || 'User'} />
                              <AvatarFallback>{request.name ? request.name.charAt(0) : 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-[#191919]">{request.name || 'Unknown User'}</h3>
                                {request.isVerified && (
                                  <Badge variant="outline" className="ml-2 bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2] text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#666666]">{request.title || 'No title'}</p>
                              <p className="text-xs text-[#666666] mt-1">
                                <span className="font-medium">{request.mutualConnections || 0}</span> mutual connections
                              </p>
                            </div>
                          </div>
                          
                          {request.message && (
                            <div className="mt-3 p-3 bg-[#F9F9F9] rounded-md text-sm text-[#191919]">
                              "{request.message}"
                            </div>
                          )}
                          
                          <div className="flex gap-2 mt-4 self-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-[#E0E0E0] text-[#666666] hover:bg-gray-50"
                                >
                                  Ignore
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Ignore Connection Request</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to ignore this connection request? {request.name || 'This user'} won't be notified.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-4 py-4">
                                  <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                                    <AvatarImage src={request.avatarUrl} alt={request.name || 'User'} />
                                    <AvatarFallback>{request.name ? request.name.charAt(0) : 'U'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold text-[#191919]">{request.name || 'Unknown User'}</h4>
                                    <p className="text-sm text-[#666666]">{request.title || 'No title'}</p>
                                  </div>
                                </div>
                                <DialogFooter className="flex justify-between">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                      if (closeButton) closeButton.click();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={async () => {
                                      try {
                                        // In a real app, we would make an API call to ignore the connection request
                                        // const res = await apiRequest(`/api/connection-requests/${request.id}/ignore`, "POST");
                                        // if (res.error) throw new Error(res.error.message);
                                        
                                        // For now, just show a toast
                                        toast({
                                          title: "Request ignored",
                                          description: `Connection request from ${request.name} has been ignored`,
                                        });
                                        
                                        // Invalidate the connection requests query to refresh the list
                                        queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
                                        
                                        // Close the dialog
                                        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                        if (closeButton) closeButton.click();
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to ignore connection request. Please try again.",
                                          variant: "destructive",
                                        });
                                      }
                                    }}
                                  >
                                    Ignore Request
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="sm" 
                              className="bg-[#0A66C2] hover:bg-[#004182] text-white"
                              onClick={async () => {
                                try {
                                  // In a real app, we would make an API call to accept the connection request
                                  // const res = await apiRequest(`/api/connection-requests/${request.id}/accept`, "POST");
                                  // if (res.error) throw new Error(res.error.message);
                                  
                                  // For now, just show a toast
                                  toast({
                                    title: "Request accepted",
                                    description: `You are now connected with ${request.name}`,
                                  });
                                  
                                  // Invalidate the relevant queries to refresh the lists
                                  queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
                                  queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to accept connection request. Please try again.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-[#666666] mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-[#191919]">No pending requests</h3>
                      <p className="text-[#666666] mt-1">You don't have any connection requests at the moment</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="suggestions" className="mt-0">
                  {isLoadingSuggestions ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center p-4 border border-[#E0E0E0] rounded-lg">
                          <Skeleton className="h-12 w-12 rounded-full bg-[#F3F2EF]" />
                          <div className="ml-4 space-y-2 flex-1">
                            <Skeleton className="h-4 w-32 bg-[#F3F2EF]" />
                            <Skeleton className="h-3 w-48 bg-[#F3F2EF]" />
                          </div>
                          <Skeleton className="h-9 w-28 bg-[#F3F2EF] rounded-md" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displaySuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex flex-col sm:flex-row sm:items-center p-4 border border-[#E0E0E0] rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center flex-1">
                            <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                              <AvatarImage src={suggestion.avatarUrl} alt={suggestion.name || 'User'} />
                              <AvatarFallback>{suggestion.name ? suggestion.name.charAt(0) : 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h3 className="font-semibold text-[#191919]">{suggestion.name || 'Unknown User'}</h3>
                                {suggestion.isVerified && (
                                  <Badge variant="outline" className="ml-2 bg-[#E8F3FF] text-[#0A66C2] border-[#0A66C2] text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#666666]">{suggestion.title || 'No title'}</p>
                              <p className="text-xs text-[#666666] mt-1">
                                <span className="font-medium">{suggestion.mutualConnections || 0}</span> mutual connections
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-[#0A66C2] text-[#0A66C2] hover:bg-[#E8F3FF]"
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Connect
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Send Connection Request</DialogTitle>
                                  <DialogDescription>
                                    Add a personalized message to your connection request to {suggestion.name || 'this user'}.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex items-center space-x-4 py-4">
                                  <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                                    <AvatarImage src={suggestion.avatarUrl} alt={suggestion.name || 'User'} />
                                    <AvatarFallback>{suggestion.name ? suggestion.name.charAt(0) : 'U'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold text-[#191919]">{suggestion.name || 'Unknown User'}</h4>
                                    <p className="text-sm text-[#666666]">{suggestion.title || 'No title'}</p>
                                  </div>
                                </div>
                                <form 
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const message = formData.get('message') as string;
                                    
                                    (async () => {
                                      try {
                                        // In a real app, we would make an API call to send a connection request
                                        // const res = await apiRequest("/api/connection-requests", "POST", {
                                        //   recipientId: suggestion.id,
                                        //   message: message
                                        // });
                                        // if (res.error) throw new Error(res.error.message);
                                        
                                        // For now, just show a toast
                                        toast({
                                          title: "Connection request sent",
                                          description: `Your connection request has been sent to ${suggestion.name || 'the user'}`,
                                        });
                                        
                                        // Invalidate the suggestions query to refresh the list
                                        queryClient.invalidateQueries({ queryKey: ["/api/connection-suggestions"] });
                                        
                                        // Close the dialog
                                        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
                                        if (closeButton) closeButton.click();
                                      } catch (error) {
                                        toast({
                                          title: "Error",
                                          description: "Failed to send connection request. Please try again.",
                                          variant: "destructive",
                                        });
                                      }
                                    })();
                                  }}
                                >
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="message">Message</Label>
                                      <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="I'd like to connect with you!"
                                        className="min-h-[100px]"
                                        defaultValue={`Hi ${suggestion.name || 'there'}, I'd like to connect with you!`}
                                      />
                                      <p className="text-xs text-[#666666]">
                                        Adding a personalized message increases the chances of your request being accepted.
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit" className="bg-[#0A66C2] hover:bg-[#004182]">
                                      Send Request
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[#666666] hover:bg-gray-50"
                              onClick={() => {
                                // In a real app, we would make an API call to hide this suggestion
                                toast({
                                  title: "Suggestion hidden",
                                  description: `You won't see ${suggestion.name || 'this user'} in your suggestions anymore`,
                                });
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Ignore
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
              <h3 className="font-semibold text-[#191919] mb-3">Network Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#0A66C2] mr-2" />
                    <span className="text-sm text-[#191919]">Connections</span>
                  </div>
                  <span className="font-semibold text-[#191919]">{displayConnections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-[#0A66C2] mr-2" />
                    <span className="text-sm text-[#191919]">Pending Requests</span>
                  </div>
                  <span className="font-semibold text-[#191919]">{displayRequests.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-[#0A66C2] mr-2" />
                    <span className="text-sm text-[#191919]">Industry Connections</span>
                  </div>
                  <span className="font-semibold text-[#191919]">18</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                <Button variant="link" className="text-[#0A66C2] p-0 h-auto text-sm">
                  View detailed analytics
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-4">
              <h3 className="font-semibold text-[#191919] mb-3">Groups You Might Like</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-[#E8F3FF] rounded-md flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-[#0A66C2]" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-[#191919]">Startup Founders Network</h4>
                    <p className="text-xs text-[#666666] mt-1">8,542 members</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 h-7 text-xs border-[#0A66C2] text-[#0A66C2] hover:bg-[#E8F3FF]"
                    >
                      Join Group
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-[#E8F3FF] rounded-md flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#0A66C2]" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-[#191919]">Tech Entrepreneurs - Bay Area</h4>
                    <p className="text-xs text-[#666666] mt-1">12,354 members</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 h-7 text-xs border-[#0A66C2] text-[#0A66C2] hover:bg-[#E8F3FF]"
                    >
                      Join Group
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                <Button variant="link" className="text-[#0A66C2] p-0 h-auto text-sm">
                  Discover more groups
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
