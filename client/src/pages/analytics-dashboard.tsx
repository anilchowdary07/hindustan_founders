import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Activity, 
  Users, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter,
  Eye,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Crown,
  Lock,
  ArrowRight,
  Info,
  Zap,
  FileText,
  Briefcase,
  Building
} from "lucide-react";

// Import chart components from recharts
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
  Legend,
  LineChart as RechartsLineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");
  const [isPremium, setIsPremium] = useState(false);

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

  const industryEngagementData = [
    { subject: 'Technology', A: 120, B: 110, fullMark: 150 },
    { subject: 'Finance', A: 98, B: 130, fullMark: 150 },
    { subject: 'Healthcare', A: 86, B: 130, fullMark: 150 },
    { subject: 'Education', A: 99, B: 100, fullMark: 150 },
    { subject: 'E-commerce', A: 85, B: 90, fullMark: 150 },
    { subject: 'Manufacturing', A: 65, B: 85, fullMark: 150 },
  ];

  const contentPerformanceData = [
    { name: 'Post 1', views: 400, engagement: 240, amt: 240 },
    { name: 'Post 2', views: 300, engagement: 139, amt: 221 },
    { name: 'Post 3', views: 200, engagement: 980, amt: 229 },
    { name: 'Post 4', views: 278, engagement: 390, amt: 200 },
    { name: 'Post 5', views: 189, engagement: 480, amt: 218 },
  ];

  const skillsData = [
    { name: 'Leadership', value: 85 },
    { name: 'Technical', value: 90 },
    { name: 'Communication', value: 75 },
    { name: 'Strategy', value: 80 },
    { name: 'Innovation', value: 70 },
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

  const handleUpgradeToPremium = () => {
    window.location.href = '/premium-features';
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
          <TabsList className="grid grid-cols-5 md:w-[750px]">
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
            <TabsTrigger value="content">
              <FileText className="mr-2 h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="career">
              <Briefcase className="mr-2 h-4 w-4" />
              Career
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Strength</CardTitle>
                  <CardDescription>
                    How complete and effective your profile is
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative h-40 w-40">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold">78%</div>
                          <div className="text-sm text-muted-foreground">Profile Strength</div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Complete", value: 78 },
                              { name: "Incomplete", value: 22 }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell fill="#0284c7" />
                            <Cell fill="#e5e7eb" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2 w-full">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Basic Info</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Experience</span>
                          <span>80%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Skills</span>
                          <span>90%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>About</span>
                          <span>60%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Recommendations</span>
                          <span>40%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Complete Your Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>
                    Your activity on the platform in the selected period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Profile Views</div>
                          <div className="text-sm text-muted-foreground">People who viewed your profile</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">1,248</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">New Connections</div>
                          <div className="text-sm text-muted-foreground">People who connected with you</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">32</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">Messages</div>
                          <div className="text-sm text-muted-foreground">Messages sent and received</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">89</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-full mr-3">
                          <ThumbsUp className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium">Engagement</div>
                          <div className="text-sm text-muted-foreground">Likes, comments, and shares</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">157</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!isPremium && (
              <Card className="border-2 border-yellow-400">
                <CardHeader>
                  <div className="flex items-center">
                    <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                    <CardTitle>Unlock Premium Analytics</CardTitle>
                  </div>
                  <CardDescription>
                    Get deeper insights with advanced analytics features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded mr-3 mt-1">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Connection Insights</h4>
                        <p className="text-sm text-muted-foreground">Detailed breakdown of your network growth and quality</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded mr-3 mt-1">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Engagement Analytics</h4>
                        <p className="text-sm text-muted-foreground">Advanced metrics on how people interact with your content</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded mr-3 mt-1">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Competitive Benchmarking</h4>
                        <p className="text-sm text-muted-foreground">See how you compare to peers in your industry</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleUpgradeToPremium}>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </CardFooter>
              </Card>
            )}
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
                      <PieChart>
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
                      </PieChart>
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
                <CardTitle>Industry Connections</CardTitle>
                <CardDescription>
                  Distribution of your connections across industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { industry: "Technology", connections: 45 },
                        { industry: "Finance", connections: 28 },
                        { industry: "Healthcare", connections: 15 },
                        { industry: "Education", connections: 12 },
                        { industry: "Retail", connections: 8 },
                        { industry: "Manufacturing", connections: 7 },
                        { industry: "Media", connections: 5 },
                        { industry: "Others", connections: 10 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="industry" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="connections" fill="#0284c7" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {!isPremium && (
              <Card className="border-2 border-yellow-400">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <Lock className="mr-2 h-4 w-4 text-yellow-500" />
                      Premium Network Analytics
                    </CardTitle>
                    <CardDescription>
                      Unlock advanced network insights with Premium
                    </CardDescription>
                  </div>
                  <Button onClick={handleUpgradeToPremium}>
                    Upgrade
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded mr-3">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-400">Connection Quality Score</h4>
                        <p className="text-sm text-gray-400">Measure the strength and value of your connections</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded mr-3">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-400">Company Insights</h4>
                        <p className="text-sm text-gray-400">Analyze connections by company size and type</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Post Engagement</CardTitle>
                  <CardDescription>Likes, comments, and shares</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">224</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+18.2%</span> from previous period
                  </p>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Week 1", engagement: 45 },
                        { name: "Week 2", engagement: 52 },
                        { name: "Week 3", engagement: 49 },
                        { name: "Week 4", engagement: 78 },
                      ]}>
                        <defs>
                          <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="engagement" stroke="#8884d8" fillOpacity={1} fill="url(#colorEngagement)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Content Reach</CardTitle>
                  <CardDescription>People who saw your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,842</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">+24.5%</span> from previous period
                  </p>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Week 1", reach: 720 },
                        { name: "Week 2", reach: 890 },
                        { name: "Week 3", reach: 1020 },
                        { name: "Week 4", reach: 1212 },
                      ]}>
                        <defs>
                          <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="reach" stroke="#f59e0b" fillOpacity={1} fill="url(#colorReach)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  <CardDescription>Engagement as % of reach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5.8%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500">-1.2%</span> from previous period
                  </p>
                  <div className="h-[80px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Week 1", rate: 6.3 },
                        { name: "Week 2", rate: 5.9 },
                        { name: "Week 3", rate: 6.1 },
                        { name: "Week 4", rate: 5.8 },
                      ]}>
                        <defs>
                          <linearGradient id="colorEngRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="rate" stroke="#16a34a" fillOpacity={1} fill="url(#colorEngRate)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Breakdown</CardTitle>
                <CardDescription>
                  Types of engagement with your content
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
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Engagement</CardTitle>
                <CardDescription>
                  How your content performs across different industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={industryEngagementData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar name="Your Content" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      {isPremium && (
                        <Radar name="Industry Average" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      )}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              {!isPremium && (
                <CardFooter className="bg-muted/50 flex justify-between">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upgrade to Premium to see industry benchmarks</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleUpgradeToPremium}>
                    <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                    Upgrade
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>
                  How your posts are performing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={contentPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="#0284c7" />
                      <Bar dataKey="engagement" fill="#16a34a" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>
                    Your most engaging posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                        <div className="bg-muted h-12 w-12 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">Post about {i === 1 ? 'startup funding' : i === 2 ? 'team building' : 'product launch'}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              <span>{i === 1 ? '1,245' : i === 2 ? '987' : '756'} views</span>
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              <span>{i === 1 ? '87' : i === 2 ? '64' : '42'} likes</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              <span>{i === 1 ? '32' : i === 2 ? '18' : '9'} comments</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Recommendations</CardTitle>
                  <CardDescription>
                    Suggestions to improve your content strategy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Post Consistently</h4>
                        <p className="text-xs text-muted-foreground mt-1">Your engagement is higher when you post at least 3 times per week.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Engage With Comments</h4>
                        <p className="text-xs text-muted-foreground mt-1">Posts where you respond to comments get 40% more engagement.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Content Types</h4>
                        <p className="text-xs text-muted-foreground mt-1">Your audience engages most with case studies and how-to content.</p>
                      </div>
                    </div>
                    {isPremium && (
                      <div className="flex items-start gap-3">
                        <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Optimal Posting Times</h4>
                          <p className="text-xs text-muted-foreground mt-1">Your content performs best when posted on Tuesdays and Thursdays between 10am-12pm.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                {!isPremium && (
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Unlock more insights with Premium</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleUpgradeToPremium}>
                      Upgrade
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Career Tab */}
          <TabsContent value="career" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Assessment</CardTitle>
                  <CardDescription>
                    How your skills are perceived based on endorsements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart
                        layout="vertical"
                        data={skillsData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#0284c7" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Visibility by Industry</CardTitle>
                  <CardDescription>
                    Who's viewing your profile by industry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Technology", value: 35 },
                            { name: "Finance", value: 25 },
                            { name: "Healthcare", value: 15 },
                            { name: "Education", value: 10 },
                            { name: "Others", value: 15 },
                          ]}
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
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Career Growth Opportunities</CardTitle>
                <CardDescription>
                  Potential opportunities based on your profile and network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Job Matches</h3>
                      <p className="text-sm text-muted-foreground mb-3">Based on your skills and experience, these roles might be a good fit</p>
                      <div className="space-y-3">
                        {isPremium ? (
                          <>
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="flex justify-between">
                                <h4 className="font-medium">Product Manager</h4>
                                <Badge>95% Match</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">TechSolutions Inc. • Bangalore</p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="flex justify-between">
                                <h4 className="font-medium">Senior Business Analyst</h4>
                                <Badge>92% Match</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">FinTech Innovations • Mumbai</p>
                            </div>
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="flex justify-between">
                                <h4 className="font-medium">Growth Marketing Lead</h4>
                                <Badge>88% Match</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">StartupGrowth • Remote</p>
                            </div>
                          </>
                        ) : (
                          <div className="bg-muted p-6 rounded-lg text-center">
                            <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <h4 className="font-medium mb-1">Premium Feature</h4>
                            <p className="text-sm text-muted-foreground mb-3">Upgrade to see personalized job matches</p>
                            <Button variant="outline" size="sm" onClick={handleUpgradeToPremium}>
                              <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                              Upgrade to Premium
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Network Recommendations</h3>
                      <p className="text-sm text-muted-foreground mb-3">Connect with these professionals to expand your opportunities</p>
                      {isPremium ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-muted p-3 rounded-lg flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                            <div>
                              <h4 className="font-medium text-sm">Priya Sharma</h4>
                              <p className="text-xs text-muted-foreground">VP of Product, TechCorp</p>
                            </div>
                          </div>
                          <div className="bg-muted p-3 rounded-lg flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                            <div>
                              <h4 className="font-medium text-sm">Rahul Kapoor</h4>
                              <p className="text-xs text-muted-foreground">Angel Investor</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted p-6 rounded-lg text-center">
                          <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <h4 className="font-medium mb-1">Premium Feature</h4>
                          <p className="text-sm text-muted-foreground mb-3">Upgrade to see strategic connection recommendations</p>
                          <Button variant="outline" size="sm" onClick={handleUpgradeToPremium}>
                            Upgrade to Premium
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}