import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Lightbulb, 
  ThumbsUp, 
  MessageSquare, 
  Eye
} from "lucide-react";

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
}

export default function StudentInnovationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample data for innovations
  const innovations = [
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
      views: 1203
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
      views: 876
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
      views: 723
    }
  ];

  // Filter innovations based on search
  const filteredInnovations = innovations.filter(innovation => 
    innovation.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    innovation.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Student Innovations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover groundbreaking innovations from India's brightest student minds.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search innovations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Innovations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredInnovations.map((innovation) => (
            <div 
              key={innovation.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={innovation.imageUrl} 
                  alt={innovation.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{innovation.title}</h3>
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{innovation.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {innovation.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <span className="font-medium text-gray-800">{innovation.studentName}</span>
                  <span className="mx-1">•</span>
                  <span>{innovation.institution}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {innovation.upvotes}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {innovation.comments}
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {innovation.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="bg-primary/90 rounded-xl p-8 text-white text-center">
          <Lightbulb className="h-10 w-10 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Have an innovative idea?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Showcase your innovation to potential investors, mentors, and the entire Hindustan Founders Network community.
          </p>
          <Button 
            className="bg-white text-primary hover:bg-gray-100"
            size="lg"
          >
            Submit Your Innovation
          </Button>
        </div>
      </div>
    </Layout>
  );
}