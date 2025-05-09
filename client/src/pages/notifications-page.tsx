import { useState, useEffect } from 'react';
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, UserPlus, Star, Briefcase, MessageSquare, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
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
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call to fetch notifications
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
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
      // In a real app, this would be an API call to fetch fresh notifications
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add a new notification at the top for demonstration
      const newNotification: Notification = {
        id: Date.now(),
        type: 'message',
        text: 'sent you a new message',
        timestamp: new Date(),
        read: false,
        user: {
          id: Math.floor(Math.random() * 100),
          name: 'New User ' + Math.floor(Math.random() * 100),
        }
      };
      
      setNotifications([newNotification, ...notifications]);
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
      // In a real app, this would be an API call to mark all notifications as read
      await new Promise(resolve => setTimeout(resolve, 300));
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
      // In a real app, this would be an API call to mark a notification as read
      await new Promise(resolve => setTimeout(resolve, 200));
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
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold dark:text-white mr-2">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={refreshNotifications}
            disabled={isRefreshing}
            className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Check className="h-4 w-4 mr-2" /> Mark all as read
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              All
              {unreadCount > 0 && (
                <span className="ml-2 h-5 min-w-5 px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Connections</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Messages</TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Jobs</TabsTrigger>
            <TabsTrigger value="startups" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Startups</TabsTrigger>
          </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-1">
            {notifications.length ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                >
                  <Avatar>
                    <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                    {notification.user.avatarUrl && <AvatarImage src={notification.user.avatarUrl} />}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-sm dark:text-gray-200">
                        <span className="font-semibold">{notification.user.name}</span> {notification.text}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{formatTime(notification.timestamp)}</span>
                    </div>
                    <div className="flex mt-2">
                      <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
                        {getNotificationIcon(notification.type)}
                      </div>
                      {!notification.read && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-auto h-7 text-xs dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="connections" className="mt-4">
          <div className="space-y-1">
            {notifications.filter(n => n.type === 'connection').length ? (
              notifications
                .filter(n => n.type === 'connection')
                .map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'dark:bg-gray-800'}`}
                  >
                    <Avatar>
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                      {notification.user.avatarUrl && <AvatarImage src={notification.user.avatarUrl} />}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm dark:text-gray-200">
                          <span className="font-semibold">{notification.user.name}</span> {notification.text}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">{formatTime(notification.timestamp)}</span>
                      </div>
                      <div className="flex mt-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-auto h-7 text-xs dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No connection notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="messages" className="mt-4">
          <div className="space-y-1">
            {notifications.filter(n => n.type === 'message' || n.type === 'mention').length ? (
              notifications
                .filter(n => n.type === 'message' || n.type === 'mention')
                .map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <Avatar>
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                      {notification.user.avatarUrl && <AvatarImage src={notification.user.avatarUrl} />}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span> {notification.text}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formatTime(notification.timestamp)}</span>
                      </div>
                      <div className="flex mt-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-auto h-7 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No message notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="jobs" className="mt-4">
          <div className="space-y-1">
            {notifications.filter(n => n.type === 'job').length ? (
              notifications
                .filter(n => n.type === 'job')
                .map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <Avatar>
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                      {notification.user.avatarUrl && <AvatarImage src={notification.user.avatarUrl} />}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span> {notification.text}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formatTime(notification.timestamp)}</span>
                      </div>
                      <div className="flex mt-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-auto h-7 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No job notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="startups" className="mt-4">
          <div className="space-y-1">
            {notifications.filter(n => n.type === 'pitch').length ? (
              notifications
                .filter(n => n.type === 'pitch')
                .map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <Avatar>
                      <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                      {notification.user.avatarUrl && <AvatarImage src={notification.user.avatarUrl} />}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span> {notification.text}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{formatTime(notification.timestamp)}</span>
                      </div>
                      <div className="flex mt-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <Star className="h-4 w-4" />
                        </div>
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-auto h-7 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" /> Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No startup notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
}