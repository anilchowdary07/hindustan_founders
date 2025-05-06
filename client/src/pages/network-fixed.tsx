import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, UserPlus, UserCheck, MessageSquare, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NetworkFixed() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("connections");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingConnections, setPendingConnections] = useState<number[]>([]);
  const [acceptedConnections, setAcceptedConnections] = useState<number[]>([]);

  // Mock data for UI demonstration
  const mockConnections = [
    {
      id: 1,
      name: "Rahul Sharma",
      title: "Founder & CEO at TechStartup Inc.",
      location: "Bangalore, India",
      mutualConnections: 12,
      avatarUrl: null,
      isVerified: true
    },
    {
      id: 2,
      name: "Priya Patel",
      title: "Product Manager at FinTech Solutions",
      location: "Mumbai, India",
      mutualConnections: 8,
      avatarUrl: null,
      isVerified: false
    },
    {
      id: 3,
      name: "Vikram Malhotra",
      title: "Angel Investor at Venture Capital Partners",
      location: "Delhi, India",
      mutualConnections: 15,
      avatarUrl: null,
      isVerified: true
    },
    {
      id: 4,
      name: "Neha Gupta",
      title: "Software Engineer at Google",
      location: "Hyderabad, India",
      mutualConnections: 5,
      avatarUrl: null,
      isVerified: false
    },
    {
      id: 5,
      name: "Amit Kumar",
      title: "Co-founder at EdTech Startup",
      location: "Pune, India",
      mutualConnections: 10,
      avatarUrl: null,
      isVerified: true
    }
  ];

  // Mock data for pending invitations
  const mockPendingInvitations = [
    {
      id: 6,
      name: "Sanjay Mehta",
      title: "CTO at Cloud Solutions",
      location: "Chennai, India",
      mutualConnections: 7,
      avatarUrl: null,
      isVerified: true,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: 7,
      name: "Ananya Singh",
      title: "Marketing Director at Brand Agency",
      location: "Kolkata, India",
      mutualConnections: 3,
      avatarUrl: null,
      isVerified: false,
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    }
  ];

  // Mock data for received invitations
  const mockReceivedInvitations = [
    {
      id: 8,
      name: "Rajesh Khanna",
      title: "Founder at AI Solutions",
      location: "Bangalore, India",
      mutualConnections: 9,
      avatarUrl: null,
      isVerified: true,
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
    },
    {
      id: 9,
      name: "Meera Reddy",
      title: "Investment Banker at Finance Corp",
      location: "Mumbai, India",
      mutualConnections: 4,
      avatarUrl: null,
      isVerified: false,
      receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
    }
  ];

  const handleConnect = (userId: number) => {
    if (pendingConnections.includes(userId)) {
      setPendingConnections(pendingConnections.filter(id => id !== userId));
      toast({
        title: "Invitation withdrawn",
        description: "Your connection invitation has been withdrawn."
      });
    } else {
      setPendingConnections([...pendingConnections, userId]);
      toast({
        title: "Invitation sent",
        description: "Your connection invitation has been sent."
      });
    }
  };

  const handleAcceptInvitation = (userId: number) => {
    setAcceptedConnections([...acceptedConnections, userId]);
    toast({
      title: "Connection accepted",
      description: "You are now connected."
    });
  };

  const handleIgnoreInvitation = (userId: number) => {
    toast({
      title: "Invitation ignored",
      description: "The invitation has been removed."
    });
  };

  const handleMessage = (userId: number) => {
    toast({
      title: "Message",
      description: "Opening chat with this connection."
    });
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#191919]">My Network</h1>
            <p className="text-[#666666] text-sm">Manage your connections and invitations</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666]" size={16} />
            <Input 
              placeholder="Search by name, title, or location" 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="connections" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="connections">Connections</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="space-y-4">
            {mockConnections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={connection.avatarUrl || ""} alt={connection.name} />
                        <AvatarFallback className="bg-[#0077B5] text-white">{getInitials(connection.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{connection.name} {connection.isVerified && "✓"}</div>
                        <div className="text-sm text-[#666666]">{connection.title}</div>
                        <div className="text-xs text-[#666666]">{connection.location}</div>
                        <div className="text-xs text-[#666666] mt-1">{connection.mutualConnections} mutual connections</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-end pt-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleMessage(connection.id)}
                    className="text-[#0077B5]"
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Message
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="sent" className="space-y-4">
            {mockPendingInvitations.length > 0 ? (
              mockPendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={invitation.avatarUrl || ""} alt={invitation.name} />
                          <AvatarFallback className="bg-[#0077B5] text-white">{getInitials(invitation.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{invitation.name} {invitation.isVerified && "✓"}</div>
                          <div className="text-sm text-[#666666]">{invitation.title}</div>
                          <div className="text-xs text-[#666666]">{invitation.location}</div>
                          <div className="text-xs text-[#666666] mt-1">{invitation.mutualConnections} mutual connections</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-end pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleConnect(invitation.id)}
                      className="text-[#0077B5] border-[#0077B5]"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Withdraw
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-[#666666]">No pending invitations sent.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="received" className="space-y-4">
            {mockReceivedInvitations.length > 0 ? (
              mockReceivedInvitations.map((invitation) => (
                <Card key={invitation.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={invitation.avatarUrl || ""} alt={invitation.name} />
                          <AvatarFallback className="bg-[#0077B5] text-white">{getInitials(invitation.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{invitation.name} {invitation.isVerified && "✓"}</div>
                          <div className="text-sm text-[#666666]">{invitation.title}</div>
                          <div className="text-xs text-[#666666]">{invitation.location}</div>
                          <div className="text-xs text-[#666666] mt-1">{invitation.mutualConnections} mutual connections</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2 pt-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleIgnoreInvitation(invitation.id)}
                      className="text-[#666666]"
                    >
                      Ignore
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      className="bg-[#0077B5] hover:bg-[#005885] text-white"
                    >
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-[#666666]">No pending invitations received.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}