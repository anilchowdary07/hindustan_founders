import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertPostSchema, 
  insertPitchSchema, 
  insertExperienceSchema,
  PitchStatus
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

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
