import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  LinkedInCard, 
  LinkedInCardContent, 
  LinkedInButton
} from "../ui/linkedin-ui";
import { LinkedInAvatar } from "../ui/linkedin-avatar";
import { LinkedInSearch } from "../ui/linkedin-search";
import { 
  Edit, 
  MoreHorizontal, 
  Send, 
  Image, 
  Paperclip, 
  Smile, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: {
    type: "image" | "file";
    url: string;
    name?: string;
  }[];
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

interface LinkedInMessagingProps {
  conversations: Conversation[];
  currentUserId: string;
  selectedConversation?: Conversation;
  messages: Message[];
  isLoading?: boolean;
  onSendMessage?: (conversationId: string, text: string) => void;
  onSelectConversation?: (conversationId: string) => void;
  onCreateNewMessage?: () => void;
  onSearchMessages?: (query: string) => void;
}

export function LinkedInMessaging({ 
  conversations = [], 
  currentUserId,
  selectedConversation,
  messages = [],
  isLoading = false,
  onSendMessage,
  onSelectConversation,
  onCreateNewMessage,
  onSearchMessages
}: LinkedInMessagingProps) {
  const [, navigate] = useLocation();
  const [messageText, setMessageText] = useState("");
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Set mobile conversation open state when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setIsMobileConversationOpen(true);
    }
  }, [selectedConversation]);
  
  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messageText.trim() && selectedConversation && onSendMessage) {
      onSendMessage(selectedConversation.id, messageText);
      setMessageText("");
    }
  };
  
  // Get other participant in conversation
  const getOtherParticipant = (conversation: Conversation) => {
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
  
  // Render conversation list item
  const renderConversationItem = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    const isSelected = selectedConversation?.id === conversation.id;
    
    return (
      <button
        key={conversation.id}
        className={`w-full p-3 flex items-start hover:bg-[#F3F2EF] transition-colors text-left ${
          isSelected ? 'bg-[#EEF3F8]' : ''
        }`}
        onClick={() => onSelectConversation && onSelectConversation(conversation.id)}
      >
        <LinkedInAvatar
          src={otherParticipant.avatarUrl}
          alt={otherParticipant.name}
          fallback={otherParticipant.name.substring(0, 2).toUpperCase()}
          size="md"
          status={otherParticipant.isOnline ? "online" : undefined}
        />
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={`text-sm ${conversation.unreadCount > 0 ? 'font-bold text-[#191919]' : 'font-medium text-[#191919]'}`}>
              {otherParticipant.name}
            </h3>
            
            {conversation.lastMessage && (
              <span className="text-xs text-[#666666]">
                {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: false })}
              </span>
            )}
          </div>
          
          {conversation.lastMessage && (
            <div className="flex items-center justify-between mt-1">
              <p className={`text-xs truncate ${conversation.unreadCount > 0 ? 'font-medium text-[#191919]' : 'text-[#666666]'}`}>
                {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                {conversation.lastMessage.text}
              </p>
              
              {conversation.unreadCount > 0 && (
                <span className="ml-1 flex-shrink-0 h-2 w-2 bg-[#0A66C2] rounded-full"></span>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };
  
  // Render message
  const renderMessage = (message: Message) => {
    const isCurrentUser = message.senderId === currentUserId;
    
    // Get other participant safely
    const getOtherParticipantSafely = () => {
      if (!selectedConversation) {
        return {
          name: "Unknown User",
          avatarUrl: undefined
        };
      }
      return getOtherParticipant(selectedConversation);
    };
    
    const otherParticipant = getOtherParticipantSafely();
    
    return (
      <div 
        key={message.id} 
        className={`flex mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isCurrentUser && (
          <div className="mr-2 flex-shrink-0">
            <LinkedInAvatar
              src={otherParticipant.avatarUrl}
              alt={otherParticipant.name}
              fallback={otherParticipant.name.substring(0, 2).toUpperCase()}
              size="sm"
            />
          </div>
        )}
        
        <div className={`max-w-[75%] ${isCurrentUser ? 'order-1' : 'order-2'}`}>
          <div 
            className={`px-3 py-2 rounded-lg ${
              isCurrentUser 
                ? 'bg-[#0A66C2] text-white' 
                : 'bg-[#F3F2EF] text-[#191919]'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          </div>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-1">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="mt-1">
                  {attachment.type === "image" ? (
                    <img 
                      src={attachment.url} 
                      alt="Attachment" 
                      className="max-w-full rounded-lg"
                    />
                  ) : (
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-2 bg-[#F3F2EF] rounded-lg text-[#0A66C2] text-xs"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      <span>{attachment.name || "Attachment"}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center mt-1">
            <span className="text-xs text-[#666666]">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
            
            {isCurrentUser && message.isRead && (
              <CheckCircle className="h-3 w-3 text-[#0A66C2] ml-1" />
            )}
            
            {isCurrentUser && !message.isRead && (
              <Clock className="h-3 w-3 text-[#666666] ml-1" />
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex h-[calc(100vh-56px)] md:h-[calc(100vh-80px)]">
        {/* Conversation List - Hidden on mobile when conversation is open */}
        <div 
          className={`w-full md:w-1/3 md:block border-r border-[#E0E0E0] bg-white ${
            isMobileConversationOpen ? 'hidden' : 'block'
          }`}
        >
          {/* Header */}
          <div className="p-3 border-b border-[#E0E0E0] flex justify-between items-center sticky top-14 bg-white z-10">
            <h1 className="text-lg font-medium text-[#191919]">Messaging</h1>
            
            <div className="flex items-center">
              <button 
                className="p-2 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                onClick={() => navigate("/messaging/filters")}
                aria-label="Filter messages"
              >
                <Filter className="h-5 w-5" />
              </button>
              
              <button 
                className="p-2 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full ml-1"
                onClick={onCreateNewMessage}
                aria-label="New message"
              >
                <Edit className="h-5 w-5" />
              </button>
              
              <button 
                className="p-2 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full ml-1"
                onClick={() => navigate("/messaging/settings")}
                aria-label="Message settings"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="p-3 border-b border-[#E0E0E0] sticky top-[70px] bg-white z-10">
            <LinkedInSearch
              placeholder="Search messages"
              onSearch={onSearchMessages}
            />
          </div>
          
          {/* Conversation List */}
          <div className="overflow-y-auto h-[calc(100%-130px)]">
            {conversations.length > 0 ? (
              <div className="divide-y divide-[#E0E0E0]">
                {conversations.map(renderConversationItem)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#666666]">No conversations yet</p>
                <LinkedInButton
                  variant="primary"
                  className="mt-3"
                  onClick={onCreateNewMessage}
                >
                  Start a conversation
                </LinkedInButton>
              </div>
            )}
          </div>
        </div>
        
        {/* Conversation Detail - Full width on mobile when open */}
        <div 
          className={`w-full md:w-2/3 bg-white flex flex-col ${
            isMobileConversationOpen || selectedConversation ? 'block' : 'hidden md:block'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-3 border-b border-[#E0E0E0] flex justify-between items-center sticky top-14 bg-white z-10">
                <div className="flex items-center">
                  {/* Back button on mobile */}
                  <button 
                    className="p-2 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full mr-1 md:hidden"
                    onClick={() => setIsMobileConversationOpen(false)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  
                  {selectedConversation && (
                    <>
                      <LinkedInAvatar
                        src={getOtherParticipant(selectedConversation).avatarUrl}
                        alt={getOtherParticipant(selectedConversation).name}
                        fallback={getOtherParticipant(selectedConversation).name.substring(0, 2).toUpperCase()}
                        size="sm"
                        status={getOtherParticipant(selectedConversation).isOnline ? "online" : undefined}
                        onClick={() => navigate(`/profile/${getOtherParticipant(selectedConversation).id}`)}
                      />
                      
                      <div className="ml-2">
                        <h2 
                          className="text-sm font-medium text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer"
                          onClick={() => navigate(`/profile/${getOtherParticipant(selectedConversation).id}`)}
                        >
                          {getOtherParticipant(selectedConversation).name}
                        </h2>
                        
                        {getOtherParticipant(selectedConversation).isOnline && (
                          <p className="text-xs text-[#057642]">Online</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center">
                  {selectedConversation && (
                    <button 
                      className="p-2 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                      onClick={() => navigate(`/profile/${getOtherParticipant(selectedConversation).id}`)}
                      aria-label="View profile"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 bg-white">
                {messages.length > 0 ? (
                  <div>
                    {messages.map(renderMessage)}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-sm text-[#666666] mb-2">No messages yet</p>
                      <p className="text-xs text-[#666666]">
                        Start a conversation with {getOtherParticipant(selectedConversation).name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-3 border-t border-[#E0E0E0] bg-white">
                <form onSubmit={handleSendMessage} className="flex items-end">
                  <div className="flex-1 bg-[#F3F2EF] rounded-lg p-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write a message..."
                      className="w-full bg-transparent border-none resize-none focus:outline-none text-sm text-[#191919] min-h-[40px] max-h-[120px]"
                      rows={1}
                    />
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <button 
                          type="button"
                          className="p-1.5 text-[#666666] hover:text-[#191919] hover:bg-[#E0E0E0] rounded-full"
                          aria-label="Add image"
                        >
                          <Image className="h-5 w-5" />
                        </button>
                        
                        <button 
                          type="button"
                          className="p-1.5 text-[#666666] hover:text-[#191919] hover:bg-[#E0E0E0] rounded-full ml-1"
                          aria-label="Add attachment"
                        >
                          <Paperclip className="h-5 w-5" />
                        </button>
                        
                        <button 
                          type="button"
                          className="p-1.5 text-[#666666] hover:text-[#191919] hover:bg-[#E0E0E0] rounded-full ml-1"
                          aria-label="Add emoji"
                        >
                          <Smile className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <button 
                        type="submit"
                        className={`p-1.5 rounded-full ${
                          messageText.trim() 
                            ? 'text-[#0A66C2] hover:bg-[#DCE6F1]' 
                            : 'text-[#A8A8A8] cursor-not-allowed'
                        }`}
                        disabled={!messageText.trim()}
                        aria-label="Send message"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            // Empty state when no conversation is selected
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <h3 className="text-lg font-medium text-[#191919] mb-2">Select a conversation</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Choose a conversation from the list or start a new one
                </p>
                <LinkedInButton
                  variant="primary"
                  onClick={onCreateNewMessage}
                >
                  New message
                </LinkedInButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}