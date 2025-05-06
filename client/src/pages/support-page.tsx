import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Mail, MessageSquare, Phone, User, MessageCircle, Loader2, Check, TicketIcon, FileText } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("help");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setSubject("");
        setMessage("");
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  const faqItems = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Sign Up' button in the top right corner of the homepage. Fill in your details including your name, email, and password. You'll receive a verification email to confirm your account."
    },
    {
      question: "How do I connect with other founders?",
      answer: "You can connect with other founders by visiting the Network page and searching for founders based on industry, location, or interests. Once you find someone you'd like to connect with, send them a connection request with a personalized message."
    },
    {
      question: "How do I post a job?",
      answer: "To post a job, go to the Jobs page and click on the 'Post a Job' button. Fill in the job details including title, description, requirements, and application instructions. Your job posting will be reviewed and published within 24 hours."
    },
    {
      question: "How do I update my profile?",
      answer: "You can update your profile by clicking on your profile picture in the top right corner and selecting 'Settings' from the dropdown menu. From there, you can edit your personal information, professional experience, and preferences."
    },
    {
      question: "How do I find funding opportunities?",
      answer: "You can find funding opportunities by going to the Resources page and clicking on the 'Funding' tab. This will show you a list of VC firms, angel investors, and grants that are currently accepting applications from founders."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take data security very seriously. All data is encrypted both in transit and at rest. We never share your personal information with third parties without your explicit consent. For more information, please see our Privacy Policy."
    },
    {
      question: "How can I delete my account?",
      answer: "To delete your account, go to Settings > Account > Delete Account. Please note that this action cannot be undone and all your data will be permanently deleted from our systems."
    },
    {
      question: "What happens if I find inappropriate content?",
      answer: "If you find any content that violates our community guidelines, please report it immediately by clicking on the 'Report' button next to the content. Our moderation team will review the report and take appropriate action."
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get answers to your questions, find resources, or contact our support team for assistance.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="help" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Us
              </TabsTrigger>
              <TabsTrigger value="community" className="data-[state=active]:bg-white data-[state=active]:text-primary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Community
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="help" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">FAQs</CardTitle>
                  <CardDescription>Find answers to common questions</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 justify-center">
                  <Button variant="ghost" className="text-primary" onClick={() => navigate('/faq')}>
                    Browse FAQs
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <TicketIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Support Tickets</CardTitle>
                  <CardDescription>Submit and track support requests</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 justify-center">
                  <Button variant="ghost" className="text-primary" onClick={() => navigate('/support-tickets')}>
                    View Tickets
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Email Support</CardTitle>
                  <CardDescription>Get help via email</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 justify-center">
                  <Button variant="ghost" className="text-primary" onClick={() => setActiveTab("contact")}>
                    Contact Support
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Phone Support</CardTitle>
                  <CardDescription>Speak with a support agent</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 justify-center">
                  <Button variant="ghost" className="text-primary">
                    +91 (011) 2345-6789
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card className="bg-white border-gray-200 shadow-sm" id="faqs">
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Browse common questions and answers to help you get started with Hindustan Founders Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-left font-medium text-gray-900">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <p className="text-sm text-gray-500">
                  Cannot find what you are looking for? {" "}
                  <Button variant="link" className="h-auto p-0 text-primary" onClick={() => setActiveTab("contact")}>
                    Contact our support team
                  </Button>
                </p>
              </CardFooter>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Resources</CardTitle>
                <CardDescription>
                  Helpful guides and tutorials to get the most out of Hindustan Founders Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">Getting Started Guide</h3>
                    <p className="text-sm text-gray-600 mb-4">Learn how to set up your profile and start connecting with other founders</p>
                    <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">Networking Tips</h3>
                    <p className="text-sm text-gray-600 mb-4">Best practices for building meaningful connections with other entrepreneurs</p>
                    <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">Funding Resources</h3>
                    <p className="text-sm text-gray-600 mb-4">How to find and apply for funding opportunities through our platform</p>
                    <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">Pitch Deck Templates</h3>
                    <p className="text-sm text-gray-600 mb-4">Download professionally designed pitch deck templates for your startup</p>
                    <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">Job Posting Guide</h3>
                    <p className="text-sm text-gray-600 mb-4">Tips for writing effective job postings that attract top talent</p>
                    <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                  </div>
                  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900 mb-2">Event Planning</h3>
                    <p className="text-sm text-gray-600 mb-4">How to organize and promote networking events for the founder community</p>
                    <Button variant="outline" size="sm" className="w-full">View Guide</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Contact Us</CardTitle>
                  <CardDescription>
                    Fill out the form below to get in touch with our support team. We'll respond as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="How can we help you?"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please describe your issue or question in detail..."
                        rows={5}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting || isSuccess}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : isSuccess ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Sent!
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <div className="space-y-8">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Email</h3>
                        <p className="text-gray-600">support@hindustanfounders.com</p>
                        <p className="text-sm text-gray-500 mt-1">We aim to respond within 24 hours</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Phone</h3>
                        <p className="text-gray-600">+91 (011) 2345-6789</p>
                        <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9:00 AM to 6:00 PM IST</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">Office</h3>
                        <p className="text-gray-600">
                          Hindustan Founders Network<br />
                          91 Springboard, Koramangala<br />
                          Bangalore, 560034<br />
                          India
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Helpful Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="link" className="text-primary p-0 h-auto w-full justify-start" onClick={() => navigate('/privacy-policy')}>Privacy Policy</Button>
                    <Button variant="link" className="text-primary p-0 h-auto w-full justify-start" onClick={() => navigate('/terms-of-service')}>Terms of Service</Button>
                    <Button variant="link" className="text-primary p-0 h-auto w-full justify-start" onClick={() => navigate('/faq')}>Frequently Asked Questions</Button>
                    <Button variant="link" className="text-primary p-0 h-auto w-full justify-start" onClick={() => navigate('/help')}>Help Center</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-8">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Community Forum</CardTitle>
                <CardDescription>
                  Connect with other founders, ask questions, and share your experiences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mb-4 bg-primary/10 p-4 rounded-full inline-block">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Join the Conversation</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Join our active community forum to connect with other founders, share insights, and get answers to your questions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Input 
                      placeholder="Enter your email" 
                      className="max-w-xs mx-auto sm:mx-0"
                    />
                    <Button>Notify Me</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Connect on Social Media</CardTitle>
                <CardDescription>
                  Follow us on social media for updates, tips, and community highlights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-12">
                    Twitter
                  </Button>
                  <Button variant="outline" className="h-12">
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="h-12">
                    Facebook
                  </Button>
                  <Button variant="outline" className="h-12">
                    Instagram
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
