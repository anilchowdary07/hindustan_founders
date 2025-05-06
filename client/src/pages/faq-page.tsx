import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, HelpCircle, Users, Briefcase, Lightbulb, Settings, Shield, CreditCard } from "lucide-react";

// FAQ data structure
interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: JSX.Element;
  questions: FAQ[];
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  
  // FAQ categories with questions
  const faqCategories: FAQCategory[] = [
    {
      id: "account",
      title: "Account & Profile",
      icon: <Users className="h-5 w-5" />,
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
        },
        {
          id: "profile-visibility",
          question: "Who can see my profile?",
          answer: "By default, your profile is visible to all registered users on the platform. You can adjust your privacy settings in the Settings & Privacy section to control who can see different parts of your profile."
        }
      ]
    },
    {
      id: "networking",
      title: "Networking & Connections",
      icon: <Users className="h-5 w-5" />,
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
        },
        {
          id: "remove-connection",
          question: "How do I remove a connection?",
          answer: "To remove a connection, go to the person's profile, click on the 'Connected' button, and select 'Remove Connection' from the dropdown menu. The person will not be notified when you remove them as a connection."
        },
        {
          id: "network-recommendations",
          question: "How are network recommendations generated?",
          answer: "Network recommendations are generated based on your profile information, industry, skills, mutual connections, and interaction patterns. The more complete your profile is, the better our recommendations will be."
        }
      ]
    },
    {
      id: "pitches",
      title: "Pitches & Funding",
      icon: <Lightbulb className="h-5 w-5" />,
      questions: [
        {
          id: "create-pitch",
          question: "How do I create a pitch?",
          answer: "To create a pitch, go to the Pitch Room and click on the 'Create Pitch' button. You'll need to provide information about your startup idea, including the problem you're solving, your solution, target market, business model, and funding requirements."
        },
        {
          id: "edit-pitch",
          question: "Can I edit my pitch after publishing it?",
          answer: "Yes, you can edit your pitch after publishing it. Go to the Pitch Room, find your pitch, and click on the 'Edit' button. Keep in mind that major changes to an active pitch might affect its credibility with investors who have already viewed it."
        },
        {
          id: "pitch-visibility",
          question: "Who can see my pitch?",
          answer: "By default, your pitch is visible to all registered users on the platform. You can adjust the visibility settings when creating or editing your pitch to make it visible only to investors, specific groups, or keep it private and share it selectively."
        },
        {
          id: "investor-interest",
          question: "How will I know if an investor is interested in my pitch?",
          answer: "When an investor expresses interest in your pitch, you'll receive a notification. You can view all investor interests in the 'Interests' tab of your pitch dashboard. From there, you can respond and schedule meetings with interested investors."
        },
        {
          id: "funding-rounds",
          question: "How do I indicate my funding round on my pitch?",
          answer: "When creating or editing your pitch, you can specify your current funding round (pre-seed, seed, Series A, etc.) in the 'Funding' section. This helps investors understand what stage your startup is at and what level of investment you're seeking."
        }
      ]
    },
    {
      id: "jobs",
      title: "Jobs & Recruitment",
      icon: <Briefcase className="h-5 w-5" />,
      questions: [
        {
          id: "post-job",
          question: "How do I post a job?",
          answer: "To post a job, go to the Jobs page and click on the 'Post a Job' button. Fill in the job details including title, description, requirements, and application instructions. You can also specify whether it's remote, hybrid, or on-site."
        },
        {
          id: "edit-job",
          question: "Can I edit a job posting after publishing it?",
          answer: "Yes, you can edit your job posting after publishing it. Go to the Jobs page, find your job listing under 'My Job Postings', and click on the 'Edit' button. You can update any details as needed."
        },
        {
          id: "job-visibility",
          question: "How long will my job posting be visible?",
          answer: "Standard job postings remain visible for 30 days. Premium members can extend this period or set custom visibility durations. You can also manually close a job posting at any time if the position has been filled."
        },
        {
          id: "manage-applications",
          question: "How do I manage job applications?",
          answer: "You can manage job applications through the 'Applications' tab in your job posting dashboard. From there, you can review applicants, download resumes, mark candidates as shortlisted or rejected, and communicate with applicants directly."
        },
        {
          id: "job-alerts",
          question: "How do I set up job alerts?",
          answer: "To set up job alerts, go to the Jobs page and click on 'Create Job Alert'. You can specify your job preferences including role, industry, location, and salary range. You'll receive notifications when new jobs matching your criteria are posted."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: <Settings className="h-5 w-5" />,
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
        },
        {
          id: "data-export",
          question: "Can I export my data?",
          answer: "Yes, you can request a download of your data by going to Settings & Privacy, then to the Data Privacy section. Click on 'Download Your Data' and select which information you want to include in the export. The data will be provided in a downloadable format."
        },
        {
          id: "technical-issues",
          question: "What should I do if I encounter a technical issue?",
          answer: "If you encounter a technical issue, first try refreshing the page or clearing your browser cache. If the problem persists, please report it through the Help Center by clicking on 'Report a Bug' and providing details about the issue, including screenshots if possible."
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          id: "data-usage",
          question: "How is my data used?",
          answer: "We use your data to provide and improve our services, personalize your experience, and connect you with relevant opportunities. We do not sell your personal information to third parties. For detailed information, please refer to our Privacy Policy."
        },
        {
          id: "data-security",
          question: "How is my data protected?",
          answer: "We implement industry-standard security measures to protect your data, including encryption, secure servers, regular security audits, and strict access controls. We also comply with relevant data protection regulations."
        },
        {
          id: "privacy-controls",
          question: "What privacy controls do I have?",
          answer: "You have several privacy controls available in the Settings & Privacy section, including the ability to control who can see your profile, who can send you connection requests, and whether your profile appears in search results. You can also manage your data and request deletion."
        },
        {
          id: "report-violation",
          question: "How do I report a privacy violation or inappropriate content?",
          answer: "You can report privacy violations or inappropriate content by clicking the 'Report' button that appears next to content or on user profiles. Alternatively, you can contact our support team through the Help Center with details about the violation."
        },
        {
          id: "two-factor",
          question: "Does the platform support two-factor authentication?",
          answer: "Yes, we support two-factor authentication (2FA) to add an extra layer of security to your account. You can enable 2FA in the Security section of your Settings & Privacy page. We recommend using an authenticator app for the most secure experience."
        }
      ]
    },
    {
      id: "billing",
      title: "Billing & Subscription",
      icon: <CreditCard className="h-5 w-5" />,
      questions: [
        {
          id: "subscription-plans",
          question: "What subscription plans are available?",
          answer: "We offer several subscription plans: Free, Basic, Premium, and Enterprise. Each plan includes different features and benefits. You can view the details of each plan on our Pricing page."
        },
        {
          id: "change-plan",
          question: "How do I change my subscription plan?",
          answer: "To change your subscription plan, go to Settings & Privacy, then to the Billing section. Click on 'Manage Subscription' and select the plan you want to switch to. If you're upgrading, the change will take effect immediately. If you're downgrading, the change will take effect at the end of your current billing cycle."
        },
        {
          id: "payment-methods",
          question: "What payment methods are accepted?",
          answer: "We accept major credit and debit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans. For Enterprise plans, we also offer invoice-based payments."
        },
        {
          id: "refund-policy",
          question: "What is your refund policy?",
          answer: "We offer a 14-day money-back guarantee for new subscriptions. If you're not satisfied with our service, you can request a refund within 14 days of your initial purchase. For subsequent billing cycles, we do not provide refunds for partial months."
        },
        {
          id: "invoice-receipt",
          question: "How do I get an invoice or receipt?",
          answer: "Invoices and receipts are automatically generated and sent to your registered email address after each payment. You can also access all your billing documents in the Billing section of your Settings & Privacy page."
        }
      ]
    }
  ];

  // Get all FAQs for the "All" category
  const allFAQs = faqCategories.flatMap(category => 
    category.questions.map(q => ({ ...q, categoryId: category.id }))
  );

  // Filter FAQs based on search query and active category
  const filteredFAQs = allFAQs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || faq.categoryId === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group filtered FAQs by category for display
  const groupedFilteredFAQs = faqCategories
    .map(category => ({
      ...category,
      questions: filteredFAQs.filter(faq => faq.categoryId === category.id)
    }))
    .filter(category => category.questions.length > 0);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset expanded state when search changes
    setExpandedFAQs([]);
  };

  // Auto-expand first few FAQs when search is performed
  useEffect(() => {
    if (searchQuery) {
      // Expand the first 3 matching FAQs
      const firstFewFAQs = filteredFAQs.slice(0, 3).map(faq => faq.id);
      setExpandedFAQs(firstFewFAQs);
    }
  }, [searchQuery, filteredFAQs]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about using the Hindustan Founders Network platform
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10 py-6 text-lg"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs 
          value={activeCategory} 
          onValueChange={setActiveCategory}
          className="mb-8"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                <HelpCircle className="h-4 w-4 mr-2" />
                All Topics
              </TabsTrigger>
              
              {faqCategories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-white"
                >
                  {category.icon}
                  <span className="ml-2 hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* All FAQs Tab */}
          <TabsContent value="all">
            {searchQuery && filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-xl font-medium">No results found</h3>
                <p className="mt-2 text-gray-500">
                  We couldn't find any FAQs matching "{searchQuery}"
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedFilteredFAQs.map(category => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {category.icon}
                        <CardTitle>{category.title}</CardTitle>
                      </div>
                      <CardDescription>
                        Common questions about {category.title.toLowerCase()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion 
                        type="multiple" 
                        value={expandedFAQs}
                        onValueChange={setExpandedFAQs}
                        className="w-full"
                      >
                        {category.questions.map(faq => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="prose prose-sm max-w-none text-gray-600">
                                {faq.answer}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Individual Category Tabs */}
          {faqCategories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {category.icon}
                    <CardTitle>{category.title}</CardTitle>
                  </div>
                  <CardDescription>
                    Common questions about {category.title.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="mx-auto h-10 w-10 text-gray-300" />
                      <h3 className="mt-3 text-lg font-medium">No results found</h3>
                      <p className="mt-1 text-gray-500">
                        We couldn't find any FAQs in this category matching "{searchQuery}"
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-3"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <Accordion 
                      type="multiple" 
                      value={expandedFAQs}
                      onValueChange={setExpandedFAQs}
                      className="w-full"
                    >
                      {filteredFAQs
                        .filter(faq => faq.categoryId === category.id)
                        .map(faq => (
                          <AccordionItem key={faq.id} value={faq.id}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="prose prose-sm max-w-none text-gray-600">
                                {faq.answer}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      }
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Still Need Help Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Please contact our support team or submit a support ticket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => window.location.href = '/contact'}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/support-tickets'}>
              Submit a Ticket
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}