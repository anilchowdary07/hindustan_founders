import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Users, 
  BarChart, 
  PieChart, 
  FileText, 
  Calendar, 
  Mail, 
  ExternalLink,
  Download,
  ArrowRight
} from "lucide-react";

export default function InvestorRelationsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Investor Relations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access financial information, reports, and resources for current and prospective investors in the Hindustan Founders Network ecosystem.
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financial Reports</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="contact">Investor Contact</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">User Growth (YoY)</p>
                      <p className="text-2xl font-bold">+127%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Revenue Growth (YoY)</p>
                      <p className="text-2xl font-bold">+85%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Retention Rate</p>
                      <p className="text-2xl font-bold">92%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    User Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold">1.2M+</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Active Users</p>
                      <p className="text-2xl font-bold">850K+</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Premium Subscribers</p>
                      <p className="text-2xl font-bold">125K+</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart className="mr-2 h-5 w-5 text-primary" />
                    Financial Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Annual Revenue</p>
                      <p className="text-2xl font-bold">₹125 Cr</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gross Margin</p>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cash Reserves</p>
                      <p className="text-2xl font-bold">₹350 Cr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
                <CardDescription>
                  Key information about Hindustan Founders Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">About Us</h3>
                    <p className="text-gray-600">
                      Hindustan Founders Network is India's premier professional network for entrepreneurs, 
                      startup founders, and business professionals. Founded in 2020, we've grown to become 
                      the leading platform for business networking, knowledge sharing, and professional 
                      growth in the Indian startup ecosystem.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Business Model</h3>
                    <p className="text-gray-600 mb-4">
                      Our business operates on a freemium model with multiple revenue streams:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Premium subscriptions for enhanced networking features</li>
                      <li>Enterprise solutions for companies and organizations</li>
                      <li>Recruitment and job posting services</li>
                      <li>Event sponsorships and partnerships</li>
                      <li>Advertising and promotional opportunities</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Leadership Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {[
                        { name: "Rajiv Sharma", role: "Founder & CEO", image: "https://randomuser.me/api/portraits/men/32.jpg" },
                        { name: "Priya Patel", role: "COO", image: "https://randomuser.me/api/portraits/women/44.jpg" },
                        { name: "Vikram Mehta", role: "CTO", image: "https://randomuser.me/api/portraits/men/68.jpg" },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.image} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Highlights</CardTitle>
                <CardDescription>
                  Why invest in Hindustan Founders Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                      Market Leadership
                    </h3>
                    <p className="text-gray-600">
                      #1 professional network for entrepreneurs in India with over 1.2 million users and growing rapidly.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <PieChart className="mr-2 h-5 w-5 text-primary" />
                      Strong Unit Economics
                    </h3>
                    <p className="text-gray-600">
                      78% gross margins with improving operational efficiency and clear path to profitability.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Premium User Growth
                    </h3>
                    <p className="text-gray-600">
                      125,000+ premium subscribers with 92% annual retention rate and expanding feature set.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center">
                      <BarChart className="mr-2 h-5 w-5 text-primary" />
                      Diversified Revenue
                    </h3>
                    <p className="text-gray-600">
                      Multiple revenue streams including subscriptions, enterprise solutions, and recruitment services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Reports Tab */}
          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Access our quarterly and annual financial reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Annual Reports</h3>
                    <div className="space-y-4">
                      {[
                        { year: "2024", date: "March 31, 2024" },
                        { year: "2023", date: "March 31, 2023" },
                        { year: "2022", date: "March 31, 2022" },
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <p className="font-medium">Annual Report {report.year}</p>
                              <p className="text-sm text-gray-500">Published: {report.date}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Quarterly Reports</h3>
                    <div className="space-y-4">
                      {[
                        { quarter: "Q1 2024", date: "April 30, 2024" },
                        { quarter: "Q4 2023", date: "January 31, 2024" },
                        { quarter: "Q3 2023", date: "October 31, 2023" },
                        { quarter: "Q2 2023", date: "July 31, 2023" },
                      ].map((report, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <p className="font-medium">{report.quarter} Financial Results</p>
                              <p className="text-sm text-gray-500">Published: {report.date}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Investor Presentations</h3>
                    <div className="space-y-4">
                      {[
                        { title: "Investor Day 2024", date: "February 15, 2024" },
                        { title: "Growth Strategy Presentation", date: "November 10, 2023" },
                        { title: "Series C Funding Deck", date: "July 5, 2023" },
                      ].map((presentation, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <p className="font-medium">{presentation.title}</p>
                              <p className="text-sm text-gray-500">Published: {presentation.date}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Board of Directors</CardTitle>
                <CardDescription>
                  Meet our board members who provide strategic guidance and oversight
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      name: "Rajiv Sharma", 
                      role: "Chairman & CEO", 
                      image: "https://randomuser.me/api/portraits/men/32.jpg",
                      bio: "Founder of Hindustan Founders Network with 20+ years of experience in technology and entrepreneurship."
                    },
                    { 
                      name: "Anita Desai", 
                      role: "Independent Director", 
                      image: "https://randomuser.me/api/portraits/women/68.jpg",
                      bio: "Former CEO of a major tech company with expertise in scaling businesses across Asian markets."
                    },
                    { 
                      name: "Sanjay Mehta", 
                      role: "Independent Director", 
                      image: "https://randomuser.me/api/portraits/men/45.jpg",
                      bio: "Angel investor with 50+ investments and deep expertise in financial markets and corporate governance."
                    },
                    { 
                      name: "Lakshmi Iyer", 
                      role: "Independent Director", 
                      image: "https://randomuser.me/api/portraits/women/33.jpg",
                      bio: "Seasoned executive with background in regulatory compliance and corporate law."
                    },
                  ].map((director, index) => (
                    <div key={index} className="flex space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={director.image} alt={director.name} />
                        <AvatarFallback>{director.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{director.name}</p>
                        <p className="text-sm text-primary font-medium">{director.role}</p>
                        <p className="text-sm text-gray-600 mt-2">{director.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Corporate Governance</CardTitle>
                <CardDescription>
                  Our commitment to ethical business practices and transparency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Governance Framework</h3>
                    <p className="text-gray-600">
                      Hindustan Founders Network is committed to maintaining the highest standards of corporate governance. 
                      Our governance framework is designed to ensure transparency, accountability, and ethical business practices 
                      across all operations.
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Board Committees</h3>
                    <div className="space-y-4 mt-4">
                      <div>
                        <p className="font-medium">Audit Committee</p>
                        <p className="text-sm text-gray-600">
                          Oversees financial reporting, internal controls, and compliance with laws and regulations.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Compensation Committee</p>
                        <p className="text-sm text-gray-600">
                          Reviews and approves executive compensation and ensures alignment with company performance.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Nomination and Governance Committee</p>
                        <p className="text-sm text-gray-600">
                          Identifies and evaluates potential board members and oversees corporate governance practices.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Governance Documents</h3>
                    <div className="space-y-3 mt-4">
                      {[
                        "Code of Business Conduct and Ethics",
                        "Corporate Governance Guidelines",
                        "Board Committee Charters",
                        "Whistleblower Policy",
                        "Related Party Transaction Policy",
                      ].map((document, index) => (
                        <div key={index} className="flex items-center">
                          <FileText className="h-4 w-4 text-primary mr-2" />
                          <a href="#" className="text-primary hover:underline">{document}</a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ESG Initiatives</CardTitle>
                <CardDescription>
                  Our commitment to environmental, social, and governance responsibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Environmental Impact</h3>
                    <p className="text-gray-600 mb-4">
                      We're committed to minimizing our environmental footprint through:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Carbon-neutral operations by 2025</li>
                      <li>100% renewable energy for our data centers</li>
                      <li>Sustainable office practices and waste reduction</li>
                      <li>Remote-first work policy to reduce commuting emissions</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Social Responsibility</h3>
                    <p className="text-gray-600 mb-4">
                      Our social initiatives focus on:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Digital inclusion programs for underserved communities</li>
                      <li>Entrepreneurship training for women and rural youth</li>
                      <li>Diversity and inclusion in hiring and promotion</li>
                      <li>Mental health and wellbeing support for employees</li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Governance Practices</h3>
                    <p className="text-gray-600 mb-4">
                      Our governance framework ensures:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-600">
                      <li>Transparent reporting and disclosure</li>
                      <li>Strong data privacy and security measures</li>
                      <li>Ethical business practices and anti-corruption policies</li>
                      <li>Regular board evaluation and continuous improvement</li>
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Button>
                      Download ESG Report
                      <Download className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investor Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Investor Relations Contact</CardTitle>
                <CardDescription>
                  Get in touch with our investor relations team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-gray-600">investors@hindustanfounders.com</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <p className="font-medium">Investor Call Schedule</p>
                            <p className="text-gray-600">Quarterly earnings calls are held within two weeks after the end of each quarter</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Investor Relations Team</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            name: "Anil Kumar", 
                            role: "Head of Investor Relations", 
                            image: "https://randomuser.me/api/portraits/men/42.jpg",
                            email: "anil.kumar@hindustanfounders.com"
                          },
                          { 
                            name: "Meera Reddy", 
                            role: "Investor Relations Manager", 
                            image: "https://randomuser.me/api/portraits/women/52.jpg",
                            email: "meera.reddy@hindustanfounders.com"
                          },
                        ].map((member, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.image} alt={member.name} />
                              <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">{member.role}</p>
                              <p className="text-sm text-primary">{member.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
                      <div className="space-y-4">
                        {[
                          { 
                            title: "Q2 2024 Earnings Call", 
                            date: "July 25, 2024",
                            time: "2:00 PM IST"
                          },
                          { 
                            title: "Annual Investor Day", 
                            date: "September 15, 2024",
                            time: "10:00 AM - 4:00 PM IST"
                          },
                        ].map((event, index) => (
                          <div key={index} className="flex items-start">
                            <Calendar className="h-5 w-5 text-primary mr-3 mt-0.5" />
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Investor Inquiry Form</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input 
                          type="email" 
                          className="w-full p-2 border rounded-md"
                          placeholder="Your email address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Organization</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border rounded-md"
                          placeholder="Your company or organization"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Inquiry Type</label>
                        <select className="w-full p-2 border rounded-md">
                          <option>Financial Information</option>
                          <option>Investment Opportunities</option>
                          <option>Corporate Governance</option>
                          <option>ESG Initiatives</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <textarea 
                          className="w-full p-2 border rounded-md h-32"
                          placeholder="Please provide details about your inquiry"
                        ></textarea>
                      </div>
                      <div className="pt-2">
                        <Button className="w-full">
                          Submit Inquiry
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Resources Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Press Releases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Series C Funding Announcement</p>
                  <p className="text-sm text-gray-500">May 10, 2024</p>
                </div>
                <div>
                  <p className="font-medium">Partnership with Leading Tech Accelerator</p>
                  <p className="text-sm text-gray-500">April 22, 2024</p>
                </div>
                <div>
                  <p className="font-medium">Launch of Enterprise Solutions</p>
                  <p className="text-sm text-gray-500">March 15, 2024</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Press Releases
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Analyst Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Growth Equity Research Report</p>
                  <p className="text-sm text-gray-500">By Capital Insights • April 2024</p>
                </div>
                <div>
                  <p className="font-medium">Tech Platform Market Analysis</p>
                  <p className="text-sm text-gray-500">By TechMarket Research • March 2024</p>
                </div>
                <div>
                  <p className="font-medium">Indian SaaS Sector Report</p>
                  <p className="text-sm text-gray-500">By Global Ventures • February 2024</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All Analyst Reports
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">FAQ for Investors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">How can I invest in Hindustan Founders Network?</p>
                  <p className="text-sm text-gray-500">Information about current investment opportunities</p>
                </div>
                <div>
                  <p className="font-medium">What is your dividend policy?</p>
                  <p className="text-sm text-gray-500">Details about our approach to shareholder returns</p>
                </div>
                <div>
                  <p className="font-medium">How do you approach growth vs. profitability?</p>
                  <p className="text-sm text-gray-500">Our strategic financial priorities</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View All FAQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-primary text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                <p className="mb-4">
                  Subscribe to our investor newsletter to receive the latest updates, financial reports, and news about Hindustan Founders Network.
                </p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 p-2 rounded-md text-black"
                />
                <Button variant="secondary">Subscribe</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}