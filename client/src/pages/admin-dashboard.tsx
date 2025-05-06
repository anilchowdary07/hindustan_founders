import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2, Search, UserX, UserCheck, Shield, Settings, Users, Activity, BarChart, FileText, Calendar as CalendarIcon, Bell, PieChart, Newspaper, CalendarDays, MessageSquare, Upload, Download, Info, CheckCircle, AlertCircle, Clock, Trash, Edit, Plus, Send } from "lucide-react";
import { useLocation } from "wouter";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { DemoDataLoader } from "@/components/admin/demo-data-loader";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
    }
  }, [user, setLocation, toast]);

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin",
  });

  // Fetch platform stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin",
    // Fallback data if the endpoint doesn't exist yet
    placeholderData: {
      totalUsers: users?.length || 0,
      totalPosts: 0,
      totalConnections: 0,
      totalArticles: 0,
      totalEvents: 0,
      totalPitches: 0,
      usersByRole: {
        founder: 0,
        investor: 0,
        student: 0,
        jobSeeker: 0,
        explorer: 0,
        admin: 0,
      },
      recentActivity: {
        newUsers: 0,
        newPosts: 0,
      },
      weeklyStats: {
        users: Array(7).fill(0).map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10)
        })).reverse(),
        posts: Array(7).fill(0).map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 15)
        })).reverse()
      }
    }
  });

  // Fetch content (articles, events, pitches)
  const { data: content, isLoading: isLoadingContent } = useQuery({
    queryKey: ["/api/admin/content"],
    enabled: !!user && user.role === "admin" && activeTab === "content",
    // Fallback data
    placeholderData: {
      articles: [],
      events: [],
      pitches: []
    }
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: isLoadingAuditLogs } = useQuery<any[]>({
    queryKey: ["/api/admin/audit-logs"],
    enabled: !!user && user.role === "admin" && activeTab === "audit",
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted."
      });
      refetchUsers();
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Toggle user verification mutation
  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ userId, isVerified }: { userId: number, isVerified: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, { isVerified });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "The user's verification status has been updated."
      });
      refetchUsers();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update user: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notification: { title: string, message: string, type: string }) => {
      const res = await apiRequest("POST", "/api/admin/notifications", notification);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Notification Sent",
        description: `Successfully sent notification to ${data.count} users.`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to send notification: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await apiRequest("PUT", "/api/admin/settings", settings);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Platform settings have been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Handle user deletion
  const handleDeleteUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  // Handle verification toggle
  const handleToggleVerification = (userId: number, currentStatus: boolean) => {
    toggleVerificationMutation.mutate({ userId, isVerified: !currentStatus });
  };

  // Filter users based on search term
  const filteredUsers = Array.isArray(users) ? users.filter((user: any) => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Chart data for user growth
  const userGrowthData = {
    labels: stats?.weeklyStats?.users.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'New Users',
        data: stats?.weeklyStats?.users.map((item: any) => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for post activity
  const postActivityData = {
    labels: stats?.weeklyStats?.posts.map((item: any) => item.date) || [],
    datasets: [
      {
        label: 'New Posts',
        data: stats?.weeklyStats?.posts.map((item: any) => item.count) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  // Chart data for user roles
  const userRolesData = {
    labels: Object.keys(stats?.usersByRole || {}),
    datasets: [
      {
        label: 'Users by Role',
        data: Object.values(stats?.usersByRole || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!user) return null;
  if (user.role !== "admin") return null;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Admin: {user.name}</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalUsers || users?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+{stats?.recentActivity?.newUsers || 0}</span> in the last 7 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalPosts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-green-500">+{stats?.recentActivity?.newPosts || 0}</span> in the last 7 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalConnections || 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      (stats?.totalArticles || 0) + (stats?.totalEvents || 0) + (stats?.totalPitches || 0)
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>Articles: {stats?.totalArticles || 0}</span>
                    <span>Events: {stats?.totalEvents || 0}</span>
                    <span>Pitches: {stats?.totalPitches || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {isLoadingStats ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Bar 
                        data={userGrowthData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Post Activity</CardTitle>
                  <CardDescription>New posts over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {isLoadingStats ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Line 
                        data={postActivityData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top' as const,
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {isLoadingStats ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <Pie 
                        data={userRolesData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right' as const,
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingAuditLogs ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : auditLogs && auditLogs.length > 0 ? (
                      <div className="space-y-4">
                        {auditLogs.slice(0, 5).map((log: any, index: number) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Activity className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{log.action}</p>
                              <p className="text-xs text-muted-foreground">{log.details}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <p>No recent activity found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">User Verification</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          As an admin, you can verify users to give them a blue checkmark badge. This helps the community identify authentic and notable members.
                        </p>
                        <p className="mt-1">
                          <strong>When to verify users:</strong> Verify founders of established companies, industry experts, investors, and other notable figures.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardContent>
                <div className="flex items-center mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers && filteredUsers.length > 0 ? (
                          filteredUsers.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <span className="capitalize">{user.role}</span>
                              </TableCell>
                              <TableCell>
                                {user.isVerified ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Unverified
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={user.isVerified ? "outline" : "default"}
                                        size="sm"
                                        className={user.isVerified ? "border-blue-500 text-blue-500" : "bg-blue-500 text-white"}
                                        disabled={toggleVerificationMutation.isPending}
                                      >
                                        {toggleVerificationMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 mr-1" />
                                        )}
                                        {user.isVerified ? 'Verified' : 'Verify User'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80">
                                      <div className="space-y-2">
                                        <h4 className="font-medium">User Verification</h4>
                                        <p className="text-sm text-muted-foreground">
                                          Verified users receive a blue checkmark badge next to their name, indicating they are authentic and notable figures in the community.
                                        </p>
                                        <div className="flex justify-between pt-2">
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleToggleVerification(user.id, user.isVerified)}
                                          >
                                            {user.isVerified ? 'Remove Verification' : 'Verify User'}
                                          </Button>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={user.role === 'admin'}
                                      >
                                        <UserX className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the user
                                          account and remove all associated data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          {deleteUserMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          ) : null}
                                          Delete User
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <Tabs defaultValue="articles" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="articles">Articles</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="pitches">Pitches</TabsTrigger>
                </TabsList>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New Content</DialogTitle>
                      <DialogDescription>
                        Add a new article, event, or pitch to the platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="content-type">Content Type</Label>
                        <Select defaultValue="article">
                          <SelectTrigger id="content-type">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="pitch">Pitch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter title" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" placeholder="Enter content" rows={5} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="image">Image</Label>
                        <Input id="image" type="file" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <TabsContent value="articles" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    {isLoadingContent ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : content?.articles && content.articles.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Author</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {content.articles.map((article: any) => (
                              <TableRow key={article.id}>
                                <TableCell className="font-medium">{article.title}</TableCell>
                                <TableCell>{article.authorName || 'Unknown'}</TableCell>
                                <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Newspaper className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No articles found</p>
                        <Button variant="outline" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Article
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    {isLoadingContent ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : content?.events && content.events.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {content.events.map((event: any) => (
                              <TableRow key={event.id}>
                                <TableCell className="font-medium">{event.title}</TableCell>
                                <TableCell>{event.location || (event.isVirtual ? 'Virtual' : 'TBD')}</TableCell>
                                <TableCell>{new Date(event.startDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No events found</p>
                        <Button variant="outline" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Event
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pitches" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    {isLoadingContent ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : content?.pitches && content.pitches.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Creator</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {content.pitches.map((pitch: any) => (
                              <TableRow key={pitch.id}>
                                <TableCell className="font-medium">{pitch.name}</TableCell>
                                <TableCell>{pitch.creatorName || 'Unknown'}</TableCell>
                                <TableCell>
                                  <span className="capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {pitch.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <PieChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        <p>No pitches found</p>
                        <Button variant="outline" className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Pitch
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Notifications</CardTitle>
                <CardDescription>Send system-wide notifications to all users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-title">Notification Title</Label>
                  <Input id="notification-title" placeholder="Enter notification title" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-message">Message</Label>
                  <Textarea id="notification-message" placeholder="Enter notification message" rows={4} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notification-type">Notification Type</Label>
                  <Select defaultValue="info">
                    <SelectTrigger id="notification-type">
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => {
                    const title = (document.getElementById('notification-title') as HTMLInputElement)?.value;
                    const message = (document.getElementById('notification-message') as HTMLTextAreaElement)?.value;
                    const typeSelect = document.getElementById('notification-type');
                    const type = typeSelect ? (typeSelect as HTMLSelectElement).value : 'info';
                    
                    if (!title || !message) {
                      toast({
                        title: "Error",
                        description: "Please fill in all required fields",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    sendNotificationMutation.mutate({ title, message, type });
                  }}
                  disabled={sendNotificationMutation.isPending}
                >
                  {sendNotificationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>View recently sent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would be populated from an API call in a real implementation */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Info className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Platform Maintenance</p>
                      <p className="text-xs text-muted-foreground">The platform will be undergoing maintenance on Sunday, May 5th from 2-4 AM IST.</p>
                      <p className="text-xs text-muted-foreground">Sent on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">New Feature Released</p>
                      <p className="text-xs text-muted-foreground">We've just launched our new messaging feature. Try it out now!</p>
                      <p className="text-xs text-muted-foreground">Sent on {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Update Your Profile</p>
                      <p className="text-xs text-muted-foreground">Please update your profile to take advantage of our new networking features.</p>
                      <p className="text-xs text-muted-foreground">Sent on {new Date(Date.now() - 172800000).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Track all admin actions for accountability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[240px] justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {isLoadingAuditLogs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : auditLogs && auditLogs.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Date & Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{log.action}</TableCell>
                            <TableCell>{log.userName || `User #${log.userId}`}</TableCell>
                            <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                            <TableCell>{log.ipAddress}</TableCell>
                            <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No audit logs found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <DemoDataLoader />
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input id="site-name" defaultValue="Hindustan Founders Network" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" defaultValue="admin@hindustanfounders.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="maintenance-mode" />
                    <Label htmlFor="maintenance-mode">Enable maintenance mode</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-enabled">User Registration</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="signup-enabled" defaultChecked />
                    <Label htmlFor="signup-enabled">Allow new user registrations</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-schedule">Automatic Backup</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backup-schedule">
                      <SelectValue placeholder="Select backup frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Reset to Defaults</Button>
                <Button
                  onClick={() => {
                    const siteName = (document.getElementById('site-name') as HTMLInputElement)?.value;
                    const contactEmail = (document.getElementById('contact-email') as HTMLInputElement)?.value;
                    const maintenanceMode = (document.getElementById('maintenance-mode') as HTMLInputElement)?.checked;
                    const signupEnabled = (document.getElementById('signup-enabled') as HTMLInputElement)?.checked;
                    const backupScheduleSelect = document.getElementById('backup-schedule');
                    const backupSchedule = backupScheduleSelect ? (backupScheduleSelect as HTMLSelectElement).value : 'daily';
                    
                    updateSettingsMutation.mutate({
                      siteName,
                      contactEmail,
                      maintenanceMode,
                      signupEnabled,
                      backupSchedule,
                      updatedAt: new Date().toISOString()
                    });
                  }}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Settings"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
