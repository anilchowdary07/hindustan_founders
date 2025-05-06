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
  Download, 
  ExternalLink, 
  Bookmark, 
  Filter,
  Star,
  Clock,
  Eye,
  Tool,
  FileSpreadsheet,
  FileText as FileIcon,
  FileCode,
  FilePieChart,
  FilePresentation,
  FileCheck,
  ThumbsUp
} from "lucide-react";

export default function TemplatesAndToolsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sample templates and tools data
  const items = [
    {
      id: 1,
      title: "Startup Financial Model Template",
      description: "A comprehensive financial model template for startups, including P&L, cash flow, and valuation.",
      category: "finance",
      type: "template",
      format: "spreadsheet",
      author: "Finance for Founders",
      date: "March 15, 2025",
      tags: ["financial model", "projections", "valuation"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.8,
      downloads: 3245,
      isPremium: false
    },
    {
      id: 2,
      title: "Pitch Deck Template",
      description: "A professionally designed pitch deck template with 20+ slides covering all essential aspects of your startup pitch.",
      category: "fundraising",
      type: "template",
      format: "presentation",
      author: "Pitch Perfect",
      date: "February 10, 2025",
      tags: ["pitch deck", "fundraising", "presentation"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.6,
      downloads: 5120,
      isPremium: false
    },
    {
      id: 3,
      title: "Product Roadmap Template",
      description: "A strategic product roadmap template to plan and communicate your product development timeline.",
      category: "product",
      type: "template",
      format: "spreadsheet",
      author: "Product Strategy Institute",
      date: "April 5, 2025",
      tags: ["product", "roadmap", "planning"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.9,
      downloads: 2890,
      isPremium: false
    },
    {
      id: 4,
      title: "Startup Legal Documents Pack",
      description: "Essential legal templates for startups, including incorporation, founder agreements, and employee contracts.",
      category: "legal",
      type: "template",
      format: "document",
      author: "Legal Experts Association",
      date: "January 22, 2025",
      tags: ["legal", "contracts", "agreements"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.5,
      downloads: 1875,
      isPremium: true
    },
    {
      id: 5,
      title: "Marketing Plan Template",
      description: "A comprehensive marketing plan template to structure your marketing strategy and campaigns.",
      category: "marketing",
      type: "template",
      format: "document",
      author: "Digital Growth Academy",
      date: "March 30, 2025",
      tags: ["marketing", "strategy", "planning"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.7,
      downloads: 6340,
      isPremium: false
    },
    {
      id: 6,
      title: "Startup Valuation Calculator",
      description: "An interactive tool to calculate your startup's valuation using multiple methodologies.",
      category: "finance",
      type: "tool",
      format: "spreadsheet",
      author: "Venture Valuations",
      date: "February 28, 2025",
      tags: ["valuation", "calculator", "finance"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.4,
      downloads: 4210,
      isPremium: true
    },
    {
      id: 7,
      title: "Business Model Canvas Template",
      description: "A structured template to visualize and develop your business model.",
      category: "strategy",
      type: "template",
      format: "spreadsheet",
      author: "Business Strategy Institute",
      date: "April 12, 2025",
      tags: ["business model", "strategy", "planning"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.8,
      downloads: 3560,
      isPremium: false
    },
    {
      id: 8,
      title: "Customer Persona Creator",
      description: "A tool to create detailed customer personas for your target audience.",
      category: "marketing",
      type: "tool",
      format: "document",
      author: "Marketing Insights",
      date: "January 15, 2025",
      tags: ["customer persona", "marketing", "audience"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.6,
      downloads: 5230,
      isPremium: false
    },
    {
      id: 9,
      title: "Equity Split Calculator",
      description: "A tool to help founders determine fair equity splits based on various contributions.",
      category: "finance",
      type: "tool",
      format: "spreadsheet",
      author: "Founder Equity",
      date: "March 5, 2025",
      tags: ["equity", "founders", "split"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.7,
      downloads: 2980,
      isPremium: true
    },
    {
      id: 10,
      title: "ESOP Policy Template",
      description: "A comprehensive template for creating your startup's Employee Stock Option Plan.",
      category: "legal",
      type: "template",
      format: "document",
      author: "HR Legal Experts",
      date: "February 20, 2025",
      tags: ["ESOP", "equity", "employees"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.5,
      downloads: 4120,
      isPremium: false
    },
  ];

  // Filter items based on active tab, search query, and category
  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "templates" && item.type === "template") ||
                      (activeTab === "tools" && item.type === "tool") ||
                      (activeTab === "finance" && item.category === "finance") ||
                      (activeTab === "marketing" && item.category === "marketing") ||
                      (activeTab === "legal" && item.category === "legal") ||
                      (activeTab === "product" && item.category === "product") ||
                      (activeTab === "fundraising" && item.category === "fundraising") ||
                      (activeTab === "strategy" && item.category === "strategy") ||
                      (activeTab === "premium" && item.isPremium) ||
                      (activeTab === "bookmarked" && bookmarkedItems.includes(item.id));
    
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const toggleBookmark = (id: number) => {
    setBookmarkedItems(prev => {
      const isCurrentlyBookmarked = prev.includes(id);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];
      
      const item = items.find(r => r.id === id);
      
      toast({
        title: isCurrentlyBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: item?.title,
      });
      
      return newBookmarks;
    });
  };

  const handleDownload = (item: any) => {
    if (item.isPremium) {
      toast({
        title: "Premium Content",
        description: "This is a premium template. Please upgrade to download.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Download started",
      description: `Downloading ${item.title}`,
    });
    
    // In a real app, this would trigger an actual download
    setTimeout(() => {
      toast({
        title: "Download complete",
        description: `${item.title} has been downloaded successfully`,
      });
    }, 2000);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "document":
        return <FileIcon className="h-5 w-5" />;
      case "presentation":
        return <FilePresentation className="h-5 w-5" />;
      case "spreadsheet":
        return <FileSpreadsheet className="h-5 w-5" />;
      case "code":
        return <FileCode className="h-5 w-5" />;
      case "chart":
        return <FilePieChart className="h-5 w-5" />;
      default:
        return <FileCheck className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "finance":
        return "bg-green-100 text-green-800";
      case "marketing":
        return "bg-orange-100 text-orange-800";
      case "legal":
        return "bg-blue-100 text-blue-800";
      case "product":
        return "bg-purple-100 text-purple-800";
      case "fundraising":
        return "bg-yellow-100 text-yellow-800";
      case "strategy":
        return "bg-indigo-100 text-indigo-800";
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
              <Tool className="mr-2 h-8 w-8" />
              Templates & Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              Ready-to-use templates and tools to accelerate your startup
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates & tools..."
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
                    id="category-strategy" 
                    name="category" 
                    className="mr-2"
                    checked={categoryFilter === "strategy"}
                    onChange={() => setCategoryFilter("strategy")}
                  />
                  <label htmlFor="category-strategy">Business Strategy</label>
                </div>
              </CardContent>
              <CardHeader className="pt-0">
                <CardTitle className="text-lg">Most Popular</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items
                  .sort((a, b) => b.downloads - a.downloads)
                  .slice(0, 3)
                  .map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded">
                        {getFormatIcon(item.format)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Download className="h-3 w-3 mr-1" />
                          <span>{item.downloads.toLocaleString()} downloads</span>
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
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredItems.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Tool className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No items found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        We couldn't find any templates or tools matching your current filters.
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
                    {filteredItems.map(item => (
                      <Card key={item.id} className={`overflow-hidden ${item.isPremium ? 'border-yellow-400' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <Badge className={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                              <Badge variant="outline">
                                {item.type}
                              </Badge>
                              {item.isPremium && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(item.id)}
                              className="h-8 w-8"
                            >
                              <Bookmark
                                className={`h-5 w-5 ${bookmarkedItems.includes(item.id) ? "fill-primary text-primary" : ""}`}
                              />
                            </Button>
                          </div>
                          <div className="flex items-center mt-2">
                            <div className="bg-primary/10 p-2 rounded mr-3">
                              {getFormatIcon(item.format)}
                            </div>
                            <CardTitle className="text-xl">{item.title}</CardTitle>
                          </div>
                          <CardDescription className="mt-2">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1 text-yellow-500" />
                              <span className="mr-4">{item.rating}</span>
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>98% recommended</span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              <span>{item.downloads.toLocaleString()} downloads</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <div className="text-sm text-muted-foreground">
                            By {item.author}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(item.previewUrl, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownload(item)}
                              disabled={item.isPremium}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {item.isPremium ? "Premium" : "Download"}
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