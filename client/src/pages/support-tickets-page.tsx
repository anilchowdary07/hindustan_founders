import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  TicketIcon, 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Check,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

// Mock ticket data
const mockTickets = [
  {
    id: "TKT-1001",
    subject: "Unable to update profile picture",
    status: "open",
    priority: "medium",
    category: "account",
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 16),
    messages: [
      {
        id: "msg-1",
        sender: "user",
        content: "I'm trying to update my profile picture but keep getting an error message. Can you help?",
        timestamp: new Date(2025, 3, 15, 14, 30)
      },
      {
        id: "msg-2",
        sender: "support",
        content: "Hi there! I'd be happy to help. Could you please tell me what error message you're seeing?",
        timestamp: new Date(2025, 3, 16, 9, 15)
      }
    ]
  },
  {
    id: "TKT-1002",
    subject: "Question about premium subscription",
    status: "closed",
    priority: "high",
    category: "billing",
    createdAt: new Date(2025, 3, 10),
    updatedAt: new Date(2025, 3, 12),
    messages: [
      {
        id: "msg-3",
        sender: "user",
        content: "I have a question about the premium subscription features. What's included?",
        timestamp: new Date(2025, 3, 10, 11, 45)
      },
      {
        id: "msg-4",
        sender: "support",
        content: "Our premium subscription includes advanced networking features, priority support, and access to exclusive events. Would you like more details on any specific feature?",
        timestamp: new Date(2025, 3, 11, 10, 30)
      },
      {
        id: "msg-5",
        sender: "user",
        content: "That answers my question. Thank you!",
        timestamp: new Date(2025, 3, 12, 9, 20)
      }
    ]
  },
  {
    id: "TKT-1003",
    subject: "Feature request: Calendar integration",
    status: "in_progress",
    priority: "low",
    category: "feature_request",
    createdAt: new Date(2025, 3, 5),
    updatedAt: new Date(2025, 3, 8),
    messages: [
      {
        id: "msg-6",
        sender: "user",
        content: "It would be great if we could integrate the platform calendar with Google Calendar. Is this feature planned?",
        timestamp: new Date(2025, 3, 5, 16, 20)
      },
      {
        id: "msg-7",
        sender: "support",
        content: "Thank you for your suggestion! We're actually working on calendar integrations right now. I've added your vote for Google Calendar specifically. We expect to release this feature in the next 2-3 months.",
        timestamp: new Date(2025, 3, 8, 11, 10)
      }
    ]
  }
];

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case "open":
        return { variant: "default", label: "Open", icon: <Clock className="h-3 w-3 mr-1" /> };
      case "in_progress":
        return { variant: "secondary", label: "In Progress", icon: <AlertCircle className="h-3 w-3 mr-1" /> };
      case "closed":
        return { variant: "outline", label: "Closed", icon: <CheckCircle2 className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "outline", label: status, icon: null };
    }
  };

  const { variant, label, icon } = getStatusProps();
  
  return (
    <Badge variant={variant as any} className="flex items-center">
      {icon}
      {label}
    </Badge>
  );
};

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityProps = () => {
    switch (priority) {
      case "high":
        return { className: "bg-red-100 text-red-800 border-red-200", label: "High" };
      case "medium":
        return { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Medium" };
      case "low":
        return { className: "bg-green-100 text-green-800 border-green-200", label: "Low" };
      default:
        return { className: "bg-gray-100 text-gray-800 border-gray-200", label: priority };
    }
  };

  const { className, label } = getPriorityProps();
  
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default function SupportTicketsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-tickets");
  const [tickets, setTickets] = useState(mockTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "account",
    priority: "medium",
    message: ""
  });

  // Filter tickets based on search query and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get the selected ticket details
  const ticketDetails = selectedTicket 
    ? tickets.find(ticket => ticket.id === selectedTicket) 
    : null;

  // Handle new ticket submission
  const handleNewTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newTicketObj = {
        id: `TKT-${1000 + tickets.length + 1}`,
        subject: newTicket.subject,
        status: "open",
        priority: newTicket.priority,
        category: newTicket.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: `msg-new-${Date.now()}`,
            sender: "user",
            content: newTicket.message,
            timestamp: new Date()
          }
        ]
      };
      
      setTickets([newTicketObj, ...tickets]);
      setNewTicket({
        subject: "",
        category: "account",
        priority: "medium",
        message: ""
      });
      
      toast({
        title: "Ticket Created",
        description: `Your ticket #${newTicketObj.id} has been created successfully.`,
      });
      
      setIsSubmitting(false);
      setActiveTab("my-tickets");
      setSelectedTicket(newTicketObj.id);
    }, 1500);
  };

  // Handle new message submission
  const handleNewMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === selectedTicket) {
          const newMsg = {
            id: `msg-${Date.now()}`,
            sender: "user",
            content: newMessage,
            timestamp: new Date()
          };
          
          return {
            ...ticket,
            updatedAt: new Date(),
            messages: [...ticket.messages, newMsg]
          };
        }
        return ticket;
      });
      
      setTickets(updatedTickets);
      setNewMessage("");
      setIsSubmitting(false);
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent to support.",
      });
    }, 1000);
  };

  // Handle input change for new ticket form
  const handleNewTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTicket(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <TicketIcon className="mr-2 h-6 w-6" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground mt-1">
              Get help with your questions and issues
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setActiveTab("new-ticket")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
          </TabsList>

          {/* My Tickets Tab */}
          <TabsContent value="my-tickets" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tickets by ID or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Your Tickets</CardTitle>
                    <CardDescription>
                      {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                    {filteredTickets.length === 0 ? (
                      <div className="text-center py-8">
                        <TicketIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-lg font-medium">No tickets found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchQuery || statusFilter !== "all" 
                            ? "Try adjusting your filters" 
                            : "Create a new ticket to get help"}
                        </p>
                        {!searchQuery && statusFilter === "all" && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setActiveTab("new-ticket")}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Ticket
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredTickets.map((ticket) => (
                          <div 
                            key={ticket.id}
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedTicket === ticket.id 
                                ? 'bg-primary/10 border-primary/30' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedTicket(ticket.id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">{ticket.subject}</div>
                              <StatusBadge status={ticket.status} />
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <div>{ticket.id}</div>
                              <div>{format(ticket.updatedAt, 'MMM d, yyyy')}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Ticket Details */}
              <div className="md:col-span-2">
                {selectedTicket && ticketDetails ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{ticketDetails.subject}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>{ticketDetails.id}</span>
                            <span>•</span>
                            <span>{format(ticketDetails.createdAt, 'MMM d, yyyy')}</span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <PriorityBadge priority={ticketDetails.priority} />
                          <StatusBadge status={ticketDetails.status} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Messages */}
                      <div className="space-y-4 max-h-[400px] overflow-y-auto p-1">
                        {ticketDetails.messages.map((message) => (
                          <div 
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.sender === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="text-sm mb-1">
                                {message.sender === 'user' ? 'You' : 'Support Agent'}
                              </div>
                              <div>{message.content}</div>
                              <div className="text-xs mt-2 opacity-70">
                                {format(message.timestamp, 'MMM d, yyyy h:mm a')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      {ticketDetails.status !== 'closed' && (
                        <form onSubmit={handleNewMessageSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reply">Reply</Label>
                            <Textarea 
                              id="reply"
                              placeholder="Type your message here..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="min-h-[100px]"
                              required
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              type="submit" 
                              disabled={isSubmitting || !newMessage.trim()}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Send Reply
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      )}

                      {ticketDetails.status === 'closed' && (
                        <div className="bg-gray-100 p-4 rounded-md text-center">
                          <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                          <p className="font-medium">This ticket is closed</p>
                          <p className="text-sm text-gray-600 mt-1">
                            If you need further assistance, please create a new ticket.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <TicketIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No ticket selected</h3>
                      <p className="text-gray-500 text-center mt-1 mb-4">
                        Select a ticket from the list to view details or create a new ticket
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("new-ticket")}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Ticket
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* New Ticket Tab */}
          <TabsContent value="new-ticket">
            <Card>
              <CardHeader>
                <CardTitle>Create New Support Ticket</CardTitle>
                <CardDescription>
                  Fill out the form below to submit a new support request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNewTicketSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject"
                      name="subject"
                      placeholder="Brief description of your issue"
                      value={newTicket.subject}
                      onChange={handleNewTicketChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newTicket.category} 
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">Account & Profile</SelectItem>
                          <SelectItem value="billing">Billing & Subscription</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="feature_request">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTicket.priority} 
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      placeholder="Please describe your issue in detail..."
                      value={newTicket.message}
                      onChange={handleNewTicketChange}
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || !newTicket.subject || !newTicket.message}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <TicketIcon className="mr-2 h-4 w-4" />
                          Submit Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}