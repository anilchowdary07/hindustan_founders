import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  RefreshCw,
  Loader2,
  UserPlus,
  Bell
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface ActivityItem {
  id: number;
  type: 'post' | 'connection' | 'job' | 'event' | 'mention';
  content: string;
  createdAt: Date;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
    title?: string;
  };
  likes?: number;
  comments?: number;
  isLiked?: boolean;
}

interface ActivityFeedProps {
  endpoint?: string;
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
  showRefresh?: boolean;
  filter?: string;
}

export default function ActivityFeed({
  endpoint = "/api/feed",
  title = "Activity Feed",
  emptyMessage = "No activity to show",
  maxItems = 10,
  showRefresh = true,
  filter
}: ActivityFeedProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activitySocketRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection for real-time feed updates
  useEffect(() => {
    // In a real app, this would connect to a WebSocket server
    // activitySocketRef.current = new WebSocket('wss://api.example.com/feed');
    
    // Mock WebSocket events for demonstration
    const mockActivityEvents = () => {
      // 20% chance to receive a new activity
      if (Math.random() < 0.2) {
        const activityTypes = ['post', 'connection', 'job', 'event', 'mention'];
        const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)] as 'post' | 'connection' | 'job' | 'event' | 'mention';
        
        const randomUser = {
          id: Math.floor(Math.random() * 1000) + 1,
          name: ['Rahul', 'Priya', 'Vikram', 'Anjali', 'Arjun'][Math.floor(Math.random() * 5)] + ' ' + 
                ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta'][Math.floor(Math.random() * 5)],
          title: ['Founder at TechStartup', 'CTO at InnovateNow', 'Product Manager at BigTech', 'Angel Investor', 'Software Engineer'][Math.floor(Math.random() * 5)]
        };
        
        let activityContent = '';
        switch (randomType) {
          case 'post':
            activityContent = [
              'Just secured our first round of funding! Excited for what\'s next.',
              'Looking for talented developers to join our team. DM me if interested!',
              'Shared an article: "10 Tips for Startup Success"',
              'Launched our new product today. Check it out!',
              'Attending the tech conference next week. Who else is going?'
            ][Math.floor(Math.random() * 5)];
            break;
          case 'connection':
            activityContent = `connected with ${['Rahul', 'Priya', 'Vikram', 'Anjali', 'Arjun'][Math.floor(Math.random() * 5)]} ${['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta'][Math.floor(Math.random() * 5)]}`;
            break;
          case 'job':
            activityContent = `posted a new job: "${['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'Marketing Specialist'][Math.floor(Math.random() * 5)]}"`;
            break;
          case 'event':
            activityContent = `is attending "${['Tech Conference 2023', 'Startup Meetup', 'Investor Pitch Night', 'Hackathon', 'Networking Event'][Math.floor(Math.random() * 5)]}"`;
            break;
          case 'mention':
            activityContent = `mentioned you in a post: "Thanks to @${user?.name} for the great advice!"`;
            break;
        }
        
        const newActivity: ActivityItem = {
          id: Date.now(),
          type: randomType,
          content: activityContent,
          createdAt: new Date(),
          user: randomUser,
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 20),
          isLiked: false
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
        
        // Show browser notification for mentions if supported
        if (randomType === 'mention' && Notification.permission === "granted" && document.hidden) {
          new Notification(`${randomUser.name} mentioned you`, {
            body: activityContent,
            icon: "/logo.png"
          });
        }
      }
    };
    
    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    // Set up mock real-time updates
    const interval = setInterval(mockActivityEvents, 45000); // Every 45 seconds
    
    return () => {
      clearInterval(interval);
      if (activitySocketRef.current) {
        activitySocketRef.current.close();
      }
    };
  }, [user, maxItems]);
  
  // Fetch activities
  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = endpoint;
      if (filter) {
        url += `?filter=${filter}`;
      }
      
      const response = await apiRequest(url);
      
      if (response && response.data) {
        setActivities(response.data);
      } else {
        // Use mock data for demonstration
        setActivities([
          {
            id: 1,
            type: 'post',
            content: 'Just secured our first round of funding! Excited for what\'s next. #startup #funding',
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            user: {
              id: 1,
              name: 'Vikram Malhotra',
              title: 'Founder at TechVision',
              avatarUrl: ''
            },
            likes: 42,
            comments: 8,
            isLiked: false
          },
          {
            id: 2,
            type: 'connection',
            content: 'connected with Priya Sharma',
            createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            user: {
              id: 2,
              name: 'Rahul Kapoor',
              title: 'CTO at FinTech Solutions',
              avatarUrl: ''
            }
          },
          {
            id: 3,
            type: 'job',
            content: 'posted a new job: "Senior Software Engineer"',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            user: {
              id: 3,
              name: 'TechSolutions India',
              title: 'Technology Company',
              avatarUrl: ''
            }
          },
          {
            id: 4,
            type: 'post',
            content: 'Looking for talented developers to join our team. DM me if interested! #hiring #jobs #tech',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            user: {
              id: 4,
              name: 'Anjali Desai',
              title: 'HR Manager at BigTech',
              avatarUrl: ''
            },
            likes: 28,
            comments: 15,
            isLiked: true
          },
          {
            id: 5,
            type: 'event',
            content: 'is attending "Startup Meetup in Mumbai"',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            user: {
              id: 5,
              name: 'Arjun Singh',
              title: 'Product Manager at Tech Innovations',
              avatarUrl: ''
            }
          }
        ]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Refresh activities
  const refreshActivities = async () => {
    try {
      setIsRefreshing(true);
      await fetchActivities();
      setIsRefreshing(false);
      
      toast({
        title: "Feed refreshed",
        description: "Your activity feed has been updated."
      });
    } catch (error) {
      console.error('Error refreshing activities:', error);
      setIsRefreshing(false);
      toast({
        title: "Error",
        description: "Failed to refresh activities. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Load activities on component mount
  useEffect(() => {
    fetchActivities();
  }, [endpoint, filter]);
  
  // Format time
  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "FN";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle like
  const handleLike = (id: number) => {
    setActivities(activities.map(activity => 
      activity.id === id 
        ? { 
            ...activity, 
            isLiked: !activity.isLiked, 
            likes: activity.likes ? (activity.isLiked ? activity.likes - 1 : activity.likes + 1) : 1 
          } 
        : activity
    ));
  };
  
  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-4 w-4 text-[#0A66C2]" />;
      case 'job':
        return <Briefcase className="h-4 w-4 text-[#0073B1]" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-[#5F9B41]" />;
      case 'mention':
        return <Bell className="h-4 w-4 text-[#915907]" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#191919]">{title}</h2>
        {showRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[#666666] hover:bg-[#F3F2EF] rounded-md"
            onClick={refreshActivities}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">{error}</p>
          <Button 
            onClick={refreshActivities}
            className="bg-[#0A66C2] hover:bg-[#004182] text-white"
          >
            Try Again
          </Button>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex">
                <div className="relative">
                  <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                    <AvatarImage src={activity.user.avatarUrl} />
                    <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2] font-semibold">
                      {getInitials(activity.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {activity.type !== 'post' && (
                    <div className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full flex items-center justify-center bg-white border-2 border-white shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="font-semibold text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer">
                          {activity.user.name}
                        </span>
                        {activity.type !== 'post' && (
                          <span className="text-sm text-[#666666] ml-1">
                            {activity.content}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#666666]">
                        {activity.user.title} • {formatTime(activity.createdAt)}
                      </p>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {activity.type === 'post' && (
                    <div className="mt-2">
                      <p className="text-sm text-[#191919] whitespace-pre-line">{activity.content}</p>
                    </div>
                  )}
                  
                  {(activity.likes !== undefined || activity.comments !== undefined) && (
                    <div className="mt-3 pt-2 border-t border-[#E0E0E0]">
                      <div className="flex justify-between items-center text-xs text-[#666666] mb-2">
                        {activity.likes !== undefined && activity.likes > 0 && (
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded-full bg-[#0A66C2] flex items-center justify-center mr-1">
                              <ThumbsUp className="h-2 w-2 text-white" />
                            </div>
                            <span>{activity.likes}</span>
                          </div>
                        )}
                        {activity.comments !== undefined && activity.comments > 0 && (
                          <div>
                            <span>{activity.comments} comments</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between border-t border-[#E0E0E0] pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`flex-1 flex items-center justify-center ${activity.isLiked ? 'text-[#0A66C2]' : 'text-[#666666]'} hover:bg-[#F3F2EF] rounded-md`}
                          onClick={() => handleLike(activity.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          <span>{activity.isLiked ? 'Liked' : 'Like'}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center justify-center text-[#666666] hover:bg-[#F3F2EF] rounded-md"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          <span>Comment</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 flex items-center justify-center text-[#666666] hover:bg-[#F3F2EF] rounded-md"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          <span>Share</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4 bg-[#F3F2EF] p-4 rounded-full inline-block">
            <Bell className="h-8 w-8 text-[#666666]" />
          </div>
          <h3 className="text-lg font-bold text-[#191919] mb-2">{emptyMessage}</h3>
          <p className="text-[#666666] mb-4">Check back later for updates</p>
        </div>
      )}
    </div>
  );
}

// Additional components needed for the activity feed
const Briefcase = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const Calendar = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);