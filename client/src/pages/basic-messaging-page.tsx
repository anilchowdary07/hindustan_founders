import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { useAuth } from "@/hooks/use-auth";
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

export default function BasicMessagingPage() {
  console.log("BasicMessagingPage rendering");
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageText, setMessageText] = useState("");

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
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedConversation) return;
    
    // Optimistically add the message to the UI
    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: String(user?.id || "current"),
      text: messageText,
      timestamp: new Date(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageText("");
    
    try {
      // Send the message to the API
      const response = await apiRequest(`/api/conversations/${selectedConversation.id}/messages`, {
        content: messageText
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Update the conversation list with the new message
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? {
                ...conv,
                lastMessage: {
                  id: String(response.data?.id || newMessage.id),
                  senderId: String(user?.id || "current"),
                  text: messageText,
                  timestamp: new Date(),
                  isRead: false
                }
              }
            : conv
        )
      );
      
      // Refresh messages to get the server-generated ID
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
      
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
  };

  // Get other participant in conversation
  const getOtherParticipant = (conversation: Conversation) => {
    const currentUserId = String(user?.id || "current");
    
    // Check if participants array exists and has items
    if (!conversation.participants || conversation.participants.length === 0) {
      // Return a default participant if none exists
      return {
        id: "unknown",
        name: "Unknown User",
        avatarUrl: undefined,
        isOnline: false
      };
    }
    
    // Find the other participant or default to the first one
    return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  };

  console.log("Rendering BasicMessagingPage with:", {
    conversationsCount: conversations.length,
    hasSelectedConversation: !!selectedConversation,
    messagesCount: messages.length,
    isLoading
  });

  return (
    <Layout>
      <div className="container mx-auto py-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h1 className="text-xl font-bold p-4 border-b">Messages</h1>
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading conversations...</p>
            </div>
          )}
          
          {!isLoading && (
            <div className="flex h-[calc(80vh-100px)]">
              {/* Conversation List */}
              <div className="w-1/3 border-r overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No conversations yet</p>
                  </div>
                ) : (
                  <div>
                    {conversations.map(conversation => {
                      const otherParticipant = getOtherParticipant(conversation);
                      const isSelected = selectedConversation?.id === conversation.id;
                      
                      return (
                        <div 
                          key={conversation.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                          onClick={() => handleSelectConversation(conversation)}
                        >
                          <div className="flex items-start">
                            <div className="relative">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {otherParticipant.avatarUrl ? (
                                  <img 
                                    src={otherParticipant.avatarUrl} 
                                    alt={otherParticipant.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  otherParticipant.name.substring(0, 2).toUpperCase()
                                )}
                              </div>
                              {otherParticipant.isOnline && (
                                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex justify-between">
                                <h3 className={`text-sm ${conversation.unreadCount > 0 ? 'font-bold' : 'font-medium'}`}>
                                  {otherParticipant.name}
                                </h3>
                                
                                {conversation.lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              
                              {conversation.lastMessage && (
                                <div className="flex items-center justify-between mt-1">
                                  <p className={`text-xs truncate ${conversation.unreadCount > 0 ? 'font-medium' : 'text-gray-500'}`}>
                                    {conversation.lastMessage.senderId === String(user?.id || "current") ? 'You: ' : ''}
                                    {conversation.lastMessage.text}
                                  </p>
                                  
                                  {conversation.unreadCount > 0 && (
                                    <span className="ml-1 flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Message Area */}
              <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-3 border-b flex items-center">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {getOtherParticipant(selectedConversation).avatarUrl ? (
                            <img 
                              src={getOtherParticipant(selectedConversation).avatarUrl} 
                              alt={getOtherParticipant(selectedConversation).name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            getOtherParticipant(selectedConversation).name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        {getOtherParticipant(selectedConversation).isOnline && (
                          <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="ml-3">
                        <h2 className="text-sm font-medium">{getOtherParticipant(selectedConversation).name}</h2>
                        {getOtherParticipant(selectedConversation).isOnline && (
                          <p className="text-xs text-green-600">Online</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-sm text-gray-400 mt-1">Start the conversation by sending a message</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {messages.map(message => {
                            const isCurrentUser = message.senderId === String(user?.id || "current");
                            
                            return (
                              <div 
                                key={message.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isCurrentUser && (
                                  <div className="mr-2 flex-shrink-0">
                                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                      {getOtherParticipant(selectedConversation).avatarUrl ? (
                                        <img 
                                          src={getOtherParticipant(selectedConversation).avatarUrl} 
                                          alt={getOtherParticipant(selectedConversation).name}
                                          className="h-8 w-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        getOtherParticipant(selectedConversation).name.substring(0, 2).toUpperCase()
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <div className={`max-w-[75%]`}>
                                  <div 
                                    className={`px-3 py-2 rounded-lg ${
                                      isCurrentUser 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                                  </div>
                                  
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    
                                    {isCurrentUser && message.isRead && (
                                      <span className="ml-1 text-xs text-blue-500">✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="border-t p-3">
                      <form onSubmit={handleSendMessage} className="flex items-center">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={!messageText.trim()}
                          className={`ml-2 p-2 rounded-full ${
                            messageText.trim() 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-4">
                      <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                      <p className="text-gray-500">Choose a conversation from the list or start a new one</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}