import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  User, 
  Settings, 
  Bell,
  Share2,
  UserPlus,
  MessageCircle,
  CalendarDays,
  FileText,
  Lock,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Pin,
  Clock,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export default function GroupDetailPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discussions");
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [isJoined, setIsJoined] = useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // Sample group data
  const group = {
    id: 1,
    name: "Startup Founders India",
    description: "A community of startup founders in India sharing experiences, challenges, and opportunities. Connect with fellow entrepreneurs, share insights, and grow together.",
    category: "entrepreneurship",
    members: 1250,
    posts: 342,
    events: 12,
    isPrivate: false,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
    admins: [
      {
        id: 1,
        name: "Rajiv Sharma",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        title: "Founder & CEO, TechSolutions"
      }
    ],
    moderators: [
      {
        id: 2,
        name: "Priya Patel",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        title: "Co-founder, GrowthLabs"
      },
      {
        id: 3,
        name: "Vikram Singh",
        avatar: "https://randomuser.me/api/portraits/men/62.jpg",
        title: "Angel Investor"
      }
    ],
    rules: [
      "Be respectful and constructive in all interactions",
      "No self-promotion without prior approval",
      "Keep discussions relevant to entrepreneurship and startups",
      "Respect confidentiality of shared information",
      "No spam or irrelevant content"
    ]
  };

  // Sample discussions data
  const discussions = [
    {
      id: 1,
      author: {
        id: 5,
        name: "Ananya Desai",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
        title: "Founder, EcoStartup"
      },
      content: "Has anyone here successfully raised seed funding in the current market? What's your experience with Indian VCs versus angel investors? I'm preparing for my first fundraising round and would appreciate any insights or introductions.",
      timestamp: "2 hours ago",
      likes: 24,
      comments: [
        {
          id: 101,
          author: {
            id: 6,
            name: "Arjun Mehta",
            avatar: "https://randomuser.me/api/portraits/men/22.jpg",
            title: "Founder, PayEase"
          },
          content: "We raised our seed round last quarter. Found angels to be more flexible and faster to close compared to institutional VCs. Happy to share more details over DM.",
          timestamp: "1 hour ago",
          likes: 8
        },
        {
          id: 102,
          author: {
            id: 7,
            name: "Neha Gupta",
            avatar: "https://randomuser.me/api/portraits/women/28.jpg",
            title: "Partner, Venture Capital Firm"
          },
          content: "From the VC side, I'd recommend having clear traction metrics and a well-defined market opportunity. Most VCs are still actively investing but the bar has definitely been raised.",
          timestamp: "45 minutes ago",
          likes: 12
        }
      ]
    },
    {
      id: 2,
      author: {
        id: 8,
        name: "Rahul Kapoor",
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        title: "Founder & CTO, CloudNative"
      },
      content: "I'm looking for recommendations on affordable co-working spaces in Bangalore that have a good startup community. Preferably in the Koramangala or Indiranagar area. Any suggestions from fellow founders?",
      timestamp: "5 hours ago",
      likes: 15,
      comments: [
        {
          id: 103,
          author: {
            id: 9,
            name: "Divya Shah",
            avatar: "https://randomuser.me/api/portraits/women/33.jpg",
            title: "Co-founder, DesignHub"
          },
          content: "We've been working out of WeWork in Koramangala for the past year and love the community. They often host networking events which have been great for meeting potential clients and partners.",
          timestamp: "4 hours ago",
          likes: 6
        }
      ]
    },
    {
      id: 3,
      author: {
        id: 10,
        name: "Sanjay Joshi",
        avatar: "https://randomuser.me/api/portraits/men/55.jpg",
        title: "Serial Entrepreneur"
      },
      content: "Just published a detailed guide on navigating the regulatory landscape for fintech startups in India based on our experience. Covers RBI regulations, data protection, and compliance requirements. Let me know if you'd like me to share it here!",
      timestamp: "1 day ago",
      likes: 47,
      comments: [
        {
          id: 104,
          author: {
            id: 11,
            name: "Meera Reddy",
            avatar: "https://randomuser.me/api/portraits/women/59.jpg",
            title: "Founder, FinSecure"
          },
          content: "This would be incredibly valuable! We're in the process of applying for various licenses and finding the process quite complex.",
          timestamp: "22 hours ago",
          likes: 9
        },
        {
          id: 105,
          author: {
            id: 12,
            name: "Amit Sharma",
            avatar: "https://randomuser.me/api/portraits/men/36.jpg",
            title: "Legal Advisor"
          },
          content: "I'd love to see this as well. The regulatory environment is constantly evolving, especially with the new data protection bill coming up.",
          timestamp: "20 hours ago",
          likes: 7
        },
        {
          id: 106,
          author: {
            id: 10,
            name: "Sanjay Joshi",
            avatar: "https://randomuser.me/api/portraits/men/55.jpg",
            title: "Serial Entrepreneur"
          },
          content: "Thanks for the interest! I've shared the guide as a resource in the 'Resources' tab. It includes templates for compliance documentation as well.",
          timestamp: "18 hours ago",
          likes: 15
        }
      ]
    }
  ];

  // Sample events data
  const events = [
    {
      id: 1,
      title: "Startup Networking Mixer",
      description: "An evening of networking with fellow entrepreneurs, investors, and industry experts. Great opportunity to make meaningful connections and discuss potential collaborations.",
      date: "June 15, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "The Leela Palace, Bangalore",
      isVirtual: false,
      organizer: {
        id: 2,
        name: "Priya Patel",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      attendees: 78,
      isRegistered: true,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
    },
    {
      id: 2,
      title: "Fundraising Masterclass: Pitching to Investors",
      description: "Learn how to create a compelling pitch deck and effectively communicate your vision to potential investors. Includes live pitch practice and feedback session.",
      date: "June 22, 2025",
      time: "2:00 PM - 5:00 PM",
      location: "Online",
      isVirtual: true,
      organizer: {
        id: 3,
        name: "Vikram Singh",
        avatar: "https://randomuser.me/api/portraits/men/62.jpg"
      },
      attendees: 125,
      isRegistered: false,
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      title: "Product-Market Fit Workshop",
      description: "A hands-on workshop to help you validate your product ideas and find the right market fit. Bring your current challenges and work through them with expert guidance.",
      date: "July 5, 2025",
      time: "10:00 AM - 4:00 PM",
      location: "WeWork, Koramangala, Bangalore",
      isVirtual: false,
      organizer: {
        id: 1,
        name: "Rajiv Sharma",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      attendees: 45,
      isRegistered: false,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  ];

  // Sample resources data
  const resources = [
    {
      id: 1,
      title: "Startup Funding Guide for Indian Entrepreneurs",
      description: "A comprehensive guide to raising capital in India's startup ecosystem, including angel investors, venture capital, and government grants.",
      type: "guide",
      format: "PDF",
      author: {
        id: 3,
        name: "Vikram Singh",
        avatar: "https://randomuser.me/api/portraits/men/62.jpg"
      },
      date: "March 15, 2025",
      downloads: 342,
      rating: 4.8
    },
    {
      id: 2,
      title: "Financial Model Template for SaaS Startups",
      description: "A ready-to-use financial model template specifically designed for SaaS businesses, including revenue projections, cash flow, and unit economics.",
      type: "template",
      format: "XLSX",
      author: {
        id: 7,
        name: "Neha Gupta",
        avatar: "https://randomuser.me/api/portraits/women/28.jpg"
      },
      date: "February 10, 2025",
      downloads: 215,
      rating: 4.6
    },
    {
      id: 3,
      title: "Regulatory Guide for Fintech Startups in India",
      description: "Comprehensive overview of the regulatory landscape for fintech startups, including RBI regulations, data protection, and compliance requirements.",
      type: "guide",
      format: "PDF",
      author: {
        id: 10,
        name: "Sanjay Joshi",
        avatar: "https://randomuser.me/api/portraits/men/55.jpg"
      },
      date: "April 5, 2025",
      downloads: 178,
      rating: 4.9
    }
  ];

  // Sample members data
  const members = [
    {
      id: 1,
      name: "Rajiv Sharma",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      title: "Founder & CEO, TechSolutions",
      role: "Admin",
      joinedDate: "Jan 2023"
    },
    {
      id: 2,
      name: "Priya Patel",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      title: "Co-founder, GrowthLabs",
      role: "Moderator",
      joinedDate: "Feb 2023"
    },
    {
      id: 3,
      name: "Vikram Singh",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg",
      title: "Angel Investor",
      role: "Moderator",
      joinedDate: "Mar 2023"
    },
    {
      id: 5,
      name: "Ananya Desai",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      title: "Founder, EcoStartup",
      role: "Member",
      joinedDate: "Apr 2023"
    },
    {
      id: 6,
      name: "Arjun Mehta",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      title: "Founder, PayEase",
      role: "Member",
      joinedDate: "May 2023"
    },
    {
      id: 7,
      name: "Neha Gupta",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      title: "Partner, Venture Capital Firm",
      role: "Member",
      joinedDate: "Jun 2023"
    },
    {
      id: 8,
      name: "Rahul Kapoor",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      title: "Founder & CTO, CloudNative",
      role: "Member",
      joinedDate: "Jul 2023"
    },
    {
      id: 9,
      name: "Divya Shah",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      title: "Co-founder, DesignHub",
      role: "Member",
      joinedDate: "Aug 2023"
    }
  ];

  const handleToggleJoin = () => {
    setIsJoined(!isJoined);
    toast({
      title: isJoined ? "Left group" : "Joined group",
      description: isJoined 
        ? `You have left ${group.name}` 
        : `You have successfully joined ${group.name}`,
    });
  };

  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
    toast({
      title: isNotificationsEnabled ? "Notifications disabled" : "Notifications enabled",
      description: isNotificationsEnabled 
        ? `You will no longer receive notifications from ${group.name}` 
        : `You will now receive notifications from ${group.name}`,
    });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      toast({
        title: "Post created",
        description: "Your post has been published to the group",
      });
      setNewPost("");
    }
  };

  const handleCommentSubmit = (postId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      toast({
        title: "Comment added",
        description: "Your comment has been added to the discussion",
      });
      setNewComment("");
    }
  };

  const toggleLikePost = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const toggleLikeComment = (commentId: number) => {
    setLikedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId) 
        : [...prev, commentId]
    );
  };

  const handleRegisterForEvent = (eventId: number) => {
    toast({
      title: "Registration successful",
      description: `You have registered for ${events.find(e => e.id === eventId)?.title}`,
    });
  };

  const handleDownloadResource = (resourceId: number) => {
    toast({
      title: "Download started",
      description: `Downloading ${resources.find(r => r.id === resourceId)?.title}`,
    });
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div 
          className="h-64 rounded-lg bg-cover bg-center mb-6 relative"
          style={{ backgroundImage: `url(${group.image})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex flex-col justify-end p-6">
            <div className="flex justify-between items-end">
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  {group.category}
                </Badge>
                <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
                <div className="flex items-center text-white">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="mr-4">{group.members.toLocaleString()} members</span>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span className="mr-4">{group.posts} posts</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{group.events} events</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    toast({
                      title: "Group shared",
                      description: "Link copied to clipboard",
                    });
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant={isJoined ? "outline" : "default"}
                  className={isJoined ? "bg-white text-gray-800 hover:bg-gray-100" : ""}
                  onClick={handleToggleJoin}
                >
                  {isJoined ? (
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {group.description}
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Admins</h3>
                    {group.admins.map(admin => (
                      <div key={admin.id} className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={admin.avatar} alt={admin.name} />
                          <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{admin.name}</p>
                          <p className="text-xs text-muted-foreground">{admin.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Moderators</h3>
                    {group.moderators.map(mod => (
                      <div key={mod.id} className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={mod.avatar} alt={mod.name} />
                          <AvatarFallback>{mod.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{mod.name}</p>
                          <p className="text-xs text-muted-foreground">{mod.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {group.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Group Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-primary" />
                    <span>Notifications</span>
                  </div>
                  <Button 
                    variant={isNotificationsEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleNotifications}
                  >
                    {isNotificationsEnabled ? "On" : "Off"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-primary" />
                    <span>Group Settings</span>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Coming soon",
                        description: "This feature is under development",
                      });
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="discussions">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <FileText className="h-4 w-4 mr-2" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
              </TabsList>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="space-y-6">
                {isJoined && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Start a Discussion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handlePostSubmit}>
                        <Textarea 
                          placeholder="Share your thoughts, questions, or insights with the group..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="mb-4"
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button type="submit" disabled={!newPost.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {discussions.map(post => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar>
                              <AvatarImage src={post.author.avatar} alt={post.author.name} />
                              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{post.author.name}</h3>
                              <p className="text-xs text-muted-foreground">{post.author.title}</p>
                              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pin className="h-4 w-4 mr-2" />
                                Save Post
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Flag className="h-4 w-4 mr-2" />
                                Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm">{post.content}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0 pb-3">
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`flex items-center gap-1 ${likedPosts.includes(post.id) ? 'text-primary' : ''}`}
                            onClick={() => toggleLikePost(post.id)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span>{likedPosts.includes(post.id) ? post.likes + 1 : post.likes}</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments.length}</span>
                          </Button>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Post shared",
                              description: "Link copied to clipboard",
                            });
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                      
                      {expandedPost === post.id && (
                        <div className="px-6 pb-4 space-y-4">
                          <Separator />
                          
                          <div className="space-y-4">
                            {post.comments.map(comment => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                                  <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-muted p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="text-sm font-medium">{comment.author.name}</h4>
                                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Flag className="h-4 w-4 mr-2" />
                                            Report
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                    <p className="text-sm mt-1">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 ml-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className={`flex items-center gap-1 h-6 px-2 ${likedComments.includes(comment.id) ? 'text-primary' : ''}`}
                                      onClick={() => toggleLikeComment(comment.id)}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                      <span className="text-xs">{likedComments.includes(comment.id) ? comment.likes + 1 : comment.likes}</span>
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="flex items-center gap-1 h-6 px-2"
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                      <span className="text-xs">Reply</span>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {isJoined && (
                            <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>SC</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input 
                                  placeholder="Write a comment..." 
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="flex-1"
                                />
                                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="space-y-6">
                {isJoined && (
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Upcoming Events</h2>
                    <Button onClick={() => window.location.href = '/events/create'}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      <div 
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${event.image})` }}
                      ></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Badge variant={event.isVirtual ? "outline" : "default"}>
                            {event.isVirtual ? "Virtual" : "In-Person"}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                        <CardTitle className="mt-2">{event.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {event.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p>{event.date}</p>
                              <p className="text-muted-foreground">{event.time}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex items-center">
                              <Avatar className="h-5 w-5 mr-1">
                                <AvatarImage src={event.organizer.avatar} alt={event.organizer.name} />
                                <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>Organized by {event.organizer.name}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/events/${event.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {event.isRegistered ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-green-500 text-green-600"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Registered
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleRegisterForEvent(event.id)}
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Register
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-6">
                {isJoined && (
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Shared Resources</h2>
                    <Button onClick={() => window.location.href = '/resources/create'}>
                      <Plus className="h-4 w-4 mr-2" />
                      Share Resource
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {resources.map(resource => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <Badge variant="outline">
                            {resource.type}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 mr-1" />
                            <span>{resource.format}</span>
                          </div>
                        </div>
                        <CardTitle className="mt-2">{resource.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {resource.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={resource.author.avatar} alt={resource.author.name} />
                              <AvatarFallback>{resource.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>Shared by {resource.author.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{resource.date}</span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{resource.downloads} downloads</span>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span>{resource.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => window.location.href = `/resources/${resource.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleDownloadResource(resource.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Group Members</h2>
                  <Input 
                    placeholder="Search members..." 
                    className="w-[250px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map(member => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{member.name}</h3>
                                <p className="text-sm text-muted-foreground">{member.title}</p>
                              </div>
                              <Badge variant={
                                member.role === "Admin" 
                                  ? "default" 
                                  : member.role === "Moderator" 
                                    ? "secondary" 
                                    : "outline"
                              }>
                                {member.role}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>Joined {member.joinedDate}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}