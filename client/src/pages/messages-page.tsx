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
  
  // Sample data for messages
  const [messages, setMessages] = useState<Record<number, Message[]>>({
    1: [
      {
        id: 1,
        content: "Hi Vikram, I wanted to discuss our upcoming product launch strategy.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 2,
        content: "Sure! I've been analyzing the market data you sent. I think we should target urban professionals first.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5), // 5 minutes after previous message
        sender: { id: 101, name: 'Vikram Malhotra' },
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "That makes sense. Do you have any specific marketing channels in mind?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 4,
        content: "I think we should focus on LinkedIn and industry-specific webinars.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        sender: { id: 101, name: 'Vikram Malhotra' },
        isCurrentUser: false,
      },
      {
        id: 5,
        content: "Looking forward to our meeting tomorrow!",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        sender: { id: 101, name: 'Vikram Malhotra' },
        isCurrentUser: false,
      },
    ],
    2: [
      {
        id: 1,
        content: "Hello Priya, I've shared my startup pitch deck with you. Would appreciate your feedback.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 2,
        content: "Hi there! I'll take a look at it over the weekend.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        sender: { id: 102, name: 'Priya Sharma' },
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "Thanks, I'm particularly interested in your thoughts on the financial projections.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 4,
        content: "I'll review your pitch and get back to you",
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        sender: { id: 102, name: 'Priya Sharma' },
        isCurrentUser: false,
      },
    ],
    3: [
      {
        id: 1,
        content: "Hi Rahul, I'm looking for investment opportunities for my tech startup.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 2,
        content: "What's your current valuation and how much are you looking to raise?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        sender: { id: 103, name: 'Rahul Kapoor' },
        isCurrentUser: false,
      },
      {
        id: 3,
        content: "We're valued at $2M pre-money and looking to raise $500K for market expansion.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 4,
        content: "Have you considered raising capital from angel investors?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        sender: { id: 103, name: 'Rahul Kapoor' },
        isCurrentUser: false,
      },
    ],
    4: [
      {
        id: 1,
        content: "I saw your job posting for a tech lead role at your startup.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        sender: { id: 104, name: 'Anjali Desai' },
        isCurrentUser: false,
      },
      {
        id: 2,
        content: "Yes, we're growing our tech team. Do you have experience with React and Node.js?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
        sender: { id: user?.id || 0, name: user?.name || 'You' },
        isCurrentUser: true,
      },
      {
        id: 3,
        content: "I have 5 years of experience with both technologies and have led engineering teams at two startups.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
        sender: { id: 104, name: 'Anjali Desai' },
        isCurrentUser: false,
      },
      {
        id: 4,
        content: "I'm interested in joining your startup as a tech lead",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        sender: { id: 104, name: 'Anjali Desai' },
        isCurrentUser: false,
      },
    ],
  });
  
  // Sample data for conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      user: {
        id: 101,
        name: "Vikram Malhotra",
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
        name: "Rahul Kapoor",
        status: 'online',
      },
      lastMessage: {
        content: "Have you considered raising capital from angel investors?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      id: 4,
      user: {
        id: 104,
        name: "Anjali Desai",
        status: 'away',
        lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
      },
      lastMessage: {
        content: "I'm interested in joining your startup as a tech lead",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
      },
      unreadCount: 0,
    },
  ]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversation]);
  
  useEffect(() => {
    if (activeConversation) {
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
  
  const fetchAvailableContacts = async () => {
    setIsLoadingContacts(true);
    try {
      // In a real app, this would be an API call to get users you can message
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        // Mock data for available contacts
        const mockContacts = [
          { id: 201, name: "Rajiv Kumar", role: "Founder", avatarUrl: "/avatars/rajiv.jpg" },
          { id: 202, name: "Ananya Desai", role: "Investor", avatarUrl: "/avatars/ananya.jpg" },
          { id: 203, name: "Sanjay Mehta", role: "Mentor", avatarUrl: "/avatars/sanjay.jpg" },
          { id: 204, name: "Meera Patel", role: "Founder", avatarUrl: "/avatars/meera.jpg" },
          { id: 205, name: "Arjun Singh", role: "Job Seeker", avatarUrl: "/avatars/arjun.jpg" },
          { id: 206, name: "Neha Sharma", role: "Investor", avatarUrl: "/avatars/neha.jpg" },
          { id: 207, name: "Kiran Rao", role: "Founder", avatarUrl: "/avatars/kiran.jpg" },
          { id: 208, name: "Divya Kapoor", role: "Student", avatarUrl: "/avatars/divya.jpg" },
        ];
        setAvailableContacts(mockContacts);
        setIsLoadingContacts(false);
      }, 1000);
      
      // Real implementation would be:
      // const response = await apiRequest('GET', '/api/users/available-contacts');
      // const data = await response.json();
      // setAvailableContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };
  
  const startNewConversation = () => {
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
    
    // Find the selected contact details
    const contact = availableContacts.find(c => c.id === selectedContact);
    
    if (!contact) return;
    
    // Create a new conversation
    const newConversationId = Math.max(...conversations.map(c => c.id)) + 1;
    
    // Add to conversations list
    const newConversationObj: Conversation = {
      id: newConversationId,
      user: {
        id: contact.id,
        name: contact.name,
        avatarUrl: contact.avatarUrl,
        status: 'online',
        lastSeen: new Date(),
      },
      lastMessage: {
        content: "New conversation started",
        timestamp: new Date(),
        isRead: true,
      },
      unreadCount: 0,
    };
    
    // Add empty messages array for this conversation
    setMessages(prev => ({
      ...prev,
      [newConversationId]: [],
    }));
    
    // Add to conversations and set as active
    setConversations(prev => [...prev, newConversationObj]);
    setActiveConversation(newConversationId);
    
    // Close modal and reset
    setNewConversationOpen(false);
    setSelectedContact(null);
    
    toast({
      title: "Conversation started",
      description: `You can now chat with ${contact.name}`,
    });
  };
  
  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    // Create a new message
    const newMsg = {
      id: messages[activeConversation].length > 0 
        ? Math.max(...messages[activeConversation].map(m => m.id)) + 1
        : 1,
      content: newMessage,
      timestamp: new Date(),
      sender: { id: user?.id || 0, name: user?.name || 'You' },
      isCurrentUser: true,
    };
    
    // Add to messages
    setMessages(prev => ({
      ...prev,
      [activeConversation]: [...prev[activeConversation], newMsg]
    }));
    
    // Update conversation
    setConversations(prev => 
      prev.map(convo => {
        if (convo.id === activeConversation) {
          return {
            ...convo,
            lastMessage: {
              content: newMessage,
              timestamp: new Date(),
              isRead: true,
            }
          };
        }
        return convo;
      })
    );
    
    // Clear input
    setNewMessage("");
    
    // In a real app, we would send the message to the server here
    // Example:
    // apiRequest('POST', '/api/messages', {
    //   conversationId: activeConversation,
    //   content: newMessage,
    // }).then(response => {
    //   if (!response.ok) {
    //     toast({
    //       title: "Error",
    //       description: "Failed to send message. Please try again.",
    //       variant: "destructive",
    //     });
    //   }
    // }).catch(error => {
    //   console.error("Error sending message:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to send message. Please try again.",
    //     variant: "destructive",
    //   });
    // });
    
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

  return (
    <Layout>
      <div className="flex flex-col h-full">
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-2">Messages</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search conversations..."
                  className="pl-8"
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
                      className={`flex items-center p-2 rounded-lg cursor-pointer mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        activeConversation === convo.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                      onClick={() => setActiveConversation(convo.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                          {convo.user.avatarUrl && <AvatarImage src={convo.user.avatarUrl} />}
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
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
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(convo.lastMessage.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                        onClick={() => setActiveConversation(convo.id)}
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
            
            <div className="p-4 border-t dark:border-gray-700">
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
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
                    <Button variant="ghost" size="icon">
                      <PhoneCall className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
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
                        className={`max-w-xs md:max-w-md rounded-lg py-2 px-3 ${
                          message.isCurrentUser 
                            ? 'bg-primary text-white rounded-br-none' 
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatTime(message.timestamp)}
                        </p>
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
                <div className="p-3 border-t dark:border-gray-700 flex gap-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
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
