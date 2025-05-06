import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  Award, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Calendar, 
  Sparkles, 
  Lightbulb, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Define types for our data
interface Innovation {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  studentName: string;
  institution: string;
  date: string;
  featured?: boolean;
  views: number;
  upvotes: number;
  comments: number;
}

// Sample data for innovations
const sampleInnovations: Innovation[] = [
  {
    id: "1",
    title: "AI-Powered Water Quality Monitor",
    description: "A low-cost device that uses machine learning to detect contaminants in drinking water and sends alerts to a mobile app.",
    imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    tags: ["AI", "IoT", "Healthcare", "Environment"],
    studentName: "Priya Sharma",
    institution: "IIT Delhi",
    date: "2023-10-15",
    featured: true,
    views: 1245,
    upvotes: 342,
    comments: 56
  },
  {
    id: "2",
    title: "Solar-Powered Smart Irrigation System",
    description: "An automated irrigation system that uses soil moisture sensors and weather data to optimize water usage for farmers.",
    imageUrl: "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    tags: ["Agriculture", "Sustainability", "IoT"],
    studentName: "Rahul Patel",
    institution: "BITS Pilani",
    date: "2023-09-28",
    views: 987,
    upvotes: 245,
    comments: 32
  },
  {
    id: "3",
    title: "AR-Based Educational Platform for Rural Schools",
    description: "An augmented reality platform that brings interactive learning experiences to students in rural areas with limited resources.",
    imageUrl: "https://images.unsplash.com/photo-1596496181871-9681eacf9764?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    tags: ["Education", "AR/VR", "Social Impact"],
    studentName: "Ananya Desai",
    institution: "IIIT Hyderabad",
    date: "2023-10-05",
    views: 756,
    upvotes: 189,
    comments: 41
  },
  {
    id: "4",
    title: "Blockchain-Based Medical Records System",
    description: "A secure platform for storing and sharing medical records using blockchain technology to ensure privacy and accessibility.",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    tags: ["Blockchain", "Healthcare", "Security"],
    studentName: "Vikram Singh",
    institution: "IIM Bangalore",
    date: "2023-09-20",
    views: 1102,
    upvotes: 276,
    comments: 38
  },
  {
    id: "5",
    title: "Eco-Friendly Biodegradable Packaging",
    description: "A new material made from agricultural waste that can replace plastic packaging and degrades within 60 days.",
    imageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    tags: ["Sustainability", "Materials", "Environment"],
    studentName: "Neha Gupta",
    institution: "NIT Trichy",
    date: "2023-10-10",
    views: 845,
    upvotes: 198,
    comments: 27
  },
  {
    id: "6",
    title: "Mental Health Support Chatbot",
    description: "An AI-powered chatbot designed to provide initial mental health support and resources for college students.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
    tags: ["AI", "Mental Health", "Social Impact"],
    studentName: "Arjun Reddy",
    institution: "AIIMS Delhi",
    date: "2023-09-15",
    views: 1320,
    upvotes: 312,
    comments: 64
  },
  {
    id: "7",
    title: "Smart Traffic Management System",
    description: "A network of IoT sensors and AI algorithms to optimize traffic flow in congested urban areas.",
    imageUrl: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    tags: ["IoT", "Smart City", "AI"],
    studentName: "Karthik Menon",
    institution: "IIT Madras",
    date: "2023-10-02",
    views: 932,
    upvotes: 221,
    comments: 35
  },
  {
    id: "8",
    title: "Wearable Device for the Visually Impaired",
    description: "A haptic feedback wearable that helps visually impaired individuals navigate their surroundings safely.",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    tags: ["Accessibility", "Wearable", "Social Impact"],
    studentName: "Zoya Khan",
    institution: "IISC Bangalore",
    date: "2023-09-25",
    views: 876,
    upvotes: 234,
    comments: 42
  }
];

// All possible tags for filtering
const allTags = [
  "AI", "IoT", "Healthcare", "Environment", "Agriculture", "Sustainability", 
  "Education", "AR/VR", "Social Impact", "Blockchain", "Security", 
  "Materials", "Mental Health", "Smart City", "Accessibility", "Wearable"
];

// Categories for filtering
const categories = [
  "All",
  "Technology",
  "Healthcare",
  "Environment",
  "Education",
  "Social Impact"
];

// Map tags to categories
const tagToCategory: Record<string, string[]> = {
  "Technology": ["AI", "IoT", "Blockchain", "AR/VR", "Wearable"],
  "Healthcare": ["Healthcare", "Mental Health"],
  "Environment": ["Environment", "Sustainability", "Materials"],
  "Education": ["Education"],
  "Social Impact": ["Social Impact", "Accessibility"]
};

export default function StudentInnovationsPage() {
  const { toast } = useToast();
  const [innovations, setInnovations] = useState<Innovation[]>(sampleInnovations);
  const [filteredInnovations, setFilteredInnovations] = useState<Innovation[]>(sampleInnovations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedInnovation, setSelectedInnovation] = useState<Innovation | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isUpvoted, setIsUpvoted] = useState<Record<string, boolean>>({});
  
  // Form state for submission
  const [submissionForm, setSubmissionForm] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    studentName: "",
    institution: "",
    imageUrl: ""
  });

  // Items per page for pagination
  const itemsPerPage = 6;

  // Filter innovations based on search term, category, and tags
  useEffect(() => {
    let filtered = [...innovations];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        item => 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      const categoryTags = tagToCategory[selectedCategory] || [];
      filtered = filtered.filter(item => 
        item.tags.some(tag => categoryTags.includes(tag))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.every(tag => item.tags.includes(tag))
      );
    }
    
    setFilteredInnovations(filtered);
    setCurrentPage(0); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, selectedTags, innovations]);

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubmissionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle tag selection in submission form
  const handleSubmissionTagToggle = (tag: string) => {
    setSubmissionForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Handle innovation submission
  const handleSubmitInnovation = () => {
    // Validate form
    if (!submissionForm.title || !submissionForm.description || !submissionForm.studentName || !submissionForm.institution) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Create new innovation
    const newInnovation: Innovation = {
      id: Date.now().toString(),
      title: submissionForm.title,
      description: submissionForm.description,
      imageUrl: submissionForm.imageUrl || "https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: submissionForm.tags.length > 0 ? submissionForm.tags : ["Other"],
      studentName: submissionForm.studentName,
      institution: submissionForm.institution,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      upvotes: 0,
      comments: 0
    };

    // Add to innovations list
    setInnovations(prev => [newInnovation, ...prev]);
    
    // Reset form and close dialog
    setSubmissionForm({
      title: "",
      description: "",
      tags: [],
      studentName: "",
      institution: "",
      imageUrl: ""
    });
    setIsSubmitDialogOpen(false);
    
    toast({
      title: "Innovation Submitted",
      description: "Your innovation has been submitted successfully!",
      variant: "default"
    });
  };

  // Handle viewing innovation details
  const handleViewInnovation = (innovation: Innovation) => {
    setSelectedInnovation(innovation);
    setIsDetailDialogOpen(true);
    
    // Increment view count
    setInnovations(prev => 
      prev.map(item => 
        item.id === innovation.id 
          ? { ...item, views: item.views + 1 } 
          : item
      )
    );
  };

  // Handle upvoting an innovation
  const handleUpvote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (isUpvoted[id]) {
      // Remove upvote
      setIsUpvoted(prev => ({ ...prev, [id]: false }));
      setInnovations(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, upvotes: item.upvotes - 1 } 
            : item
        )
      );
    } else {
      // Add upvote
      setIsUpvoted(prev => ({ ...prev, [id]: true }));
      setInnovations(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, upvotes: item.upvotes + 1 } 
            : item
        )
      );
      
      toast({
        title: "Upvoted!",
        description: "You've upvoted this innovation",
        variant: "default"
      });
    }
  };

  // Handle sharing an innovation
  const handleShare = (innovation: Innovation, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedInnovation(innovation);
    setIsShareDialogOpen(true);
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredInnovations.length / itemsPerPage);
  
  // Get current page items
  const currentItems = filteredInnovations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Featured innovation (if any)
  const featuredInnovation = innovations.find(item => item.featured);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Student Innovations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover groundbreaking innovations from India's brightest student minds. 
            From AI to sustainability, explore how the next generation is solving real-world problems.
          </p>
        </div>

        {/* Featured Innovation - Enhanced for Desktop */}
        {featuredInnovation && (
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-xl shadow-lg border border-primary/10 bg-white hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white font-semibold px-3 py-1.5 shadow-md">
                  <Award className="h-4 w-4 mr-1" />
                  Featured Innovation
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-64 md:h-auto overflow-hidden">
                  <img 
                    src={featuredInnovation.imageUrl} 
                    alt={featuredInnovation.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{featuredInnovation.title}</h2>
                    <p className="text-gray-600 mb-4 md:text-lg">{featuredInnovation.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featuredInnovation.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <span className="font-medium text-gray-800">{featuredInnovation.studentName}</span>
                      <span className="mx-2">•</span>
                      <span>{featuredInnovation.institution}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm md:text-base text-gray-500">
                        <span className="flex items-center">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {featuredInnovation.upvotes}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {featuredInnovation.comments}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(featuredInnovation.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleViewInnovation(featuredInnovation)}
                        className="bg-primary hover:bg-primary/90 text-white md:px-6 md:py-2"
                      >
                        View Details
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search innovations, students, or institutions..."
                className="pl-10 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setIsSubmitDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Submit Your Innovation
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="mt-4">
            <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-gray-100 p-1">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedTags.includes(tag) 
                      ? "bg-primary text-white" 
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && " ✓"}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Innovations Grid - Enhanced for Desktop */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentItems.map((innovation) => (
              <motion.div
                key={innovation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleViewInnovation(innovation)}
              >
                <div className="h-48 md:h-56 overflow-hidden relative">
                  <img 
                    src={innovation.imageUrl} 
                    alt={innovation.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <p className="font-medium">View Details</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{innovation.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm md:text-base line-clamp-2">{innovation.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {innovation.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                    {innovation.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                        +{innovation.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <span className="font-medium text-gray-800">{innovation.studentName}</span>
                    <span className="mx-1">•</span>
                    <span className="truncate">{innovation.institution}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <button 
                        className={`flex items-center hover:text-primary transition-colors ${isUpvoted[innovation.id] ? 'text-primary' : ''}`}
                        onClick={(e) => handleUpvote(innovation.id, e)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {innovation.upvotes}
                      </button>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {innovation.comments}
                      </span>
                    </div>
                    <button 
                      className="text-gray-500 hover:text-primary transition-colors p-1 rounded-full hover:bg-gray-100"
                      onClick={(e) => handleShare(innovation, e)}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No innovations found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedTags([]);
              }}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="border-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(index)}
                className={currentPage === index ? "bg-primary text-white" : "border-gray-200"}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="border-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Call to Action - Enhanced for Desktop */}
        <div className="bg-gradient-to-r from-primary/90 to-blue-600 rounded-xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          {/* Decorative elements visible on desktop */}
          <div className="hidden md:block absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-xl"></div>
          <div className="hidden md:block absolute -bottom-32 -left-32 w-80 h-80 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Sparkles className="h-10 w-10 md:h-14 md:w-14 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Have an innovative idea?</h2>
              <p className="mb-6 max-w-2xl mx-auto md:text-lg">
                Showcase your innovation to potential investors, mentors, and the entire Hindustan Founders Network community.
              </p>
              <Button 
                onClick={() => setIsSubmitDialogOpen(true)}
                className="bg-white text-primary hover:bg-gray-100 md:text-lg md:px-8 md:py-6 shadow-lg hover:shadow-xl transition-shadow"
                size="lg"
              >
                <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Submit Your Innovation
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Submit Innovation Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-primary" />
              Submit Your Innovation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Innovation Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={submissionForm.title}
                onChange={handleInputChange}
                placeholder="Enter a catchy title for your innovation"
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                value={submissionForm.description}
                onChange={handleInputChange}
                placeholder="Describe your innovation, its purpose, and impact"
                className="border-gray-300 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tags (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant={submissionForm.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      submissionForm.tags.includes(tag) 
                        ? "bg-primary text-white" 
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSubmissionTagToggle(tag)}
                  >
                    {tag}
                    {submissionForm.tags.includes(tag) && " ✓"}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="studentName" className="text-sm font-medium">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={submissionForm.studentName}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="institution" className="text-sm font-medium">
                  Institution <span className="text-red-500">*</span>
                </label>
                <Input
                  id="institution"
                  name="institution"
                  value={submissionForm.institution}
                  onChange={handleInputChange}
                  placeholder="Your college or university"
                  className="border-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium">
                Image URL (Optional)
              </label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={submissionForm.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/your-image.jpg"
                className="border-gray-300"
              />
              <p className="text-xs text-gray-500">
                Provide a URL to an image that represents your innovation. If left blank, a default image will be used.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitInnovation} className="bg-primary text-white">
              Submit Innovation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Innovation Detail Dialog */}
      {selectedInnovation && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
            <div className="h-64 overflow-hidden">
              <img 
                src={selectedInnovation.imageUrl} 
                alt={selectedInnovation.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedInnovation.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedInnovation.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-gray-600 mb-6">{selectedInnovation.description}</p>
              
              <div className="flex items-center text-gray-600 mb-4">
                <span className="font-medium text-gray-800">{selectedInnovation.studentName}</span>
                <span className="mx-2">•</span>
                <span>{selectedInnovation.institution}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(selectedInnovation.date).toLocaleDateString('en-US', { 
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-6">
                  <button 
                    className={`flex items-center ${isUpvoted[selectedInnovation.id] ? 'text-primary' : 'text-gray-500'}`}
                    onClick={() => handleUpvote(selectedInnovation.id)}
                  >
                    <ThumbsUp className="h-5 w-5 mr-1" />
                    <span>{selectedInnovation.upvotes} Upvotes</span>
                  </button>
                  <span className="flex items-center text-gray-500">
                    <MessageSquare className="h-5 w-5 mr-1" />
                    {selectedInnovation.comments} Comments
                  </span>
                  <span className="flex items-center text-gray-500">
                    <Eye className="h-5 w-5 mr-1" />
                    {selectedInnovation.views} Views
                  </span>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsShareDialogOpen(true);
                  }}
                  className="border-gray-200"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      {selectedInnovation && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Share this Innovation</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-4">
                Share "{selectedInnovation.title}" with your network
              </p>
              <div className="flex justify-center space-x-4 mb-6">
                <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-blue-500 text-blue-500">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-sky-500 text-sky-500">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-blue-700 text-blue-700">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="rounded-full h-12 w-12 p-0 border-green-500 text-green-500">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <div className="relative">
                <Input 
                  value={`https://foundernetwork.in/innovations/${selectedInnovation.id}`}
                  readOnly
                  className="pr-20 bg-gray-50"
                />
                <Button 
                  className="absolute right-1 top-1 h-8 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://foundernetwork.in/innovations/${selectedInnovation.id}`);
                    toast({
                      title: "Link Copied",
                      description: "Link copied to clipboard",
                    });
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}