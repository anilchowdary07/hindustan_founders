import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, Mail, MessageSquare, HelpCircle, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HelpPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the form data to an API
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond shortly.",
    });
    
    // Reset form
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  // FAQ data
  const faqCategories = [
    {
      id: "account",
      title: "Account & Profile",
      questions: [
        {
          id: "create-account",
          question: "How do I create an account?",
          answer: "To create an account, click on the 'Sign Up' button on the login page. You'll need to provide your name, email, and create a password. You can also sign up using your Google or LinkedIn account for faster registration."
        },
        {
          id: "edit-profile",
          question: "How do I edit my profile?",
          answer: "To edit your profile, go to your profile page by clicking on your avatar in the top right corner and selecting 'View Profile'. Then click the 'Edit Profile' button to update your information, including your bio, experience, education, and skills."
        },
        {
          id: "change-password",
          question: "How do I change my password?",
          answer: "To change your password, go to Settings & Privacy from the dropdown menu under your profile picture. In the Account section, you'll find the option to change your password. You'll need to enter your current password for verification."
        },
        {
          id: "delete-account",
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account by going to Settings & Privacy, then to the Account section. At the bottom, you'll find the option to delete your account. Please note that this action is permanent and all your data will be removed from our platform."
        }
      ]
    },
    {
      id: "networking",
      title: "Networking & Connections",
      questions: [
        {
          id: "find-connections",
          question: "How do I find and connect with other founders?",
          answer: "You can find other founders through the Network page, which allows you to filter by industry, location, and interests. Once you find someone you'd like to connect with, send them a connection request with a personalized message."
        },
        {
          id: "connection-requests",
          question: "Where can I see my connection requests?",
          answer: "You can view your connection requests in the Notifications section. Click on the bell icon in the top navigation bar to see all your notifications, including connection requests."
        },
        {
          id: "messaging",
          question: "How do I message someone?",
          answer: "You can message your connections by going to the Messages page or by clicking on the message icon on a person's profile. You can send direct messages to individuals or create group conversations."
        }
      ]
    },
    {
      id: "events",
      title: "Events & Opportunities",
      questions: [
        {
          id: "create-event",
          question: "How do I create an event?",
          answer: "To create an event, go to the Events page and click on the 'Create Event' button. Fill in the event details including title, date, time, location, and description. You can also specify if it's a virtual event and set attendance limits."
        },
        {
          id: "register-event",
          question: "How do I register for an event?",
          answer: "To register for an event, go to the Events page, find the event you're interested in, and click on the 'Register' button. You'll receive a confirmation email with the event details and any necessary instructions."
        },
        {
          id: "pitch-idea",
          question: "How do I pitch my startup idea?",
          answer: "You can pitch your startup idea in the Pitch Room. Go to the Pitch Room page and click on 'Create Pitch'. Fill in the details about your idea, including the problem you're solving, your solution, target market, and funding needs."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      questions: [
        {
          id: "browser-compatibility",
          question: "Which browsers are supported?",
          answer: "Our platform works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience."
        },
        {
          id: "mobile-app",
          question: "Is there a mobile app?",
          answer: "Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store by searching for 'Hindustan Founders Network'."
        },
        {
          id: "notifications",
          question: "How do I manage my notification settings?",
          answer: "You can manage your notification settings by going to Settings & Privacy, then to the Notifications section. Here you can choose which types of notifications you want to receive and how you want to receive them (email, push, or in-app)."
        }
      ]
    }
  ];

  // Filter FAQs based on search query
  const filteredFAQs = searchQuery === "" 
    ? faqCategories 
    : faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0);

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to your questions and get support
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="faq">
              <HelpCircle className="mr-2 h-4 w-4" />
              Frequently Asked Questions
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileText className="mr-2 h-4 w-4" />
              Help Resources
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No results found</h3>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your search terms</p>
              </div>
            ) : (
              filteredFAQs.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>
                      Common questions about {category.title.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Fill out the form below and our support team will get back to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={contactForm.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={contactForm.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Guides</CardTitle>
                  <CardDescription>
                    Comprehensive guides to help you navigate the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Getting Started Guide</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        A complete walkthrough for new users
                      </p>
                      <Button variant="link" className="h-auto p-0">
                        Read Guide <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Networking Best Practices</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Tips for effective networking on the platform
                      </p>
                      <Button variant="link" className="h-auto p-0">
                        Read Guide <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Pitch Room Tutorial</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Learn how to create effective pitches
                      </p>
                      <Button variant="link" className="h-auto p-0">
                        Read Guide <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Video Tutorials</CardTitle>
                  <CardDescription>
                    Watch step-by-step video guides
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Platform Overview</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        A quick tour of all platform features
                      </p>
                      <Button variant="link" className="h-auto p-0">
                        Watch Video <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Creating Your First Event</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Learn how to set up and manage events
                      </p>
                      <Button variant="link" className="h-auto p-0">
                        Watch Video <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MessageSquare className="h-5 w-5 mr-3 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Using Analytics Dashboard</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Get insights from your network data
                      </p>
                      <Button variant="link" className="h-auto p-0">
                        Watch Video <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}