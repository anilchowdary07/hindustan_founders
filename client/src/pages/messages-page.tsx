import { useState, useRef, useEffect } from 'react';
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Search, UserPlus, Star, PhoneCall, Video, Info, MoreVertical, MessageSquare, Paperclip, Smile, Image as ImageIcon, FileText, Mic, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  failed?: boolean;
}

interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [availableContacts, setAvailableContacts] = useState<Array<{id: number, name: string, avatarUrl?: string, role: string}>>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  
  // State for messages and conversations
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // Fetch conversations when component mounts
  useEffect(() => {
    console.log("Fetching conversations...");
    fetchConversations();
  }, []);
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversation]);
  
  // Simulate typing effect
  useEffect(() => {
    if (activeConversation && messages[activeConversation]?.length > 0) {
      const randomDelay = Math.floor(Math.random() * 10000) + 3000; // Random delay between 3-13 seconds
      const timer = setTimeout(() => {
        setIsTyping(true);
        
        // Show typing for a random duration
        const typingDuration = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
        setTimeout(() => {
          setIsTyping(false);
          
          // Add a new message from the other user
          const randomMessages = [
            "That sounds great!",
            "Let me think about it and get back to you.",
            "Can we schedule a call to discuss this further?",
            "I've shared some resources that might help.",
            "What do you think about this approach?"
          ];
          
          const randomIndex = Math.floor(Math.random() * randomMessages.length);
          const newMsg = {
            id: Math.max(...messages[activeConversation].map(m => m.id)) + 1,
            content: randomMessages[randomIndex],
            timestamp: new Date(),
            sender: {
              id: conversations.find(c => c.id === activeConversation)?.user.id || 0,
              name: conversations.find(c => c.id === activeConversation)?.user.name || '',
            },
            isCurrentUser: false,
          };
          
          setMessages(prev => ({
            ...prev,
            [activeConversation]: [...prev[activeConversation], newMsg]
          }));
          
        }, typingDuration);
      }, randomDelay);
      
      return () => clearTimeout(timer);
    }
  }, [activeConversation, messages]);
  
  // Fetch available contacts for new conversations
  useEffect(() => {
    if (newConversationOpen) {
      fetchAvailableContacts();
    }
  }, [newConversationOpen]);
  
  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      console.log("Making API request to fetch conversations");
      const response = await apiRequest('/api/conversations');
      console.log("Conversations API response:", response);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Format the data to match our Conversation interface
        const formattedConversations = response.data.map(conv => {
          // Get the other participant (for 1:1 conversations)
          const otherParticipant = conv.otherParticipants && conv.otherParticipants.length > 0 
            ? conv.otherParticipants[0] 
            : null;
            
          return {
            id: conv.id,
            user: {
              id: otherParticipant?.id || 0,
              name: otherParticipant?.name || 'Unknown User',
              avatarUrl: otherParticipant?.avatarUrl,
              status: otherParticipant?.isOnline ? 'online' : 'offline',
              lastSeen: otherParticipant?.lastSeen ? new Date(otherParticipant.lastSeen) : undefined
            },
            lastMessage: conv.lastMessage ? {
              content: conv.lastMessage.content,
              timestamp: new Date(conv.lastMessage.createdAt),
              isRead: conv.lastMessage.isRead
            } : {
              content: 'Start a conversation',
              timestamp: new Date(conv.createdAt),
              isRead: true
            },
            unreadCount: conv.unreadCount || 0
          };
        });
        
        console.log("Setting conversations:", formattedConversations);
        setConversations(formattedConversations);
        
        // If there are conversations and none is active, set the first one as active
        if (formattedConversations.length > 0 && !activeConversation) {
          console.log("Setting active conversation:", formattedConversations[0].id);
          setActiveConversation(formattedConversations[0].id);
        }
      } else {
        console.log("No conversations data received");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      
      // Use mock data if the API fails
      console.log("Using mock conversation data");
      const mockConversations: Conversation[] = [
        {
          id: 1,
          user: {
            id: 101,
            name: "Vikram Malhotra",
            avatarUrl: "/avatars/vikram.jpg",
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
            avatarUrl: "/avatars/priya.jpg",
            status: 'offline',
            lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
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
            avatarUrl: "/avatars/arjun.jpg",
            status: 'away',
          },
          lastMessage: {
            content: "Can we schedule a call to discuss the investment terms?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            isRead: true,
          },
          unreadCount: 0,
        }
      ];
      
      setConversations(mockConversations);
      
      // If there are mock conversations and none is active, set the first one as active
      if (mockConversations.length > 0 && !activeConversation) {
        console.log("Setting active conversation:", mockConversations[0].id);
        setActiveConversation(mockConversations[0].id);
      }
      
      toast({
        title: "Notice",
        description: "Using demo conversation data for preview purposes.",
      });
    }
  };
  
  // Fetch messages for a conversation from API
  const fetchMessages = async (conversationId: number) => {
    try {
      console.log(`Fetching messages for conversation ${conversationId}`);
      const response = await apiRequest(`/api/conversations/${conversationId}/messages`);
      console.log(`Messages API response for conversation ${conversationId}:`, response);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Format the data to match our Message interface
        const formattedMessages = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          sender: {
            id: msg.sender?.id || 0,
            name: msg.sender?.name || 'Unknown User',
            avatarUrl: msg.sender?.avatarUrl,
          },
          isCurrentUser: msg.sender?.id === user?.id,
          attachmentUrl: msg.attachmentUrl,
          attachmentType: msg.attachmentType
        }));
        
        console.log(`Setting messages for conversation ${conversationId}:`, formattedMessages);
        setMessages(prev => ({
          ...prev,
          [conversationId]: formattedMessages
        }));
        
        // Mark all messages as read
        if (formattedMessages.length > 0) {
          // Update the unread count in the conversation list
          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversationId 
                ? { ...conv, unreadCount: 0 } 
                : conv
            )
          );
        }
      } else {
        console.log(`No messages data received for conversation ${conversationId}`);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      
      // Use mock data if the API fails
      console.log("Using mock message data");
      
      // Generate mock messages based on the conversation ID
      const mockMessages: Message[] = [];
      
      // Add some mock messages
      if (conversationId === 1) {
        mockMessages.push(
          {
            id: 101,
            content: "Hi there! I saw your startup on the platform and I'm really impressed with what you're building.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            sender: {
              id: 101,
              name: "Vikram Malhotra",
              avatarUrl: "/avatars/vikram.jpg",
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
              avatarUrl: "/avatars/vikram.jpg",
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
              avatarUrl: "/avatars/vikram.jpg",
            },
            isCurrentUser: false
          }
        );
      } else if (conversationId === 2) {
        mockMessages.push(
          {
            id: 201,
            content: "I reviewed your pitch deck and I'm interested in learning more about your revenue model.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            sender: {
              id: 102,
              name: "Priya Sharma",
              avatarUrl: "/avatars/priya.jpg",
            },
            isCurrentUser: false
          },
          {
            id: 202,
            content: "That's great to hear! I'd be happy to walk you through our revenue model in detail.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            sender: {
              id: user?.id || 0,
              name: user?.name || "You",
            },
            isCurrentUser: true
          },
          {
            id: 203,
            content: "I'll send you our detailed financial projections shortly.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            sender: {
              id: user?.id || 0,
              name: user?.name || "You",
            },
            isCurrentUser: true
          },
          {
            id: 204,
            content: "Perfect, I'll review them and get back to you.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
            sender: {
              id: 102,
              name: "Priya Sharma",
              avatarUrl: "/avatars/priya.jpg",
            },
            isCurrentUser: false
          }
        );
      } else if (conversationId === 3) {
        mockMessages.push(
          {
            id: 301,
            content: "Hello! I'm interested in discussing potential investment in your startup.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            sender: {
              id: 103,
              name: "Arjun Kapoor",
              avatarUrl: "/avatars/arjun.jpg",
            },
            isCurrentUser: false
          },
          {
            id: 302,
            content: "Hi Arjun! We're currently raising our seed round. Would love to discuss.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11), // 11 hours ago
            sender: {
              id: user?.id || 0,
              name: user?.name || "You",
            },
            isCurrentUser: true
          },
          {
            id: 303,
            content: "Great! What's your current valuation and how much are you looking to raise?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 hours ago
            sender: {
              id: 103,
              name: "Arjun Kapoor",
              avatarUrl: "/avatars/arjun.jpg",
            },
            isCurrentUser: false
          },
          {
            id: 304,
            content: "We're raising $1.5M at a $10M valuation. We've already secured $500K from angel investors.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9), // 9 hours ago
            sender: {
              id: user?.id || 0,
              name: user?.name || "You",
            },
            isCurrentUser: true
          },
          {
            id: 305,
            content: "Can we schedule a call to discuss the investment terms?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            sender: {
              id: 103,
              name: "Arjun Kapoor",
              avatarUrl: "/avatars/arjun.jpg",
            },
            isCurrentUser: false
          }
        );
      }
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: mockMessages
      }));
      
      toast({
        title: "Notice",
        description: "Using demo message data for preview purposes.",
      });
    }
  };
  
  const fetchAvailableContacts = async () => {
    setIsLoadingContacts(true);
    try {
      // Fetch connections from the API to use as potential message recipients
      const response = await apiRequest('/api/connections');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Format the data to match our contacts interface
        const contacts = response.data
          .filter(conn => conn.status === 'accepted') // Only show accepted connections
          .map(conn => ({
            id: conn.user?.id,
            name: conn.user?.name || 'Unknown User',
            avatarUrl: conn.user?.avatarUrl,
            role: conn.user?.role || 'User'
          }));
        
        setAvailableContacts(contacts);
      } else {
        // If no connections, use suggestions
        const suggestionsResponse = await apiRequest('/api/connections/suggestions');
        
        if (suggestionsResponse.data && Array.isArray(suggestionsResponse.data)) {
          const suggestions = suggestionsResponse.data.map(user => ({
            id: user.id,
            name: user.name || 'Unknown User',
            avatarUrl: user.avatarUrl,
            role: user.role || 'User'
          }));
          
          setAvailableContacts(suggestions);
        } else {
          throw new Error("No contacts available");
        }
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      
      // Use mock data if the API fails
      console.log("Using mock contacts data");
      const mockContacts = [
        {
          id: 201,
          name: "Neha Gupta",
          title: "CTO at TechSolutions",
          avatarUrl: "/avatars/neha.jpg",
        },
        {
          id: 202,
          name: "Rajiv Mehta",
          title: "Angel Investor",
          avatarUrl: "/avatars/rajiv.jpg",
        },
        {
          id: 203,
          name: "Ananya Desai",
          title: "Founder at EcoWear",
          avatarUrl: "/avatars/ananya.jpg",
        },
        {
          id: 204,
          name: "Sanjay Kumar",
          title: "VP Engineering at DataTech",
          avatarUrl: "/avatars/sanjay.jpg",
        },
        {
          id: 205,
          name: "Meera Patel",
          title: "Product Manager at Flipkart",
          avatarUrl: "/avatars/meera.jpg",
        }
      ];
      
      setAvailableContacts(mockContacts);
      
      toast({
        title: "Notice",
        description: "Using demo contacts data for preview purposes.",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };
  
  const startNewConversation = async () => {
    if (!selectedContact) {
      toast({
        title: "Select a contact",
        description: "Please select a contact to start a conversation with.",
        variant: "default",
      });
      return;
    }
    
    // Check if conversation already exists
    const existingConversation = conversations.find(c => c.user.id === selectedContact);
    
    if (existingConversation) {
      setActiveConversation(existingConversation.id);
      setNewConversationOpen(false);
      setSelectedContact(null);
      return;
    }
    
    try {
      // Create a new conversation via API
      const response = await apiRequest('/api/conversations', {
        participants: [selectedContact]
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        // Get the selected contact details
        const selectedContactDetails = availableContacts.find(c => c.id === selectedContact);
        
        // Format the conversation to match our interface
        const newConversation = {
          id: response.data.id,
          user: {
            id: selectedContact,
            name: selectedContactDetails?.name || 'Unknown User',
            avatarUrl: selectedContactDetails?.avatarUrl,
            status: 'offline',
          },
          lastMessage: {
            content: 'Start a conversation',
            timestamp: new Date(),
            isRead: true,
          },
          unreadCount: 0
        };
        
        // Add empty messages array for this conversation
        setMessages(prev => ({
          ...prev,
          [newConversation.id]: [],
        }));
        
        // Add to conversations and set as active
        setConversations(prev => [...prev, newConversation]);
        setActiveConversation(newConversation.id);
        
        // Close modal and reset
        setNewConversationOpen(false);
        setSelectedContact(null);
        
        toast({
          title: "Conversation started",
          description: `You can now chat with ${newConversation.user.name}`,
        });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    const messageContent = newMessage;
    
    // Clear input immediately for better UX
    setNewMessage("");
    
    // Create a temporary message ID
    const tempId = Date.now();
    
    // Create a temporary message object
    const tempMessage: Message = {
      id: tempId,
      content: messageContent,
      timestamp: new Date(),
      sender: {
        id: user?.id || 0,
        name: user?.name || "You",
      },
      isCurrentUser: true
    };
    
    // Add the temporary message to the UI immediately
    setMessages(prev => {
      const conversationMessages = prev[activeConversation] || [];
      return {
        ...prev,
        [activeConversation]: [...conversationMessages, tempMessage]
      };
    });
    
    // Update conversation preview
    setConversations(prev => 
      prev.map(convo => {
        if (convo.id === activeConversation) {
          return {
            ...convo,
            lastMessage: {
              content: messageContent,
              timestamp: new Date(),
              isRead: true,
            },
            unreadCount: 0
          };
        }
        return convo;
      })
    );
    
    try {
      // Send message to API
      const response = await apiRequest('POST', `/api/conversations/${activeConversation}/messages`, {
        content: messageContent
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data) {
        const newMsg = response.data;
        
        // Replace the temporary message with the real one from the server
        setMessages(prev => {
          const conversationMessages = prev[activeConversation] || [];
          const updatedMessages = conversationMessages.map(msg => 
            msg.id === tempId ? newMsg : msg
          );
          
          return {
            ...prev,
            [activeConversation]: updatedMessages
          };
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Keep the message in the UI but mark it as failed
      setMessages(prev => {
        const conversationMessages = prev[activeConversation] || [];
        const updatedMessages = conversationMessages.map(msg => 
          msg.id === tempId ? {...msg, failed: true} : msg
        );
        
        return {
          ...prev,
          [activeConversation]: updatedMessages
        };
      });
      
      toast({
        title: "Message not sent",
        description: "Your message will appear locally but wasn't delivered. Tap to retry.",
        variant: "destructive",
      });
    }
    
    // Simulate typing after a delay
    setTimeout(() => {
      setIsTyping(true);
    }, 5000);
  };
  
  // Format timestamp to readable time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours ago, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If less than 7 days ago, show day of week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(convo => 
    convo.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log("Rendering MessagesPage component with:", {
    conversations,
    filteredConversations,
    activeConversation,
    messages: activeConversation ? messages[activeConversation] : null
  });

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden p-3 border-b dark:border-gray-700 flex justify-between items-center bg-white sticky top-12 z-10">
            <h2 className="text-lg font-semibold">Messages</h2>
            {activeConversation && !showMobileSidebar && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          
          {/* Sidebar */}
          <div className={`${!showMobileSidebar && activeConversation ? 'hidden' : 'flex'} md:flex w-full md:w-80 border-r dark:border-gray-700 flex-col md:h-[calc(100vh-4rem)]`}>
            <div className="p-4 border-b dark:border-gray-700 bg-white sticky top-[84px] md:top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search messages"
                  className="pl-10 rounded-full bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="flex-1 flex flex-col">
              <div className="px-4 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                  <TabsTrigger value="starred" className="flex-1">Starred</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="flex-1 overflow-y-auto p-2">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((convo) => (
                    <div 
                      key={convo.id}
                      className={`flex items-center p-3 cursor-pointer border-b border-gray-100 ${
                        activeConversation === convo.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        setActiveConversation(convo.id);
                        // On mobile, switch to chat view when a conversation is selected
                        if (window.innerWidth < 768) {
                          setShowMobileSidebar(false);
                        }
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                          {convo.user.avatarUrl && <AvatarImage src={convo.user.avatarUrl} />}
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                            convo.user.status === 'online' 
                              ? 'bg-green-500' 
                              : convo.user.status === 'away' 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium truncate">{convo.user.name}</h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-1">
                            {formatTime(convo.lastMessage.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500 truncate">
                            {convo.lastMessage.content}
                          </p>
                          {convo.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                              {convo.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No conversations found
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="unread" className="flex-1 overflow-y-auto p-2">
                {filteredConversations.filter(c => c.unreadCount > 0).length > 0 ? (
                  filteredConversations
                    .filter(c => c.unreadCount > 0)
                    .map((convo) => (
                      <div 
                        key={convo.id}
                        className={`flex items-center p-2 rounded-lg cursor-pointer mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          activeConversation === convo.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                        onClick={() => {
                          setActiveConversation(convo.id);
                          // On mobile, switch to chat view when a conversation is selected
                          if (window.innerWidth < 768) {
                            setShowMobileSidebar(false);
                          }
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                          {convo.user.avatarUrl && <AvatarImage src={convo.user.avatarUrl} />}
                        </Avatar>
                        <div className="ml-3 flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium truncate">{convo.user.name}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(convo.lastMessage.timestamp)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {convo.lastMessage.content}
                            </p>
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                              {convo.unreadCount}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No unread messages
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="starred" className="flex-1 overflow-y-auto p-2">
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No starred conversations yet
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="fixed bottom-16 right-4 md:static md:p-4 md:border-t md:dark:border-gray-700 md:w-full">
              <Button 
                className="md:w-full rounded-full h-14 w-14 md:h-auto md:rounded-md shadow-lg md:shadow-none"
                onClick={() => setNewConversationOpen(true)}
              >
                <UserPlus className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">New Conversation</span>
              </Button>
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className={`${!showMobileSidebar && activeConversation ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-[calc(100vh-4rem)] md:h-auto`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center bg-white sticky top-[84px] md:top-0 z-10">
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="mr-2 md:hidden" 
                      onClick={() => setShowMobileSidebar(true)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {conversations.find(c => c.id === activeConversation)?.user.name.charAt(0)}
                      </AvatarFallback>
                      {conversations.find(c => c.id === activeConversation)?.user.avatarUrl && (
                        <AvatarImage src={conversations.find(c => c.id === activeConversation)?.user.avatarUrl} />
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium">
                        {conversations.find(c => c.id === activeConversation)?.user.name}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversations.find(c => c.id === activeConversation)?.user.status === 'online'
                          ? 'Online'
                          : conversations.find(c => c.id === activeConversation)?.user.status === 'away'
                            ? 'Away'
                            : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        // Initiate voice call
                        toast({
                          title: "Voice Call",
                          description: "Initiating voice call with " + selectedChat?.name
                        });
                      }}
                    >
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        // Initiate video call
                        toast({
                          title: "Video Call",
                          description: "Initiating video call with " + selectedChat?.name
                        });
                      }}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        toast({
                          title: "Contact Info",
                          description: `View ${conversations.find(c => c.id === activeConversation)?.user.name}'s profile for more information.`
                        });
                      }}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-0">
                        <div className="py-1">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm px-3 py-2 h-auto"
                            onClick={() => {
                              toast({
                                title: "Conversation Muted",
                                description: "You won't receive notifications for this conversation"
                              });
                            }}
                          >
                            Mute conversation
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm px-3 py-2 h-auto"
                            onClick={() => {
                              toast({
                                title: "Conversation Archived",
                                description: "This conversation has been archived"
                              });
                            }}
                          >
                            Archive conversation
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm px-3 py-2 h-auto text-red-500"
                            onClick={() => {
                              toast({
                                title: "Conversation Deleted",
                                description: "This conversation has been deleted"
                              });
                              setActiveConversation(null);
                            }}
                          >
                            Delete conversation
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 pb-20 md:pb-4">
                  {messages[activeConversation]?.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isCurrentUser && (
                        <Avatar className="h-8 w-8 mt-1 mr-2">
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                          {message.sender.avatarUrl && <AvatarImage src={message.sender.avatarUrl} />}
                        </Avatar>
                      )}
                      <div 
                        className={`max-w-xs md:max-w-md rounded-2xl py-3 px-4 ${
                          message.isCurrentUser 
                            ? message.failed ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-600 text-white' 
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className={`text-xs ${
                            message.isCurrentUser 
                              ? message.failed ? 'text-red-500' : 'text-blue-100' 
                              : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                            {message.failed && " • Not sent"}
                          </p>
                          {message.failed && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 py-0 text-xs text-red-600 hover:text-red-800 hover:bg-red-100"
                              onClick={() => {
                                // Get the message content and retry sending
                                const content = message.content;
                                
                                // Remove the failed message
                                setMessages(prev => {
                                  const conversationMessages = prev[activeConversation] || [];
                                  return {
                                    ...prev,
                                    [activeConversation]: conversationMessages.filter(m => m.id !== message.id)
                                  };
                                });
                                
                                // Set the message content and send again
                                setNewMessage(content);
                                setTimeout(() => handleSendMessage(), 100);
                              }}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <Avatar className="h-8 w-8 mt-1 mr-2">
                        <AvatarFallback>
                          {conversations.find(c => c.id === activeConversation)?.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2 px-3 rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '400ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t dark:border-gray-700 flex gap-2 bg-white fixed bottom-0 left-0 right-0 md:static md:bottom-auto">
                  <div className="flex items-center gap-2 md:hidden">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Paperclip className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </Button>
                  </div>
                  <Input 
                    placeholder="Write a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="rounded-full aspect-square p-0 w-10 h-10"
                    variant={newMessage.trim() ? "default" : "ghost"}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-6 mb-4">
                  <MessageSquare size={48} className="text-gray-400 dark:text-gray-300" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
                  Connect with founders, investors, and professionals in the startup ecosystem. Select a conversation to start messaging.
                </p>
                <Button onClick={() => setNewConversationOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* New Conversation Dialog */}
      <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 my-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                className="pl-8"
                value={contactSearchTerm}
                onChange={(e) => setContactSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-72 rounded-md border p-2">
            {isLoadingContacts ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-1">
                {availableContacts
                  .filter(contact => 
                    contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                    contact.role.toLowerCase().includes(contactSearchTerm.toLowerCase())
                  )
                  .map(contact => (
                    <div 
                      key={contact.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedContact === contact.id ? 'bg-primary/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => setSelectedContact(contact.id)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} />}
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.role}</p>
                      </div>
                      {selectedContact === contact.id && (
                        <Badge variant="outline" className="ml-auto bg-primary/20 text-primary border-primary/30">
                          Selected
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                {availableContacts.filter(contact => 
                  contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                  contact.role.toLowerCase().includes(contactSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No contacts found matching your search
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setNewConversationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={startNewConversation} disabled={!selectedContact || isLoadingContacts}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
