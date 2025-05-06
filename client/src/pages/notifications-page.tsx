import { useState, useEffect, useRef } from 'react';
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Check, 
  UserPlus, 
  Star, 
  Briefcase, 
  MessageSquare, 
  RefreshCw, 
  ThumbsUp, 
  Heart, 
  Share2, 
  Settings, 
  MoreHorizontal, 
  Calendar, 
  FileText, 
  Bookmark,
  ChevronDown,
  Filter,
  AtSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  type: 'connection' | 'message' | 'mention' | 'job' | 'pitch';
  text: string;
  timestamp: Date;
  read: boolean;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      connections: true,
      messages: true,
      mentions: true,
      jobs: false,
      events: true
    },
    push: {
      connections: true,
      messages: true,
      mentions: true,
      jobs: true,
      events: true
    }
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'connection',
      text: 'sent you a connection request',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: false,
      user: {
        id: 1,
        name: 'Rahul Verma',
      }
    },
    {
      id: 2,
      type: 'message',
      text: 'sent you a message',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      user: {
        id: 2,
        name: 'Priya Singh',
      }
    },
    {
      id: 3,
      type: 'pitch',
      text: 'liked your startup pitch',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: true,
      user: {
        id: 3,
        name: 'Vikram Sharma',
      }
    },
    {
      id: 4,
      type: 'job',
      text: 'posted a new job that matches your profile',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
      user: {
        id: 4,
        name: 'TechSolutions India',
      }
    },
    {
      id: 5,
      type: 'connection',
      text: 'accepted your connection request',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      user: {
        id: 5,
        name: 'Aisha Patel',
      }
    },
    {
      id: 6,
      type: 'mention',
      text: 'mentioned you in a comment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      user: {
        id: 6,
        name: 'Raj Kumar',
      }
    },
  ]);
  
  // WebSocket connection for real-time notifications
  const notificationSocketRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection for notifications
  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port;
    // Use the current host and port, the proxy will handle the redirection
    const wsUrl = `${protocol}//${host}${port ? ':' + port : ''}/ws`;
    
    try {
      console.log(`Connecting to WebSocket server at ${wsUrl}`);
      notificationSocketRef.current = new WebSocket(wsUrl);
      
      notificationSocketRef.current.onopen = () => {
        console.log('WebSocket connection established for notifications');
        
        // Authenticate with the WebSocket server
        if (notificationSocketRef.current && user) {
          notificationSocketRef.current.send(JSON.stringify({
            type: 'connection',
            payload: { userId: user.id }
          }));
        }
      };
      
      notificationSocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket notification received:', data);
          
          if (data.type === 'notification') {
            // Handle incoming notification
            const notification = data.payload.notification;
            
            if (notification) {
              // Transform to match our Notification interface
              const newNotification: Notification = {
                id: notification.id,
                type: notification.type as 'connection' | 'message' | 'mention' | 'job' | 'pitch',
                text: notification.content,
                timestamp: new Date(notification.createdAt || Date.now()),
                read: notification.read || false,
                user: {
                  id: notification.relatedId || 0,
                  name: notification.content.split(' ')[0] // Extract name from content (simplification)
                }
              };
              
              setNotifications(prev => [newNotification, ...prev]);
              
              // Show browser notification if supported and permission is granted
              if ('Notification' in window) {
                if (Notification.permission === "granted" && document.hidden) {
                  try {
                    new Notification(`New notification`, {
                      body: notification.content,
                      icon: "/logo.png"
                    });
                  } catch (error) {
                    console.error('Error showing browser notification:', error);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket notification:', error);
        }
      };
      
      notificationSocketRef.current.onclose = () => {
        console.log('WebSocket connection closed for notifications');
      };
      
      notificationSocketRef.current.onerror = (error) => {
        console.error('WebSocket error for notifications:', error);
      };
    } catch (error) {
      console.error('Error setting up WebSocket connection for notifications:', error);
      
      // Fallback to mock implementation if WebSocket connection fails
      const mockNotificationEvents = () => {
        try {
          // 30% chance to receive a new notification
          if (Math.random() < 0.3) {
            const notificationTypes = ['connection', 'message', 'mention', 'job', 'pitch'];
            const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)] as 'connection' | 'message' | 'mention' | 'job' | 'pitch';
            const randomUser = {
              id: Math.floor(Math.random() * 1000) + 1,
              name: ['Rahul', 'Priya', 'Vikram', 'Anjali', 'Arjun'][Math.floor(Math.random() * 5)] + ' ' + 
                    ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta'][Math.floor(Math.random() * 5)],
            };
            
            let notificationText = '';
            switch (randomType) {
              case 'connection':
                notificationText = 'sent you a connection request';
                break;
              case 'message':
                notificationText = 'sent you a message';
                break;
              case 'mention':
                notificationText = 'mentioned you in a post';
                break;
              case 'job':
                notificationText = 'posted a job that matches your profile';
                break;
              case 'pitch':
                notificationText = 'liked your startup pitch';
                break;
            }
            
            const newNotification: Notification = {
              id: Date.now(),
              type: randomType,
              text: notificationText,
              timestamp: new Date(),
              read: false,
              user: randomUser
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show browser notification if supported and permission is granted
            if ('Notification' in window) {
              if (Notification.permission === "granted" && document.hidden) {
                try {
                  new Notification(`New notification from ${randomUser.name}`, {
                    body: notificationText,
                    icon: "/logo.png"
                  });
                } catch (error) {
                  console.error('Error showing browser notification:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in mock notification event:', error);
        }
      };
      
      // Set up mock real-time updates as fallback
      const interval = setInterval(mockNotificationEvents, 60000); // Every minute
      
      return () => {
        clearInterval(interval);
      };
    }
    
    // Request notification permission
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
          try {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
          } catch (error) {
            console.error('Error requesting notification permission:', error);
          }
        }
      }
    };
    
    requestNotificationPermission();
    
    return () => {
      if (notificationSocketRef.current) {
        notificationSocketRef.current.close();
      }
    };
  }, [user]);
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/notifications");
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      
      // Transform API data to match our Notification interface
      const transformedNotifications = data.map((notification: any) => ({
        id: notification.id,
        type: notification.type as 'connection' | 'message' | 'mention' | 'job' | 'pitch',
        text: notification.content,
        timestamp: new Date(notification.createdAt),
        read: notification.read,
        user: {
          id: notification.relatedId || 0,
          name: notification.content.split(' ')[0], // Extract name from content (this is a simplification)
          avatarUrl: '',
        }
      }));
      
      if (transformedNotifications.length > 0) {
        setNotifications(transformedNotifications);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    try {
      setIsRefreshing(true);
      await fetchNotifications();
      setIsRefreshing(false);
      
      toast({
        title: "Refreshed",
        description: "Notifications updated successfully."
      });
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setIsRefreshing(false);
      toast({
        title: "Error",
        description: "Failed to refresh notifications. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Load notification settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      if (!document.hidden) { // Only refresh if the page is visible
        fetchNotifications();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString();
  };
  
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }
      
      // Update UI
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      
      toast({
        title: "Success",
        description: "All notifications marked as read."
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
      
      // Update UI
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'mention':
        return <MessageSquare className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'pitch':
        return <Star className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "HF";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Add more LinkedIn-style notifications
  const linkedInNotifications: Notification[] = [
    {
      id: 101,
      type: 'connection',
      text: 'accepted your connection request',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      user: {
        id: 201,
        name: 'Ananya Sharma',
        avatarUrl: '',
      }
    },
    {
      id: 102,
      type: 'message',
      text: 'commented on your post: "Great insights! Would love to connect and discuss more about this topic."',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      read: false,
      user: {
        id: 202,
        name: 'Vikram Mehta',
        avatarUrl: '',
      }
    },
    {
      id: 103,
      type: 'job',
      text: 'posted a new job: "Senior Software Engineer" that matches your profile',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      read: false,
      user: {
        id: 203,
        name: 'Google India',
        avatarUrl: '',
      }
    },
    {
      id: 104,
      type: 'pitch',
      text: 'liked your post: "Announcing our new startup funding round of $2M"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      user: {
        id: 204,
        name: 'Neha Gupta',
        avatarUrl: '',
      }
    },
    {
      id: 105,
      type: 'mention',
      text: 'mentioned you in a comment: "I think @YourName would be a great fit for this role!"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: true,
      user: {
        id: 205,
        name: 'Rajesh Kumar',
        avatarUrl: '',
      }
    },
    {
      id: 106,
      type: 'connection',
      text: 'is celebrating 5 years at Microsoft',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      user: {
        id: 206,
        name: 'Priya Singh',
        avatarUrl: '',
      }
    },
    {
      id: 107,
      type: 'job',
      text: 'viewed your profile',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      user: {
        id: 207,
        name: 'Recruiter at Amazon',
        avatarUrl: '',
      }
    },
  ];
  
  // Combine with existing notifications
  const allNotifications = [...linkedInNotifications, ...notifications];

  return (
    <Layout>
      <div className="max-w-[1128px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
              <div className="p-4">
                <h2 className="font-semibold text-[#191919]">Manage</h2>
              </div>
              
              <div className="p-0">
                <div 
                  className="hover:bg-[#F3F2EF] cursor-pointer"
                  onClick={() => {
                    // Scroll to top of the page
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-[#666666] mr-3" />
                      <span className="text-sm text-[#191919]">View all notifications</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="hover:bg-[#F3F2EF] cursor-pointer"
                  onClick={() => {
                    setIsSettingsDialogOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-[#666666] mr-3" />
                      <span className="text-sm text-[#191919]">Settings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
              <div className="p-4">
                <h2 className="font-semibold text-[#191919]">Improve your notifications</h2>
                <p className="text-xs text-[#666666] mt-1">
                  Adjust what you see in your feed and how you're notified
                </p>
              </div>
              
              <div className="p-0">
                <div 
                  className="hover:bg-[#F3F2EF] cursor-pointer"
                  onClick={() => {
                    setIsSettingsDialogOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-[#666666] mr-3" />
                      <span className="text-sm text-[#191919]">View notification preferences</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
              <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center">
                <div className="flex items-center">
                  <h2 className="font-semibold text-[#191919]">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-[#CC1016] hover:bg-[#CC1016] text-white">{unreadCount}</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#666666] hover:bg-[#F3F2EF] rounded-md"
                    onClick={refreshNotifications}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Refresh</span>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#666666] hover:bg-[#F3F2EF] rounded-md"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    <span className="text-sm">Filter</span>
                  </Button>
                  
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#666666] hover:bg-[#F3F2EF] rounded-md"
                      onClick={markAllAsRead}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-sm">Mark all as read</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="p-0">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full flex justify-start bg-white border-b border-[#E0E0E0] px-4">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:text-[#0A66C2] data-[state=active]:border-b-2 data-[state=active]:border-[#0A66C2] data-[state=active]:shadow-none rounded-none px-4 py-3 text-[#666666] hover:bg-[#F3F2EF]"
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="my_network" 
                      className="data-[state=active]:text-[#0A66C2] data-[state=active]:border-b-2 data-[state=active]:border-[#0A66C2] data-[state=active]:shadow-none rounded-none px-4 py-3 text-[#666666] hover:bg-[#F3F2EF]"
                    >
                      My Network
                    </TabsTrigger>
                    <TabsTrigger 
                      value="mentions" 
                      className="data-[state=active]:text-[#0A66C2] data-[state=active]:border-b-2 data-[state=active]:border-[#0A66C2] data-[state=active]:shadow-none rounded-none px-4 py-3 text-[#666666] hover:bg-[#F3F2EF]"
                    >
                      Mentions
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="p-0">
                    {allNotifications.length > 0 ? (
                      <div>
                        {allNotifications.map((notification, index) => {
                          // Determine if this is a new notification (for animation)
                          const isNew = !notification.read && index === 0;
                          
                          return (
                            <div 
                              key={notification.id} 
                              className={`p-4 hover:bg-[#F3F2EF] border-b border-[#E0E0E0] ${!notification.read ? 'bg-[#F5FAFF]' : ''} ${isNew ? 'animate-pulse' : ''} relative group`}
                              onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                              {!notification.read && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A66C2]"></div>
                              )}
                              <div className="flex">
                                <div className="relative">
                                  <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                                    <AvatarImage src={notification.user.avatarUrl} />
                                    <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                                      {getInitials(notification.user.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className={`absolute -right-1 -bottom-1 h-6 w-6 rounded-full flex items-center justify-center ${
                                    notification.type === 'connection' ? 'bg-[#0A66C2]' : 
                                    notification.type === 'message' ? 'bg-[#5F9B41]' :
                                    notification.type === 'mention' ? 'bg-[#915907]' :
                                    notification.type === 'job' ? 'bg-[#0073B1]' : 'bg-[#B24020]'
                                  } text-white border-2 border-white`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                </div>
                                
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm text-[#191919]">
                                        <span className="font-semibold hover:text-[#0A66C2] hover:underline cursor-pointer">
                                          {notification.user.name}
                                        </span>{" "}
                                        {notification.text}
                                      </p>
                                      <p className="text-xs text-[#666666] mt-1">
                                        {formatTime(notification.timestamp)}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1">
                                      {!notification.read && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF] opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                          }}
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // In a real app, this would open a menu with more options
                                          toast({
                                            title: "Options",
                                            description: "This would show notification options"
                                          });
                                        }}
                                      >
                                        <MoreHorizontal className="h-5 w-5" />
                                      </Button>
                                    </div>
                                  </div>
                                
                                {notification.type === 'job' && (
                                  <div className="mt-2 flex">
                                    <Button 
                                      variant="outline" 
                                      className="text-[#0A66C2] border-[#0A66C2] hover:bg-[#E5F5FC] hover:border-[#004182] hover:text-[#004182] rounded-full text-sm"
                                    >
                                      View job
                                    </Button>
                                  </div>
                                )}
                                
                                {notification.type === 'connection' && notification.text.includes('request') && (
                                  <div className="mt-2 flex space-x-2">
                                    <Button 
                                      variant="outline" 
                                      className="border-[#666666] text-[#666666] hover:bg-[#F3F2EF] hover:border-[#666666] hover:text-[#191919] rounded-full text-sm"
                                    >
                                      Ignore
                                    </Button>
                                    <Button 
                                      className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full text-sm"
                                    >
                                      Accept
                                    </Button>
                                  </div>
                                )}
                                
                                {notification.type === 'message' && notification.text.includes('commented') && (
                                  <div className="mt-2 flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      className="text-[#666666] hover:bg-[#F3F2EF] rounded-md text-sm"
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Like
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      className="text-[#666666] hover:bg-[#F3F2EF] rounded-md text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Reply
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                        
                        <div className="p-4 text-center">
                          <Button variant="ghost" className="text-sm text-[#666666] hover:bg-[#F3F2EF] rounded-md font-medium">
                            Show more
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto text-[#E0E0E0] mb-3" />
                        <h3 className="text-lg font-medium mb-1 text-[#191919]">No notifications</h3>
                        <p className="text-[#666666]">You're all caught up!</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="my_network" className="p-0">
                    {allNotifications.filter(n => n.type === 'connection').length > 0 ? (
                      <div>
                        {allNotifications
                          .filter(n => n.type === 'connection')
                          .map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 hover:bg-[#F3F2EF] border-b border-[#E0E0E0] ${!notification.read ? 'bg-[#F5FAFF]' : ''}`}
                              onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                              <div className="flex">
                                <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                                  <AvatarImage src={notification.user.avatarUrl} />
                                  <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                                    {getInitials(notification.user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm text-[#191919]">
                                        <span className="font-semibold hover:text-[#0A66C2] hover:underline cursor-pointer">
                                          {notification.user.name}
                                        </span>{" "}
                                        {notification.text}
                                      </p>
                                      <p className="text-xs text-[#666666] mt-1">
                                        {formatTime(notification.timestamp)}
                                      </p>
                                    </div>
                                    
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                  </div>
                                  
                                  {notification.text.includes('request') && (
                                    <div className="mt-2 flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        className="border-[#666666] text-[#666666] hover:bg-[#F3F2EF] hover:border-[#666666] hover:text-[#191919] rounded-full text-sm"
                                      >
                                        Ignore
                                      </Button>
                                      <Button 
                                        className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full text-sm"
                                      >
                                        Accept
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <UserPlus className="h-12 w-12 mx-auto text-[#E0E0E0] mb-3" />
                        <h3 className="text-lg font-medium mb-1 text-[#191919]">No network notifications</h3>
                        <p className="text-[#666666]">You're all caught up!</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="mentions" className="p-0">
                    {allNotifications.filter(n => n.type === 'mention').length > 0 ? (
                      <div>
                        {allNotifications
                          .filter(n => n.type === 'mention')
                          .map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-4 hover:bg-[#F3F2EF] border-b border-[#E0E0E0] ${!notification.read ? 'bg-[#F5FAFF]' : ''}`}
                              onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                              <div className="flex">
                                <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                                  <AvatarImage src={notification.user.avatarUrl} />
                                  <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                                    {getInitials(notification.user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="ml-3 flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="text-sm text-[#191919]">
                                        <span className="font-semibold hover:text-[#0A66C2] hover:underline cursor-pointer">
                                          {notification.user.name}
                                        </span>{" "}
                                        {notification.text}
                                      </p>
                                      <p className="text-xs text-[#666666] mt-1">
                                        {formatTime(notification.timestamp)}
                                      </p>
                                    </div>
                                    
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                                      <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                  </div>
                                  
                                  <div className="mt-2 flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      className="text-[#666666] hover:bg-[#F3F2EF] rounded-md text-sm"
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Like
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      className="text-[#666666] hover:bg-[#F3F2EF] rounded-md text-sm"
                                    >
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-[#E0E0E0] mb-3" />
                        <h3 className="text-lg font-medium mb-1 text-[#191919]">No mentions</h3>
                        <p className="text-[#666666]">You haven't been mentioned in any posts or comments</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Customize how and when you receive notifications.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-connections" className="flex-1">Connection requests and acceptances</Label>
                <Switch 
                  id="email-connections" 
                  checked={notificationSettings.email.connections}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      email: {
                        ...notificationSettings.email,
                        connections: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-messages" className="flex-1">Messages</Label>
                <Switch 
                  id="email-messages" 
                  checked={notificationSettings.email.messages}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      email: {
                        ...notificationSettings.email,
                        messages: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-mentions" className="flex-1">Mentions and reactions</Label>
                <Switch 
                  id="email-mentions" 
                  checked={notificationSettings.email.mentions}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      email: {
                        ...notificationSettings.email,
                        mentions: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-jobs" className="flex-1">Job recommendations</Label>
                <Switch 
                  id="email-jobs" 
                  checked={notificationSettings.email.jobs}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      email: {
                        ...notificationSettings.email,
                        jobs: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email-events" className="flex-1">Events and webinars</Label>
                <Switch 
                  id="email-events" 
                  checked={notificationSettings.email.events}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      email: {
                        ...notificationSettings.email,
                        events: checked
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-medium mb-3">Push Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-connections" className="flex-1">Connection requests and acceptances</Label>
                <Switch 
                  id="push-connections" 
                  checked={notificationSettings.push.connections}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      push: {
                        ...notificationSettings.push,
                        connections: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-messages" className="flex-1">Messages</Label>
                <Switch 
                  id="push-messages" 
                  checked={notificationSettings.push.messages}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      push: {
                        ...notificationSettings.push,
                        messages: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-mentions" className="flex-1">Mentions and reactions</Label>
                <Switch 
                  id="push-mentions" 
                  checked={notificationSettings.push.mentions}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      push: {
                        ...notificationSettings.push,
                        mentions: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-jobs" className="flex-1">Job recommendations</Label>
                <Switch 
                  id="push-jobs" 
                  checked={notificationSettings.push.jobs}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      push: {
                        ...notificationSettings.push,
                        jobs: checked
                      }
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="push-events" className="flex-1">Events and webinars</Label>
                <Switch 
                  id="push-events" 
                  checked={notificationSettings.push.events}
                  onCheckedChange={(checked) => {
                    setNotificationSettings({
                      ...notificationSettings,
                      push: {
                        ...notificationSettings.push,
                        events: checked
                      }
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            try {
              // In a real app, we would make an API call to save the settings
              // For now, we'll simulate a successful API call
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Save settings to localStorage for persistence
              localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
              
              toast({
                title: "Settings Saved",
                description: "Your notification preferences have been updated."
              });
              setIsSettingsDialogOpen(false);
            } catch (error) {
              console.error('Error saving notification settings:', error);
              toast({
                title: "Error",
                description: "Failed to save notification settings. Please try again.",
                variant: "destructive"
              });
            }
          }}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </Layout>
  );
}

interface Notification {
  id: number;
  type: 'connection' | 'message' | 'mention' | 'job' | 'pitch';
  text: string;
  timestamp: Date;
  read: boolean;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  }
}

interface MockNotification {
  id: string;
  type: 'connection' | 'message' | 'mention' | 'job' | 'pitch';
  actor: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
  entityId: string;
  entityType: string;
  entityPreview?: string;
}

const mockNotifications: MockNotification[] = [
  {
    id: '1',
    type: 'connection',
    actor: {
      id: 'user2',
      name: 'Bob Singh',
      avatarUrl: '/avatars/bob.png'
    },
    content: 'sent you a connection request',
    timestamp: new Date(),
    isRead: false,
    entityId: 'conn_123',
    entityType: 'post'
  },
  {
    id: '2',
    type: 'mention',
    actor: {
      id: 'user3',
      name: 'Priya Patel',
      avatarUrl: '/avatars/priya.png'
    },
    content: 'mentioned you in a comment',
    timestamp: new Date(Date.now() - 3600_000),
    isRead: true,
    entityId: 'comment_456',
    entityType: 'comment',
    entityPreview: 'Looking forward to collaborating...'
  }
];