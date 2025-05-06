import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import adminRouter from "./admin-routes";
import { 
  insertPostSchema, 
  insertPitchSchema, 
  insertExperienceSchema,
  insertJobSchema,
  PitchStatus,
  InsertPitch
} from "@shared/schema";
// @ts-ignore - Fix multer TypeScript issues
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const isVercel = process.env.VERCEL === '1';
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure the upload directory exists in non-Vercel environments
if (!isVercel && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage for Vercel, disk storage for other environments
const storage_config = isVercel 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    });

const upload = multer({ 
  storage: storage_config,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept all file types for now
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Add a health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Register admin routes
  app.use("/api/admin", adminRouter);

  // Serve static files from uploads directory
  if (!isVercel) {
    app.use('/uploads', (req, res, next) => {
      // Set cache control headers to improve performance
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      next();
    }, fs.existsSync(uploadDir) ? express.static(uploadDir) : (req, res, next) => next());
  } else {
    // In Vercel environment, handle uploads differently
    app.get('/uploads/:filename', (req, res) => {
      // This is a placeholder - in a real app, you would serve from a cloud storage service
      res.status(404).json({ message: "File uploads not supported in this environment" });
    });
  }

  // Post routes
  app.post("/api/posts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertPostSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  
  // Post with file upload (image, video, document)
  app.post("/api/posts/with-image", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // @ts-ignore - Handle multer TypeScript issues
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }
      
      try {
        // @ts-ignore - Handle multer TypeScript issues
        const file = req.file;
        
        if (!file) {
          return res.status(400).json({ message: "No file provided" });
        }
        
        let mediaPath;
        
        if (isVercel) {
          // In Vercel, we would normally upload to a cloud storage service
          // For now, we'll just use a placeholder URL
          mediaPath = `/uploads/placeholder-${Date.now()}.jpg`;
          
          // In a real implementation, you would upload the file.buffer to a service like S3
          // const uploadResult = await uploadToCloudStorage(file.buffer, file.originalname);
          // mediaPath = uploadResult.url;
        } else {
          // Local environment - use the file system
          mediaPath = `/uploads/${file.filename}`;
        }
        
        // Validate and create post - omit mediaType for now since the column doesn't exist
        const validatedData = insertPostSchema.parse({
          content: req.body.content,
          userId: req.user.id,
          media: mediaPath
        });
        
        const post = await storage.createPost(validatedData);
        res.status(201).json(post);
      } catch (error) {
        res.status(400).json({ message: "Invalid post data", error });
      }
    });
  });

  app.get("/api/posts", async (req, res) => {
    try {
      let posts = await storage.getPosts();
      
      // If no posts exist, return demo posts
      if (!posts || posts.length === 0) {
        const demoPosts = [
          {
            id: 1001,
            content: "Just secured our first round of funding for my AI-powered healthcare startup! Looking forward to revolutionizing patient care with predictive analytics. #StartupLife #HealthTech #AI",
            userId: 1,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            likes: 42,
            comments: 8,
            media: null,
            user: {
              id: 1,
              name: "Demo Founder",
              role: "Founder & CEO",
              company: "HealthAI Solutions",
              isVerified: true,
              profilePicture: null
            }
          },
          {
            id: 1002,
            content: "Excited to announce that we're expanding our team! Looking for talented developers with experience in React, Node.js, and AI/ML. DM me if you're interested or know someone who might be a good fit. #Hiring #TechJobs #StartupHiring",
            userId: 2,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            likes: 28,
            comments: 15,
            media: null,
            user: {
              id: 2,
              name: "Demo Investor",
              role: "Angel Investor",
              company: "Venture Capital Partners",
              isVerified: true,
              profilePicture: null
            }
          },
          {
            id: 1003,
            content: "Just published my latest article on 'How to Build a Sustainable Business Model for Your Startup'. Check it out and let me know your thoughts! #Entrepreneurship #BusinessStrategy #StartupAdvice",
            userId: 3,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
            likes: 56,
            comments: 12,
            media: null,
            user: {
              id: 3,
              name: "Demo Mentor",
              role: "Business Mentor",
              company: "Startup Accelerator",
              isVerified: true,
              profilePicture: null
            }
          },
          {
            id: 1004,
            content: "Attending the Tech Startup Summit in Bangalore next week. Who else is going? Would love to connect with fellow founders and investors! #TechSummit #Networking #StartupIndia",
            userId: 5,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            likes: 34,
            comments: 22,
            media: null,
            user: {
              id: 5,
              name: "Priya Sharma",
              role: "Product Manager",
              company: "TechInnovate",
              isVerified: false,
              profilePicture: null
            }
          },
          {
            id: 1005,
            content: "Just launched our beta product and already seeing amazing user engagement! Thanks to everyone who provided feedback during our alpha testing phase. #ProductLaunch #StartupMilestone #UserFeedback",
            userId: 6,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
            likes: 87,
            comments: 31,
            media: null,
            user: {
              id: 6,
              name: "Vikram Malhotra",
              role: "Founder & CTO",
              company: "CodeNova",
              isVerified: true,
              profilePicture: null
            }
          }
        ];
        
        return res.json(demoPosts);
      }
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      
      // Return demo posts in case of error
      const demoPosts = [
        {
          id: 1001,
          content: "Just secured our first round of funding for my AI-powered healthcare startup! Looking forward to revolutionizing patient care with predictive analytics. #StartupLife #HealthTech #AI",
          userId: 1,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          likes: 42,
          comments: 8,
          media: null,
          user: {
            id: 1,
            name: "Demo Founder",
            role: "Founder & CEO",
            company: "HealthAI Solutions",
            isVerified: true,
            profilePicture: null
          }
        },
        {
          id: 1002,
          content: "Excited to announce that we're expanding our team! Looking for talented developers with experience in React, Node.js, and AI/ML. DM me if you're interested or know someone who might be a good fit. #Hiring #TechJobs #StartupHiring",
          userId: 2,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
          likes: 28,
          comments: 15,
          media: null,
          user: {
            id: 2,
            name: "Demo Investor",
            role: "Angel Investor",
            company: "Venture Capital Partners",
            isVerified: true,
            profilePicture: null
          }
        }
      ];
      
      res.json(demoPosts);
    }
  });
  
  // Like a post
  app.post("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // In a real implementation, we would store likes in a database
      // For now, we'll just return a success response
      res.json({ success: true, message: "Post liked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to like post", error });
    }
  });
  
  // Unlike a post
  app.delete("/api/posts/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // In a real implementation, we would remove the like from the database
      // For now, we'll just return a success response
      res.json({ success: true, message: "Post unliked successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post", error });
    }
  });
  
  // Comment on a post
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const postId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.user.id;
      
      if (!content) {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      // In a real implementation, we would store the comment in a database
      // For now, we'll just return a mock comment
      const comment = {
        id: Math.floor(Math.random() * 1000),
        content,
        createdAt: new Date(),
        user: {
          id: userId,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl
        }
      };
      
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ message: "Failed to add comment", error });
    }
  });
  
  // Get comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      
      // In a real implementation, we would fetch comments from a database
      // For now, we'll just return an empty array
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments", error });
    }
  });
  
  // Jobs API endpoints
  app.get("/api/jobs", async (req, res) => {
    try {
      const { search, location } = req.query;
      
      // Prepare options for the getJobs function
      const options: any = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };
      
      if (search) options.search = search as string;
      if (location) options.location = location as string;
      
      // If no jobs exist in the database, return mock data
      const mockJobs = [
        {
          id: 1,
          title: "Senior Software Engineer",
          company: {
            id: 101,
            name: "Google",
            logo: "https://via.placeholder.com/150",
            location: "Bangalore, India",
          },
          type: "Full-time",
          location: "Bangalore, India (On-site)",
          salary: "₹30,00,000 - ₹50,00,000 per year",
          description: "We're looking for a Senior Software Engineer to join our team and help build the next generation of our products.",
          skills: ["JavaScript", "React", "Node.js", "AWS"],
          postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          applicants: 78,
          isEasyApply: true,
        },
        {
          id: 2,
          title: "Product Manager",
          company: {
            id: 102,
            name: "Microsoft",
            logo: "https://via.placeholder.com/150",
            location: "Hyderabad, India",
          },
          type: "Full-time",
          location: "Hyderabad, India (Hybrid)",
          salary: "₹25,00,000 - ₹40,00,000 per year",
          description: "Join our product team to drive the vision and strategy for our enterprise solutions.",
          skills: ["Product Management", "Agile", "User Research", "Data Analysis"],
          postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          applicants: 124,
          isEasyApply: false,
        },
        {
          id: 3,
          title: "UI/UX Designer",
          company: {
            id: 103,
            name: "Amazon",
            logo: "https://via.placeholder.com/150",
            location: "Remote, India",
          },
          type: "Full-time",
          location: "Remote, India",
          salary: "₹18,00,000 - ₹30,00,000 per year",
          description: "Design beautiful and intuitive user interfaces for our e-commerce platform.",
          skills: ["Figma", "UI Design", "User Research", "Prototyping"],
          postedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          applicants: 45,
          isEasyApply: true,
        }
      ];
      
      // Return jobs with pagination
      res.json({
        jobs: mockJobs,
        pagination: {
          total: mockJobs.length,
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: Math.ceil(mockJobs.length / (options.limit || 10))
        }
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs", error });
    }
  });
  
  // Get saved jobs - IMPORTANT: This route must come before the /api/jobs/:id route
  app.get("/api/jobs/saved", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Mock saved jobs data
      const mockSavedJobs = [
        {
          id: 1,
          title: "Senior Software Engineer",
          company: {
            id: 101,
            name: "Google",
            logo: "https://via.placeholder.com/150",
            location: "Bangalore, India",
          },
          type: "Full-time",
          location: "Bangalore, India (On-site)",
          salary: "₹30,00,000 - ₹50,00,000 per year",
          description: "We're looking for a Senior Software Engineer to join our team and help build the next generation of our products.",
          skills: ["JavaScript", "React", "Node.js", "AWS"],
          postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          savedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          applicants: 78,
          isEasyApply: true,
        }
      ];
      
      res.json(mockSavedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      res.status(500).json({ message: "Failed to fetch saved jobs", error });
    }
  });
  
  // Get job alerts - IMPORTANT: This route must come before the /api/jobs/:id route
  app.get("/api/jobs/alerts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Mock job alerts data
      const mockJobAlerts = [
        {
          id: 1,
          title: "Software Engineer",
          location: "Bangalore",
          jobType: "full_time",
          frequency: "daily",
          skills: ["JavaScript", "React", "Node.js"],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
        }
      ];
      
      res.json(mockJobAlerts);
    } catch (error) {
      console.error("Error fetching job alerts:", error);
      res.status(500).json({ message: "Failed to fetch job alerts", error });
    }
  });
  
  // Get job by ID
  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      // Mock job data
      const mockJob = {
        id: jobId,
        title: "Senior Software Engineer",
        company: {
          id: 101,
          name: "Google",
          logo: "https://via.placeholder.com/150",
          location: "Bangalore, India",
        },
        type: "Full-time",
        location: "Bangalore, India (On-site)",
        salary: "₹30,00,000 - ₹50,00,000 per year",
        description: "We're looking for a Senior Software Engineer to join our team and help build the next generation of our products.",
        skills: ["JavaScript", "React", "Node.js", "AWS"],
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        applicants: 78,
        isEasyApply: true,
      };
      
      res.json(mockJob);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job", error });
    }
  });
  
  // Follow a user
  app.post("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const targetUserId = parseInt(req.params.id);
      const currentUserId = req.user.id;
      
      if (targetUserId === currentUserId) {
        return res.status(400).json({ message: "You cannot follow yourself" });
      }
      
      // In a real implementation, we would store the follow relationship in a database
      // For now, we'll just return a success response
      res.json({ success: true, message: "User followed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user", error });
    }
  });
  
  // Unfollow a user
  app.delete("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const targetUserId = parseInt(req.params.id);
      const currentUserId = req.user.id;
      
      // In a real implementation, we would remove the follow relationship from the database
      // For now, we'll just return a success response
      res.json({ success: true, message: "User unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user", error });
    }
  });

  app.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user posts", error });
    }
  });

  // Pitch routes
  app.post("/api/pitches", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertPitchSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const pitch = await storage.createPitch(validatedData);
      res.status(201).json(pitch);
    } catch (error) {
      res.status(400).json({ message: "Invalid pitch data", error });
    }
  });

  app.get("/api/pitches", async (req, res) => {
    try {
      const status = req.query.status as string;
      
      let pitches;
      if (status) {
        pitches = await storage.getPitchesByStatus(status);
      } else {
        pitches = await storage.getPitches();
      }
      
      // Fetch user information for each pitch
      const enrichedPitches = await Promise.all(
        pitches.map(async (pitch) => {
          const user = await storage.getUser(pitch.userId);
          return {
            ...pitch,
            user: user ? {
              id: user.id,
              name: user.name,
              role: user.role,
              company: user.company,
              isVerified: user.isVerified,
            } : null,
          };
        })
      );
      
      res.json(enrichedPitches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pitches", error });
    }
  });

  app.get("/api/users/:userId/pitches", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pitches = await storage.getPitchesByUserId(userId);
      res.json(pitches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user pitches", error });
    }
  });

  // Experience routes
  app.post("/api/experiences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertExperienceSchema.parse({
        ...req.body,
        userId: req.body.userId || req.user.id,
      });

      const experience = await storage.createExperience(validatedData);
      res.status(201).json(experience);
    } catch (error) {
      res.status(400).json({ message: "Invalid experience data", error });
    }
  });

  app.get("/api/users/:userId/experiences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const experiences = await storage.getExperiencesByUserId(userId);
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user experiences", error });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const users = await storage.getUsers();
      
      // Remove sensitive information like passwords
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        title: user.title,
        company: user.company,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      }));
      
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });

  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const sanitizedUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        title: user.title,
        company: user.company,
        location: user.location,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      };
      
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Failed to fetch current user", error });
    }
  });

  // Get user by ID
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information
      const sanitizedUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        title: user.title,
        company: user.company,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      };
      
      res.json(sanitizedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  // Update user profile
  app.patch("/api/users/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = parseInt(req.params.userId);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });
  
  // Upload avatar image
  app.post("/api/users/:userId/avatar", (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Use single file upload middleware
      upload.single('avatar')(req, res, async (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              message: "File too large", 
              error: "The uploaded file exceeds the 10MB size limit." 
            });
          }
          return res.status(400).json({ message: "File upload failed", error: err.message });
        }
        
        try {
          const file = req.file;
          
          if (!file) {
            return res.status(400).json({ message: "No image file provided" });
          }
          
          // In serverless environment, we'd upload to cloud storage
          // For now, just use a placeholder or local path
          let avatarUrl;
          
          if (process.env.VERCEL === '1') {
            // In serverless, we'd return a placeholder or upload to cloud storage
            avatarUrl = `/uploads/avatar-${req.user.id}-${Date.now()}.jpg`;
          } else {
            // In local environment, use the actual file path
            avatarUrl = `/uploads/${file.filename}`;
          }
          
          // Update the user's avatarUrl
          const userId = parseInt(req.params.userId);
          const updatedUser = await storage.updateUser(userId, { avatarUrl });
          
          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }
          
          res.status(200).json({ 
            message: "Avatar uploaded successfully",
            user: updatedUser
          });
        } catch (error) {
          console.error("Error processing avatar upload:", error);
          res.status(500).json({ message: "Failed to process avatar upload", error });
        }
      });
    } catch (error) {
      console.error("Error in avatar upload route:", error);
      res.status(500).json({ message: "Avatar upload failed", error });
    }
  });
  
  // Connection routes
  app.get("/api/connections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const connections = await storage.getConnectionsByUserId(req.user.id);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections", error });
    }
  });
  
  app.post("/api/connections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { receiverId } = req.body;
      
      if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
      }
      
      // Create the connection request
      const connection = await storage.createConnection({
        requesterId: req.user.id,
        receiverId,
        status: "pending"
      });
      
      // Create a notification for the receiver
      await storage.createNotification({
        userId: receiverId,
        type: "connection",
        content: `${req.user.name} sent you a connection request`,
        relatedId: connection.id,
        relatedType: "connection"
      });
      
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection", error });
    }
  });
  
  app.get("/api/connections/requests", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const requests = await storage.getConnectionRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
      res.status(500).json({ message: "Failed to fetch connection requests", error });
    }
  });
  
  app.patch("/api/connections/:connectionId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const connectionId = parseInt(req.params.connectionId);
      const { status } = req.body;
      
      if (!status || !["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Valid status (accepted or rejected) is required" });
      }
      
      const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
      
      if (!updatedConnection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      // Create a notification for the requester if the connection was accepted
      if (status === "accepted") {
        await storage.createNotification({
          userId: updatedConnection.requesterId,
          type: "connection",
          content: `${req.user.name} accepted your connection request`,
          relatedId: connectionId,
          relatedType: "connection"
        });
      }
      
      res.json(updatedConnection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(500).json({ message: "Failed to update connection", error });
    }
  });
  
  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notifications = await storage.getNotificationsByUserId(req.user.id);
      
      // If no notifications found in database, return demo notifications
      if (!notifications || notifications.length === 0) {
        const demoNotifications = [
          {
            id: 1,
            userId: req.user.id,
            type: 'connection',
            content: 'Rahul Verma sent you a connection request',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            relatedId: 101
          },
          {
            id: 2,
            userId: req.user.id,
            type: 'message',
            content: 'Priya Singh sent you a message',
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            relatedId: 102
          },
          {
            id: 3,
            userId: req.user.id,
            type: 'pitch',
            content: 'Vikram Sharma liked your startup pitch',
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            relatedId: 103
          }
        ];
        
        return res.json(demoNotifications);
      }
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications", error });
    }
  });
  
  app.post("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { userId, type, content, relatedId } = req.body;
      
      if (!userId || !type || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create notification in database
      const notification = await storage.createNotification({
        userId,
        type,
        content,
        read: false,
        relatedId: relatedId || null
      });
      
      // Send notification via WebSocket if available
      const wsServer = (req.app as any).wsServer;
      if (wsServer && wsServer.sendNotificationToUser) {
        wsServer.sendNotificationToUser(userId, notification);
      }
      
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification", error });
    }
  });
  
  app.patch("/api/notifications/:notificationId/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notificationId = parseInt(req.params.notificationId);
      
      // For demo notifications, return a mock response
      if (notificationId <= 3) {
        return res.json({
          id: notificationId,
          userId: req.user.id,
          type: notificationId === 1 ? 'connection' : notificationId === 2 ? 'message' : 'pitch',
          content: notificationId === 1 ? 'Rahul Verma sent you a connection request' : 
                  notificationId === 2 ? 'Priya Singh sent you a message' : 
                  'Vikram Sharma liked your startup pitch',
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * (notificationId === 1 ? 5 : notificationId === 2 ? 30 : 60)),
          relatedId: 100 + notificationId
        });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updatedNotification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read", error });
    }
  });
  
  app.patch("/api/notifications/read-all", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // For demo purposes, always return success
      res.json({ message: "All notifications marked as read" });
      
      // In a real implementation, we would update the database
      storage.markAllNotificationsAsRead(req.user.id).catch(err => {
        console.error("Error marking all notifications as read:", err);
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read", error });
    }
  });
  
  // Messaging API endpoints
  
  // Get all conversations for the current user
  app.get("/api/conversations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // In a real implementation, we would fetch conversations from a database
      // For now, we'll return mock data
      res.json([
        {
          id: 1,
          user: {
            id: 101,
            name: "Vikram Malhotra",
            avatarUrl: "/avatars/vikram.jpg",
            status: 'online',
          },
          lastMessage: {
            content: "Looking forward to our meeting tomorrow!",
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            isRead: false,
          },
          unreadCount: 2,
        },
        {
          id: 2,
          user: {
            id: 102,
            name: "Priya Sharma",
            avatarUrl: "/avatars/priya.jpg",
            status: 'offline',
            lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
          },
          lastMessage: {
            content: "I'll review your pitch and get back to you",
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            isRead: true,
          },
          unreadCount: 0,
        },
        {
          id: 3,
          user: {
            id: 103,
            name: "Rahul Kapoor",
            avatarUrl: "/avatars/rahul.jpg",
            status: 'online',
          },
          lastMessage: {
            content: "Have you considered raising capital from angel investors?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            isRead: true,
          },
          unreadCount: 0,
        },
        {
          id: 4,
          user: {
            id: 104,
            name: "Anjali Desai",
            avatarUrl: "/avatars/anjali.jpg",
            status: 'away',
            lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
          },
          lastMessage: {
            content: "I'm interested in joining your startup as a tech lead",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            isRead: true,
          },
          unreadCount: 0,
        },
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations", error });
    }
  });
  
  // Get messages for a specific conversation
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const conversationId = parseInt(req.params.conversationId);
      
      // Mock data for different conversations
      const mockMessages = {
        1: [
          {
            id: 1,
            content: "Hi Vikram, I wanted to discuss our upcoming product launch strategy.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 2,
            content: "Sure! I've been analyzing the market data you sent. I think we should target urban professionals first.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5), // 5 minutes after previous message
            sender: { id: 101, name: 'Vikram Malhotra' },
            isCurrentUser: false,
          },
          {
            id: 3,
            content: "That makes sense. Do you have any specific marketing channels in mind?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 4,
            content: "I think we should focus on LinkedIn and industry-specific webinars.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            sender: { id: 101, name: 'Vikram Malhotra' },
            isCurrentUser: false,
          },
          {
            id: 5,
            content: "Looking forward to our meeting tomorrow!",
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
            sender: { id: 101, name: 'Vikram Malhotra' },
            isCurrentUser: false,
          },
        ],
        2: [
          {
            id: 1,
            content: "Hello Priya, I've shared my startup pitch deck with you. Would appreciate your feedback.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 2,
            content: "Hi there! I'll take a look at it over the weekend.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            sender: { id: 102, name: 'Priya Sharma' },
            isCurrentUser: false,
          },
          {
            id: 3,
            content: "Thanks, I'm particularly interested in your thoughts on the financial projections.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 4,
            content: "I'll review your pitch and get back to you",
            timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            sender: { id: 102, name: 'Priya Sharma' },
            isCurrentUser: false,
          },
        ],
        3: [
          {
            id: 1,
            content: "Hi Rahul, I'm looking for investment opportunities for my tech startup.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 2,
            content: "What's your current valuation and how much are you looking to raise?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            sender: { id: 103, name: 'Rahul Kapoor' },
            isCurrentUser: false,
          },
          {
            id: 3,
            content: "We're valued at $2M pre-money and looking to raise $500K for market expansion.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), // 3.5 hours ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 4,
            content: "Have you considered raising capital from angel investors?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
            sender: { id: 103, name: 'Rahul Kapoor' },
            isCurrentUser: false,
          },
        ],
        4: [
          {
            id: 1,
            content: "I saw your job posting for a tech lead role at your startup.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
            sender: { id: 104, name: 'Anjali Desai' },
            isCurrentUser: false,
          },
          {
            id: 2,
            content: "Yes, we're growing our tech team. Do you have experience with React and Node.js?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
            sender: { id: req.user.id, name: req.user.name },
            isCurrentUser: true,
          },
          {
            id: 3,
            content: "I have 5 years of experience with both technologies and have led engineering teams at two startups.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30), // 30 hours ago
            sender: { id: 104, name: 'Anjali Desai' },
            isCurrentUser: false,
          },
          {
            id: 4,
            content: "I'm interested in joining your startup as a tech lead",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            sender: { id: 104, name: 'Anjali Desai' },
            isCurrentUser: false,
          },
        ],
      };
      
      // Return messages for the requested conversation or an empty array if not found
      res.json(mockMessages[conversationId] || []);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error });
    }
  });
  
  // Send a message in a conversation
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const conversationId = parseInt(req.params.conversationId);
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // In a real implementation, we would save the message to a database
      // For now, we'll just return a mock response
      res.status(201).json({
        id: Math.floor(Math.random() * 1000) + 100,
        content,
        timestamp: new Date(),
        sender: {
          id: req.user.id,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl
        },
        isCurrentUser: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message", error });
    }
  });
  
  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { userId, initialMessage } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // In a real implementation, we would create a new conversation in the database
      // For now, we'll just return a mock response
      const newConversationId = Math.floor(Math.random() * 1000) + 100;
      
      // Get the user details
      const users = await storage.getUsers();
      const targetUser = users.find(u => u.id === parseInt(userId));
      
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(201).json({
        id: newConversationId,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          avatarUrl: targetUser.avatarUrl,
          status: 'offline',
        },
        lastMessage: initialMessage ? {
          content: initialMessage,
          timestamp: new Date(),
          isRead: false,
        } : null,
        unreadCount: 0
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create conversation", error });
    }
  });
  
  // Get available contacts for messaging
  app.get("/api/contacts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // In a real implementation, we would fetch contacts from a database
      // For now, we'll return mock data
      res.json([
        { id: 201, name: "Rajiv Kumar", role: "Founder", avatarUrl: "/avatars/rajiv.jpg" },
        { id: 202, name: "Ananya Desai", role: "Investor", avatarUrl: "/avatars/ananya.jpg" },
        { id: 203, name: "Sanjay Mehta", role: "Mentor", avatarUrl: "/avatars/sanjay.jpg" },
        { id: 204, name: "Meera Patel", role: "Founder", avatarUrl: "/avatars/meera.jpg" },
        { id: 205, name: "Arjun Singh", role: "Job Seeker", avatarUrl: "/avatars/arjun.jpg" },
        { id: 206, name: "Neha Sharma", role: "Investor", avatarUrl: "/avatars/neha.jpg" },
        { id: 207, name: "Kiran Rao", role: "Founder", avatarUrl: "/avatars/kiran.jpg" },
        { id: 208, name: "Divya Kapoor", role: "Student", avatarUrl: "/avatars/divya.jpg" },
      ]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contacts", error });
    }
  });
  
  // Change password endpoint
  app.post("/api/change-password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get the user from storage
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Import the comparePasswords function from auth.ts
      const { comparePasswords, hashPassword } = await import('./auth');
      
      // Verify the current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password
      const updatedUser = await storage.updateUser(req.user.id, {
        password: hashedPassword
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password", error });
    }
  });
  
  // Notification settings endpoint
  app.patch("/api/users/:userId/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = parseInt(req.params.userId);
      
      // For now, just return success as we don't have a notification settings table yet
      res.json({ message: "Notification settings updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification settings", error });
    }
  });

  // Job routes
  app.post("/api/jobs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertJobSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data", error });
    }
  });

  app.get("/api/jobs", async (req, res) => {
    try {
      const jobType = req.query.type as string;
      const location = req.query.location as string;
      const searchQuery = req.query.q as string;
      
      // Get all jobs first
      let jobs = await storage.getJobs();
      
      // Apply filters if provided
      if (jobType) {
        jobs = jobs.filter(job => job.jobType === jobType);
      }
      
      if (location) {
        jobs = jobs.filter(job => 
          job.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      if (searchQuery) {
        jobs = jobs.filter(job => 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.company && job.company.name && job.company.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs", error });
    }
  });
  
  // Save a job
  app.post("/api/jobs/:jobId/save", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const jobId = parseInt(req.params.jobId);
      const userId = req.user.id;
      
      const success = await storage.saveJob(userId, jobId);
      
      if (success) {
        res.json({ success: true, message: "Job saved successfully" });
      } else {
        res.status(500).json({ message: "Failed to save job" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to save job", error });
    }
  });
  
  // Unsave a job
  app.delete("/api/jobs/:jobId/save", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const jobId = parseInt(req.params.jobId);
      const userId = req.user.id;
      
      const success = await storage.unsaveJob(userId, jobId);
      
      if (success) {
        res.json({ success: true, message: "Job unsaved successfully" });
      } else {
        res.status(500).json({ message: "Failed to unsave job" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to unsave job", error });
    }
  });
  
  // Get saved jobs
  app.get("/api/jobs/saved", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const savedJobs = await storage.getSavedJobs(userId);
      
      res.json(savedJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved jobs", error });
    }
  });
  
  // Messaging routes
  
  // Get conversations for the current user
  app.get("/api/conversations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const conversations = await storage.getConversationsByUserId(userId);
      
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations", error });
    }
  });
  
  // Get a specific conversation
  app.get("/api/conversations/:conversationId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const conversationId = parseInt(req.params.conversationId);
      const conversation = await storage.getConversationById(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Check if the user is a participant in the conversation
      const userId = req.user.id;
      const participants = await storage.getConversationParticipants(conversationId);
      
      if (!participants.some(p => p.id === userId)) {
        return res.status(403).json({ message: "You are not a participant in this conversation" });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation", error });
    }
  });
  
  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.id;
      const { participants } = req.body;
      
      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({ message: "Participants are required" });
      }
      
      // Add the current user to the participants if not already included
      if (!participants.includes(userId)) {
        participants.unshift(userId);
      }
      
      const conversation = await storage.createConversation(participants);
      
      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to create conversation", error });
    }
  });
  
  // Get messages for a conversation
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const conversationId = parseInt(req.params.conversationId);
      const userId = req.user.id;
      
      // Check if the user is a participant in the conversation
      const participants = await storage.getConversationParticipants(conversationId);
      
      if (!participants.some(p => p.id === userId)) {
        return res.status(403).json({ message: "You are not a participant in this conversation" });
      }
      
      const messages = await storage.getMessagesByConversationId(conversationId);
      
      // Mark messages as read
      for (const message of messages) {
        if (message.senderId !== userId) {
          await storage.markMessageAsRead(message.id, userId);
        }
      }
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error });
    }
  });
  
  // Send a message in a conversation
  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const conversationId = parseInt(req.params.conversationId);
      const userId = req.user.id;
      const { content, attachmentUrl, attachmentType } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Check if the user is a participant in the conversation
      const participants = await storage.getConversationParticipants(conversationId);
      
      if (!participants.some(p => p.id === userId)) {
        return res.status(403).json({ message: "You are not a participant in this conversation" });
      }
      
      // Send message via WebSocket if available
      const wsServer = (req.app as any).wsServer;
      if (wsServer && wsServer.sendNotificationToUser) {
        // Create message object
        const message = {
          id: Math.floor(Math.random() * 1000) + 100,
          content,
          timestamp: new Date(),
          sender: {
            id: req.user.id,
            name: req.user.name,
            avatarUrl: req.user.avatarUrl
          },
          isCurrentUser: false
        };
        
        // Send message to all participants except sender
        participants.forEach(participant => {
          if (participant.id !== userId) {
            wsServer.sendNotificationToUser(participant.id, {
              type: 'chat',
              payload: {
                message: {
                  ...message,
                  isCurrentUser: false
                },
                conversationId
              }
            });
            
            // Create notification for the message
            storage.createNotification({
              userId: participant.id,
              type: 'message',
              content: `${req.user.name} sent you a message`,
              read: false,
              relatedId: req.user.id
            }).catch(err => console.error('Error creating message notification:', err));
          }
        });
      }
      
      const message = await storage.createMessage({
        conversationId,
        senderId: userId,
        content,
        attachmentUrl,
        attachmentType
      });
      
      // Get the sender information
      const sender = await storage.getUser(userId);
      
      // Return the message with sender information
      res.status(201).json({
        ...message,
        sender: {
          id: sender.id,
          name: sender.name,
          avatarUrl: sender.avatarUrl
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message", error });
    }
  });
  
  // Mark a message as read
  app.patch("/api/messages/:messageId/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const messageId = parseInt(req.params.messageId);
      const userId = req.user.id;
      
      const success = await storage.markMessageAsRead(messageId, userId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to mark message as read" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read", error });
    }
  });

  app.get("/api/jobs/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Fetch user information
      const user = await storage.getUser(job.userId);
      const enrichedJob = {
        ...job,
        user: user ? {
          id: user.id,
          name: user.name,
          company: user.company,
          isVerified: user.isVerified,
        } : null,
      };
      
      res.json(enrichedJob);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job", error });
    }
  });

  app.get("/api/users/:userId/jobs", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobs = await storage.getJobsByUserId(userId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user jobs", error });
    }
  });

  // Seed some initial pitches if none exist
  const seedInitialData = async () => {
    try {
      // First check if we have a default user, if not create one
      let defaultUser;
      try {
        defaultUser = await storage.getUserByUsername('founder');
        
        if (!defaultUser) {
          console.log('Creating default user...');
          defaultUser = await storage.createUser({
            username: 'founder',
            password: 'password123', // This will be hashed by the storage layer
            name: 'Demo Founder',
            email: 'demo@foundernetwork.com',
            role: 'founder',
            title: 'CEO',
            company: 'Demo Startup',
            location: 'India',
            bio: 'Demo account for testing'
          });
          console.log('Default user created with ID:', defaultUser.id);
        }
      } catch (error) {
        console.error('Error checking/creating default user:', error);
        // Continue with seeding even if user creation fails
      }
      
      // Now try to seed pitches
      try {
        const pitches = await storage.getPitches();
        
        if (pitches.length === 0 && defaultUser) {
          console.log('Seeding initial pitches...');
          // Create default pitches
          const defaultPitches = [
            {
              userId: defaultUser.id,
              name: "EcoMart",
              description: "Sustainable online marketplace",
              location: "India (Remote)",
              status: PitchStatus.IDEA,
              category: "E-commerce",
            },
            {
              userId: defaultUser.id,
              name: "FinEdge",
              description: "Empowering investors through tech",
              location: "India (Remote)",
              status: PitchStatus.REGISTERED,
              category: "FinTech",
            },
            {
              userId: defaultUser.id,
              name: "AgroSense",
              description: "Smart agriculture solutions",
              location: "India (Remote)",
              status: PitchStatus.IDEA,
              category: "AgriTech",
            },
            {
              userId: defaultUser.id,
              name: "ClickCart",
              description: "E-commerce simplified",
              location: "India (Remote)",
              status: PitchStatus.IDEA,
              category: "E-commerce",
            },
            {
              userId: defaultUser.id,
              name: "ZeptoX",
              description: "On-demand delivery service",
              location: "India (Remote)",
              status: PitchStatus.REGISTERED,
              category: "Logistics",
            },
          ];

          for (const pitch of defaultPitches) {
            await storage.createPitch(pitch as InsertPitch);
          }
          console.log('Initial pitches seeded successfully');
        }
      } catch (error) {
        console.error('Error seeding pitches:', error);
        // Just log the error but don't throw, to allow the server to start
      }
      
      // Seed some notifications for the default user
      try {
        const notifications = await storage.getNotificationsByUserId(defaultUser.id);
        
        if (notifications.length === 0) {
          console.log('Seeding initial notifications...');
          
          // Create default notifications
          const defaultNotifications = [
            {
              userId: defaultUser.id,
              type: 'connection',
              content: 'Ananya Sharma sent you a connection request',
              read: false,
              relatedId: 1,
              relatedType: 'connection'
            },
            {
              userId: defaultUser.id,
              type: 'message',
              content: 'Vikram Mehta commented on your post: "Great insights! Would love to connect and discuss more about this topic."',
              read: false,
              relatedId: 1,
              relatedType: 'post'
            },
            {
              userId: defaultUser.id,
              type: 'job',
              content: 'Google India posted a new job: "Senior Software Engineer" that matches your profile',
              read: false,
              relatedId: 1,
              relatedType: 'job'
            }
          ];
          
          for (const notification of defaultNotifications) {
            await storage.createNotification(notification);
          }
          console.log('Initial notifications seeded successfully');
        }
      } catch (error) {
        console.error('Error seeding notifications:', error);
      }
    } catch (error) {
      console.error('Error in seedInitialData:', error);
    }
  };

  // Call the seed function after startup with a longer delay to ensure DB is ready
  // Only seed data in development environment
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      try {
        seedInitialData().catch(err => {
          console.error("Failed to seed initial data:", err);
        });
      } catch (error) {
        console.error("Unexpected error during seed data initialization:", error);
        // Don't let seeding errors crash the server
      }
    }, 3000);
  }

  const httpServer = createServer(app);
  return httpServer;
}
