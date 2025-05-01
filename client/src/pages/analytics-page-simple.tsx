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
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
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

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
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