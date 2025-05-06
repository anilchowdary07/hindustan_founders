import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
import { LinkedInMessaging } from "@/components/messaging/linkedin-messaging";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Define interfaces for our data types
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatarUrl?: string;
    isOnline?: boolean;
  }[];
  lastMessage?: Message;
  unreadCount: number;
}

export default function SimpleMessagingPage() {
  console.log("SimpleMessagingPage rendering");
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Fetch conversations from API or use mock data
  const fetchConversations = async () => {
    console.log("Fetching conversations...");
    setIsLoading(true);
    try {
      console.log("Making API request to /api/conversations");
      const response = await apiRequest('/api/conversations');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Format the data to match our Conversation interface
        const formattedConversations: Conversation[] = response.data.map(conv => {
          // Ensure we have a valid user ID
          const currentUserId = String(user?.id || "current");
          
          // Create participants array with proper checks
          const participants = [
            // Add other participants if they exist
            ...(Array.isArray(conv.otherParticipants) ? conv.otherParticipants.map((p: any) => ({
              id: String(p.id || "unknown"),
              name: p.name || "Unknown User",
              avatarUrl: p.avatarUrl,
              isOnline: Boolean(p.isOnline)
            })) : []),
            // Always add current user
            {
              id: currentUserId,
              name: user?.name || 'You',
              avatarUrl: user?.avatarUrl,
              isOnline: true
            }
          ];
          
          // Ensure we have at least one participant
          if (participants.length === 1) {
            participants.unshift({
              id: "system",
              name: "System",
              avatarUrl: undefined,
              isOnline: true
            });
          }
          
          return {
            id: String(conv.id || Date.now()),
            participants,
            lastMessage: conv.lastMessage ? {
              id: String(conv.lastMessage.id || "msg-default"),
              senderId: String(conv.lastMessage.senderId || "system"),
              text: conv.lastMessage.content || "No message content",
              timestamp: new Date(conv.lastMessage.createdAt || Date.now()),
              isRead: Boolean(conv.lastMessage.isRead)
            } : undefined,
            unreadCount: Number(conv.unreadCount) || 0
          };
        });
        
        setConversations(formattedConversations);
        
        // Select the first conversation by default
        if (formattedConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(formattedConversations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      console.log("Using mock data instead");
      
      // Use mock data if API fails
      const currentUserId = String(user?.id || "current");
      const mockConversations: Conversation[] = [
        {
          id: "1",
          participants: [
            {
              id: "101",
              name: "John Doe",
              avatarUrl: "/avatars/john.jpg",
              isOnline: true
            },
            {
              id: currentUserId,
              name: user?.name || "You",
              avatarUrl: user?.avatarUrl,
              isOnline: true
            }
          ],
          lastMessage: {
            id: "msg1",
            senderId: "101",
            text: "Hey, how's your startup going?",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            isRead: false
          },
          unreadCount: 1
        },
        {
          id: "2",
          participants: [
            {
              id: "102",
              name: "Jane Smith",
              avatarUrl: "/avatars/jane.jpg",
              isOnline: false
            },
            {
              id: currentUserId,
              name: user?.name || "You",
              avatarUrl: user?.avatarUrl,
              isOnline: true
            }
          ],
          lastMessage: {
            id: "msg2",
            senderId: currentUserId,
            text: "I'll send you the pitch deck tomorrow",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            isRead: true
          },
          unreadCount: 0
        },
        {
          id: "3",
          participants: [
            {
              id: "103",
              name: "Alex Johnson",
              avatarUrl: "/avatars/alex.jpg",
              isOnline: true
            },
            {
              id: currentUserId,
              name: user?.name || "You",
              avatarUrl: user?.avatarUrl,
              isOnline: true
            }
          ],
          lastMessage: {
            id: "msg3",
            senderId: "103",
            text: "Let's schedule a call to discuss the investment opportunity",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            isRead: true
          },
          unreadCount: 0
        }
      ];
      
      setConversations(mockConversations);
      
      // Select the first conversation by default
      if (mockConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(mockConversations[0]);
      }
      
      toast({
        title: "Using demo data",
        description: "Showing sample conversations for preview",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/conversations/${conversationId}/messages`);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Format the data to match our Message interface
        const formattedMessages: Message[] = response.data.map(msg => ({
          id: String(msg.id),
          senderId: String(msg.senderId),
          text: msg.content,
          timestamp: new Date(msg.createdAt),
          isRead: msg.isRead || false
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      
      // Use mock data if API fails
      const currentUserId = String(user?.id || "current");
      
      // Get the other participant ID safely
      let otherParticipantId = "unknown";
      if (selectedConversation && selectedConversation.participants && selectedConversation.participants.length > 0) {
        const otherParticipant = selectedConversation.participants.find(p => p.id !== currentUserId);
        if (otherParticipant) {
          otherParticipantId = otherParticipant.id;
        } else if (selectedConversation.participants[0]) {
          otherParticipantId = selectedConversation.participants[0].id;
        }
      }
      
      const mockMessages: Message[] = [
        {
          id: "msg101",
          senderId: otherParticipantId,
          text: "Hey there! I saw your startup on the platform and I'm really impressed with what you're building.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          isRead: true
        },
        {
          id: "msg102",
          senderId: currentUserId,
          text: "Thanks! We've been working hard on it for the past few months.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
          isRead: true
        },
        {
          id: "msg103",
          senderId: otherParticipantId,
          text: "Would you be interested in discussing potential collaboration?",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
          isRead: true
        },
        {
          id: "msg104",
          senderId: currentUserId,
          text: "Absolutely! I'd love to hear more about what you have in mind.",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 hours ago
          isRead: true
        },
        {
          id: "msg105",
          senderId: otherParticipantId,
          text: "Great! How about we schedule a call next week to discuss the details?",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false
        }
      ];
      
      setMessages(mockMessages);
      
      toast({
        title: "Using demo data",
        description: "Showing sample messages for preview",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (conversationId: string, text: string) => {
    if (!text.trim()) return;
    
    // Optimistically add the message to the UI
    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: String(user?.id || "current"),
      text,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      // Send the message to the API
      const response = await apiRequest(`/api/conversations/${conversationId}/messages`, {
        content: text
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Update the conversation list with the new message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                lastMessage: {
                  id: String(response.data?.id || newMessage.id),
                  senderId: String(user?.id || "current"),
                  text,
                  timestamp: new Date(),
                  isRead: false
                }
              }
            : conv
        )
      );
      
      // Refresh messages to get the server-generated ID
      fetchMessages(conversationId);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Mark the message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, failed: true }
            : msg
        )
      );
      
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      
      // Mark conversation as read
      if (conversation.unreadCount > 0) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    }
  };

  // Handle creating a new message
  const handleCreateNewMessage = () => {
    toast({
      title: "Feature coming soon",
      description: "Creating new conversations will be available soon",
    });
  };

  // Handle searching messages
  const handleSearchMessages = (query: string) => {
    toast({
      title: "Feature coming soon",
      description: "Message search will be available soon",
    });
  };

  console.log("Rendering SimpleMessagingPage with:", {
    conversationsCount: conversations.length,
    hasSelectedConversation: !!selectedConversation,
    messagesCount: messages.length,
    isLoading
  });

  return (
    <Layout>
      <div className="container mx-auto py-4">
        {isLoading && <div className="text-center py-8">Loading conversations...</div>}
        
        {!isLoading && conversations.length === 0 && (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-2">No conversations found</h2>
            <p className="text-gray-600">Start a new conversation to get started</p>
          </div>
        )}
        
        {!isLoading && conversations.length > 0 && (
          <LinkedInMessaging
            conversations={conversations}
            currentUserId={String(user?.id || "current")}
            selectedConversation={selectedConversation}
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onSelectConversation={handleSelectConversation}
            onCreateNewMessage={handleCreateNewMessage}
            onSearchMessages={handleSearchMessages}
          />
        )}
      </div>
    </Layout>
  );
}