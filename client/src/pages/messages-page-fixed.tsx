import { useState, useRef, useEffect } from 'react';
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Send, 
  Search, 
  UserPlus, 
  MoreVertical, 
  MessageSquare, 
  Paperclip, 
  Smile, 
  Image as ImageIcon,
  Phone,
  Video,
  Info,
  ChevronLeft,
  Filter,
  Bell,
  BellOff,
  Star,
  Trash2,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: number;
  content: string;
  timestamp: Date;
  sender: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  isCurrentUser: boolean;
}

interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
    status: 'online' | 'offline' | 'away';
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  
  // Mock data for conversations and messages
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      user: {
        id: 101,
        name: "Vikram Malhotra",
        avatarUrl: "https://via.placeholder.com/40",
        status: 'online',
      },
      lastMessage: {
        content: "Looking forward to our meeting tomorrow!",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: false,
      },
      unreadCount: 2,
    },
    {
      id: 2,
      user: {
        id: 102,
        name: "Priya Sharma",
        avatarUrl: "https://via.placeholder.com/40",
        status: 'offline',
      },
      lastMessage: {
        content: "I'll review your pitch and get back to you",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      id: 3,
      user: {
        id: 103,
        name: "Arjun Kapoor",
        avatarUrl: "https://via.placeholder.com/40",
        status: 'away',
      },
      lastMessage: {
        content: "Can we schedule a call to discuss the investment terms?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
      },
      unreadCount: 0,
    }
  ]);
  
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [
      {
        id: 101,
        content: "Hi there! I saw your startup on the platform and I'm really impressed with what you're building.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sender: {
          id: 101,
          name: "Vikram Malhotra",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      },
      {
        id: 102,
        content: "Thank you! We've been working hard on it for the past few months.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
        sender: {
          id: user?.id || 0,
          name: user?.name || "You",
        },
        isCurrentUser: true
      },
      {
        id: 103,
        content: "Would you be interested in meeting to discuss potential collaboration?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
        sender: {
          id: 101,
          name: "Vikram Malhotra",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      },
      {
        id: 104,
        content: "Absolutely! That sounds great. When would be a good time for you?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
        sender: {
          id: user?.id || 0,
          name: user?.name || "You",
        },
        isCurrentUser: true
      },
      {
        id: 105,
        content: "How about tomorrow at 2pm? We can do a video call.",
        timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
        sender: {
          id: 101,
          name: "Vikram Malhotra",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      }
    ],
    2: [
      {
        id: 201,
        content: "Hi, I just reviewed your pitch deck. Very impressive!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        sender: {
          id: 102,
          name: "Priya Sharma",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      },
      {
        id: 202,
        content: "Thank you! I'd love to hear your thoughts on it.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        sender: {
          id: user?.id || 0,
          name: user?.name || "You",
        },
        isCurrentUser: true
      },
      {
        id: 203,
        content: "I think your market analysis is spot on. I'll review the financial projections and get back to you.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        sender: {
          id: 102,
          name: "Priya Sharma",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      }
    ],
    3: [
      {
        id: 301,
        content: "Hello! I'm interested in potentially investing in your startup.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        sender: {
          id: 103,
          name: "Arjun Kapoor",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      },
      {
        id: 302,
        content: "That's great to hear! We're currently raising our seed round.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47), // 47 hours ago
        sender: {
          id: user?.id || 0,
          name: user?.name || "You",
        },
        isCurrentUser: true
      },
      {
        id: 303,
        content: "Perfect. Can we schedule a call to discuss the investment terms?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        sender: {
          id: 103,
          name: "Arjun Kapoor",
          avatarUrl: "https://via.placeholder.com/40",
        },
        isCurrentUser: false
      }
    ]
  });

  // Set first conversation as active on mount
  useEffect(() => {
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversation(conversations[0].id);
    }
  }, [conversations, activeConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversation]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const newMsg: Message = {
      id: Date.now(),
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: user?.id || 0,
        name: user?.name || "You",
      },
      isCurrentUser: true,
    };
    
    // Add message to the conversation
    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMsg]
    }));
    
    // Update the conversation's last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === activeConversation 
          ? {
              ...conv,
              lastMessage: {
                content: newMessage,
                timestamp: new Date(),
                isRead: true
              }
            } 
          : conv
      )
    );
    
    // Clear the input
    setNewMessage("");
    
    // Simulate a response after a delay
    setTimeout(() => {
      const responseMessages = [
        "That sounds great!",
        "Let me think about it and get back to you.",
        "Can we schedule a call to discuss this further?",
        "I've shared some resources that might help.",
        "What do you think about this approach?"
      ];
      
      const randomIndex = Math.floor(Math.random() * responseMessages.length);
      const responseMsg: Message = {
        id: Date.now() + 1,
        content: responseMessages[randomIndex],
        timestamp: new Date(),
        sender: {
          id: conversations.find(c => c.id === activeConversation)?.user.id || 0,
          name: conversations.find(c => c.id === activeConversation)?.user.name || '',
          avatarUrl: conversations.find(c => c.id === activeConversation)?.user.avatarUrl,
        },
        isCurrentUser: false,
      };
      
      setMessages(prev => ({
        ...prev,
        [activeConversation]: [...(prev[activeConversation] || []), responseMsg]
      }));
      
      // Update the conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation 
            ? {
                ...conv,
                lastMessage: {
                  content: responseMessages[randomIndex],
                  timestamp: new Date(),
                  isRead: true
                }
              } 
            : conv
        )
      );
    }, 2000);
  };

  // Format timestamp for display
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      // Yesterday
      return 'Yesterday';
    } else {
      // Show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-[#F9F9F9]">
        <div className="flex flex-col md:flex-row h-full max-w-screen-2xl mx-auto shadow-md">
          {/* Conversation List - Hidden on mobile when a conversation is active */}
          {(showMobileSidebar || !activeConversation) && (
            <div className="w-full md:w-96 border-r border-[#E0E0E0] flex flex-col h-full md:block bg-white">
              {/* Header with title and actions */}
              <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between bg-white">
                <h2 className="text-xl font-semibold text-[#191919]">Messages</h2>
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Filter messages feature is not yet implemented."
                          })}
                        >
                          <Filter className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Filter messages</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "New message feature is not yet implemented."
                          })}
                        >
                          <UserPlus className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>New message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Search */}
              <div className="p-3 border-b border-[#E0E0E0] bg-white">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
                  <Input
                    placeholder="Search messages"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-[#F3F2EF] border-none focus-visible:ring-1 focus-visible:ring-[#0A66C2] rounded-full"
                  />
                </div>
              </div>
              
              {/* Conversation List */}
              <ScrollArea className="flex-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-[#666666]">
                    <div className="bg-[#F3F2EF] rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-[#666666]" />
                    </div>
                    <h3 className="text-lg font-medium text-[#191919] mb-2">No conversations found</h3>
                    <p className="text-sm text-[#666666]">Try adjusting your search or start a new conversation</p>
                    <Button 
                      className="mt-4 bg-[#0A66C2] hover:bg-[#004182]"
                      onClick={() => toast({
                        title: "Coming Soon",
                        description: "New message feature is not yet implemented."
                      })}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Message
                    </Button>
                  </div>
                ) : (
                  <div>
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`relative group hover:bg-[#F9F9F9] transition-colors ${
                          activeConversation === conv.id ? 'bg-[#F3F2EF]' : ''
                        }`}
                      >
                        <button
                          className="w-full text-left p-4 flex items-start"
                          onClick={() => {
                            setActiveConversation(conv.id);
                            setShowMobileSidebar(false);
                            
                            // Mark conversation as read
                            if (conv.unreadCount > 0) {
                              setConversations(prev => 
                                prev.map(c => 
                                  c.id === conv.id 
                                    ? { ...c, unreadCount: 0 } 
                                    : c
                                )
                              );
                            }
                          }}
                        >
                          <div className="relative">
                            <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                              <AvatarImage src={conv.user.avatarUrl} />
                              <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2]">
                                {getInitials(conv.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Online Status Indicator */}
                            <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                              conv.user.status === 'online' 
                                ? 'bg-green-500' 
                                : conv.user.status === 'away' 
                                  ? 'bg-yellow-500' 
                                  : 'bg-[#E0E0E0]'
                            }`} />
                          </div>
                          
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <h3 className={`font-medium truncate ${
                                conv.unreadCount > 0 ? 'text-[#191919] font-semibold' : 'text-[#191919]'
                              }`}>
                                {conv.user.name}
                              </h3>
                              <span className="text-xs text-[#666666] whitespace-nowrap ml-2">
                                {formatTimestamp(conv.lastMessage.timestamp)}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                              <p className={`text-sm truncate ${
                                conv.unreadCount > 0 ? 'font-medium text-[#191919]' : 'text-[#666666]'
                              }`}>
                                {conv.lastMessage.content}
                              </p>
                              
                              {conv.unreadCount > 0 && (
                                <Badge className="ml-2 bg-[#0A66C2] text-white rounded-full h-5 min-w-[20px] flex items-center justify-center text-xs">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {/* Quick actions - visible on hover */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden group-hover:flex items-center space-x-1 bg-[#F9F9F9] p-1 rounded-full">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 rounded-full hover:bg-[#E0E0E0]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toast({
                                      title: "Coming Soon",
                                      description: "Mute conversation feature is not yet implemented."
                                    });
                                  }}
                                >
                                  {conv.unreadCount > 0 ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{conv.unreadCount > 0 ? "Mute conversation" : "Unmute conversation"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-[#E0E0E0]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast({
                                title: "Coming Soon",
                                description: "Mark as unread feature is not yet implemented."
                              })}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Mark as unread
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({
                                title: "Coming Soon",
                                description: "Star conversation feature is not yet implemented."
                              })}>
                                <Star className="h-4 w-4 mr-2" />
                                Star conversation
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => toast({
                                title: "Coming Soon",
                                description: "Delete conversation feature is not yet implemented."
                              })}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete conversation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
          
          {/* Message Thread */}
          {activeConversation ? (
            <div className="flex-1 flex flex-col h-full bg-white">
              {/* Conversation Header */}
              <div className="p-4 border-b border-[#E0E0E0] flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center">
                  <button 
                    className="md:hidden mr-3 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] p-1 rounded-full"
                    onClick={() => setShowMobileSidebar(true)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <Avatar className="h-10 w-10 border border-[#E0E0E0]">
                    <AvatarImage src={conversations.find(c => c.id === activeConversation)?.user.avatarUrl} />
                    <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2]">
                      {getInitials(conversations.find(c => c.id === activeConversation)?.user.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="ml-3">
                    <h3 className="font-semibold text-[#191919]">
                      {conversations.find(c => c.id === activeConversation)?.user.name}
                    </h3>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-1.5 ${
                        conversations.find(c => c.id === activeConversation)?.user.status === 'online' 
                          ? 'bg-green-500' 
                          : conversations.find(c => c.id === activeConversation)?.user.status === 'away'
                            ? 'bg-yellow-500'
                            : 'bg-[#E0E0E0]'
                      }`} />
                      <p className="text-xs text-[#666666]">
                        {conversations.find(c => c.id === activeConversation)?.user.status === 'online' 
                          ? 'Online' 
                          : conversations.find(c => c.id === activeConversation)?.user.status === 'away'
                            ? 'Away'
                            : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Voice call feature is not yet implemented."
                          })}
                        >
                          <Phone className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Voice call</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "Video call feature is not yet implemented."
                          })}
                        >
                          <Video className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Video call</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                          onClick={() => toast({
                            title: "Coming Soon",
                            description: "View profile feature is not yet implemented."
                          })}
                        >
                          <Info className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View profile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast({
                        title: "Coming Soon",
                        description: "Mute conversation feature is not yet implemented."
                      })}>
                        <BellOff className="h-4 w-4 mr-2" />
                        Mute conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({
                        title: "Coming Soon",
                        description: "Block user feature is not yet implemented."
                      })}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Block user
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({
                        title: "Coming Soon",
                        description: "Report conversation feature is not yet implemented."
                      })}>
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Report conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Message Thread */}
              <ScrollArea className="flex-1 p-4 bg-[#F9F9F9]">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {messages[activeConversation]?.map((message, index) => {
                    // Check if we should show the date separator
                    const showDateSeparator = index === 0 || 
                      new Date(message.timestamp).toDateString() !== 
                      new Date(messages[activeConversation][index - 1].timestamp).toDateString();
                    
                    // Check if this is a new sender or if more than 5 minutes have passed since the last message
                    const isNewSenderOrTimeGap = index === 0 || 
                      message.sender.id !== messages[activeConversation][index - 1].sender.id ||
                      (message.timestamp.getTime() - messages[activeConversation][index - 1].timestamp.getTime()) > 5 * 60 * 1000;
                    
                    return (
                      <div key={message.id}>
                        {showDateSeparator && (
                          <div className="flex items-center justify-center my-6">
                            <div className="bg-white px-3 py-1 rounded-full text-xs text-[#666666] shadow-sm">
                              {new Date(message.timestamp).toLocaleDateString([], {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
                          <div className={`flex ${message.isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%]`}>
                            {!message.isCurrentUser && isNewSenderOrTimeGap && (
                              <Avatar className="h-8 w-8 mr-2 mb-4">
                                <AvatarImage src={message.sender.avatarUrl} />
                                <AvatarFallback className="bg-[#F3F2EF] text-[#0A66C2]">
                                  {getInitials(message.sender.name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            {!message.isCurrentUser && !isNewSenderOrTimeGap && (
                              <div className="w-8 mr-2"></div>
                            )}
                            
                            <div className={`${message.isCurrentUser ? 'mr-2' : 'ml-0'}`}>
                              {isNewSenderOrTimeGap && !message.isCurrentUser && (
                                <p className="text-xs text-[#666666] mb-1 ml-1">{message.sender.name}</p>
                              )}
                              
                              <div className={`p-3 rounded-2xl ${
                                message.isCurrentUser 
                                  ? 'bg-[#0A66C2] text-white' 
                                  : 'bg-white text-[#191919] shadow-sm'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              
                              <div className={`flex items-center mt-1 ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <p className="text-xs text-[#666666]">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                
                                <div className="hidden group-hover:flex ml-2 space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full hover:bg-[#E0E0E0]"
                                    onClick={() => toast({
                                      title: "Coming Soon",
                                      description: "React to message feature is not yet implemented."
                                    })}
                                  >
                                    <Smile className="h-3 w-3" />
                                  </Button>
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6 rounded-full hover:bg-[#E0E0E0]"
                                    onClick={() => toast({
                                      title: "Coming Soon",
                                      description: "Reply to message feature is not yet implemented."
                                    })}
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="p-4 border-t border-[#E0E0E0] bg-white">
                <div className="flex items-center max-w-3xl mx-auto">
                  <div className="flex space-x-1 mr-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                            onClick={() => toast({
                              title: "Coming Soon",
                              description: "Attach file feature is not yet implemented."
                            })}
                          >
                            <Paperclip className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Attach file</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                            onClick={() => toast({
                              title: "Coming Soon",
                              description: "Attach image feature is not yet implemented."
                            })}
                          >
                            <ImageIcon className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Attach image</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                            onClick={() => toast({
                              title: "Coming Soon",
                              description: "Add emoji feature is not yet implemented."
                            })}
                          >
                            <Smile className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add emoji</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="relative flex-1">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="pr-12 py-6 bg-[#F3F2EF] border-none focus-visible:ring-1 focus-visible:ring-[#0A66C2] rounded-full"
                    />
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full ${
                        newMessage.trim() 
                          ? 'bg-[#0A66C2] text-white hover:bg-[#004182]' 
                          : 'text-[#666666] bg-[#E0E0E0] cursor-not-allowed'
                      }`}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#F9F9F9]">
              <div className="text-center p-8 max-w-md">
                <div className="relative mb-10">
                  <div className="absolute -top-6 -left-6">
                    <div className="bg-blue-100 rounded-full p-4 shadow-sm">
                      <MessageSquare className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-4">
                    <div className="bg-green-100 rounded-full p-3 shadow-sm">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-8 w-32 h-32 flex items-center justify-center mx-auto shadow-md">
                    <MessageSquare className="h-16 w-16 text-[#0A66C2]" />
                  </div>
                  <div className="absolute -bottom-4 -right-6">
                    <div className="bg-purple-100 rounded-full p-4 shadow-sm">
                      <Send className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold text-[#191919] mb-3">Your Messages</h3>
                <p className="text-[#666666] mb-8 text-lg">
                  Connect with founders, investors, and professionals in your network. Select a conversation or start a new one.
                </p>
                
                <div className="flex flex-col space-y-4">
                  <Button 
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-6 h-auto text-lg rounded-xl"
                    onClick={() => toast({
                      title: "Coming Soon",
                      description: "New message feature is not yet implemented."
                    })}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Start a New Conversation
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 px-6 py-6 h-auto text-lg rounded-xl"
                    onClick={() => {
                      if (conversations.length > 0) {
                        setActiveConversation(conversations[0].id);
                      }
                    }}
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    View Recent Messages
                  </Button>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Need help? <a href="#" className="text-[#0A66C2] hover:underline">Visit our support center</a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}