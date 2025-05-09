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
