import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Users, 
  Info, 
  Plus, 
  MessageSquare, 
  Calendar, 
  User, 
  Settings, 
  Bell,
  Filter,
  ChevronRight,
  Star,
  Clock,
  Eye,
  UserPlus,
  MessageCircle,
  CalendarDays,
  FileText,
  Lock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InterestGroupsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);

  // Sample groups data
  const groups = [
    {
      id: 1,
      name: "Startup Founders India",
      description: "A community of startup founders in India sharing experiences, challenges, and opportunities.",
      category: "entrepreneurship",
      members: 1250,
      posts: 342,
      events: 12,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
      recentActivity: "New event: Startup Networking Mixer - June 15"
    },
    {
      id: 2,
      name: "Tech Entrepreneurs",
      description: "For entrepreneurs building technology products and services. Discuss tech trends, development challenges, and innovation.",
      category: "technology",
      members: 3420,
      posts: 567,
      events: 8,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      recentActivity: "Hot discussion: AI tools for startups"
    },
    {
      id: 3,
      name: "Women in Business",
      description: "A supportive community for women entrepreneurs and business leaders to connect, share insights, and empower each other.",
      category: "diversity",
      members: 2180,
      posts: 423,
      events: 15,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
      recentActivity: "New resource: Funding opportunities for women entrepreneurs"
    },
    {
      id: 4,
      name: "SaaS Founders Circle",
      description: "Exclusive group for founders of SaaS companies to discuss pricing strategies, customer acquisition, and retention.",
      category: "technology",
      members: 875,
      posts: 289,
      events: 6,
      isPrivate: true,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      recentActivity: "Member spotlight: Success story from Akash Gupta"
    },
    {
      id: 5,
      name: "Fintech Innovation",
      description: "Discussing the latest in financial technology, regulations, and market opportunities in India and globally.",
      category: "finance",
      members: 1560,
      posts: 312,
      events: 9,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
      recentActivity: "New discussion: UPI integration best practices"
    },
    {
      id: 6,
      name: "Bootstrapped Businesses",
      description: "For entrepreneurs building profitable businesses without external funding. Share strategies for sustainable growth.",
      category: "entrepreneurship",
      members: 1120,
      posts: 267,
      events: 5,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      recentActivity: "Poll: Best tools for bootstrapped startups"
    },
    {
      id: 7,
      name: "Product Managers India",
      description: "A community for product managers to discuss product strategy, user experience, and roadmap planning.",
      category: "product",
      members: 1890,
      posts: 378,
      events: 11,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      recentActivity: "Upcoming workshop: User research techniques"
    },
    {
      id: 8,
      name: "Angel Investors Network",
      description: "Connecting angel investors with promising startups. Discuss investment opportunities and portfolio management.",
      category: "finance",
      members: 650,
      posts: 198,
      events: 7,
      isPrivate: true,
      image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      recentActivity: "New pitch opportunity: Seed round for AI startups"
    },
    {
      id: 9,
      name: "Marketing Masterminds",
      description: "For marketing professionals to share strategies, campaigns, and insights on digital and traditional marketing.",
      category: "marketing",
      members: 2240,
      posts: 412,
      events: 10,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      recentActivity: "Resource shared: Social media content calendar template"
    },
    {
      id: 10,
      name: "Startup Legal Support",
      description: "Discussing legal aspects of startups including incorporation, IP protection, contracts, and compliance.",
      category: "legal",
      members: 980,
      posts: 245,
      events: 4,
      isPrivate: false,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      recentActivity: "Q&A session: Trademark registration process"
    },
  ];

  // Filter groups based on active tab, search query, and category
  const filteredGroups = groups.filter(group => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "joined" && joinedGroups.includes(group.id)) ||
                      (activeTab === "public" && !group.isPrivate) ||
                      (activeTab === "private" && group.isPrivate);
    
    const matchesSearch = searchQuery === "" || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || group.category === categoryFilter;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleJoinGroup = (groupId: number) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(prev => prev.filter(id => id !== groupId));
      toast({
        title: "Left group",
        description: `You have left ${groups.find(g => g.id === groupId)?.name}`,
      });
    } else {
      setJoinedGroups(prev => [...prev, groupId]);
      toast({
        title: "Joined group",
        description: `You have successfully joined ${groups.find(g => g.id === groupId)?.name}`,
      });
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim() && newGroupDescription.trim() && newGroupCategory) {
      toast({
        title: "Group created",
        description: `Your group "${newGroupName}" has been created successfully.`,
      });
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupCategory("");
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "entrepreneurship":
        return "bg-blue-100 text-blue-800";
      case "technology":
        return "bg-purple-100 text-purple-800";
      case "finance":
        return "bg-green-100 text-green-800";
      case "marketing":
        return "bg-orange-100 text-orange-800";
      case "product":
        return "bg-indigo-100 text-indigo-800";
      case "legal":
        return "bg-red-100 text-red-800";
      case "diversity":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="mr-2 h-8 w-8" />
              Interest Groups
            </h1>
            <p className="text-muted-foreground mt-1">
              Join topic-based groups to connect with like-minded professionals
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search groups..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a group to connect with professionals who share your interests.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter group name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select value={newGroupCategory} onValueChange={setNewGroupCategory}>
                      <SelectTrigger id="category" className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="diversity">Diversity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="privacy" className="text-right">
                      Privacy
                    </Label>
                    <Select defaultValue="public">
                      <SelectTrigger id="privacy" className="col-span-3">
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Describe what this group is about"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGroup}>
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-all" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "all"}
                    onChange={() => setCategoryFilter("all")}
                  />
                  <label htmlFor="category-all">All Categories</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-entrepreneurship" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "entrepreneurship"}
                    onChange={() => setCategoryFilter("entrepreneurship")}
                  />
                  <label htmlFor="category-entrepreneurship">Entrepreneurship</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-technology" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "technology"}
                    onChange={() => setCategoryFilter("technology")}
                  />
                  <label htmlFor="category-technology">Technology</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-finance" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "finance"}
                    onChange={() => setCategoryFilter("finance")}
                  />
                  <label htmlFor="category-finance">Finance</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-marketing" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "marketing"}
                    onChange={() => setCategoryFilter("marketing")}
                  />
                  <label htmlFor="category-marketing">Marketing</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-product" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "product"}
                    onChange={() => setCategoryFilter("product")}
                  />
                  <label htmlFor="category-product">Product</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-legal" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "legal"}
                    onChange={() => setCategoryFilter("legal")}
                  />
                  <label htmlFor="category-legal">Legal</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-diversity" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "diversity"}
                    onChange={() => setCategoryFilter("diversity")}
                  />
                  <label htmlFor="category-diversity">Diversity</label>
                </div>
              </CardContent>
              <CardHeader className="pt-0">
                <CardTitle className="text-lg">My Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                    <span>My Discussions</span>
                  </div>
                  <Badge>12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                    <span>Upcoming Events</span>
                  </div>
                  <Badge>5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-primary" />
                    <span>Notifications</span>
                  </div>
                  <Badge>8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span>Saved Resources</span>
                  </div>
                  <Badge>3</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">All Groups</TabsTrigger>
                <TabsTrigger value="joined">My Groups</TabsTrigger>
                <TabsTrigger value="public">Public Groups</TabsTrigger>
                <TabsTrigger value="private">Private Groups</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredGroups.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No groups found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        {activeTab === "joined" 
                          ? "You haven't joined any groups yet. Explore and join groups that match your interests."
                          : "We couldn't find any groups matching your current filters."}
                      </p>
                      {activeTab === "joined" ? (
                        <Button onClick={() => setActiveTab("all")}>
                          Explore Groups
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchQuery("");
                            setCategoryFilter("all");
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredGroups.map(group => (
                      <Card key={group.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div 
                            className="md:w-1/4 h-[200px] md:h-auto bg-cover bg-center"
                            style={{ backgroundImage: `url(${group.image})` }}
                          >
                            <div className="w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
                              {group.isPrivate && (
                                <div className="bg-black bg-opacity-70 p-2 rounded-full">
                                  <Lock className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="md:w-3/4 p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={getCategoryColor(group.category)}>
                                    {group.category}
                                  </Badge>
                                  {group.isPrivate && (
                                    <Badge variant="outline" className="flex items-center">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Private
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                                <p className="text-muted-foreground mb-4">{group.description}</p>
                                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{group.members.toLocaleString()} members</span>
                                  </div>
                                  <div className="flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    <span>{group.posts} posts</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{group.events} events</span>
                                  </div>
                                </div>
                                {group.recentActivity && (
                                  <div className="bg-primary/5 p-2 rounded text-sm mb-4">
                                    <span className="font-medium">Recent activity: </span>
                                    {group.recentActivity}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/groups/${group.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Group
                              </Button>
                              <Button
                                size="sm"
                                variant={joinedGroups.includes(group.id) ? "outline" : "default"}
                                onClick={() => handleJoinGroup(group.id)}
                                className={joinedGroups.includes(group.id) ? "border-green-500 text-green-600" : ""}
                              >
                                {joinedGroups.includes(group.id) ? (
                                  <>
                                    <User className="h-4 w-4 mr-2" />
                                    Joined
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Join Group
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}