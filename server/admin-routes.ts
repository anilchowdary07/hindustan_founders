import { Router, Request, Response } from "express";
import { storage } from "./storage";
import { UserRole } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const adminRouter = Router();

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Middleware to check if user is admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  
  next();
};

// Get platform stats
adminRouter.get("/stats", isAdmin, async (req: Request, res: Response) => {
  try {
    // Fetch data with error handling for each call
    let users = [];
    let posts = [];
    let connections = [];
    let articles = [];
    let events = [];
    let pitches = [];
    
    try {
      users = await storage.getUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    
    try {
      posts = await storage.getPosts();
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    
    try {
      connections = await storage.getConnections();
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
    
    try {
      articles = await storage.getArticles();
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
    
    try {
      events = await storage.getEvents();
    } catch (error) {
      console.error("Error fetching events:", error);
    }
    
    try {
      pitches = await storage.getPitches();
    } catch (error) {
      console.error("Error fetching pitches:", error);
    }
    
    // Calculate stats
    const stats = {
      totalUsers: users.length,
      totalPosts: posts.length,
      totalConnections: connections.length,
      totalArticles: articles.length,
      totalEvents: events.length,
      totalPitches: pitches.length,
      usersByRole: {
        founder: users.filter(user => user.role === UserRole.FOUNDER).length,
        investor: users.filter(user => user.role === UserRole.INVESTOR).length,
        student: users.filter(user => user.role === UserRole.STUDENT).length,
        jobSeeker: users.filter(user => user.role === UserRole.JOB_SEEKER).length,
        explorer: users.filter(user => user.role === UserRole.EXPLORER).length,
        admin: users.filter(user => user.role === UserRole.ADMIN).length,
      },
      recentActivity: {
        newUsers: users.filter(user => {
          const createdAt = new Date(user.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff < 7; // Users created in the last 7 days
        }).length,
        newPosts: posts.filter(post => {
          const createdAt = new Date(post.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff < 7; // Posts created in the last 7 days
        }).length,
      },
      // Weekly stats for charts
      weeklyStats: {
        users: Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          
          return {
            date: date.toISOString().split('T')[0],
            count: users.filter(user => {
              const createdAt = new Date(user.createdAt);
              return createdAt >= date && createdAt < nextDay;
            }).length
          };
        }).reverse(),
        posts: Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          
          return {
            date: date.toISOString().split('T')[0],
            count: posts.filter(post => {
              const createdAt = new Date(post.createdAt);
              return createdAt >= date && createdAt < nextDay;
            }).length
          };
        }).reverse()
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
});

// Get all users (admin only)
adminRouter.get("/users", isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsers();
    
    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user (admin only)
adminRouter.patch("/users/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user
    const updatedUser = await storage.updateUser(userId, req.body);
    
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update user" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user (admin only)
adminRouter.delete("/users/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check if user exists
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent deleting admin users
    if (existingUser.role === UserRole.ADMIN) {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }
    
    // Delete user
    const result = await storage.deleteUser(userId);
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Get all content (articles, events, etc.)
adminRouter.get("/content", isAdmin, async (req: Request, res: Response) => {
  try {
    const articles = await storage.getArticles();
    const events = await storage.getEvents();
    const pitches = await storage.getPitches();
    
    res.json({
      articles,
      events,
      pitches
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Failed to fetch content" });
  }
});

// Create article (admin only)
adminRouter.post("/content/articles", isAdmin, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { title, content, summary } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const article = await storage.createArticle({
      title,
      content,
      summary,
      imageUrl,
      authorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({ message: "Failed to create article" });
  }
});

// Update article (admin only)
adminRouter.put("/content/articles/:id", isAdmin, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id);
    const { title, content, summary } = req.body;
    
    const existingArticle = await storage.getArticle(articleId);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    let imageUrl = existingArticle.imageUrl;
    if (req.file) {
      // Delete old image if exists
      if (existingArticle.imageUrl) {
        const oldImagePath = path.join(process.cwd(), existingArticle.imageUrl.replace("/uploads/", "uploads/"));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const updatedArticle = await storage.updateArticle(articleId, {
      title,
      content,
      summary,
      imageUrl,
      updatedAt: new Date().toISOString()
    });
    
    res.json(updatedArticle);
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({ message: "Failed to update article" });
  }
});

// Delete article (admin only)
adminRouter.delete("/content/articles/:id", isAdmin, async (req: Request, res: Response) => {
  try {
    const articleId = parseInt(req.params.id);
    
    const existingArticle = await storage.getArticle(articleId);
    if (!existingArticle) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    // Delete image if exists
    if (existingArticle.imageUrl) {
      const imagePath = path.join(process.cwd(), existingArticle.imageUrl.replace("/uploads/", "uploads/"));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await storage.deleteArticle(articleId);
    
    res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Failed to delete article" });
  }
});

// Similar endpoints for events
adminRouter.post("/content/events", isAdmin, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const { title, description, location, startDate, endDate, isVirtual, registrationLink } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const event = await storage.createEvent({
      title,
      description,
      location,
      startDate,
      endDate,
      isVirtual: isVirtual === "true",
      registrationLink,
      imageUrl,
      creatorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// Send notification to all users
adminRouter.post("/notifications", isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, message, type } = req.body;
    
    const users = await storage.getUsers();
    
    // Create a notification for each user
    const notifications = [];
    for (const user of users) {
      const notification = await storage.createNotification({
        userId: user.id,
        title,
        message,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      notifications.push(notification);
    }
    
    res.status(201).json({ success: true, count: notifications.length });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ message: "Failed to send notifications" });
  }
});

// Get system settings
adminRouter.get("/settings", isAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await storage.getSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update system settings
adminRouter.put("/settings", isAdmin, async (req: Request, res: Response) => {
  try {
    const updatedSettings = await storage.updateSettings(req.body);
    res.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// Get audit logs
adminRouter.get("/audit-logs", isAdmin, async (req: Request, res: Response) => {
  try {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// Create audit log
adminRouter.post("/audit-logs", isAdmin, async (req: Request, res: Response) => {
  try {
    const { action, details } = req.body;
    
    const log = await storage.createAuditLog({
      userId: req.user.id,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json(log);
  } catch (error) {
    console.error("Error creating audit log:", error);
    res.status(500).json({ message: "Failed to create audit log" });
  }
});

export default adminRouter;
