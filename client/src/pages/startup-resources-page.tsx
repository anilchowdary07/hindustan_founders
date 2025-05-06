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
  BookmarkCheck,
  Filter,
  Star,
  Clock,
  Eye,
  Wrench,
  FileSpreadsheet,
  FileIcon,
  FileCode,
  FilePieChart,
  // FilePresentation is not available in lucide-react, using FileText instead
  FileText as FilePresentation,
  FileCheck,
  ThumbsUp,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Video,
  Briefcase,
  Building,
  Users,
  ArrowRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StartupResourcesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sample resources data
  const resources = [
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
  ];

  // Sample guides data
  const guides = [
    {
      id: 101,
      title: "The Complete Guide to Startup Fundraising in India",
      description: "A comprehensive guide covering all aspects of fundraising for startups in India, from angel investment to Series A and beyond.",
      category: "fundraising",
      type: "guide",
      format: "document",
      author: "Venture Capital Association",
      date: "April 10, 2025",
      tags: ["fundraising", "venture capital", "angel investment"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.9,
      downloads: 8750,
      isPremium: false
    },
    {
      id: 102,
      title: "Product-Market Fit Playbook",
      description: "A step-by-step guide to finding and validating product-market fit for your startup.",
      category: "product",
      type: "guide",
      format: "document",
      author: "Product Strategy Institute",
      date: "March 5, 2025",
      tags: ["product-market fit", "validation", "customer development"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.8,
      downloads: 6320,
      isPremium: false
    },
    {
      id: 103,
      title: "Startup Legal Compliance in India",
      description: "Everything founders need to know about legal compliance for startups in India, including company formation, taxation, and regulatory requirements.",
      category: "legal",
      type: "guide",
      format: "document",
      author: "Legal Experts Association",
      date: "February 15, 2025",
      tags: ["legal", "compliance", "regulations"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.7,
      downloads: 5430,
      isPremium: true
    },
    {
      id: 104,
      title: "Growth Marketing for Early-Stage Startups",
      description: "Practical strategies and tactics for marketing your startup with limited resources.",
      category: "marketing",
      type: "guide",
      format: "document",
      author: "Growth Hackers Collective",
      date: "April 20, 2025",
      tags: ["marketing", "growth", "customer acquisition"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.6,
      downloads: 7890,
      isPremium: false
    },
    {
      id: 105,
      title: "Founder's Guide to Equity and Cap Tables",
      description: "A comprehensive guide to understanding equity, cap tables, and dilution for startup founders.",
      category: "finance",
      type: "guide",
      format: "document",
      author: "Startup Finance Academy",
      date: "January 30, 2025",
      tags: ["equity", "cap table", "dilution"],
      downloadUrl: "#",
      previewUrl: "#",
      rating: 4.9,
      downloads: 4560,
      isPremium: true
    },
  ];

  // Sample courses data
  const courses = [
    {
      id: 201,
      title: "Startup Fundamentals",
      description: "A comprehensive course covering all aspects of building a successful startup, from idea validation to scaling.",
      category: "entrepreneurship",
      instructor: "Rajiv Sharma",
      instructorTitle: "Serial Entrepreneur",
      duration: "8 weeks",
      modules: 12,
      level: "Beginner",
      rating: 4.8,
      students: 3245,
      isPremium: true,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 202,
      title: "Mastering Startup Fundraising",
      description: "Learn how to raise capital for your startup, from preparing your pitch to negotiating term sheets.",
      category: "fundraising",
      instructor: "Priya Patel",
      instructorTitle: "VC Partner",
      duration: "6 weeks",
      modules: 8,
      level: "Intermediate",
      rating: 4.9,
      students: 2180,
      isPremium: true,
      image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 203,
      title: "Product Management for Startups",
      description: "A practical course on product management specifically tailored for early-stage startups.",
      category: "product",
      instructor: "Vikram Mehta",
      instructorTitle: "Product Leader",
      duration: "5 weeks",
      modules: 10,
      level: "Intermediate",
      rating: 4.7,
      students: 1890,
      isPremium: false,
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 204,
      title: "Financial Management for Non-Financial Founders",
      description: "Essential financial knowledge and skills for startup founders without a finance background.",
      category: "finance",
      instructor: "Ananya Desai",
      instructorTitle: "CFO & Finance Expert",
      duration: "4 weeks",
      modules: 8,
      level: "Beginner",
      rating: 4.6,
      students: 2560,
      isPremium: false,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1026&q=80"
    },
  ];

  // Sample events data
  const events = [
    {
      id: 301,
      title: "Startup Funding Masterclass",
      description: "A comprehensive workshop on raising capital for your startup, from preparation to execution.",
      date: "June 15, 2025",
      time: "10:00 AM - 4:00 PM IST",
      location: "Online",
      speaker: "Vikram Singh",
      speakerTitle: "Angel Investor",
      category: "fundraising",
      isPremium: false,
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 302,
      title: "Product-Market Fit Workshop",
      description: "A hands-on workshop to help you validate your product ideas and find the right market fit.",
      date: "July 5, 2025",
      time: "10:00 AM - 4:00 PM IST",
      location: "WeWork, Koramangala, Bangalore",
      speaker: "Rajiv Sharma",
      speakerTitle: "Serial Entrepreneur",
      category: "product",
      isPremium: true,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
  ];

  // Filter items based on active tab, search query, and category
  const getFilteredItems = () => {
    let items = [];
    
    switch (activeTab) {
      case "templates":
        items = resources;
        break;
      case "guides":
        items = guides;
        break;
      case "courses":
        items = courses;
        break;
      case "events":
        items = events;
        break;
      default:
        items = [...resources, ...guides, ...courses, ...events];
    }
    
    return items.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesBookmark = activeTab !== "bookmarked" || bookmarkedItems.includes(item.id);
      
      return matchesSearch && matchesCategory && matchesBookmark;
    });
  };

  const filteredItems = getFilteredItems();

  const toggleBookmark = (id: number) => {
    setBookmarkedItems(prev => {
      const isCurrentlyBookmarked = prev.includes(id);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];
      
      const item = [...resources, ...guides, ...courses, ...events].find(r => r.id === id);
      
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
        description: "This is a premium resource. Please upgrade to download.",
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
        return <FileText className="h-5 w-5" />;
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
      case "entrepreneurship":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderResourceCard = (item: any) => {
    return (
      <Card key={item.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {getFormatIcon(item.format)}
              <Badge className={getCategoryColor(item.category)}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Badge>
              {item.isPremium && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
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
              {bookmarkedItems.includes(item.id) ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
          <CardTitle className="text-lg mt-2">{item.title}</CardTitle>
          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{item.date}</span>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Eye className="h-4 w-4 mr-1" />
            <span>{item.downloads} downloads</span>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Star className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{item.rating}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {item.tags && item.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full">
            <Button variant="outline" size="sm" onClick={() => window.open(item.previewUrl, '_blank')}>
              Preview
              <Eye className="ml-2 h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => handleDownload(item)}>
              Download
              <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  const renderCourseCard = (course: any) => {
    return (
      <Card key={course.id} className="overflow-hidden">
        <div className="relative h-40">
          <img 
            src={course.image} 
            alt={course.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {course.isPremium && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Premium
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => toggleBookmark(course.id)}
              className="h-8 w-8 bg-white/80 hover:bg-white"
            >
              {bookmarkedItems.includes(course.id) ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <Badge className={getCategoryColor(course.category)}>
              {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center mb-3">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{course.instructor.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{course.instructor}</p>
              <p className="text-xs text-gray-500">{course.instructorTitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-gray-500" />
              <span>{course.modules} modules</span>
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-1 text-gray-500" />
              <span>{course.level}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span>{course.rating} ({course.students} students)</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            {course.isPremium ? "Enroll (Premium)" : "Enroll Now"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const renderEventCard = (event: any) => {
    return (
      <Card key={event.id} className="overflow-hidden">
        <div className="relative h-40">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {event.isPremium && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Premium
              </Badge>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => toggleBookmark(event.id)}
              className="h-8 w-8 bg-white/80 hover:bg-white"
            >
              {bookmarkedItems.includes(event.id) ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <Badge className={getCategoryColor(event.category)}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center mb-3">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback>{event.speaker.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{event.speaker}</p>
              <p className="text-xs text-gray-500">{event.speakerTitle}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-gray-500" />
              <span>{event.location}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            Register Now
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Lightbulb className="mr-2 h-8 w-8" />
              Startup Resources
            </h1>
            <p className="text-muted-foreground mt-1">
              Tools, templates, guides, and courses to help you build and grow your startup
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

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

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
                    <label htmlFor="category-product">Product & Development</label>
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
                    <label htmlFor="category-fundraising">Fundraising & Pitching</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      id="category-entrepreneurship" 
                      name="category" 
                      className="mr-2"
                      checked={categoryFilter === "entrepreneurship"}
                      onChange={() => setCategoryFilter("entrepreneurship")}
                    />
                    <label htmlFor="category-entrepreneurship">Entrepreneurship</label>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Resource Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="type-free" 
                      className="mr-2"
                    />
                    <label htmlFor="type-free">Free Resources</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="type-premium" 
                      className="mr-2"
                    />
                    <label htmlFor="type-premium">Premium Resources</label>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6 bg-primary text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Star className="h-6 w-6 mr-2" />
                    <h3 className="text-lg font-bold">Premium Access</h3>
                  </div>
                  <p className="mb-4">
                    Upgrade to Premium to access all resources, courses, and exclusive content.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <TabsContent value="all" className="m-0">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <Wrench className="mr-2 h-5 w-5" />
                      Templates & Tools
                    </h2>
                    <Button variant="link" className="text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.slice(0, 3).map(renderResourceCard)}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Guides & Playbooks
                    </h2>
                    <Button variant="link" className="text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guides.slice(0, 3).map(renderResourceCard)}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Courses & Learning
                    </h2>
                    <Button variant="link" className="text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.slice(0, 2).map(renderCourseCard)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Upcoming Events
                    </h2>
                    <Button variant="link" className="text-primary">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(renderEventCard)}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resources.map(renderResourceCard)}
                </div>
              </TabsContent>

              <TabsContent value="guides" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guides.map(renderResourceCard)}
                </div>
              </TabsContent>

              <TabsContent value="courses" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map(renderCourseCard)}
                </div>
              </TabsContent>

              <TabsContent value="events" className="m-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map(renderEventCard)}
                </div>
              </TabsContent>

              <TabsContent value="bookmarked" className="m-0">
                {bookmarkedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No bookmarked resources</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't bookmarked any resources yet. Browse our resources and click the bookmark icon to save them for later.
                    </p>
                    <Button onClick={() => setActiveTab("all")}>
                      Browse Resources
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => {
                      if (item.modules) {
                        return renderCourseCard(item);
                      } else if (item.speaker) {
                        return renderEventCard(item);
                      } else {
                        return renderResourceCard(item);
                      }
                    })}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Featured Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-3 bg-primary text-white">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-2">The Ultimate Startup Toolkit</h3>
                  <p className="mb-4">
                    Get access to our comprehensive collection of templates, guides, and resources to help you build and scale your startup.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <span>50+ premium templates</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <span>25+ detailed guides</span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      <span>10+ video courses</span>
                    </div>
                  </div>
                  <Button variant="secondary">
                    Get the Toolkit
                  </Button>
                </div>
                <div className="hidden md:block">
                  <img 
                    src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                    alt="Startup Toolkit" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Expert Network */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Connect with Experts</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Get Personalized Guidance</h3>
                  <p className="text-gray-600 mb-4">
                    Connect with experienced entrepreneurs, industry experts, and mentors who can provide personalized guidance for your startup journey.
                  </p>
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-primary mr-3 mt-1" />
                      <div>
                        <p className="font-medium">1-on-1 Mentorship</p>
                        <p className="text-sm text-gray-500">Schedule sessions with experienced mentors</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Video className="h-5 w-5 text-primary mr-3 mt-1" />
                      <div>
                        <p className="font-medium">Expert Office Hours</p>
                        <p className="text-sm text-gray-500">Join weekly Q&A sessions with industry experts</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-primary mr-3 mt-1" />
                      <div>
                        <p className="font-medium">Startup Clinics</p>
                        <p className="text-sm text-gray-500">Get feedback on specific aspects of your business</p>
                      </div>
                    </div>
                  </div>
                  <Button>
                    Browse Expert Network
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Rajiv Sharma", title: "Serial Entrepreneur", image: "https://randomuser.me/api/portraits/men/32.jpg" },
                    { name: "Priya Patel", title: "VC Partner", image: "https://randomuser.me/api/portraits/women/44.jpg" },
                    { name: "Vikram Mehta", title: "Product Leader", image: "https://randomuser.me/api/portraits/men/68.jpg" },
                    { name: "Ananya Desai", title: "Marketing Expert", image: "https://randomuser.me/api/portraits/women/65.jpg" },
                  ].map((expert, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <Avatar className="h-20 w-20 mb-2">
                        <AvatarImage src={expert.image} alt={expert.name} />
                        <AvatarFallback>{expert.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{expert.name}</p>
                      <p className="text-sm text-gray-500">{expert.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                <p className="mb-4">
                  Subscribe to our newsletter to receive the latest resources, guides, and expert insights for your startup journey.
                </p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 p-2 border rounded-md"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}