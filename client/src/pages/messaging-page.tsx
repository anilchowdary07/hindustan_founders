import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Edit, MoreHorizontal, Paperclip, Image, Smile, Send, Phone, Video, Info } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function MessagingPage() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<{[key: number]: number}>({});
  const [lastSeen, setLastSeen] = useState<{[key: number]: Date}>({});
  const [isOnline, setIsOnline] = useState<{[key: number]: boolean}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // WebSocket connection for real-time updates
  const socketRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port;
    // Use the current host and port, the proxy will handle the redirection
    const wsUrl = `${protocol}//${host}${port ? ':' + port : ''}/ws`;
    
    try {
      console.log(`Connecting to WebSocket server at ${wsUrl}`);
      socketRef.current = new WebSocket(wsUrl);
      
      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        
        // Authenticate with the WebSocket server
        if (socketRef.current && user) {
          socketRef.current.send(JSON.stringify({
            type: 'connection',
            payload: { userId: user.id }
          }));
        }
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'chat') {
            // Handle incoming chat message
            const { message, conversationId } = data.payload;
            
            // If this is for the active chat, no need to increment unread count
            if (conversationId !== activeChat) {
              setUnreadMessages(prev => ({
                ...prev,
                [conversationId]: (prev[conversationId] || 0) + 1
              }));
              
              // Show browser notification if supported
              if (Notification.permission === "granted" && document.hidden) {
                new Notification(`New message from ${message.sender.name}`, {
                  body: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
                  icon: "/logo.png"
                });
              }
            }
          } else if (data.type === 'typing') {
            // Handle typing indicator
            const { userId, conversationId, isTyping } = data.payload;
            
            if (conversationId === activeChat) {
              setIsTyping(isTyping);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      
      // Fallback to mock implementation if WebSocket connection fails
      const mockSocketEvents = () => {
        // Simulate receiving a new message
        const randomConversationId = Math.floor(Math.random() * 3) + 1;
        if (randomConversationId !== activeChat) {
          setUnreadMessages(prev => ({
            ...prev,
            [randomConversationId]: (prev[randomConversationId] || 0) + 1
          }));
          
          // Show browser notification if supported
          if (Notification.permission === "granted" && document.hidden) {
            const conversation = mockConversations.find(c => c.id === randomConversationId);
            if (conversation) {
              new Notification("New message from " + conversation.user.name, {
                body: "You have a new message",
                icon: "/logo.png"
              });
            }
          }
        }
        
        // Simulate online status changes
        const randomUserId = Math.floor(Math.random() * 3) + 1;
        setIsOnline(prev => ({
          ...prev,
          [randomUserId]: Math.random() > 0.3 // 70% chance of being online
        }));
      };
      
      // Set up mock real-time updates as fallback
      const interval = setInterval(mockSocketEvents, 30000); // Every 30 seconds
      
      return () => {
        clearInterval(interval);
      };
    }
    
    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user, activeChat]);
  
  // Fetch conversations
  const {
    data: conversations,
    isLoading: isLoadingConversations,
  } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/conversations");
        // The response is already handled by the queryFn
        return res;
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    },
  });
  
  // Fetch messages for active chat
  const {
    data: messages,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: [`/api/conversations/${activeChat}/messages`],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", `/api/conversations/${activeChat}/messages`);
        // The response is already handled by the queryFn
        return res;
      } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
      }
    },
    enabled: !!activeChat,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      console.log(`Sending message to conversation ${activeChat}:`, content);
      const res = await apiRequest("POST", `/api/conversations/${activeChat}/messages`, { content });
      console.log(`Message send response:`, res);
      // The response is already handled by the queryFn
      return res;
    },
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
      setMessageText("");
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    }
  });
  
  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (messageText.trim() && activeChat) {
      sendMessageMutation.mutate(messageText);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Mock data for UI demonstration
  const mockConversations = [
    {
      id: 1,
      user: {
        id: 101,
        name: "John Doe",
        avatarUrl: "",
        title: "Software Engineer at Google",
        isOnline: true,
        isTyping: Math.random() > 0.5, // Randomly show typing indicator for demo
      },
      lastMessage: {
        content: "Let's connect to discuss the project details",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: true,
      },
    },
    {
      id: 2,
      user: {
        id: 102,
        name: "Alice Smith",
        avatarUrl: "",
        title: "Product Manager at Microsoft",
        isOnline: false,
        isTyping: false,
      },
      lastMessage: {
        content: "Thanks for your help with the presentation",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        isRead: false,
      },
    },
    {
      id: 3,
      user: {
        id: 103,
        name: "Robert Johnson",
        avatarUrl: "",
        title: "CTO at Startup Inc.",
        isOnline: true,
        isTyping: false,
      },
      lastMessage: {
        content: "I'd like to schedule a call to discuss the investment opportunity",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
      },
    },
  ];
  
  const mockMessages = [
    {
      id: 1,
      senderId: 101,
      content: "Hi there! I saw your profile and I'm impressed with your work.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: 2,
      senderId: user?.id || 0,
      content: "Thank you! I appreciate that. What can I help you with?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
    },
    {
      id: 3,
      senderId: 101,
      content: "I'm working on a new project and I think your skills would be a great fit. Would you be interested in discussing it further?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
    },
    {
      id: 4,
      senderId: user?.id || 0,
      content: "Absolutely! I'm always open to new opportunities. Could you tell me more about the project?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21), // 21 hours ago
    },
    {
      id: 5,
      senderId: 101,
      content: "It's a fintech application targeting small businesses. We need someone with your expertise in React and Node.js. Are you available for a call tomorrow?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
  ];
  
  // Use mock data if API data is not available
  // Make sure we have an array of conversations
  const displayConversations = Array.isArray(conversations) 
    ? conversations 
    : (conversations?.data && Array.isArray(conversations.data)) 
      ? conversations.data 
      : mockConversations;
      
  console.log("Display conversations:", displayConversations);
  // Make sure we have an array of messages
  const displayMessages = Array.isArray(messages) 
    ? messages 
    : (messages?.data && Array.isArray(messages.data)) 
      ? messages.data 
      : (activeChat === 1 ? mockMessages : []);
      
  console.log("Display messages:", displayMessages);
  
  const formatTime = (date: Date | string) => {
    // Convert to Date object if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date);
      return "Invalid date";
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-80px)] bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Left sidebar - Conversations list */}
        <div className="w-full md:w-96 border-r border-[#E0E0E0] flex flex-col">
          <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#191919]">Messaging</h2>
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF] ml-1">
                <Edit className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <Input 
                placeholder="Search messages" 
                className="pl-10 bg-[#EEF3F8] border-none rounded-full text-sm focus-visible:ring-[#0A66C2]" 
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="space-y-4 p-3">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center p-2">
                    <Skeleton className="h-12 w-12 rounded-full bg-[#F3F2EF]" />
                    <div className="ml-3 space-y-2 flex-1">
                      <Skeleton className="h-4 w-32 bg-[#F3F2EF]" />
                      <Skeleton className="h-3 w-40 bg-[#F3F2EF]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {displayConversations.map((conversation) => {
                  const hasUnread = unreadMessages[conversation.id] && unreadMessages[conversation.id] > 0;
                  const userOnline = isOnline[conversation.user.id] !== undefined 
                    ? isOnline[conversation.user.id] 
                    : conversation.user.isOnline;
                  
                  return (
                    <div 
                      key={conversation.id}
                      className={`flex items-start p-3 hover:bg-[#F3F2EF] cursor-pointer ${activeChat === conversation.id ? 'bg-[#F3F2EF]' : ''} ${hasUnread ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setActiveChat(conversation.id);
                        // Mark as read when selecting conversation
                        if (hasUnread) {
                          setUnreadMessages(prev => ({
                            ...prev,
                            [conversation.id]: 0
                          }));
                        }
                        // Update last seen
                        setLastSeen(prev => ({
                          ...prev,
                          [conversation.id]: new Date()
                        }));
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 border border-[#E0E0E0]">
                          <AvatarImage src={conversation.user.avatarUrl} />
                          <AvatarFallback className="bg-[#0A66C2] text-white">
                            {getInitials(conversation.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {userOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-semibold truncate ${hasUnread ? 'text-[#0A66C2]' : 'text-[#191919]'}`}>
                            {conversation.user.name}
                          </h4>
                          <div className="flex items-center ml-2">
                            {hasUnread && (
                              <div className="h-5 w-5 rounded-full bg-[#0A66C2] text-white text-xs flex items-center justify-center font-medium mr-1">
                                {unreadMessages[conversation.id]}
                              </div>
                            )}
                            <span className="text-xs text-[#666666] whitespace-nowrap">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm truncate ${hasUnread ? 'text-[#191919] font-medium' : 'text-[#666666]'}`}>
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Chat area */}
        {activeChat ? (
          <div className="hidden md:flex flex-col flex-1">
            {/* Chat header */}
            <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 border border-[#E0E0E0]">
                  <AvatarImage src={displayConversations.find(c => c.id === activeChat)?.user.avatarUrl} />
                  <AvatarFallback className="bg-[#0A66C2] text-white">
                    {getInitials(displayConversations.find(c => c.id === activeChat)?.user.name || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h4 className="font-semibold text-[#191919]">
                    {displayConversations.find(c => c.id === activeChat)?.user.name}
                  </h4>
                  <p className="text-xs text-[#666666]">
                    {displayConversations.find(c => c.id === activeChat)?.user.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF] ml-1">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF] ml-1">
                  <Info className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF] ml-1">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F9FAFB]">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                      {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full bg-[#F3F2EF] mr-2" />}
                      <div>
                        <Skeleton className={`h-10 w-48 ${i % 2 === 0 ? 'rounded-r-lg rounded-bl-lg' : 'rounded-l-lg rounded-br-lg'} bg-[#F3F2EF]`} />
                        <Skeleton className="h-3 w-16 bg-[#F3F2EF] mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayMessages.map((message) => {
                    const isCurrentUser = message.senderId === user?.id;
                    // Determine if message is read
                    const isRead = isCurrentUser && (message.isRead || 
                      (lastSeen[activeChat || 0] && new Date(lastSeen[activeChat || 0]) > new Date(message.timestamp)));
                    
                    return (
                      <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : ''}`}>
                        {!isCurrentUser && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            <AvatarImage src={displayConversations.find(c => c.id === activeChat)?.user.avatarUrl} />
                            <AvatarFallback className="bg-[#0A66C2] text-white text-xs">
                              {getInitials(displayConversations.find(c => c.id === activeChat)?.user.name || "")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className={`py-2 px-3 max-w-md ${
                            isCurrentUser 
                              ? 'bg-[#0A66C2] text-white rounded-l-lg rounded-br-lg' 
                              : 'bg-white border border-[#E0E0E0] rounded-r-lg rounded-bl-lg'
                          }`}>
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                          </div>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-[#666666]">
                              {formatTime(message.timestamp)}
                            </p>
                            {isCurrentUser && (
                              <div className="ml-1">
                                {isRead ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 h-3 w-3">
                                    <path d="M18 6L7 17L2 12" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 h-3 w-3">
                                    <path d="M20 6L9 17L4 12" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing indicator */}
                  {activeChat && displayConversations.find(c => c.id === activeChat)?.user.isTyping && (
                    <div className="flex">
                      <Avatar className="h-8 w-8 mr-2 mt-1">
                        <AvatarImage src={displayConversations.find(c => c.id === activeChat)?.user.avatarUrl} />
                        <AvatarFallback className="bg-[#0A66C2] text-white text-xs">
                          {getInitials(displayConversations.find(c => c.id === activeChat)?.user.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="py-2 px-3 bg-white border border-[#E0E0E0] rounded-r-lg rounded-bl-lg">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                          </div>
                        </div>
                        <p className="text-xs text-[#666666] mt-1">typing...</p>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input area */}
            <div className="p-3 border-t border-[#E0E0E0] bg-white">
              <div className="flex items-center bg-[#F3F2EF] rounded-lg p-1">
                <Input 
                  placeholder="Write a message..." 
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                    
                    // Handle typing indicator
                    if (!isTyping) {
                      setIsTyping(true);
                      // In a real app, we would send a typing indicator to the server
                      // apiRequest("POST", `/api/conversations/${activeChat}/typing`, { isTyping: true });
                    }
                    
                    // Clear existing timeout
                    if (typingTimeout) {
                      clearTimeout(typingTimeout);
                    }
                    
                    // Set new timeout to stop typing indicator after 2 seconds of inactivity
                    const timeout = setTimeout(() => {
                      setIsTyping(false);
                      // In a real app, we would send a typing indicator to the server
                      // apiRequest("POST", `/api/conversations/${activeChat}/typing`, { isTyping: false });
                    }, 2000);
                    
                    setTypingTimeout(timeout);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                      
                      // Clear typing indicator immediately when sending message
                      setIsTyping(false);
                      if (typingTimeout) {
                        clearTimeout(typingTimeout);
                      }
                    }
                  }}
                  className="border-none bg-transparent focus-visible:ring-0 flex-1"
                />
                <div className="flex items-center px-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-white">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-white ml-1">
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-white ml-1">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 w-8 p-0 rounded-full ml-1 ${
                      messageText.trim() 
                        ? 'text-[#0A66C2] hover:bg-[#E5F5FC]' 
                        : 'text-[#666666] opacity-50 cursor-not-allowed'
                    }`}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-[#F9FAFB]">
            <div className="text-center max-w-md p-6">
              <div className="h-16 w-16 bg-[#E5F5FC] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A66C2]">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#191919] mb-2">Your messages</h3>
              <p className="text-[#666666] mb-4">Send private messages to connections and groups</p>
              <Button className="bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-medium">
                Start a conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}