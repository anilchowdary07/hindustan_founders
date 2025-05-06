import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BarChart, LineChart, PieChart, Activity, Users, TrendingUp, Download, Calendar, Filter } from "lucide-react";

// Import chart components from recharts directly
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Line } from 'recharts';

// No need for destructuring anymore as we're importing directly

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");

  // Sample data for charts
  const profileViewsData = [
    { name: "Jan", views: 65 },
    { name: "Feb", views: 59 },
    { name: "Mar", views: 80 },
    { name: "Apr", views: 81 },
    { name: "May", views: 56 },
    { name: "Jun", views: 55 },
    { name: "Jul", views: 40 },
    { name: "Aug", views: 70 },
    { name: "Sep", views: 90 },
    { name: "Oct", views: 110 },
    { name: "Nov", views: 130 },
    { name: "Dec", views: 150 },
  ];

  const connectionData = [
    { name: "Founders", value: 45 },
    { name: "Investors", value: 20 },
    { name: "Mentors", value: 15 },
    { name: "Job Seekers", value: 10 },
    { name: "Others", value: 10 },
  ];

  const engagementData = [
    { name: "Posts", count: 24 },
    { name: "Comments", count: 67 },
    { name: "Likes", count: 145 },
    { name: "Shares", count: 12 },
    { name: "Messages", count: 89 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your analytics data is being prepared for download.",
    });
    
    // In a real app, this would trigger an API call to generate a report
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your analytics data has been exported successfully.",
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your network growth and engagement metrics
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="overview">
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="network">
              <Users className="mr-2 h-4 w-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="engagement">
              <TrendingUp className="mr-2 h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <CardDescription>Total views in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,248</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+12.5%</span> from previous period
                  </p>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={profileViewsData.slice(-6)}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="views" stroke="#0284c7" fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Connections</CardTitle>
                  <CardDescription>Connections made in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+8.2%</span> from previous period
                  </p>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Week 1", connections: 5 },
                        { name: "Week 2", connections: 8 },
                        { name: "Week 3", connections: 7 },
                        { name: "Week 4", connections: 12 },
                      ]}>
                        <defs>
                          <linearGradient id="colorConnections" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="connections" stroke="#16a34a" fillOpacity={1} fill="url(#colorConnections)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  <CardDescription>Average engagement with your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18.7%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500">-2.3%</span> from previous period
                  </p>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Week 1", rate: 22 },
                        { name: "Week 2", rate: 21 },
                        { name: "Week 3", rate: 19 },
                        { name: "Week 4", rate: 18.7 },
                      ]}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="rate" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRate)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Views Over Time</CardTitle>
                <CardDescription>
                  Track how your profile visibility has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={profileViewsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Types</CardTitle>
                  <CardDescription>
                    Breakdown of your network by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={connectionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {connectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connection Growth</CardTitle>
                  <CardDescription>
                    Monthly growth of your network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: "Jan", connections: 10 },
                          { month: "Feb", connections: 15 },
                          { month: "Mar", connections: 25 },
                          { month: "Apr", connections: 32 },
                          { month: "May", connections: 45 },
                          { month: "Jun", connections: 50 },
                          { month: "Jul", connections: 62 },
                          { month: "Aug", connections: 75 },
                          { month: "Sep", connections: 85 },
                          { month: "Oct", connections: 90 },
                          { month: "Nov", connections: 95 },
                          { month: "Dec", connections: 100 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="connections" stroke="#0284c7" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Connection Requests</CardTitle>
                <CardDescription>
                  Sent vs. Received connection requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { month: "Jan", sent: 5, received: 7 },
                        { month: "Feb", sent: 8, received: 10 },
                        { month: "Mar", sent: 12, received: 15 },
                        { month: "Apr", sent: 10, received: 12 },
                        { month: "May", sent: 15, received: 20 },
                        { month: "Jun", sent: 18, received: 15 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" fill="#0284c7" />
                      <Bar dataKey="received" fill="#16a34a" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Engagement</CardTitle>
                  <CardDescription>
                    Breakdown of engagement with your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        data={engagementData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0284c7" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Post Performance</CardTitle>
                  <CardDescription>
                    Your top performing posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { title: "Launching our new product next week!", engagement: 87 },
                      { title: "Looking for senior developers to join our team", engagement: 65 },
                      { title: "Just closed our Series A funding round!", engagement: 124 },
                      { title: "Thoughts on the future of AI in healthcare", engagement: 52 },
                    ].map((post, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium truncate">{post.title}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${Math.min(100, post.engagement / 1.5)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="ml-4 text-sm font-medium">{post.engagement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Over Time</CardTitle>
                <CardDescription>
                  Track how your engagement has changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", likes: 45, comments: 20, shares: 5 },
                        { month: "Feb", likes: 50, comments: 25, shares: 8 },
                        { month: "Mar", likes: 65, comments: 30, shares: 10 },
                        { month: "Apr", likes: 70, comments: 35, shares: 12 },
                        { month: "May", likes: 85, comments: 40, shares: 15 },
                        { month: "Jun", likes: 90, comments: 45, shares: 18 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="likes" stroke="#0284c7" />
                      <Line type="monotone" dataKey="comments" stroke="#16a34a" />
                      <Line type="monotone" dataKey="shares" stroke="#f59e0b" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+4</span> from previous period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Events Organized</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+1</span> from previous period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Connections Made at Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+12</span> from previous period
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Event Participation</CardTitle>
                <CardDescription>
                  Your event attendance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { month: "Jan", attended: 1, organized: 0 },
                        { month: "Feb", attended: 2, organized: 0 },
                        { month: "Mar", attended: 3, organized: 1 },
                        { month: "Apr", attended: 2, organized: 0 },
                        { month: "May", attended: 3, organized: 1 },
                        { month: "Jun", attended: 1, organized: 1 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attended" fill="#0284c7" />
                      <Bar dataKey="organized" fill="#16a34a" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>
                  Events you're registered for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Startup India Summit", date: "May 15, 2025", location: "New Delhi" },
                    { name: "Tech Meetup Bengaluru", date: "May 22, 2025", location: "Bengaluru" },
                    { name: "Venture Capital Masterclass", date: "June 5, 2025", location: "Online" },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center p-3 border rounded-md">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <div className="flex text-sm text-gray-500">
                          <span className="mr-3">{event.date}</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}