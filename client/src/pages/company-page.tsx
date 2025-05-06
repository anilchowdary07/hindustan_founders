import { useState, useEffect } from "react";
import { useParams } from "wouter";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, MapPin, Globe, Users, Calendar, Briefcase, 
  Edit, Share2, Bell, BellOff, MessageSquare, ExternalLink
} from "lucide-react";

export default function CompanyPage() {
  const params = useParams();
  const companyId = params.id;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock company data
  const company = {
    id: companyId,
    name: companyId === "thevedicherbs" ? "The Vedic Herbs" : "Company Name",
    logo: "",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    description: "A leading company in the herbal supplements industry, focused on bringing ancient Ayurvedic remedies to modern consumers through scientifically validated products.",
    website: "https://www.thevedicherbs.com",
    founded: "2018",
    size: "51-200 employees",
    industry: "Health & Wellness",
    headquarters: "Bangalore, India",
    specialties: ["Ayurvedic Products", "Herbal Supplements", "Natural Remedies", "Wellness"],
    followers: 3245,
  };
  
  // Mock employees
  const employees = [
    {
      id: 1,
      name: "Rajesh Kumar",
      title: "Founder & CEO",
      avatarUrl: "",
    },
    {
      id: 2,
      name: "Priya Sharma",
      title: "Chief Marketing Officer",
      avatarUrl: "",
    },
    {
      id: 3,
      name: "Vikram Singh",
      title: "Head of Product",
      avatarUrl: "",
    },
  ];
  
  // Mock posts
  const posts = [
    {
      id: 1,
      content: "We're excited to announce the launch of our new product line focused on immunity boosting supplements! #Health #Wellness",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      likes: 45,
      comments: 12,
    },
    {
      id: 2,
      content: "The Vedic Herbs is proud to be recognized as one of the top 50 startups in the health and wellness sector by Business Today magazine.",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      likes: 89,
      comments: 24,
    },
  ];
  
  // Mock jobs
  const jobs = [
    {
      id: 1,
      title: "Senior Marketing Manager",
      location: "Bangalore, India",
      type: "Full-time",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    },
    {
      id: 2,
      title: "Product Development Specialist",
      location: "Remote",
      type: "Full-time",
      postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
  ];
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };
  
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
      <div className="max-w-5xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 rounded-b-lg overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img 
              src={company.coverImage} 
              alt={`${company.name} cover`} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Company Info */}
        <div className="relative px-4 md:px-0">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 mb-6">
            <div className="z-10 h-24 w-24 md:h-32 md:w-32 rounded-lg border-4 border-white bg-white shadow-md overflow-hidden">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <Avatar className="h-full w-full">
                  <AvatarImage src={company.logo} alt={company.name} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {getInitials(company.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="flex-1 mt-4 md:mt-0 md:ml-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold">{company.name}</h1>
                  <p className="text-gray-600">{company.industry} • {company.followers} followers</p>
                </>
              )}
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              {isLoading ? (
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              ) : (
                <>
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                    className="gap-1"
                  >
                    {isFollowing ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({
                        title: "Link copied",
                        description: "Company profile link copied to clipboard",
                      });
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      window.location.href = `/messaging?company=${company.id}`;
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="px-4 md:px-0">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-3">Overview</h2>
                      <p className="text-gray-700 mb-6">{company.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              {company.website.replace('https://', '')}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Building2 className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Industry</p>
                            <p className="text-gray-700">{company.industry}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Users className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Company size</p>
                            <p className="text-gray-700">{company.size}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Headquarters</p>
                            <p className="text-gray-700">{company.headquarters}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                          <div>
                            <p className="font-medium">Founded</p>
                            <p className="text-gray-700">{company.founded}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-3">Specialties</h2>
                      <div className="flex flex-wrap gap-2">
                        {company.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="posts">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <Card key={post.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start mb-4">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarImage src={company.logo} alt={company.name} />
                            <AvatarFallback className="bg-primary text-white">
                              {getInitials(company.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{company.name}</h3>
                            <p className="text-sm text-gray-500">{formatDate(post.postedAt)}</p>
                          </div>
                        </div>
                        <p className="mb-4">{post.content}</p>
                        <div className="flex justify-between text-sm text-gray-500 pt-3 border-t">
                          <span>{post.likes} likes • {post.comments} comments</span>
                          <div className="flex gap-4">
                            <button className="hover:text-primary" onClick={() => alert('Liked!')}>Like</button>
                            <button className="hover:text-primary" onClick={() => alert('Comment!')}>Comment</button>
                            <button className="hover:text-primary" onClick={() => alert('Shared!')}>Share</button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="jobs">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-primary hover:underline cursor-pointer">
                              {job.title}
                            </h3>
                            <p className="text-gray-700">{company.name}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                              <span className="mx-2">•</span>
                              <Briefcase className="h-4 w-4 mr-1" />
                              {job.type}
                            </div>
                          </div>
                          <Button onClick={() => window.location.href = `/jobs/${job.id}`}>Apply</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center">
                    <Button variant="outline" onClick={() => window.location.href = `/jobs?company=${company.id}`}>View All Jobs</Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="people">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Employees at {company.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employees.map(employee => (
                      <Card key={employee.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12 mr-3">
                              <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {getInitials(employee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-primary hover:underline cursor-pointer">
                                {employee.name}
                              </h3>
                              <p className="text-sm text-gray-700">{employee.title}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}