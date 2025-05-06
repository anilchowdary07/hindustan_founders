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
  studentName: string;
  institution: string;
  imageUrl: string;
  tags: string[];
  upvotes: number;
  comments: number;
  views: number;
  date: string;
  category: string;
}

export default function StudentInnovationsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedInnovation, setSelectedInnovation] = useState<Innovation | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpvoted, setIsUpvoted] = useState<Record<string, boolean>>({});
  const itemsPerPage = 9;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    studentName: "",
    institution: "",
    imageUrl: "",
    tags: [] as string[],
    category: "technology"
  });

  // Sample data for innovations
  const [innovations, setInnovations] = useState<Innovation[]>([
    {
      id: "1",
      title: "AI-Powered Water Quality Monitoring System",
      description: "A low-cost, solar-powered device that uses machine learning to detect contaminants in water sources and sends real-time alerts to communities via SMS.",
      studentName: "Priya Sharma",
      institution: "IIT Delhi",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["AI", "Clean Water", "IoT", "Sustainability"],
      upvotes: 245,
      comments: 32,
      views: 1203,
      date: "2023-09-15",
      category: "sustainability"
    },
    {
      id: "2",
      title: "Biodegradable Smart Packaging",
      description: "Packaging material made from agricultural waste that changes color when food is spoiling and completely biodegrades within 30 days.",
      studentName: "Arjun Patel",
      institution: "BITS Pilani",
      imageUrl: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Sustainability", "Food Tech", "Biotech"],
      upvotes: 189,
      comments: 24,
      views: 876,
      date: "2023-08-22",
      category: "sustainability"
    },
    {
      id: "3",
      title: "AR Language Learning Platform",
      description: "An augmented reality app that helps users learn languages by overlaying translations and pronunciation guides on real-world objects.",
      studentName: "Neha Gupta",
      institution: "IIM Bangalore",
      imageUrl: "https://images.unsplash.com/photo-1626379953822-baec19c3accd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["AR", "Education", "Languages", "Mobile App"],
      upvotes: 156,
      comments: 18,
      views: 723,
      date: "2023-09-05",
      category: "education"
    },
    {
      id: "4",
      title: "Drone-Based Reforestation System",
      description: "A network of drones that can plant tree seeds in difficult-to-reach areas, accelerating reforestation efforts by 10x compared to manual planting.",
      studentName: "Vikram Singh",
      institution: "IIT Bombay",
      imageUrl: "https://images.unsplash.com/photo-1527849214787-c89127f2be38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      tags: ["Drones", "Climate Action", "Reforestation", "Robotics"],
      upvotes: 278,
      comments: 41,
      views: 1567,
      date: "2023-07-30",
      category: "sustainability"
    },
    {
      id: "5",
      title: "Wearable Health Monitor for Rural Areas",
      description: "A low-cost wearable device that monitors vital signs and can detect early warning signs of common diseases, designed specifically for use in areas with limited healthcare access.",
      studentName: "Ananya Reddy",
      institution: "AIIMS Delhi",
      imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80",
      tags: ["Healthcare", "Wearables", "Rural Tech", "IoT"],
      upvotes: 312,
      comments: 47,
      views: 1892,
      date: "2023-08-12",
      category: "healthcare"
    },
    {
      id: "6",
      title: "Blockchain-Based Microfinance Platform",
      description: "A decentralized platform that connects rural entrepreneurs directly with investors, eliminating middlemen and reducing interest rates for small business loans.",
      studentName: "Rahul Verma",
      institution: "ISB Hyderabad",
      imageUrl: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["Blockchain", "Fintech", "Microfinance", "Rural Development"],
      upvotes: 167,
      comments: 29,
      views: 943,
      date: "2023-09-18",
      category: "fintech"
    },
    {
      id: "7",
      title: "Smart Irrigation System for Small Farms",
      description: "An affordable, solar-powered irrigation system that uses soil moisture sensors and weather data to optimize water usage for small-scale farmers.",
      studentName: "Kiran Kumar",
      institution: "Tamil Nadu Agricultural University",
      imageUrl: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["AgriTech", "IoT", "Water Conservation", "Sustainable Farming"],
      upvotes: 203,
      comments: 35,
      views: 1124,
      date: "2023-08-05",
      category: "agriculture"
    },
    {
      id: "8",
      title: "Virtual Reality Therapy for Anxiety Disorders",
      description: "A VR platform that provides exposure therapy for anxiety disorders, making mental health treatment more accessible and affordable.",
      studentName: "Meera Joshi",
      institution: "NIMHANS Bangalore",
      imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["VR", "Mental Health", "Healthcare", "Therapy"],
      upvotes: 231,
      comments: 38,
      views: 1356,
      date: "2023-07-25",
      category: "healthcare"
    },
    {
      id: "9",
      title: "Peer-to-Peer Energy Trading Platform",
      description: "A platform that allows households with solar panels to sell excess energy directly to neighbors, creating microgrids that reduce dependency on central power infrastructure.",
      studentName: "Aditya Sharma",
      institution: "IIT Madras",
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
      tags: ["Clean Energy", "P2P", "Blockchain", "Smart Grid"],
      upvotes: 198,
      comments: 31,
      views: 1087,
      date: "2023-09-10",
      category: "energy"
    },
    {
      id: "10",
      title: "AI-Powered Crop Disease Detection",
      description: "A mobile app that uses computer vision to identify crop diseases from photos, providing immediate treatment recommendations to farmers in multiple Indian languages.",
      studentName: "Deepak Patel",
      institution: "Punjab Agricultural University",
      imageUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      tags: ["AI", "Agriculture", "Computer Vision", "Rural Tech"],
      upvotes: 267,
      comments: 43,
      views: 1432,
      date: "2023-08-28",
      category: "agriculture"
    },
    {
      id: "11",
      title: "Gamified Financial Literacy App",
      description: "An interactive mobile game that teaches financial literacy to young adults through real-world scenarios and challenges.",
      studentName: "Sanya Malhotra",
      institution: "SRCC Delhi",
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
      tags: ["Fintech", "Education", "Gamification", "Financial Literacy"],
      upvotes: 145,
      comments: 22,
      views: 876,
      date: "2023-09-20",
      category: "fintech"
    },
    {
      id: "12",
      title: "Braille Smart Watch for the Visually Impaired",
      description: "A wearable device that converts digital text to braille, allowing visually impaired users to read messages, notifications, and e-books on the go.",
      studentName: "Rohan Mehta",
      institution: "IIT Kharagpur",
      imageUrl: "https://images.unsplash.com/photo-1617625802912-cde586faf331?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      tags: ["Accessibility", "Wearables", "Assistive Tech", "Hardware"],
      upvotes: 289,
      comments: 45,
      views: 1678,
      date: "2023-07-15",
      category: "accessibility"
    }
  ]);

  // Get all unique tags from innovations
  const allTags = Array.from(new Set(innovations.flatMap(innovation => innovation.tags)));

  // Get all categories
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "technology", name: "Technology" },
    { id: "sustainability", name: "Sustainability" },
    { id: "healthcare", name: "Healthcare" },
    { id: "education", name: "Education" },
    { id: "fintech", name: "Fintech" },
    { id: "agriculture", name: "Agriculture" },
    { id: "energy", name: "Energy" },
    { id: "accessibility", name: "Accessibility" }
  ];

  // Featured innovation (highest upvotes)
  const featuredInnovation = innovations.reduce((prev, current) => 
    (prev.upvotes > current.upvotes) ? prev : current
  );

  // Filter innovations based on search, category, and tags
  const filteredInnovations = innovations.filter(innovation => {
    const matchesSearch = innovation.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         innovation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         innovation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         innovation.institution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || innovation.category === selectedCategory;
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => innovation.tags.includes(tag));
    
    return matchesSearch && matchesCategory && matchesTags;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInnovations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInnovations.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle view innovation details
  const handleViewInnovation = (innovation: Innovation) => {
    setSelectedInnovation(innovation);
    setIsDetailDialogOpen(true);
    
    // Increment view count
    setInnovations(prevInnovations => 
      prevInnovations.map(item => 
        item.id === innovation.id 
          ? { ...item, views: item.views + 1 } 
          : item
      )
    );
  };

  // Handle upvote
  const handleUpvote = (innovationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setIsUpvoted(prev => {
      const newState = { ...prev, [innovationId]: !prev[innovationId] };
      return newState;
    });
    
    setInnovations(prevInnovations => 
      prevInnovations.map(item => 
        item.id === innovationId 
          ? { 
              ...item, 
              upvotes: isUpvoted[innovationId] 
                ? item.upvotes - 1 
                : item.upvotes + 1 
            } 
          : item
      )
    );
    
    if (!isUpvoted[innovationId]) {
      toast({
        title: "Upvoted!",
        description: "You've upvoted this innovation.",
        duration: 2000,
      });
    }
  };

  // Handle share
  const handleShare = (innovation: Innovation, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInnovation(innovation);
    setShareUrl(`https://foundernetwork.in/innovations/${innovation.id}`);
    setIsShareDialogOpen(true);
  };

  // Handle social media sharing
  const handleSocialShare = (platform: string) => {
    if (!selectedInnovation) return;
    
    const text = `Check out this amazing innovation: ${selectedInnovation.title}`;
    const url = shareUrl;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    setIsShareDialogOpen(false);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tag selection in form
  const handleTagSelect = (tag: string) => {
    setFormData(prev => {
      if (prev.tags.includes(tag)) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a random ID
    const newId = (innovations.length + 1).toString();
    
    // Create new innovation
    const newInnovation: Innovation = {
      id: newId,
      title: formData.title,
      description: formData.description,
      studentName: formData.studentName,
      institution: formData.institution,
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2065&q=80",
      tags: formData.tags,
      upvotes: 0,
      comments: 0,
      views: 0,
      date: new Date().toISOString().split('T')[0],
      category: formData.category
    };
    
    // Add to innovations
    setInnovations(prev => [newInnovation, ...prev]);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      studentName: "",
      institution: "",
      imageUrl: "",
      tags: [],
      category: "technology"
    });
    
    // Close dialog
    setIsSubmitDialogOpen(false);
    
    // Show success toast
    toast({
      title: "Innovation Submitted!",
      description: "Your innovation has been successfully submitted.",
      duration: 3000,
    });
  };

  // Handle filter by tag
  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Student Innovations</h1>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search innovations, students, or institutions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <Tabs defaultValue="categories" className="w-full md:w-auto">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                </TabsList>
                <TabsContent value="categories" className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Badge 
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedCategory === category.id 
                            ? "bg-primary text-white" 
                            : "bg-transparent hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setCurrentPage(1);
                        }}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="tags" className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge 
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${
                          selectedTags.includes(tag) 
                            ? "bg-primary text-white" 
                            : "bg-transparent hover:bg-gray-100"
                        }`}
                        onClick={() => handleTagFilter(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
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
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedTags([]);
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {filteredInnovations.length > itemsPerPage && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`h-8 w-8 ${currentPage === page ? "bg-primary text-white" : ""}`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8"
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
            <DialogTitle>Submit Your Innovation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Innovation Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a catchy title for your innovation"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your innovation in detail"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="studentName" className="text-sm font-medium">
                    Your Name
                  </label>
                  <Input
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="institution" className="text-sm font-medium">
                    Institution
                  </label>
                  <Input
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="Your college or university"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="imageUrl" className="text-sm font-medium">
                  Image URL (Optional)
                </label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Link to an image of your innovation"
                />
                <p className="text-xs text-gray-500">
                  If left blank, a default image will be used.
                </p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange as any}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {categories.filter(c => c.id !== "all").map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge 
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        formData.tags.includes(tag) 
                          ? "bg-primary text-white" 
                          : "bg-transparent hover:bg-gray-100"
                      }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select all tags that apply to your innovation.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Innovation
              </Button>
            </DialogFooter>
          </form>
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
              <p className="text-gray-600 mb-4">{selectedInnovation.description}</p>
              <div className="flex items-center text-gray-600 mb-4">
                <span className="font-medium text-gray-800">{selectedInnovation.studentName}</span>
                <span className="mx-2">•</span>
                <span>{selectedInnovation.institution}</span>
                <span className="mx-2">•</span>
                <span>{new Date(selectedInnovation.date).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
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
                  size="sm"
                  onClick={() => {
                    setShareUrl(`https://foundernetwork.in/innovations/${selectedInnovation.id}`);
                    setIsShareDialogOpen(true);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Share this innovation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 mb-4">
              <Input value={shareUrl} readOnly />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({
                    title: "Link copied!",
                    description: "The link has been copied to your clipboard.",
                    duration: 2000,
                  });
                }}
              >
                Copy
              </Button>
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border-none"
                onClick={() => handleSocialShare('twitter')}
              >
                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border-none"
                onClick={() => handleSocialShare('linkedin')}
              >
                <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-none"
                onClick={() => handleSocialShare('facebook')}
              >
                <Facebook className="h-5 w-5 text-[#1877F2]" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-12 w-12 bg-primary/10 hover:bg-primary/20 border-none"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedInnovation?.title || 'Student Innovation',
                      text: selectedInnovation?.description || 'Check out this amazing innovation!',
                      url: shareUrl,
                    });
                  }
                }}
              >
                <Send className="h-5 w-5 text-primary" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}