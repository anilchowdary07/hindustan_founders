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
  GraduationCap,
  BookOpen as BookIcon,
  FileText as FileIcon,
  Video as VideoIcon,
  Podcast,
  CheckCircle
} from "lucide-react";

export default function EducationalMaterialsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<number[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");

  // Sample educational materials data
  const educationalMaterials = [
    {
      id: 1,
      title: "Startup Fundamentals: From Idea to Launch",
      description: "A comprehensive course covering the essentials of launching a successful startup in India.",
      type: "course",
      format: "video",
      author: "Startup India Academy",
      date: "March 15, 2025",
      tags: ["startup basics", "entrepreneurship", "business planning"],
      url: "#",
      duration: "8 hours",
      difficulty: "beginner",
      rating: 4.8,
      completionRate: 0
    },
    {
      id: 2,
      title: "Financial Modeling for Startups",
      description: "Learn how to create financial models for your startup, including revenue projections and cash flow analysis.",
      type: "tutorial",
      format: "video",
      author: "Finance for Founders",
      date: "February 10, 2025",
      tags: ["finance", "modeling", "projections"],
      url: "#",
      duration: "3 hours",
      difficulty: "intermediate",
      rating: 4.6,
      completionRate: 0
    },
    {
      id: 3,
      title: "Product-Market Fit Masterclass",
      description: "A deep dive into finding and validating product-market fit for your startup.",
      type: "course",
      format: "video",
      author: "Product Strategy Institute",
      date: "April 5, 2025",
      tags: ["product", "market fit", "validation"],
      url: "#",
      duration: "5 hours",
      difficulty: "intermediate",
      rating: 4.9,
      completionRate: 0
    },
    {
      id: 4,
      title: "Legal Essentials for Indian Startups",
      description: "A guide to navigating the legal landscape for startups in India.",
      type: "guide",
      format: "document",
      author: "Legal Experts Association",
      date: "January 22, 2025",
      tags: ["legal", "compliance", "business registration"],
      url: "#",
      duration: "2 hours",
      difficulty: "beginner",
      rating: 4.5,
      completionRate: 0
    },
    {
      id: 5,
      title: "Mastering Pitch Decks",
      description: "Learn how to create compelling pitch decks that attract investors.",
      type: "workshop",
      format: "video",
      author: "Pitch Perfect",
      date: "March 30, 2025",
      tags: ["pitch deck", "fundraising", "presentation"],
      url: "#",
      duration: "4 hours",
      difficulty: "beginner",
      rating: 4.7,
      completionRate: 0
    },
    {
      id: 6,
      title: "Digital Marketing for Startups",
      description: "Strategies for effective digital marketing on a startup budget.",
      type: "course",
      format: "video",
      author: "Digital Growth Academy",
      date: "February 28, 2025",
      tags: ["marketing", "digital", "growth"],
      url: "#",
      duration: "6 hours",
      difficulty: "intermediate",
      rating: 4.4,
      completionRate: 0
    },
    {
      id: 7,
      title: "Founder Psychology: Mental Health for Entrepreneurs",
      description: "Understanding and managing the psychological challenges of being a founder.",
      type: "podcast",
      format: "audio",
      author: "Founder Wellness Institute",
      date: "April 12, 2025",
      tags: ["mental health", "psychology", "wellbeing"],
      url: "#",
      duration: "5 episodes",
      difficulty: "all levels",
      rating: 4.8,
      completionRate: 0
    },
    {
      id: 8,
      title: "Building a Minimum Viable Product",
      description: "A step-by-step guide to defining, building, and launching an MVP.",
      type: "tutorial",
      format: "document",
      author: "Product Development Institute",
      date: "January 15, 2025",
      tags: ["MVP", "product development", "validation"],
      url: "#",
      duration: "2 hours",
      difficulty: "beginner",
      rating: 4.6,
      completionRate: 0
    },
    {
      id: 9,
      title: "Advanced Fundraising Strategies",
      description: "Expert techniques for raising capital at different stages of your startup.",
      type: "masterclass",
      format: "video",
      author: "Venture Capital Experts",
      date: "March 5, 2025",
      tags: ["fundraising", "venture capital", "investment"],
      url: "#",
      duration: "7 hours",
      difficulty: "advanced",
      rating: 4.7,
      completionRate: 0
    },
    {
      id: 10,
      title: "Customer Acquisition Fundamentals",
      description: "Learn proven strategies for acquiring and retaining customers for your startup.",
      type: "course",
      format: "video",
      author: "Growth Hackers India",
      date: "February 20, 2025",
      tags: ["customers", "acquisition", "growth"],
      url: "#",
      duration: "5 hours",
      difficulty: "intermediate",
      rating: 4.5,
      completionRate: 0
    },
  ];

  // Filter materials based on active tab, search query, and filters
  const filteredMaterials = educationalMaterials.filter(material => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "courses" && material.type === "course") ||
                      (activeTab === "tutorials" && material.type === "tutorial") ||
                      (activeTab === "guides" && material.type === "guide") ||
                      (activeTab === "workshops" && material.type === "workshop") ||
                      (activeTab === "podcasts" && material.type === "podcast") ||
                      (activeTab === "bookmarked" && bookmarkedMaterials.includes(material.id));
    
    const matchesSearch = searchQuery === "" || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === "all" || material.difficulty === difficultyFilter;
    
    const matchesFormat = formatFilter === "all" || material.format === formatFilter;
    
    return matchesTab && matchesSearch && matchesDifficulty && matchesFormat;
  });

  const toggleBookmark = (id: number) => {
    setBookmarkedMaterials(prev => {
      const isCurrentlyBookmarked = prev.includes(id);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter(materialId => materialId !== id)
        : [...prev, id];
      
      const material = educationalMaterials.find(r => r.id === id);
      
      toast({
        title: isCurrentlyBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: material?.title,
      });
      
      return newBookmarks;
    });
  };

  const startLearning = (material: any) => {
    toast({
      title: "Starting course",
      description: `You are now viewing ${material.title}`,
    });
    
    // In a real app, this would navigate to the course page
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "video":
        return <VideoIcon className="h-4 w-4" />;
      case "document":
        return <FileIcon className="h-4 w-4" />;
      case "audio":
        return <Podcast className="h-4 w-4" />;
      default:
        return <BookIcon className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
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
              <GraduationCap className="mr-2 h-8 w-8" />
              Educational Materials
            </h1>
            <p className="text-muted-foreground mt-1">
              Courses, tutorials, and resources to help you grow your skills
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search materials..."
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
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Difficulty Level</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="difficulty-all" 
                        name="difficulty" 
                        className="mr-2"
                        checked={difficultyFilter === "all"}
                        onChange={() => setDifficultyFilter("all")}
                      />
                      <label htmlFor="difficulty-all">All Levels</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="difficulty-beginner" 
                        name="difficulty" 
                        className="mr-2"
                        checked={difficultyFilter === "beginner"}
                        onChange={() => setDifficultyFilter("beginner")}
                      />
                      <label htmlFor="difficulty-beginner">Beginner</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="difficulty-intermediate" 
                        name="difficulty" 
                        className="mr-2"
                        checked={difficultyFilter === "intermediate"}
                        onChange={() => setDifficultyFilter("intermediate")}
                      />
                      <label htmlFor="difficulty-intermediate">Intermediate</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="difficulty-advanced" 
                        name="difficulty" 
                        className="mr-2"
                        checked={difficultyFilter === "advanced"}
                        onChange={() => setDifficultyFilter("advanced")}
                      />
                      <label htmlFor="difficulty-advanced">Advanced</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Format</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="format-all" 
                        name="format" 
                        className="mr-2"
                        checked={formatFilter === "all"}
                        onChange={() => setFormatFilter("all")}
                      />
                      <label htmlFor="format-all">All Formats</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="format-video" 
                        name="format" 
                        className="mr-2"
                        checked={formatFilter === "video"}
                        onChange={() => setFormatFilter("video")}
                      />
                      <label htmlFor="format-video" className="flex items-center">
                        <VideoIcon className="h-4 w-4 mr-1" />
                        Video
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="format-document" 
                        name="format" 
                        className="mr-2"
                        checked={formatFilter === "document"}
                        onChange={() => setFormatFilter("document")}
                      />
                      <label htmlFor="format-document" className="flex items-center">
                        <FileIcon className="h-4 w-4 mr-1" />
                        Document
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="format-audio" 
                        name="format" 
                        className="mr-2"
                        checked={formatFilter === "audio"}
                        onChange={() => setFormatFilter("audio")}
                      />
                      <label htmlFor="format-audio" className="flex items-center">
                        <Podcast className="h-4 w-4 mr-1" />
                        Audio
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {["fundraising", "marketing", "product", "legal", "finance", "growth"].map(topic => (
                      <Badge 
                        key={topic} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setSearchQuery(topic)}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="all">All Materials</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="guides">Guides</TabsTrigger>
                <TabsTrigger value="workshops">Workshops</TabsTrigger>
                <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
                <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredMaterials.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No materials found</h3>
                      <p className="text-muted-foreground text-center max-w-md mb-6">
                        We couldn't find any educational materials matching your current filters.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchQuery("");
                          setDifficultyFilter("all");
                          setFormatFilter("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredMaterials.map(material => (
                      <Card key={material.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 bg-gray-100 flex items-center justify-center p-6">
                            {material.format === "video" && <VideoIcon className="h-12 w-12 text-primary" />}
                            {material.format === "document" && <FileIcon className="h-12 w-12 text-primary" />}
                            {material.format === "audio" && <Podcast className="h-12 w-12 text-primary" />}
                          </div>
                          <div className="md:w-3/4 p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline">{material.type}</Badge>
                                  <Badge className={getDifficultyColor(material.difficulty)}>
                                    {material.difficulty}
                                  </Badge>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{material.title}</h3>
                                <p className="text-muted-foreground mb-4">{material.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {material.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span className="mr-4">{material.duration}</span>
                                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                  <span className="mr-4">{material.rating}</span>
                                  <span>By {material.author}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleBookmark(material.id)}
                                className="text-gray-500 hover:text-primary"
                              >
                                <Bookmark
                                  className={`h-5 w-5 ${bookmarkedMaterials.includes(material.id) ? "fill-primary text-primary" : ""}`}
                                />
                              </Button>
                            </div>
                            
                            {material.completionRate > 0 && (
                              <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{material.completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${material.completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => window.open(material.url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => startLearning(material)}
                              >
                                {material.completionRate > 0 ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Continue
                                  </>
                                ) : (
                                  <>
                                    <Lightbulb className="h-4 w-4 mr-2" />
                                    Start Learning
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
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