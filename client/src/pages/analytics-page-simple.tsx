import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { BarChart, LineChart, PieChart, Activity, Users, TrendingUp, Download, Calendar, Filter } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");

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
      {/* Mobile view (LinkedIn style) */}
      <div className="md:hidden max-w-7xl mx-auto pb-16 bg-[#F3F2EF]">
        {/* Mobile-optimized header */}
        <div className="bg-white px-4 py-3 mb-2 shadow-sm">
          <div className="flex flex-col justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-[#191919]">Analytics Dashboard</h1>
              <p className="text-sm text-[#666666] mt-1">
                Track your network growth and engagement metrics
              </p>
            </div>
            <div className="flex w-full gap-2 mt-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full text-sm h-9 border-[#E0E0E0]">
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
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="h-9 border-[#E0E0E0] text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* LinkedIn-style tabs for mobile */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <div className="bg-white px-1 py-1 overflow-x-auto scrollbar-hide">
            <TabsList className="flex bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="overview" 
                className="flex-1 flex flex-col items-center py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:text-[#0077B5] data-[state=active]:border-b-2 data-[state=active]:border-[#0077B5] rounded-none h-auto"
              >
                <Activity className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="network" 
                className="flex-1 flex flex-col items-center py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:text-[#0077B5] data-[state=active]:border-b-2 data-[state=active]:border-[#0077B5] rounded-none h-auto"
              >
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Network</span>
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="flex-1 flex flex-col items-center py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:text-[#0077B5] data-[state=active]:border-b-2 data-[state=active]:border-[#0077B5] rounded-none h-auto"
              >
                <TrendingUp className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Engagement</span>
              </TabsTrigger>
              <TabsTrigger 
                value="events" 
                className="flex-1 flex flex-col items-center py-2 px-3 data-[state=active]:bg-transparent data-[state=active]:text-[#0077B5] data-[state=active]:border-b-2 data-[state=active]:border-[#0077B5] rounded-none h-auto"
              >
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Events</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Mobile tab content will be here */}
        </Tabs>
      </div>
      
      {/* Desktop view (original style) */}
      <div className="hidden md:block container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your network growth and engagement metrics
            </p>
          </div>
          <div className="flex gap-2">
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
          <TabsList className="grid grid-cols-4 w-[600px]">
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

          {/* Mobile Overview Tab */}
          <TabsContent value="overview" className="md:hidden space-y-3 px-4">
            {/* Stats cards in LinkedIn mobile style */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-[#191919]">Profile Views</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">Total views in selected period</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#191919]">1,248</div>
                      <p className="text-xs text-[#666666] flex items-center">
                        <span className="text-green-600 font-medium">+12.5%</span>
                        <span className="ml-1">from previous period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <BarChart className="h-6 w-6 text-[#0077B5]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-[#191919]">New Connections</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">Connections made in selected period</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#191919]">32</div>
                      <p className="text-xs text-[#666666] flex items-center">
                        <span className="text-green-600 font-medium">+8.2%</span>
                        <span className="ml-1">from previous period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-4">
                  <CardTitle className="text-sm font-medium text-[#191919]">Engagement Rate</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">Average engagement with your content</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#191919]">18.7%</div>
                      <p className="text-xs text-[#666666] flex items-center">
                        <span className="text-red-600 font-medium">-2.3%</span>
                        <span className="ml-1">from previous period</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-50 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart card in LinkedIn mobile style */}
            <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-[#191919]">Profile Views Over Time</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">
                    Track how your profile visibility has changed
                  </CardDescription>
                </div>
                <Filter className="h-5 w-5 text-[#666666]" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="h-[250px] bg-gray-50 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-[#0077B5] mx-auto mb-3" />
                    <p className="text-sm text-[#666666]">Profile view data visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Desktop Overview Tab */}
          <TabsContent value="overview" className="hidden md:block space-y-4">
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
                  <div className="h-[80px] mt-4 bg-blue-50 rounded-md flex items-center justify-center">
                    <BarChart className="h-10 w-10 text-blue-500" />
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
                  <div className="h-[80px] mt-4 bg-green-50 rounded-md flex items-center justify-center">
                    <Users className="h-10 w-10 text-green-500" />
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
                  <div className="h-[80px] mt-4 bg-orange-50 rounded-md flex items-center justify-center">
                    <TrendingUp className="h-10 w-10 text-orange-500" />
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
                <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Profile view data visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Network Tab */}
          <TabsContent value="network" className="md:hidden space-y-3 px-4">
            {/* Chart cards in LinkedIn mobile style */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium text-[#191919]">Connection Types</CardTitle>
                    <CardDescription className="text-xs text-[#666666]">
                      Breakdown of your network by role
                    </CardDescription>
                  </div>
                  <Filter className="h-5 w-5 text-[#666666]" />
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-[#7F56D9] mx-auto mb-3" />
                      <p className="text-sm text-[#666666]">Connection type breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium text-[#191919]">Connection Growth</CardTitle>
                    <CardDescription className="text-xs text-[#666666]">
                      Monthly growth of your network
                    </CardDescription>
                  </div>
                  <Filter className="h-5 w-5 text-[#666666]" />
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-[#0077B5] mx-auto mb-3" />
                      <p className="text-sm text-[#666666]">Connection growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Connections in LinkedIn mobile style */}
            <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-[#191919]">Top Connections</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">
                    Your most influential connections
                  </CardDescription>
                </div>
                <Filter className="h-5 w-5 text-[#666666]" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#E0E0E0] last:border-0">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-[#0077B5]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#191919]">Connection {i}</p>
                          <p className="text-xs text-[#666666]">Role • Company</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 rounded-full text-xs border-[#0077B5] text-[#0077B5] hover:bg-[#E5F5FC]"
                        onClick={() => window.location.href = `/profile/${i}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Desktop Network Tab */}
          <TabsContent value="network" className="hidden md:block space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Types</CardTitle>
                  <CardDescription>
                    Breakdown of your network by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Connection type breakdown</p>
                    </div>
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
                  <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Connection growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Connections</CardTitle>
                <CardDescription>
                  Your most influential connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">Connection {i}</p>
                          <p className="text-sm text-gray-500">Role • Company</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.location.href = `/profile/${i}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Engagement Tab */}
          <TabsContent value="engagement" className="md:hidden space-y-3 px-4">
            {/* Chart cards in LinkedIn mobile style */}
            <div className="grid grid-cols-1 gap-3">
              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium text-[#191919]">Engagement by Type</CardTitle>
                    <CardDescription className="text-xs text-[#666666]">
                      Breakdown of different engagement types
                    </CardDescription>
                  </div>
                  <Filter className="h-5 w-5 text-[#666666]" />
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <BarChart className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-sm text-[#666666]">Engagement type breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium text-[#191919]">Engagement Over Time</CardTitle>
                    <CardDescription className="text-xs text-[#666666]">
                      How your engagement has changed
                    </CardDescription>
                  </div>
                  <Filter className="h-5 w-5 text-[#666666]" />
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                      <p className="text-sm text-[#666666]">Engagement trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Content in LinkedIn mobile style */}
            <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-[#191919]">Top Performing Content</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">
                    Your content with the highest engagement
                  </CardDescription>
                </div>
                <Filter className="h-5 w-5 text-[#666666]" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#E0E0E0] last:border-0">
                      <div className="flex items-center flex-1 min-w-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3 flex-shrink-0">
                          <Activity className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-[#191919] truncate">Content Title {i} - This is a longer title that might get truncated</p>
                          <p className="text-xs text-[#666666]">Posted on: May {i}, 2025</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-sm text-[#191919]">{100 - i * 10}</p>
                        <p className="text-xs text-[#666666]">engagements</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Desktop Engagement Tab */}
          <TabsContent value="engagement" className="hidden md:block space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement by Type</CardTitle>
                  <CardDescription>
                    Breakdown of different engagement types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <BarChart className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Engagement type breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Over Time</CardTitle>
                  <CardDescription>
                    How your engagement has changed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Engagement trends</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>
                  Your content with the highest engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                          <Activity className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">Content Title {i}</p>
                          <p className="text-sm text-gray-500">Posted on: May {i}, 2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{100 - i * 10} engagements</p>
                        <p className="text-sm text-gray-500">View • Share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile Events Tab */}
          <TabsContent value="events" className="md:hidden space-y-3 px-4">
            {/* Event Participation in LinkedIn mobile style */}
            <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-[#191919]">Event Participation</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">
                    Events you've attended or organized
                  </CardDescription>
                </div>
                <Filter className="h-5 w-5 text-[#666666]" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="h-[200px] bg-gray-50 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-[#7F56D9] mx-auto mb-3" />
                    <p className="text-sm text-[#666666]">Event participation data</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events in LinkedIn mobile style */}
            <Card className="shadow-sm border border-[#E0E0E0] overflow-hidden">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-[#191919]">Upcoming Events</CardTitle>
                  <CardDescription className="text-xs text-[#666666]">
                    Events you're registered for
                  </CardDescription>
                </div>
                <Filter className="h-5 w-5 text-[#666666]" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center py-2 border-b border-[#E0E0E0] last:border-0">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <Calendar className="h-5 w-5 text-[#7F56D9]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-[#191919] truncate">Event {i} - Founder Networking Session</h4>
                        <div className="flex flex-wrap text-xs text-[#666666]">
                          <span className="mr-3">May {10 + i}, 2025</span>
                          <span>Location {i}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-8 ml-2 rounded-full text-xs border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50 flex-shrink-0"
                        onClick={() => window.location.href = `/events/${i}`}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-3 bg-[#0077B5] hover:bg-[#005885] text-white rounded-full h-9"
                  onClick={() => window.location.href = '/events'}
                >
                  See all events
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Desktop Events Tab */}
          <TabsContent value="events" className="hidden md:block space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Participation</CardTitle>
                <CardDescription>
                  Events you've attended or organized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-gray-50 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Event participation data</p>
                  </div>
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
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 bg-gray-50 rounded-md">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Event {i}</h4>
                        <div className="flex text-sm text-gray-500">
                          <span className="mr-3">May {10 + i}, 2025</span>
                          <span>Location {i}</span>
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