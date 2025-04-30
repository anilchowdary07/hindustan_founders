import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, UserPlus, UserX, MessageSquare, Mail, Phone, Briefcase, MapPin, Loader2, Filter, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";

interface Contact {
  id: number;
  name: string;
  role: string;
  company?: string;
  title?: string;
  location?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  connectionDate: Date;
  isStarred: boolean;
}

export default function ContactsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");
  const [contactToRemove, setContactToRemove] = useState<Contact | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState<Contact | null>(null);
  
  // Sample contacts data
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "Vikram Malhotra",
      role: "founder",
      company: "TechVision India",
      title: "CEO",
      location: "Mumbai",
      email: "vikram@techvision.in",
      phone: "+91 98765 43210",
      connectionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      isStarred: true
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "investor",
      company: "Venture Capital Partners",
      title: "Managing Partner",
      location: "Delhi",
      email: "priya@vcpartners.in",
      connectionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      isStarred: false
    },
    {
      id: 3,
      name: "Rahul Kapoor",
      role: "founder",
      company: "FinTech Solutions",
      title: "CTO",
      location: "Bangalore",
      email: "rahul@fintechsolutions.in",
      phone: "+91 87654 32109",
      connectionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
      isStarred: true
    },
    {
      id: 4,
      name: "Anjali Desai",
      role: "job_seeker",
      title: "Senior Software Engineer",
      location: "Hyderabad",
      email: "anjali.desai@gmail.com",
      connectionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      isStarred: false
    },
    {
      id: 5,
      name: "Arjun Singh",
      role: "explorer",
      company: "Tech Innovations Ltd",
      title: "Product Manager",
      location: "Pune",
      email: "arjun@techinnovations.com",
      connectionDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
      isStarred: false
    },
  ]);

  // Fetch contacts
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Load contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Toggle star status
  const toggleStar = (id: number) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, isStarred: !contact.isStarred } : contact
    ));
    
    toast({
      title: "Contact updated",
      description: `Contact ${contacts.find(c => c.id === id)?.isStarred ? "removed from" : "added to"} favorites.`
    });
  };

  // Remove contact
  const removeContact = () => {
    if (!contactToRemove) return;
    
    setContacts(contacts.filter(contact => contact.id !== contactToRemove.id));
    setContactToRemove(null);
    setShowRemoveDialog(false);
    
    toast({
      title: "Contact removed",
      description: "The contact has been removed from your network."
    });
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.location && contact.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      return b.connectionDate.getTime() - a.connectionDate.getTime();
    }
  });

  // Get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "founder":
        return "Founder";
      case "investor":
        return "Investor";
      case "job_seeker":
        return "Job Seeker";
      case "student":
        return "Student";
      case "explorer":
        return "Explorer";
      default:
        return role;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search contacts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSortBy("name")}
                className={sortBy === "name" ? "border-primary text-primary" : ""}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Name
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSortBy("recent")}
                className={sortBy === "recent" ? "border-primary text-primary" : ""}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Recent
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Contacts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedContacts.map(contact => (
                    <Card key={contact.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-start">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                              {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} />}
                            </Avatar>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-semibold">{contact.name}</h3>
                                  <p className="text-sm text-gray-600">
                                    {contact.title}{contact.company ? ` at ${contact.company}` : ''}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {contact.location && (
                                      <span className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {contact.location}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {getRoleDisplay(contact.role)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between">
                            <div className="text-xs text-gray-500">
                              Connected {formatDate(contact.connectionDate)}
                            </div>
                            <div>
                              {contact.isStarred && (
                                <Badge variant="secondary" className="text-xs">
                                  Favorite
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t flex">
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none py-2 h-10"
                            onClick={() => setShowContactDetails(contact)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none py-2 h-10"
                            asChild
                          >
                            <Link href={`/messages?contact=${contact.id}`}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="flex-1 rounded-none py-2 h-10"
                            onClick={() => toggleStar(contact.id)}
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill={contact.isStarred ? "currentColor" : "none"} 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              className="mr-2"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            {contact.isStarred ? "Starred" : "Star"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserX className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No contacts found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "Try a different search term" : "You haven't connected with anyone yet"}
                  </p>
                  {searchTerm ? (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  ) : (
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find people to connect
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedContacts.filter(c => c.isStarred).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedContacts
                    .filter(contact => contact.isStarred)
                    .map(contact => (
                      <Card key={contact.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4">
                            <div className="flex items-start">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                                {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} />}
                              </Avatar>
                              <div className="ml-3 flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="font-semibold">{contact.name}</h3>
                                    <p className="text-sm text-gray-600">
                                      {contact.title}{contact.company ? ` at ${contact.company}` : ''}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {contact.location && (
                                        <span className="flex items-center">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {contact.location}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="ml-2">
                                    {getRoleDisplay(contact.role)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-between">
                              <div className="text-xs text-gray-500">
                                Connected {formatDate(contact.connectionDate)}
                              </div>
                              <div>
                                <Badge variant="secondary" className="text-xs">
                                  Favorite
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t flex">
                            <Button 
                              variant="ghost" 
                              className="flex-1 rounded-none py-2 h-10"
                              onClick={() => setShowContactDetails(contact)}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="flex-1 rounded-none py-2 h-10"
                              asChild
                            >
                              <Link href={`/messages?contact=${contact.id}`}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="flex-1 rounded-none py-2 h-10"
                              onClick={() => toggleStar(contact.id)}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="currentColor" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="mr-2"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              Starred
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="mx-auto text-gray-300 mb-3"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h3 className="text-lg font-medium mb-1">No favorite contacts</h3>
                  <p className="text-gray-500 mb-4">
                    Star your important contacts to find them quickly
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Contact Details Dialog */}
      <Dialog open={!!showContactDetails} onOpenChange={() => setShowContactDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          
          {showContactDetails && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{showContactDetails.name.charAt(0)}</AvatarFallback>
                  {showContactDetails.avatarUrl && <AvatarImage src={showContactDetails.avatarUrl} />}
                </Avatar>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">{showContactDetails.name}</h3>
                  <p className="text-gray-600">
                    {showContactDetails.title}{showContactDetails.company ? ` at ${showContactDetails.company}` : ''}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {getRoleDisplay(showContactDetails.role)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                {showContactDetails.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <a href={`mailto:${showContactDetails.email}`} className="text-primary hover:underline">
                      {showContactDetails.email}
                    </a>
                  </div>
                )}
                
                {showContactDetails.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <a href={`tel:${showContactDetails.phone}`} className="text-primary hover:underline">
                      {showContactDetails.phone}
                    </a>
                  </div>
                )}
                
                {showContactDetails.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{showContactDetails.location}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{showContactDetails.title || "Not specified"}</span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/messages?contact=${showContactDetails.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Link>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <UserX className="h-4 w-4 mr-2" />
                      Remove Contact
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Contact</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {showContactDetails.name} from your contacts? 
                        This will also remove them from your network.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          setContactToRemove(showContactDetails);
                          setShowContactDetails(null);
                          removeContact();
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
