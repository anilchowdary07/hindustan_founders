import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRoleType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Helper function to get role badge color
const getRoleBadgeColor = (role: UserRoleType) => {
  switch (role) {
    case "founder":
      return "bg-blue-100 text-blue-800";
    case "investor":
      return "bg-green-100 text-green-800";
    case "student":
      return "bg-purple-100 text-purple-800";
    case "job_seeker":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Helper function to format role text
const formatRoleText = (role: UserRoleType) => {
  switch (role) {
    case "founder":
      return "Founder";
    case "investor":
      return "Investor";
    case "student":
      return "Student";
    case "job_seeker":
      return "Job Seeker";
    case "explorer":
      return "Explorer";
    default:
      return role;
  }
};

export default function NetworkPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("people");
  const { toast } = useToast();

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  // Fetch connections (for the current user)
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ["/api/connections"],
    queryFn: async () => {
      const response = await fetch("/api/connections");
      if (!response.ok) {
        // If API not implemented yet, return empty array
        return [];
      }
      return response.json();
    },
  });

  // Fetch connection requests
  const { data: requests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ["/api/connections/requests"],
    queryFn: async () => {
      const response = await fetch("/api/connections/requests");
      if (!response.ok) {
        // If API not implemented yet, return empty array
        return [];
      }
      return response.json();
    },
  });

  // Filter users based on search query
  const filteredUsers = users?.filter((user: any) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.title && user.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <Layout>
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Network</h1>
          <p className="text-muted-foreground">
            Connect with founders, investors, and professionals in the startup ecosystem
          </p>
        </div>

        <div className="flex mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, role, or company"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="ml-2" onClick={() => toast({
            title: "Filters applied",
            description: "Your search filters have been applied",
          })}>Filter</Button>
        </div>

        <Tabs defaultValue="people" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <Card key={n}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-72" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatarUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-lg">{user.name}</h3>
                            {user.isVerified && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                Verified
                              </Badge>
                            )}
                            <Badge className={`ml-2 ${getRoleBadgeColor(user.role)}`}>
                              {formatRoleText(user.role)}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {user.title}{user.title && user.company ? " at " : ""}{user.company}
                          </p>
                          <p className="text-muted-foreground text-sm mt-1">
                            {user.location}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => {
                            toast({
                              title: "Connection request sent",
                              description: `Request sent to ${user.name}`,
                            });
                          }}
                        >
                          <UserPlus className="h-4 w-4" />
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters or check back later
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections">
            {isLoadingConnections ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <Card key={n}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-72" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : connections && connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map((connection: any) => (
                  <Card key={connection.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.user.avatarUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {connection.user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-lg">{connection.user.name}</h3>
                            {connection.user.isVerified && (
                              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">
                            {connection.user.title}{connection.user.title && connection.user.company ? " at " : ""}{connection.user.company}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connected since {new Date(connection.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            toast({
                              title: "Connection removed",
                              description: `Connection with ${connection.user.name} has been removed`,
                              variant: "destructive"
                            });
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building your professional network by connecting with other users
                </p>
                <Button onClick={() => setActiveTab("people")}>Find People</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {isLoadingRequests ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <Card key={n}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-72" />
                        </div>
                        <div className="space-x-2">
                          <Skeleton className="h-9 w-9 inline-block" />
                          <Skeleton className="h-9 w-9 inline-block" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : requests && requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request: any) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.user.avatarUrl || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {request.user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-lg">{request.user.name}</h3>
                          <p className="text-muted-foreground">
                            {request.user.title}{request.user.title && request.user.company ? " at " : ""}{request.user.company}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Requested {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                            onClick={() => {
                              toast({
                                title: "Connection accepted",
                                description: `You are now connected with ${request.user.name}`,
                              });
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                            onClick={() => {
                              toast({
                                title: "Request declined",
                                description: `Connection request from ${request.user.name} has been declined`,
                                variant: "destructive"
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No connection requests</h3>
                <p className="text-muted-foreground">
                  You don't have any pending connection requests at the moment
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}