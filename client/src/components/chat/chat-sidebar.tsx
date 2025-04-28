import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageSquare, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface ChatMessage {
  id: number;
  text: string;
  timestamp: Date;
  sender: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  isCurrentUser: boolean;
}

interface ChatContact {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  avatarUrl?: string;
  online: boolean;
}

export default function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');
  const [message, setMessage] = useState("");
  const [activeChat, setActiveChat] = useState<number | null>(null);
  
  // Mock data for demo purposes
  const contacts: ChatContact[] = [
    {
      id: 1,
      name: "Vikram Sharma",
      lastMessage: "Let's connect about the startup opportunity",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      unread: 2,
      avatarUrl: undefined,
      online: true,
    },
    {
      id: 2,
      name: "Priya Mehta",
      lastMessage: "Thanks for connecting!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      unread: 0,
      avatarUrl: undefined,
      online: false,
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      lastMessage: "I'm interested in your pitch",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      unread: 1,
      avatarUrl: undefined,
      online: true,
    },
  ];
  
  const messages: Record<number, ChatMessage[]> = {
    1: [
      {
        id: 1,
        text: "Hi there! I saw your startup pitch",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        sender: {
          id: 1,
          name: "Vikram Sharma",
        },
        isCurrentUser: false,
      },
      {
        id: 2,
        text: "I'm interested in learning more about your business model",
        timestamp: new Date(Date.now() - 1000 * 60 * 29),
        sender: {
          id: 1,
          name: "Vikram Sharma",
        },
        isCurrentUser: false,
      },
      {
        id: 3,
        text: "Thanks for reaching out! I'd be happy to discuss",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        sender: {
          id: 2,
          name: "You",
        },
        isCurrentUser: true,
      },
      {
        id: 4,
        text: "Let's connect about the startup opportunity",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        sender: {
          id: 1,
          name: "Vikram Sharma",
        },
        isCurrentUser: false,
      },
    ],
    2: [
      {
        id: 1,
        text: "Hello, just connected with you",
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        sender: {
          id: 3,
          name: "Priya Mehta",
        },
        isCurrentUser: false,
      },
      {
        id: 2,
        text: "Welcome to the network!",
        timestamp: new Date(Date.now() - 1000 * 60 * 31),
        sender: {
          id: 2,
          name: "You",
        },
        isCurrentUser: true,
      },
      {
        id: 3,
        text: "Thanks for connecting!",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        sender: {
          id: 3,
          name: "Priya Mehta",
        },
        isCurrentUser: false,
      },
    ],
    3: [
      {
        id: 1,
        text: "I'm interested in your pitch",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        sender: {
          id: 4,
          name: "Rajesh Kumar",
        },
        isCurrentUser: false,
      },
    ],
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleSendMessage = () => {
    if (message.trim() && activeChat) {
      // In a real app, you would send this to an API
      console.log(`Sending to ${activeChat}: ${message}`);
      setMessage("");
    }
  };
  
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <Button 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={24} />
        </Button>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center bg-primary text-white rounded-t-lg">
        <h3 className="font-medium">Messages</h3>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-primary/90"
            onClick={() => setActiveChat(null)}
          >
            <X size={18} />
          </Button>
        </div>
      </div>
      
      {/* Tabs (when no chat is active) */}
      {!activeChat && (
        <div className="flex border-b">
          <Button
            variant="ghost"
            className={`flex-1 rounded-none ${activeTab === 'chats' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <MessageSquare size={16} className="mr-2" />
            Chats
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 rounded-none ${activeTab === 'contacts' ? 'border-b-2 border-primary' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={16} className="mr-2" />
            Contacts
          </Button>
        </div>
      )}
      
      {/* Contact List */}
      {!activeChat && (
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setActiveChat(contact.id)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} />}
                  </Avatar>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-medium truncate">{contact.name}</h4>
                    <span className="text-xs text-gray-500">{formatTime(contact.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="ml-2 h-5 min-w-5 px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {contact.unread}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Active Chat */}
      {activeChat && (
        <>
          {/* Chat Header */}
          <div className="px-4 py-2 border-b flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="p-1"
              onClick={() => setActiveChat(null)}
            >
              <X size={16} />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {contacts.find(c => c.id === activeChat)?.name.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{contacts.find(c => c.id === activeChat)?.name}</h4>
              <p className="text-xs text-gray-500">
                {contacts.find(c => c.id === activeChat)?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages[activeChat]?.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.isCurrentUser 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="p-3 border-t flex gap-2">
            <Input 
              placeholder="Type a message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send size={16} />
            </Button>
          </div>
        </>
      )}
      
      {/* Close Button */}
      <Button 
        className="absolute -top-4 -right-4 h-8 w-8 rounded-full p-0 shadow-lg"
        onClick={() => setIsOpen(false)}
        variant="secondary"
      >
        <X size={16} />
      </Button>
    </div>
  );
}