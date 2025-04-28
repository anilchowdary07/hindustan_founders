import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
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
const uploadDir = path.join(process.cwd(), "uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Serve static files from uploads directory
  app.use('/uploads', (req, res, next) => {
    // Set cache control headers to improve performance
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
  }, fs.existsSync(uploadDir) ? express.static(uploadDir) : (req, res, next) => next());

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
  
  // Post with image upload
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
          return res.status(400).json({ message: "No image file provided" });
        }
        
        // Create relative path to the uploaded file for storage
        const mediaPath = `/uploads/${file.filename}`;
        
        // Validate and create post
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
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts", error });
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
        userId: req.user.id,
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
  
  // Connection routes - placeholder for future implementation
  app.get("/api/connections", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // For now, return empty array as this feature is not fully implemented
    res.json([]);
  });
  
  app.get("/api/connections/requests", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // For now, return empty array as this feature is not fully implemented
    res.json([]);
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
      
      let jobs;
      if (jobType) {
        jobs = await storage.getJobsByType(jobType);
      } else {
        jobs = await storage.getJobs();
      }
      
      // Fetch user information for each job
      const enrichedJobs = await Promise.all(
        jobs.map(async (job) => {
          const user = await storage.getUser(job.userId);
          return {
            ...job,
            user: user ? {
              id: user.id,
              name: user.name,
              company: user.company,
              isVerified: user.isVerified,
            } : null,
          };
        })
      );
      
      res.json(enrichedJobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs", error });
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
    const pitches = await storage.getPitches();
    
    if (pitches.length === 0) {
      // Create default pitches
      const defaultPitches = [
        {
          userId: 1,
          name: "EcoMart",
          description: "Sustainable online marketplace",
          location: "India (Remote)",
          status: PitchStatus.IDEA,
          category: "E-commerce",
        },
        {
          userId: 1,
          name: "FinEdge",
          description: "Empowering investors through tech",
          location: "India (Remote)",
          status: PitchStatus.REGISTERED,
          category: "FinTech",
        },
        {
          userId: 1,
          name: "AgroSense",
          description: "Smart agriculture solutions",
          location: "India (Remote)",
          status: PitchStatus.IDEA,
          category: "AgriTech",
        },
        {
          userId: 1,
          name: "ClickCart",
          description: "E-commerce simplified",
          location: "India (Remote)",
          status: PitchStatus.IDEA,
          category: "E-commerce",
        },
        {
          userId: 1,
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
    }
  };

  // Call the seed function after startup
  setTimeout(seedInitialData, 1000);

  const httpServer = createServer(app);
  return httpServer;
}
