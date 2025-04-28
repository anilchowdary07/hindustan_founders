import { useState } from 'react';
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Search, UserPlus, Star, PhoneCall, Video, Info, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample conversations
  const conversations: Conversation[] = [
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
  ];

  // Sample messages for each conversation
  const messages: Record<number, Message[]> = {
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
  };

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

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation) {
      // In a real app, you would send this to an API
      console.log(`Sending to conversation ${activeConversation}: ${newMessage}`);
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(convo => 
    convo.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Conversation List */}
          <div className="border-r dark:border-gray-700">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="font-bold text-xl mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search conversations" 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(convo => (
                  <div 
                    key={convo.id}
                    className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${activeConversation === convo.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    onClick={() => setActiveConversation(convo.id)}
                  >
                    <div className="flex items-start">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                          {convo.user.avatarUrl && <AvatarImage src={convo.user.avatarUrl} />}
                        </Avatar>
                        <span 
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                            convo.user.status === 'online' ? 'bg-green-500' : 
                            convo.user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{convo.user.name}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(convo.lastMessage.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{convo.lastMessage.content}</p>
                      </div>
                      {convo.unreadCount > 0 && (
                        <div className="ml-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">{convo.unreadCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No conversations found
                </div>
              )}
            </div>
          </div>

          {/* Message Area */}
          <div className="col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conversations.find(c => c.id === activeConversation)?.user.name.charAt(0) || '?'}
                      </AvatarFallback>
                      {conversations.find(c => c.id === activeConversation)?.user.avatarUrl && (
                        <AvatarImage src={conversations.find(c => c.id === activeConversation)?.user.avatarUrl || ''} />
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="font-medium">
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
                  <MessageCircle size={48} className="text-gray-400 dark:text-gray-300" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-4">
                  Connect with founders, investors, and professionals in the startup ecosystem. Select a conversation to start messaging.
                </p>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}