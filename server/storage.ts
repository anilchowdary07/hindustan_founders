import { users, type User, type InsertUser, posts, type Post, type InsertPost, pitches, type Pitch, type InsertPitch, experiences, type Experience, type InsertExperience, jobs, type Job, type InsertJob } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Helper function to add timeout to database queries
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 5000, fallback: T | null = null): Promise<T> {
  // Create a promise that will reject after a timeout
  let timeoutId: NodeJS.Timeout;
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    // Race the query against the timeout
    const result = await Promise.race([
      promise.then(result => {
        clearTimeout(timeoutId);
        return result;
      }),
      timeoutPromise
    ]);
    
    return result;
  } catch (error) {
    console.error("Operation failed or timed out:", error);
    if (fallback !== null) {
      return fallback as T;
    }
    throw error;
  }
}

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Define new interfaces for admin functionality
export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertArticle {
  title: string;
  content: string;
  summary?: string;
  imageUrl?: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isVirtual: boolean;
  registrationLink?: string;
  imageUrl?: string;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertEvent {
  title: string;
  description: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isVirtual: boolean;
  registrationLink?: string;
  imageUrl?: string;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: number;
  userId: number;
  connectedUserId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface InsertNotification {
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Settings {
  id: number;
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  signupEnabled: boolean;
  updatedAt: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface InsertAuditLog {
  userId: number;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Post operations
  createPost(post: InsertPost): Promise<Post | any>;
  getPosts(): Promise<Post[] | any[]>;
  getPostsByUserId(userId: number): Promise<Post[] | any[]>;

  // Pitch operations
  createPitch(pitch: InsertPitch): Promise<Pitch>;
  getPitches(): Promise<Pitch[]>;
  getPitchesByUserId(userId: number): Promise<Pitch[]>;
  getPitchesByStatus(status: string): Promise<Pitch[]>;

  // Experience operations
  createExperience(experience: InsertExperience): Promise<Experience>;
  getExperiencesByUserId(userId: number): Promise<Experience[]>;

  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(): Promise<Job[]>;
  getJobsByUserId(userId: number): Promise<Job[]>;
  getJobsByType(jobType: string): Promise<Job[]>;
  getJobById(id: number): Promise<Job | undefined>;
  
  // Article operations
  createArticle(article: InsertArticle): Promise<Article>;
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Connection operations
  getConnections(): Promise<Connection[]>;
  getConnectionsByUserId(userId: number): Promise<Connection[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Settings operations
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  
  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private pitches: Map<number, Pitch>;
  private experiences: Map<number, Experience>;
  private jobs: Map<number, Job>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentPostId: number;
  currentPitchId: number;
  currentExperienceId: number;
  currentJobId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.pitches = new Map();
    this.experiences = new Map();
    this.jobs = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentPitchId = 1;
    this.currentExperienceId = 1;
    this.currentJobId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      profileCompleted: 20,
      isVerified: false,
      createdAt: timestamp
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.users.has(id)) return false;
    
    // Delete the user
    this.users.delete(id);
    
    // Also delete related data (posts, experiences, etc.)
    // This is a simplified implementation - in a real app you'd need to handle all related data
    return true;
  }

  // Post methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const timestamp = new Date();
    const post: Post = { ...insertPost, id, createdAt: timestamp };
    this.posts.set(id, post);
    return post;
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Pitch methods
  async createPitch(insertPitch: InsertPitch): Promise<Pitch> {
    const id = this.currentPitchId++;
    const timestamp = new Date();
    const pitch: Pitch = { ...insertPitch, id, createdAt: timestamp };
    this.pitches.set(id, pitch);
    return pitch;
  }

  async getPitches(): Promise<Pitch[]> {
    return Array.from(this.pitches.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPitchesByUserId(userId: number): Promise<Pitch[]> {
    return Array.from(this.pitches.values())
      .filter(pitch => pitch.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getPitchesByStatus(status: string): Promise<Pitch[]> {
    return Array.from(this.pitches.values())
      .filter(pitch => pitch.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Experience methods
  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const id = this.currentExperienceId++;
    const experience: Experience = { ...insertExperience, id };
    this.experiences.set(id, experience);
    return experience;
  }

  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    return Array.from(this.experiences.values())
      .filter(exp => exp.userId === userId)
      .sort((a, b) => {
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;
        return 0;
      });
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const timestamp = new Date();
    const job: Job = { ...insertJob, id, createdAt: timestamp };
    this.jobs.set(id, job);
    return job;
  }

  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJobsByUserId(userId: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJobsByType(jobType: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.jobType === jobType)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getJobById(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      if (!id || isNaN(id)) {
        console.error("Invalid user ID provided:", id);
        return undefined;
      }
      
      const query = db.select().from(users).where(eq(users.id, id));
      const result = await withTimeout(query, 5000, []);
      return result[0];
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      return undefined; // Return undefined instead of throwing to prevent UI errors
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!username) {
        console.error("getUserByUsername called with empty username");
        return undefined;
      }
      
      const query = db.select().from(users).where(eq(users.username, username));
      
      // Use our timeout helper with a fallback to undefined
      const result = await withTimeout(query, 5000, []);
      return result[0];
    } catch (error) {
      console.error(`Error getting user by username "${username}":`, error);
      return undefined; // Return undefined instead of throwing to prevent function timeout
    }
  }
  
  async getUsers(): Promise<User[]> {
    try {
      const query = db.select().from(users);
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error("Error getting all users:", error);
      return []; // Return empty array instead of throwing to prevent UI errors
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Validate required fields
      if (!insertUser.username || !insertUser.password || !insertUser.name || !insertUser.email || !insertUser.role) {
        throw new Error("Missing required user fields");
      }
      
      console.log("Creating user with username:", insertUser.username);
      
      // Check if username already exists to provide a better error message
      const existingUser = await this.getUserByUsername(insertUser.username);
      if (existingUser) {
        throw new Error(`Username '${insertUser.username}' already exists`);
      }
      
      // Password should already be hashed by the auth.ts layer
      if (!insertUser.password.includes('.')) {
        console.warn("Warning: Password does not appear to be hashed. This might be a security issue.");
      }
      
      // Create the insert query with timeout
      const insertQuery = db
        .insert(users)
        .values({
          ...insertUser,
          profileCompleted: 20,
          isVerified: false
        })
        .returning();
      
      // Use our timeout helper with a longer timeout for user creation
      const result = await withTimeout(insertQuery, 10000);
      const user = result[0];
        
      if (!user) {
        throw new Error("User creation failed - no user returned");
      }
      
      console.log("User created successfully with ID:", user.id);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Provide more specific error messages for common database errors
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("duplicate") || errorMessage.includes("unique constraint")) {
        if (errorMessage.includes("username")) {
          throw new Error("Username already exists");
        } else if (errorMessage.includes("email")) {
          throw new Error("Email already exists");
        } else {
          throw new Error("A user with these details already exists");
        }
      }
      
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    try {
      // Validate the user exists
      const existingUser = await this.getUser(id);
      if (!existingUser) {
        console.error(`User with ID ${id} not found for update`);
        return undefined;
      }
      
      // Update the user
      const [updatedUser] = await withTimeout(
        db.update(users)
          .set(userData)
          .where(eq(users.id, id))
          .returning(),
        5000
      );
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Validate the user exists
      const existingUser = await this.getUser(id);
      if (!existingUser) {
        console.error(`User with ID ${id} not found for deletion`);
        return false;
      }
      
      // Delete user's posts
      await withTimeout(
        db.delete(posts)
          .where(eq(posts.userId, id)),
        5000
      );
      
      // Delete user's experiences
      await withTimeout(
        db.delete(experiences)
          .where(eq(experiences.userId, id)),
        5000
      );
      
      // Delete user's pitches
      await withTimeout(
        db.delete(pitches)
          .where(eq(pitches.userId, id)),
        5000
      );
      
      // Delete user's jobs
      await withTimeout(
        db.delete(jobs)
          .where(eq(jobs.userId, id)),
        5000
      );
      
      // Finally delete the user
      await withTimeout(
        db.delete(users)
          .where(eq(users.id, id)),
        5000
      );
      
      console.log(`User with ID ${id} successfully deleted`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }

  // Post methods
  async createPost(insertPost: InsertPost): Promise<any> {
    try {
      // Insert the post
      const [post] = await db
        .insert(posts)
        .values(insertPost)
        .returning();
      
      // Get the user information
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          role: users.role,
          company: users.company,
          title: users.title,
          avatarUrl: users.avatarUrl,
          isVerified: users.isVerified
        })
        .from(users)
        .where(eq(users.id, insertPost.userId));
      
      // Return the post with user information
      return {
        ...post,
        user
      };
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  async getPosts(): Promise<any[]> {
    try {
      // Create the query
      const query = db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            role: users.role,
            company: users.company,
            title: users.title,
            avatarUrl: users.avatarUrl,
            isVerified: users.isVerified
          }
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(20); // Limit to 20 most recent posts for performance
      
      // Use our timeout helper
      const result = await withTimeout(query, 5000, []);
      
      // Transform the result to match the expected format
      return result.map(item => ({
        ...item.post,
        user: item.user
      }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  async getPostsByUserId(userId: number): Promise<any[]> {
    try {
      // Create the query
      const query = db
        .select({
          post: posts,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            role: users.role,
            company: users.company,
            title: users.title,
            avatarUrl: users.avatarUrl,
            isVerified: users.isVerified
          }
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(eq(posts.userId, userId))
        .orderBy(desc(posts.createdAt))
        .limit(20); // Limit to 20 most recent posts for performance
      
      // Use our timeout helper
      const result = await withTimeout(query, 5000, []);
      
      // Transform the result to match the expected format
      return result.map(item => ({
        ...item.post,
        user: item.user
      }));
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      return [];
    }
  }

  // Pitch methods
  async createPitch(insertPitch: InsertPitch): Promise<Pitch> {
    try {
      // Validate required fields
      if (!insertPitch.userId || !insertPitch.name || !insertPitch.description || !insertPitch.status) {
        throw new Error("Missing required pitch fields");
      }
      
      const [pitch] = await withTimeout(
        db.insert(pitches)
          .values(insertPitch)
          .returning(),
        5000
      );
      
      if (!pitch) {
        throw new Error("Pitch creation failed - no pitch returned");
      }
      
      return pitch;
    } catch (error) {
      console.error("Error creating pitch:", error);
      throw error;
    }
  }

  async getPitches(): Promise<Pitch[]> {
    try {
      const query = db
        .select()
        .from(pitches)
        .orderBy(desc(pitches.createdAt))
        .limit(20); // Limit to 20 most recent pitches for performance
      
      // Use our timeout helper
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error("Error fetching pitches:", error);
      return [];
    }
  }

  async getPitchesByUserId(userId: number): Promise<Pitch[]> {
    try {
      const query = db
        .select()
        .from(pitches)
        .where(eq(pitches.userId, userId))
        .orderBy(desc(pitches.createdAt))
        .limit(20); // Limit to 20 most recent pitches for performance
      
      // Use our timeout helper
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error(`Error fetching pitches for user ${userId}:`, error);
      return [];
    }
  }

  async getPitchesByStatus(status: string): Promise<Pitch[]> {
    try {
      const query = db
        .select()
        .from(pitches)
        .where(eq(pitches.status, status))
        .orderBy(desc(pitches.createdAt))
        .limit(20); // Limit to 20 most recent pitches for performance
      
      // Use our timeout helper
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error(`Error fetching pitches with status ${status}:`, error);
      return [];
    }
  }

  // Experience methods
  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    try {
      // Validate required fields
      if (!insertExperience.userId || !insertExperience.title || !insertExperience.company || !insertExperience.startDate) {
        throw new Error("Missing required experience fields");
      }
      
      const [experience] = await withTimeout(
        db.insert(experiences)
          .values(insertExperience)
          .returning(),
        5000
      );
      
      if (!experience) {
        throw new Error("Experience creation failed - no experience returned");
      }
      
      return experience;
    } catch (error) {
      console.error("Error creating experience:", error);
      throw error;
    }
  }

  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    try {
      const query = db
        .select()
        .from(experiences)
        .where(eq(experiences.userId, userId))
        .orderBy(desc(experiences.current));
      
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error(`Error fetching experiences for user ${userId}:`, error);
      return [];
    }
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    try {
      // Validate required fields
      if (!insertJob.userId || !insertJob.title || !insertJob.company || 
          !insertJob.location || !insertJob.locationType || 
          !insertJob.jobType || !insertJob.description) {
        throw new Error("Missing required job fields");
      }
      
      const [job] = await withTimeout(
        db.insert(jobs)
          .values(insertJob)
          .returning(),
        5000
      );
      
      if (!job) {
        throw new Error("Job creation failed - no job returned");
      }
      
      return job;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  async getJobs(): Promise<Job[]> {
    try {
      const query = db
        .select()
        .from(jobs)
        .orderBy(desc(jobs.createdAt));
      
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }

  async getJobsByUserId(userId: number): Promise<Job[]> {
    try {
      const query = db
        .select()
        .from(jobs)
        .where(eq(jobs.userId, userId))
        .orderBy(desc(jobs.createdAt));
      
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error(`Error fetching jobs for user ${userId}:`, error);
      return [];
    }
  }

  async getJobsByType(jobType: string): Promise<Job[]> {
    try {
      const query = db
        .select()
        .from(jobs)
        .where(eq(jobs.jobType, jobType))
        .orderBy(desc(jobs.createdAt));
      
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error(`Error fetching jobs of type ${jobType}:`, error);
      return [];
    }
  }

  async getJobById(id: number): Promise<Job | undefined> {
    try {
      const query = db
        .select()
        .from(jobs)
        .where(eq(jobs.id, id));
      
      const [job] = await withTimeout(query, 5000, []);
      return job;
    } catch (error) {
      console.error(`Error fetching job with ID ${id}:`, error);
      return undefined;
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();
