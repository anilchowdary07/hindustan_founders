import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  FileText, 
  BookOpen, 
  Video, 
  Download, 
  ExternalLink, 
  Bookmark, 
  Filter,
  ChevronRight,
  Star,
  Clock
} from "lucide-react";

export default function ResourcesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedResources, setBookmarkedResources] = useState<number[]>([]);

  // Sample resources data
  const resources = [
    {
      id: 1,
      title: "Startup Funding Guide for Indian Entrepreneurs",
      description: "A comprehensive guide to raising capital in India's startup ecosystem, including angel investors, venture capital, and government grants.",
      type: "guide",
      format: "PDF",
      author: "Startup India",
      date: "March 15, 2025",
      tags: ["funding", "startups", "venture capital"],
      downloadUrl: "#",
      readTime: "25 min read",
      rating: 4.8
    },
    {
      id: 2,
      title: "Legal Essentials for New Businesses in India",
      description: "Learn about the legal requirements for registering and operating a business in India, including company formation, taxation, and compliance.",
      type: "guide",
      format: "PDF",
      author: "Legal Experts Association",
      date: "February 10, 2025",
      tags: ["legal", "compliance", "business registration"],
      downloadUrl: "#",
      readTime: "35 min read",
      rating: 4.6
    },
    {
      id: 3,
      title: "Product-Market Fit: A Founder's Journey",
      description: "A case study of how successful Indian startups achieved product-market fit, with actionable insights for entrepreneurs.",
      type: "case study",
      format: "PDF",
      author: "Innovation Hub",
      date: "April 5, 2025",
      tags: ["product", "market fit", "case study"],
      downloadUrl: "#",
      readTime: "20 min read",
      rating: 4.9
    },
    {
      id: 4,
      title: "Building a Tech Team in India",
      description: "Strategies for recruiting, managing, and retaining tech talent in India's competitive job market.",
      type: "guide",
      format: "PDF",
      author: "TechHR Forum",
      date: "January 22, 2025",
      tags: ["hiring", "tech team", "talent"],
      downloadUrl: "#",
      readTime: "30 min read",
      rating: 4.5
    },
    {
      id: 5,
      title: "Mastering Pitch Decks: Templates and Examples",
      description: "A collection of successful pitch deck templates and real examples from funded Indian startups.",
      type: "template",
      format: "PPTX",
      author: "Pitch Perfect",
      date: "March 30, 2025",
      tags: ["pitch deck", "fundraising", "templates"],
      downloadUrl: "#",
      readTime: "15 min read",
      rating: 4.7
    },
    {
      id: 6,
      title: "Digital Marketing Strategies for Startups",
      description: "Cost-effective digital marketing strategies specifically tailored for Indian startups with limited budgets.",
      type: "guide",
      format: "PDF",
      author: "Digital Growth Academy",
      date: "February 28, 2025",
      tags: ["marketing", "digital", "growth"],
      downloadUrl: "#",
      readTime: "40 min read",
      rating: 4.4
    },
    {
      id: 7,
      title: "Financial Modeling for Startups",
      description: "Learn how to create financial models for your startup, including revenue projections, cash flow analysis, and valuation.",
      type: "template",
      format: "XLSX",
      author: "Finance for Founders",
      date: "April 12, 2025",
      tags: ["finance", "modeling", "projections"],
      downloadUrl: "#",
      readTime: "45 min read",
      rating: 4.8
    },
    {
      id: 8,
      title: "Building a Minimum Viable Product",
      description: "A step-by-step guide to defining, building, and launching an MVP that validates your business idea.",
      type: "guide",
      format: "PDF",
      author: "Product Development Institute",
      date: "January 15, 2025",
      tags: ["MVP", "product development", "validation"],
      downloadUrl: "#",
      readTime: "30 min read",
      rating: 4.6
    },
    {
      id: 9,
      title: "Startup Valuation Methods",
      description: "Understanding different valuation methods for early-stage startups in the Indian context.",
      type: "guide",
      format: "PDF",
      author: "Venture Valuations",
      date: "March 5, 2025",
      tags: ["valuation", "fundraising", "finance"],
      downloadUrl: "#",
      readTime: "35 min read",
      rating: 4.7
    },
    {
      id: 10,
      title: "Customer Acquisition Strategies",
      description: "Proven strategies for acquiring and retaining customers for B2B and B2C startups in India.",
      type: "guide",
      format: "PDF",
      author: "Growth Hackers India",
      date: "February 20, 2025",
      tags: ["customers", "acquisition", "growth"],
      downloadUrl: "#",
      readTime: "25 min read",
      rating: 4.5
    },
  ];

  // Filter resources based on active tab and search query
  const filteredResources = resources.filter(resource => {
    const matchesTab = activeTab === "all" || resource.type === activeTab;
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTab && matchesSearch;
  });

  const toggleBookmark = (id: number) => {
    setBookmarkedResources(prev => 
      prev.includes(id) 
        ? prev.filter(resourceId => resourceId !== id)
        : [...prev, id]
    );
    
    const resource = resources.find(r => r.id === id);
    
    toast({
      title: prev => prev.includes(id) ? "Removed from bookmarks" : "Added to bookmarks",
      description: resource?.title,
    });
  };

  const handleDownload = (resource: any) => {
    toast({
      title: "Download started",
      description: `Downloading ${resource.title}`,
    });
    
    // In a real app, this would trigger an actual download
    setTimeout(() => {
      toast({
        title: "Download complete",
        description: `${resource.title} has been downloaded successfully`,
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground mt-1">
              Access guides, templates, and tools to help grow your business
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="guide">Guides</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
            <TabsTrigger value="case study">Case Studies</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <ResourceGrid 
              resources={filteredResources} 
              bookmarkedResources={bookmarkedResources}
              toggleBookmark={toggleBookmark}
              handleDownload={handleDownload}
            />
          </TabsContent>

          <TabsContent value="guide" className="space-y-4">
            <ResourceGrid 
              resources={filteredResources} 
              bookmarkedResources={bookmarkedResources}
              toggleBookmark={toggleBookmark}
              handleDownload={handleDownload}
            />
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <ResourceGrid 
              resources={filteredResources} 
              bookmarkedResources={bookmarkedResources}
              toggleBookmark={toggleBookmark}
              handleDownload={handleDownload}
            />
          </TabsContent>

          <TabsContent value="case study" className="space-y-4">
            <ResourceGrid 
              resources={filteredResources} 
              bookmarkedResources={bookmarkedResources}
              toggleBookmark={toggleBookmark}
              handleDownload={handleDownload}
            />
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-4">
            <ResourceGrid 
              resources={filteredResources.filter(r => bookmarkedResources.includes(r.id))} 
              bookmarkedResources={bookmarkedResources}
              toggleBookmark={toggleBookmark}
              handleDownload={handleDownload}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

interface ResourceGridProps {
  resources: any[];
  bookmarkedResources: number[];
  toggleBookmark: (id: number) => void;
  handleDownload: (resource: any) => void;
}

function ResourceGrid({ resources, bookmarkedResources, toggleBookmark, handleDownload }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">No resources found</h3>
        <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="mb-2">
                {resource.format}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => toggleBookmark(resource.id)}
              >
                <Bookmark 
                  className={`h-5 w-5 ${bookmarkedResources.includes(resource.id) ? 'fill-primary text-primary' : ''}`} 
                />
              </Button>
            </div>
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{resource.readTime}</span>
              <span className="mx-2">•</span>
              <Star className="mr-1 h-3 w-3 text-yellow-500" />
              <span>{resource.rating}</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {resource.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => handleDownload(resource)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="ghost" size="sm">
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}