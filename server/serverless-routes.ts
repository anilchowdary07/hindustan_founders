import { Express, Request, Response } from "express";
import { storage } from "./storage";
import { 
  insertPostSchema, 
  insertPitchSchema, 
  insertExperienceSchema,
  insertJobSchema,
  PitchStatus,
  InsertPitch
} from "@shared/schema";
import multer from "multer";

// Configure multer for memory storage in serverless environment
const upload = multer({ 
  storage: multer.memoryStorage(),
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

// Main function to set up all routes
export default function setupRoutes(app: Express) {
  // Handle CORS preflight requests
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.sendStatus(200);
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
  });

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
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  
  // Post with image upload
  app.post("/api/posts/with-image", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Handle file upload
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }
      
      try {
        const file = req.file;
        
        if (!file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        
        // In serverless environment, we'd normally upload to cloud storage
        // For now, just use a placeholder URL
        const mediaPath = `/uploads/placeholder-${Date.now()}.jpg`;
        
        // Validate and create post
        const validatedData = insertPostSchema.parse({
          content: req.body.content,
          userId: req.user.id,
          media: mediaPath
        });
        
        const post = await storage.createPost(validatedData);
        res.status(201).json(post);
      } catch (error) {
        console.error("Error creating post with image:", error);
        res.status(400).json({ message: "Invalid post data", error });
      }
    });
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts", error });
    }
  });

  app.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts = await storage.getPostsByUserId(userId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
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
      console.error("Error creating pitch:", error);
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
      console.error("Error fetching pitches:", error);
      res.status(500).json({ message: "Failed to fetch pitches", error });
    }
  });

  app.get("/api/users/:userId/pitches", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pitches = await storage.getPitchesByUserId(userId);
      res.json(pitches);
    } catch (error) {
      console.error("Error fetching user pitches:", error);
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
      console.error("Error creating experience:", error);
      res.status(400).json({ message: "Invalid experience data", error });
    }
  });

  app.get("/api/users/:userId/experiences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const experiences = await storage.getExperiencesByUserId(userId);
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching user experiences:", error);
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
      console.error("Error fetching users:", error);
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
      console.error("Error fetching user:", error);
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
      console.error("Error updating user:", error);
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
      console.error("Error changing password:", error);
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
      console.error("Error updating notification settings:", error);
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
      console.error("Error creating job:", error);
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
      console.error("Error fetching jobs:", error);
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
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job", error });
    }
  });

  app.get("/api/users/:userId/jobs", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobs = await storage.getJobsByUserId(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      res.status(500).json({ message: "Failed to fetch user jobs", error });
    }
  });

  return app;
}