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
  Clock,
  Lightbulb,
  BookOpen as BookIcon,
  FileText as FileIcon,
  Video as VideoIcon,
  Podcast,
  CheckCircle,
  Eye
} from "lucide-react";

export default function GuidesAndTutorialsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedGuides, setBookmarkedGuides] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sample guides and tutorials data
  const guides = [
    {
      id: 1,
      title: "Complete Guide to Startup Registration in India",
      description: "Step-by-step instructions for registering your startup in India, including all legal requirements and documentation.",
      category: "legal",
      format: "document",
      author: "Legal Experts Association",
      date: "March 15, 2025",
      tags: ["registration", "legal", "compliance"],
      downloadUrl: "#",
      readTime: "25 min read",
      rating: 4.8,
      views: 3245
    },
    {
      id: 2,
      title: "Fundraising 101: How to Approach Investors",
      description: "Learn the fundamentals of approaching investors, preparing your pitch, and securing funding for your startup.",
      category: "fundraising",
      format: "document",
      author: "Venture Capital Insights",
      date: "February 10, 2025",
      tags: ["fundraising", "investors", "pitch"],
      downloadUrl: "#",
      readTime: "35 min read",
      rating: 4.6,
      views: 5120
    },
    {
      id: 3,
      title: "Product-Market Fit: A Practical Guide",
      description: "A practical guide to finding and validating product-market fit for your startup.",
      category: "product",
      format: "document",
      author: "Product Strategy Institute",
      date: "April 5, 2025",
      tags: ["product", "market fit", "validation"],
      downloadUrl: "#",
      readTime: "20 min read",
      rating: 4.9,
      views: 2890
    },
    {
      id: 4,
      title: "Building a Tech Team in India",
      description: "Strategies for recruiting, managing, and retaining tech talent in India's competitive job market.",
      category: "team",
      format: "document",
      author: "TechHR Forum",
      date: "January 22, 2025",
      tags: ["hiring", "tech team", "talent"],
      downloadUrl: "#",
      readTime: "30 min read",
      rating: 4.5,
      views: 1875
    },
    {
      id: 5,
      title: "Mastering Pitch Decks: Templates and Examples",
      description: "A collection of successful pitch deck templates and real examples from funded Indian startups.",
      category: "fundraising",
      format: "presentation",
      author: "Pitch Perfect",
      date: "March 30, 2025",
      tags: ["pitch deck", "fundraising", "templates"],
      downloadUrl: "#",
      readTime: "15 min read",
      rating: 4.7,
      views: 6340
    },
    {
      id: 6,
      title: "Digital Marketing Strategies for Startups",
      description: "Cost-effective digital marketing strategies specifically tailored for Indian startups with limited budgets.",
      category: "marketing",
      format: "document",
      author: "Digital Growth Academy",
      date: "February 28, 2025",
      tags: ["marketing", "digital", "growth"],
      downloadUrl: "#",
      readTime: "40 min read",
      rating: 4.4,
      views: 4210
    },
    {
      id: 7,
      title: "Financial Modeling for Startups",
      description: "Learn how to create financial models for your startup, including revenue projections, cash flow analysis, and valuation.",
      category: "finance",
      format: "spreadsheet",
      author: "Finance for Founders",
      date: "April 12, 2025",
      tags: ["finance", "modeling", "projections"],
      downloadUrl: "#",
      readTime: "45 min read",
      rating: 4.8,
      views: 3560
    },
    {
      id: 8,
      title: "Building a Minimum Viable Product",
      description: "A step-by-step guide to defining, building, and launching an MVP that validates your business idea.",
      category: "product",
      format: "document",
      author: "Product Development Institute",
      date: "January 15, 2025",
      tags: ["MVP", "product development", "validation"],
      downloadUrl: "#",
      readTime: "30 min read",
      rating: 4.6,
      views: 5230
    },
    {
      id: 9,
      title: "Startup Valuation Methods",
      description: "Understanding different valuation methods for early-stage startups in the Indian context.",
      category: "finance",
      format: "document",
      author: "Venture Valuations",
      date: "March 5, 2025",
      tags: ["valuation", "fundraising", "finance"],
      downloadUrl: "#",
      readTime: "35 min read",
      rating: 4.7,
      views: 2980
    },
    {
      id: 10,
      title: "Customer Acquisition Strategies",
      description: "Proven strategies for acquiring and retaining customers for B2B and B2C startups in India.",
      category: "marketing",
      format: "document",
      author: "Growth Hackers India",
      date: "February 20, 2025",
      tags: ["customers", "acquisition", "growth"],
      downloadUrl: "#",
      readTime: "25 min read",
      rating: 4.5,
      views: 4120
    },
  ];

  // Filter guides based on active tab, search query, and category
  const filteredGuides = guides.filter(guide => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "legal" && guide.category === "legal") ||
                      (activeTab === "fundraising" && guide.category === "fundraising") ||
                      (activeTab === "product" && guide.category === "product") ||
                      (activeTab === "marketing" && guide.category === "marketing") ||
                      (activeTab === "finance" && guide.category === "finance") ||
                      (activeTab === "team" && guide.category === "team") ||
                      (activeTab === "bookmarked" && bookmarkedGuides.includes(guide.id));
    
    const matchesSearch = searchQuery === "" || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || guide.category === categoryFilter;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const toggleBookmark = (id: number) => {
    setBookmarkedGuides(prev => {
      const isCurrentlyBookmarked = prev.includes(id);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter(guideId => guideId !== id)
        : [...prev, id];
      
      const guide = guides.find(r => r.id === id);
      
      toast({
        title: isCurrentlyBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: guide?.title,
      });
      
      return newBookmarks;
    });
  };

  const handleDownload = (guide: any) => {
    toast({
      title: "Download started",
      description: `Downloading ${guide.title}`,
    });
    
    // In a real app, this would trigger an actual download
    setTimeout(() => {
      toast({
        title: "Download complete",
        description: `${guide.title} has been downloaded successfully`,
      });
    }, 2000);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "document":
        return <FileIcon className="h-5 w-5" />;
      case "presentation":
        return <VideoIcon className="h-5 w-5" />;
      case "spreadsheet":
        return <FileText className="h-5 w-5" />;
      default:
        return <BookIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "legal":
        return "bg-blue-100 text-blue-800";
      case "fundraising":
        return "bg-green-100 text-green-800";
      case "product":
        return "bg-purple-100 text-purple-800";
      case "marketing":
        return "bg-orange-100 text-orange-800";
      case "finance":
        return "bg-yellow-100 text-yellow-800";
      case "team":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BookIcon className="mr-2 h-8 w-8" />
              Guides & Tutorials
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive resources to help you navigate your startup journey
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search guides..."
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-all" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "all"}
                    onChange={() => setCategoryFilter("all")}
                  />
                  <label htmlFor="category-all">All Categories</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-legal" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "legal"}
                    onChange={() => setCategoryFilter("legal")}
                  />
                  <label htmlFor="category-legal">Legal & Compliance</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-fundraising" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "fundraising"}
                    onChange={() => setCategoryFilter("fundraising")}
                  />
                  <label htmlFor="category-fundraising">Fundraising</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-product" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "product"}
                    onChange={() => setCategoryFilter("product")}
                  />
                  <label htmlFor="category-product">Product Development</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-marketing" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "marketing"}
                    onChange={() => setCategoryFilter("marketing")}
                  />
                  <label htmlFor="category-marketing">Marketing & Growth</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-finance" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "finance"}
                    onChange={() => setCategoryFilter("finance")}
                  />
                  <label htmlFor="category-finance">Finance & Accounting</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="radio" 
                    id="category-team" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "team"}
                    onChange={() => setCategoryFilter("team")}
                  />
                  <label htmlFor="category-team">Team Building</label>
                </div>
              </CardContent>
              <CardHeader className="pt-0">
                <CardTitle className="text-lg">Popular Guides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guides
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map(guide => (
                    <div key={guide.id} className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded">
                        {getFormatIcon(guide.format)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium line-clamp-2">{guide.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{guide.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">All Guides</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
                <TabsTrigger value="product">Product</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredGuides.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No guides found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        We couldn't find any guides matching your current filters.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGuides.map(guide => (
                      <Card key={guide.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge className={getCategoryColor(guide.category)}>
                              {guide.category}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(guide.id)}
                              className="h-8 w-8"
                            >
                              <Bookmark
                                className={`h-5 w-5 ${bookmarkedGuides.includes(guide.id) ? "fill-primary text-primary" : ""}`}
                              />
                            </Button>
                          </div>
                          <CardTitle className="mt-2 text-xl">{guide.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {guide.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span className="mr-4">{guide.readTime}</span>
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span>{guide.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{guide.views.toLocaleString()} views</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <div className="text-sm text-muted-foreground">
                            By {guide.author}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(guide.downloadUrl, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(guide)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}