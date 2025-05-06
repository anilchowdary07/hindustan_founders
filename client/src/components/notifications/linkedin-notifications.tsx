import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  LinkedInCard, 
  LinkedInCardContent, 
  LinkedInTabs,
  LinkedInTabPanel,
  LinkedInButton
} from "../ui/linkedin-ui";
import { LinkedInAvatar } from "../ui/linkedin-avatar";
import { 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  UserPlus, 
  Briefcase,
  Calendar,
  Bell,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "like" | "comment" | "connection" | "mention" | "job" | "event" | "other";
  actor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
  entityId?: string;
  entityType?: "post" | "comment" | "profile" | "job" | "event";
  entityPreview?: string;
}

interface LinkedInNotificationsProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onTurnOffNotifications?: (type: string) => void;
}

export function LinkedInNotifications({ 
  notifications = [], 
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onTurnOffNotifications
}: LinkedInNotificationsProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "mentions" && notification.type === "mention") return true;
    if (activeTab === "connections" && notification.type === "connection") return true;
    return false;
  });
  
  // Notification tabs
  const notificationTabs = [
    { id: "all", label: "All" },
    { id: "mentions", label: "Mentions" },
    { id: "connections", label: "Connections" }
  ];
  
  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-5 w-5 text-[#0A66C2]" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-[#0A66C2]" />;
      case "connection":
        return <UserPlus className="h-5 w-5 text-[#0A66C2]" />;
      case "job":
        return <Briefcase className="h-5 w-5 text-[#0A66C2]" />;
      case "event":
        return <Calendar className="h-5 w-5 text-[#0A66C2]" />;
      default:
        return <Bell className="h-5 w-5 text-[#0A66C2]" />;
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.entityType && notification.entityId) {
      switch (notification.entityType) {
        case "post":
          navigate(`/posts/${notification.entityId}`);
          break;
        case "profile":
          navigate(`/profile/${notification.entityId}`);
          break;
        case "job":
          navigate(`/jobs/${notification.entityId}`);
          break;
        case "event":
          navigate(`/events/${notification.entityId}`);
          break;
        default:
          break;
      }
    }
  };
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Header with Settings */}
      <div className="flex justify-between items-center bg-white p-4 sticky top-14 z-10 border-b border-[#E0E0E0]">
        <h1 className="text-lg font-medium text-[#191919]">Notifications</h1>
        
        <div className="flex items-center">
          <button 
            className="p-2 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
            onClick={() => navigate("/notifications/settings")}
            aria-label="Notification settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <LinkedInTabs
        tabs={notificationTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        scrollable
        className="bg-white sticky top-[106px] z-10 mb-2"
      />
      
      {/* Mark all as read button */}
      {filteredNotifications.some(n => !n.isRead) && (
        <div className="bg-white p-3 border-b border-[#E0E0E0]">
          <LinkedInButton
            variant="secondary"
            size="sm"
            onClick={onMarkAllAsRead}
            fullWidth
          >
            Mark all as read
          </LinkedInButton>
        </div>
      )}
      
      {/* Notifications List */}
      <LinkedInTabPanel id="all" activeTab={activeTab}>
        {filteredNotifications.length > 0 ? (
          <LinkedInCard className="p-0 rounded-none md:rounded-lg">
            <LinkedInCardContent className="p-0">
              <div className="divide-y divide-[#E0E0E0]">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-[#F3F2EF] transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-[#EEF3F8]' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex">
                      <div className="mr-3">
                        <LinkedInAvatar
                          src={notification.actor.avatarUrl}
                          alt={notification.actor.name}
                          fallback={notification.actor.name.substring(0, 2).toUpperCase()}
                          size="md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#191919]">
                          <span className="font-medium">{notification.actor.name}</span>
                          {" "}
                          {notification.content}
                        </p>
                        
                        <p className="text-xs text-[#666666] mt-1">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                        
                        {notification.entityPreview && (
                          <div className="mt-2 p-3 bg-[#F3F2EF] rounded-md">
                            <p className="text-xs text-[#191919] line-clamp-2">
                              {notification.entityPreview}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-2 flex flex-col items-center">
                        <div className="mb-2">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <button
                          className="text-[#666666] hover:text-[#191919] p-1 rounded-full hover:bg-[#E0E0E0]"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show dropdown menu
                          }}
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No notifications yet</h3>
                <p className="text-sm text-[#666666]">
                  We'll notify you when something important happens
                </p>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="mentions" activeTab={activeTab}>
        {filteredNotifications.length > 0 ? (
          <LinkedInCard className="p-0 rounded-none md:rounded-lg">
            <LinkedInCardContent className="p-0">
              <div className="divide-y divide-[#E0E0E0]">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-[#F3F2EF] transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-[#EEF3F8]' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex">
                      <div className="mr-3">
                        <LinkedInAvatar
                          src={notification.actor.avatarUrl}
                          alt={notification.actor.name}
                          fallback={notification.actor.name.substring(0, 2).toUpperCase()}
                          size="md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#191919]">
                          <span className="font-medium">{notification.actor.name}</span>
                          {" "}
                          mentioned you in a post
                        </p>
                        
                        <p className="text-xs text-[#666666] mt-1">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                        
                        {notification.entityPreview && (
                          <div className="mt-2 p-3 bg-[#F3F2EF] rounded-md">
                            <p className="text-xs text-[#191919] line-clamp-2">
                              {notification.entityPreview}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-2 flex flex-col items-center">
                        <div className="mb-2">
                          <MessageSquare className="h-5 w-5 text-[#0A66C2]" />
                        </div>
                        
                        <button
                          className="text-[#666666] hover:text-[#191919] p-1 rounded-full hover:bg-[#E0E0E0]"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show dropdown menu
                          }}
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No mentions yet</h3>
                <p className="text-sm text-[#666666]">
                  When someone mentions you, you'll see it here
                </p>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="connections" activeTab={activeTab}>
        {filteredNotifications.length > 0 ? (
          <LinkedInCard className="p-0 rounded-none md:rounded-lg">
            <LinkedInCardContent className="p-0">
              <div className="divide-y divide-[#E0E0E0]">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 hover:bg-[#F3F2EF] transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-[#EEF3F8]' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex">
                      <div className="mr-3">
                        <LinkedInAvatar
                          src={notification.actor.avatarUrl}
                          alt={notification.actor.name}
                          fallback={notification.actor.name.substring(0, 2).toUpperCase()}
                          size="md"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#191919]">
                          <span className="font-medium">{notification.actor.name}</span>
                          {" "}
                          {notification.content}
                        </p>
                        
                        <p className="text-xs text-[#666666] mt-1">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      
                      <div className="ml-2 flex flex-col items-center">
                        <div className="mb-2">
                          <UserPlus className="h-5 w-5 text-[#0A66C2]" />
                        </div>
                        
                        <button
                          className="text-[#666666] hover:text-[#191919] p-1 rounded-full hover:bg-[#E0E0E0]"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show dropdown menu
                          }}
                          aria-label="More options"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No connection notifications</h3>
                <p className="text-sm text-[#666666]">
                  When someone connects with you, you'll see it here
                </p>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
    </div>
  );
}