import { 
  users, type User, type InsertUser, 
  posts, type Post, type InsertPost, 
  pitches, type Pitch, type InsertPitch, 
  experiences, type Experience, type InsertExperience, 
  jobs, type Job, type InsertJob, 
  notifications, type Notification, type InsertNotification, 
  connections, type Connection, type InsertConnection, 
  conversations, type Conversation, type InsertConversation,
  conversationParticipants, type ConversationParticipant, type InsertConversationParticipant,
  messages, type Message, type InsertMessage,
  messageReadStatus, type MessageReadStatus, type InsertMessageReadStatus,
  UserRoleType, PitchStatusType, JobLocationType, JobType 
} from "@shared/schema";
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
  requesterId: number;
  receiverId: number;
  status: 'pending' | 'accepted' | 'rejected';
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
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: number, status: string): Promise<Connection | undefined>;
  getConnectionRequests(userId: number): Promise<Connection[]>;
  getConnectionSuggestions(userId: number): Promise<any[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(): Promise<Notification[]>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  
  // Messaging operations
  createConversation(participants: number[]): Promise<Conversation>;
  getConversationsByUserId(userId: number): Promise<any[]>;
  getConversationById(conversationId: number): Promise<any | null>;
  getConversationParticipants(conversationId: number): Promise<User[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<any[]>;
  markMessageAsRead(messageId: number, userId: number): Promise<boolean>;
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
      title: insertUser.title || null,
      company: insertUser.company || null,
      location: insertUser.location || null,
      bio: insertUser.bio || null,
      avatarUrl: insertUser.avatarUrl || null,
      id, 
      role: insertUser.role as UserRoleType,
      name: insertUser.name,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email,
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
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
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
      
      // Set expiration date if not provided
      if (!insertJob.expiresAt) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30); // Default to 30 days
        insertJob.expiresAt = expirationDate;
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
      // Get active jobs (not expired)
      const currentDate = new Date();
      
      const query = db
        .select()
        .from(jobs)
        .where(
          or(
            isNull(jobs.expiresAt),
            gt(jobs.expiresAt, currentDate)
          )
        )
        .orderBy(desc(jobs.createdAt));
      
      const jobsList = await withTimeout(query, 5000, []);
      
      // Enrich jobs with company information
      const enrichedJobs = await Promise.all(
        jobsList.map(async (job) => {
          const poster = await this.getUser(job.userId);
          
          return {
            ...job,
            company: {
              id: poster?.id || job.userId,
              name: job.company,
              logo: poster?.avatarUrl || null,
              location: job.location
            },
            poster: poster ? {
              id: poster.id,
              name: poster.name,
              role: poster.role,
              avatarUrl: poster.avatarUrl
            } : null
          };
        })
      );
      
      return enrichedJobs;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }
  
  // Save a job for a user
  async saveJob(userId: number, jobId: number): Promise<boolean> {
    try {
      // In a real implementation, we would have a saved_jobs table
      // For now, we'll simulate this by returning true
      console.log(`User ${userId} saved job ${jobId}`);
      return true;
    } catch (error) {
      console.error(`Error saving job ${jobId} for user ${userId}:`, error);
      return false;
    }
  }
  
  // Unsave a job for a user
  async unsaveJob(userId: number, jobId: number): Promise<boolean> {
    try {
      // In a real implementation, we would delete from saved_jobs table
      // For now, we'll simulate this by returning true
      console.log(`User ${userId} unsaved job ${jobId}`);
      return true;
    } catch (error) {
      console.error(`Error unsaving job ${jobId} for user ${userId}:`, error);
      return false;
    }
  }
  
  // Get saved jobs for a user
  async getSavedJobs(userId: number): Promise<Job[]> {
    try {
      // In a real implementation, we would query the saved_jobs table
      // For now, we'll return a subset of all jobs as "saved"
      const allJobs = await this.getJobs();
      
      // Simulate saved jobs by returning a random subset
      const savedJobs = allJobs
        .filter(() => Math.random() > 0.7) // Randomly select ~30% of jobs
        .slice(0, 5); // Limit to 5 saved jobs
      
      return savedJobs;
    } catch (error) {
      console.error(`Error fetching saved jobs for user ${userId}:`, error);
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

  // Connection methods
  async getConnections(): Promise<Connection[]> {
    try {
      const result = await withTimeout(
        db.select()
          .from(connections)
          .orderBy(desc(connections.createdAt)),
        5000,
        []
      );
      
      return result;
    } catch (error) {
      console.error("Error fetching all connections:", error);
      return [];
    }
  }

  async getConnectionsByUserId(userId: number): Promise<Connection[]> {
    try {
      // Get connections where the user is either the requester or receiver and status is 'accepted'
      const result = await withTimeout(
        db.select()
          .from(connections)
          .where(
            or(
              and(eq(connections.requesterId, userId), eq(connections.status, 'accepted')),
              and(eq(connections.receiverId, userId), eq(connections.status, 'accepted'))
            )
          )
          .orderBy(desc(connections.createdAt)),
        5000,
        []
      );
      
      // For each connection, fetch the other user's details
      const enrichedConnections = await Promise.all(
        result.map(async (conn) => {
          const otherUserId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
          const otherUser = await this.getUser(otherUserId);
          
          return {
            ...conn,
            user: otherUser ? {
              id: otherUser.id,
              name: otherUser.name,
              username: otherUser.username,
              role: otherUser.role,
              title: otherUser.title,
              company: otherUser.company,
              avatarUrl: otherUser.avatarUrl,
              isVerified: otherUser.isVerified
            } : null
          };
        })
      );
      
      return enrichedConnections;
    } catch (error) {
      console.error(`Error fetching connections for user ${userId}:`, error);
      return [];
    }
  }
  
  async createConnection(connection: InsertConnection): Promise<Connection> {
    try {
      // Check if connection already exists
      const existingConnection = await withTimeout(
        db.select()
          .from(connections)
          .where(
            and(
              eq(connections.requesterId, connection.requesterId),
              eq(connections.receiverId, connection.receiverId)
            )
          ),
        5000,
        []
      );
      
      if (existingConnection.length > 0) {
        throw new Error("Connection request already exists");
      }
      
      // Insert the new connection
      const [newConnection] = await withTimeout(
        db.insert(connections)
          .values({
            ...connection,
            status: connection.status || 'pending',
            updatedAt: new Date()
          })
          .returning(),
        5000
      );
      
      if (!newConnection) {
        throw new Error("Connection creation failed - no connection returned");
      }
      
      // Create a notification for the receiver
      await this.createNotification({
        userId: connection.receiverId,
        type: 'connection_request',
        content: `You have a new connection request`,
        read: false,
        relatedId: newConnection.id,
        relatedType: 'connection'
      });
      
      return newConnection;
    } catch (error) {
      console.error("Error creating connection:", error);
      throw error;
    }
  }
  
  async updateConnection(id: number, status: string): Promise<Connection | undefined> {
    try {
      // Update the connection status
      const [updatedConnection] = await withTimeout(
        db.update(connections)
          .set({ 
            status, 
            updatedAt: new Date() 
          })
          .where(eq(connections.id, id))
          .returning(),
        5000
      );
      
      if (!updatedConnection) {
        return undefined;
      }
      
      // Create a notification based on the status
      if (status === 'accepted') {
        await this.createNotification({
          userId: updatedConnection.requesterId,
          type: 'connection_accepted',
          content: `Your connection request was accepted`,
          read: false,
          relatedId: updatedConnection.id,
          relatedType: 'connection'
        });
      }
      
      return updatedConnection;
    } catch (error) {
      console.error(`Error updating connection ${id}:`, error);
      return undefined;
    }
  }
  
  async getConnectionRequests(userId: number): Promise<Connection[]> {
    try {
      // Get pending connection requests where the user is the receiver
      const result = await withTimeout(
        db.select()
          .from(connections)
          .where(
            and(
              eq(connections.receiverId, userId),
              eq(connections.status, 'pending')
            )
          ),
        5000,
        []
      );
      
      // For each request, fetch the requester's details
      const enrichedRequests = await Promise.all(
        result.map(async (conn) => {
          const requester = await this.getUser(conn.requesterId);
          
          return {
            ...conn,
            user: requester ? {
              id: requester.id,
              name: requester.name,
              username: requester.username,
              role: requester.role,
              title: requester.title,
              company: requester.company,
              avatarUrl: requester.avatarUrl,
              isVerified: requester.isVerified
            } : null
          };
        })
      );
      
      return enrichedRequests;
    } catch (error) {
      console.error(`Error fetching connection requests for user ${userId}:`, error);
      return [];
    }
  }
  
  async getConnectionSuggestions(userId: number): Promise<any[]> {
    try {
      // Get all users except the current user
      const allUsers = await withTimeout(
        db.select()
          .from(users)
          .where(ne(users.id, userId)),
        5000,
        []
      );
      
      // Get existing connections (both pending and accepted)
      const existingConnections = await withTimeout(
        db.select()
          .from(connections)
          .where(
            or(
              eq(connections.requesterId, userId),
              eq(connections.receiverId, userId)
            )
          ),
        5000,
        []
      );
      
      // Filter out users who are already connected or have pending requests
      const connectedUserIds = existingConnections.map(conn => 
        conn.requesterId === userId ? conn.receiverId : conn.requesterId
      );
      
      const suggestions = allUsers
        .filter(user => !connectedUserIds.includes(user.id))
        .map(user => ({
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          title: user.title,
          company: user.company,
          avatarUrl: user.avatarUrl,
          isVerified: user.isVerified,
          // Add some random mutual connections for UI purposes
          mutualConnections: Math.floor(Math.random() * 15) + 1
        }))
        .slice(0, 10); // Limit to 10 suggestions
      
      return suggestions;
    } catch (error) {
      console.error(`Error fetching connection suggestions for user ${userId}:`, error);
      return [];
    }
  }

  // Messaging methods
  async createConversation(participants: number[]): Promise<Conversation> {
    try {
      // Validate participants
      if (!participants || participants.length < 2) {
        throw new Error("A conversation requires at least 2 participants");
      }
      
      // Check if all participants exist
      for (const userId of participants) {
        const user = await this.getUser(userId);
        if (!user) {
          throw new Error(`User with ID ${userId} does not exist`);
        }
      }
      
      // Create the conversation
      const [conversation] = await withTimeout(
        db.insert(conversations)
          .values({})
          .returning(),
        5000
      );
      
      if (!conversation) {
        throw new Error("Conversation creation failed");
      }
      
      // Add participants to the conversation
      for (const userId of participants) {
        await withTimeout(
          db.insert(conversationParticipants)
            .values({
              conversationId: conversation.id,
              userId,
            }),
          5000
        );
        
        // Create notification for each participant (except the creator)
        if (userId !== participants[0]) {
          await this.createNotification({
            userId,
            type: 'conversation_created',
            content: `You've been added to a new conversation`,
            read: false,
            relatedId: conversation.id,
            relatedType: 'conversation'
          });
        }
      }
      
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }
  
  async getConversationsByUserId(userId: number): Promise<any[]> {
    try {
      // Get all conversations where the user is a participant
      const participations = await withTimeout(
        db.select()
          .from(conversationParticipants)
          .where(eq(conversationParticipants.userId, userId))
          .orderBy(desc(conversationParticipants.joinedAt)),
        5000,
        []
      );
      
      if (participations.length === 0) {
        return [];
      }
      
      // Get the conversation IDs
      const conversationIds = participations.map(p => p.conversationId);
      
      // Get the conversations
      const conversationsData = await Promise.all(
        conversationIds.map(async (conversationId) => {
          // Get the conversation
          const [conversation] = await withTimeout(
            db.select()
              .from(conversations)
              .where(eq(conversations.id, conversationId)),
            5000,
            []
          );
          
          if (!conversation) {
            return null;
          }
          
          // Get the participants
          const participants = await this.getConversationParticipants(conversationId);
          
          // Get the other participants (not the current user)
          const otherParticipants = participants.filter(p => p.id !== userId);
          
          // Get the last message
          const [lastMessage] = await withTimeout(
            db.select()
              .from(messages)
              .where(eq(messages.conversationId, conversationId))
              .orderBy(desc(messages.createdAt))
              .limit(1),
            5000,
            []
          );
          
          // Get unread message count
          const unreadCount = await this.getUnreadMessageCount(conversationId, userId);
          
          // Format the conversation data
          return {
            id: conversation.id,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            participants: participants,
            otherParticipants: otherParticipants,
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
              isRead: await this.isMessageRead(lastMessage.id, userId)
            } : null,
            unreadCount
          };
        })
      );
      
      // Filter out null values and sort by last message timestamp
      return conversationsData
        .filter(Boolean)
        .sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.updatedAt;
          const bTime = b.lastMessage?.createdAt || b.updatedAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
    } catch (error) {
      console.error(`Error fetching conversations for user ${userId}:`, error);
      return [];
    }
  }
  
  async getConversationById(conversationId: number): Promise<any | null> {
    try {
      // Get the conversation
      const [conversation] = await withTimeout(
        db.select()
          .from(conversations)
          .where(eq(conversations.id, conversationId)),
        5000,
        []
      );
      
      if (!conversation) {
        return null;
      }
      
      // Get the participants
      const participants = await this.getConversationParticipants(conversationId);
      
      // Get the messages
      const messagesData = await this.getMessagesByConversationId(conversationId);
      
      return {
        ...conversation,
        participants,
        messages: messagesData
      };
    } catch (error) {
      console.error(`Error fetching conversation ${conversationId}:`, error);
      return null;
    }
  }
  
  async getConversationParticipants(conversationId: number): Promise<User[]> {
    try {
      // Get the participant IDs
      const participations = await withTimeout(
        db.select()
          .from(conversationParticipants)
          .where(eq(conversationParticipants.conversationId, conversationId)),
        5000,
        []
      );
      
      if (participations.length === 0) {
        return [];
      }
      
      // Get the user IDs
      const userIds = participations.map(p => p.userId);
      
      // Get the users
      const participants = await Promise.all(
        userIds.map(userId => this.getUser(userId))
      );
      
      // Filter out null values
      return participants.filter(Boolean) as User[];
    } catch (error) {
      console.error(`Error fetching participants for conversation ${conversationId}:`, error);
      return [];
    }
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      // Validate message
      if (!message.conversationId || !message.senderId || !message.content) {
        throw new Error("Message must have a conversation ID, sender ID, and content");
      }
      
      // Check if the conversation exists
      const conversation = await this.getConversationById(message.conversationId);
      if (!conversation) {
        throw new Error(`Conversation with ID ${message.conversationId} does not exist`);
      }
      
      // Check if the sender is a participant in the conversation
      const participants = await this.getConversationParticipants(message.conversationId);
      if (!participants.some(p => p.id === message.senderId)) {
        throw new Error(`User with ID ${message.senderId} is not a participant in conversation ${message.conversationId}`);
      }
      
      // Create the message
      const [newMessage] = await withTimeout(
        db.insert(messages)
          .values({
            ...message,
            updatedAt: new Date()
          })
          .returning(),
        5000
      );
      
      if (!newMessage) {
        throw new Error("Message creation failed");
      }
      
      // Update the conversation's updatedAt timestamp
      await withTimeout(
        db.update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, message.conversationId)),
        5000
      );
      
      // Create read status entries for all participants (sender has read it)
      for (const participant of participants) {
        await withTimeout(
          db.insert(messageReadStatus)
            .values({
              messageId: newMessage.id,
              userId: participant.id,
              isRead: participant.id === message.senderId // Sender has read it
            }),
          5000
        );
        
        // Create notification for each participant (except the sender)
        if (participant.id !== message.senderId) {
          await this.createNotification({
            userId: participant.id,
            type: 'new_message',
            content: `You have a new message`,
            read: false,
            relatedId: newMessage.id,
            relatedType: 'message'
          });
        }
      }
      
      return newMessage;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  
  async getMessagesByConversationId(conversationId: number): Promise<any[]> {
    try {
      // Get the messages
      const messagesData = await withTimeout(
        db.select()
          .from(messages)
          .where(eq(messages.conversationId, conversationId))
          .orderBy(messages.createdAt),
        5000,
        []
      );
      
      // Enrich the messages with sender information
      const enrichedMessages = await Promise.all(
        messagesData.map(async (message) => {
          const sender = await this.getUser(message.senderId);
          
          return {
            ...message,
            sender: sender ? {
              id: sender.id,
              name: sender.name,
              avatarUrl: sender.avatarUrl
            } : null
          };
        })
      );
      
      return enrichedMessages;
    } catch (error) {
      console.error(`Error fetching messages for conversation ${conversationId}:`, error);
      return [];
    }
  }
  
  async markMessageAsRead(messageId: number, userId: number): Promise<boolean> {
    try {
      // Check if the message exists
      const [message] = await withTimeout(
        db.select()
          .from(messages)
          .where(eq(messages.id, messageId)),
        5000,
        []
      );
      
      if (!message) {
        throw new Error(`Message with ID ${messageId} does not exist`);
      }
      
      // Check if the user is a participant in the conversation
      const participants = await this.getConversationParticipants(message.conversationId);
      if (!participants.some(p => p.id === userId)) {
        throw new Error(`User with ID ${userId} is not a participant in the conversation`);
      }
      
      // Get the read status
      const [readStatus] = await withTimeout(
        db.select()
          .from(messageReadStatus)
          .where(
            eq(messageReadStatus.messageId, messageId),
            eq(messageReadStatus.userId, userId)
          ),
        5000,
        []
      );
      
      if (!readStatus) {
        // Create a new read status
        await withTimeout(
          db.insert(messageReadStatus)
            .values({
              messageId,
              userId,
              isRead: true,
              readAt: new Date()
            }),
          5000
        );
      } else if (!readStatus.isRead) {
        // Update the existing read status
        await withTimeout(
          db.update(messageReadStatus)
            .set({ 
              isRead: true,
              readAt: new Date()
            })
            .where(
              eq(messageReadStatus.messageId, messageId),
              eq(messageReadStatus.userId, userId)
            ),
          5000
        );
      }
      
      return true;
    } catch (error) {
      console.error(`Error marking message ${messageId} as read for user ${userId}:`, error);
      return false;
    }
  }
  
  async isMessageRead(messageId: number, userId: number): Promise<boolean> {
    try {
      // Get the read status
      const [readStatus] = await withTimeout(
        db.select()
          .from(messageReadStatus)
          .where(
            eq(messageReadStatus.messageId, messageId),
            eq(messageReadStatus.userId, userId)
          ),
        5000,
        []
      );
      
      return readStatus?.isRead || false;
    } catch (error) {
      console.error(`Error checking if message ${messageId} is read by user ${userId}:`, error);
      return false;
    }
  }
  
  async getUnreadMessageCount(conversationId: number, userId: number): Promise<number> {
    try {
      // Get all messages in the conversation
      const messagesData = await withTimeout(
        db.select()
          .from(messages)
          .where(eq(messages.conversationId, conversationId)),
        5000,
        []
      );
      
      if (messagesData.length === 0) {
        return 0;
      }
      
      // Count unread messages
      let unreadCount = 0;
      for (const message of messagesData) {
        if (message.senderId !== userId && !(await this.isMessageRead(message.id, userId))) {
          unreadCount++;
        }
      }
      
      return unreadCount;
    } catch (error) {
      console.error(`Error getting unread message count for conversation ${conversationId} and user ${userId}:`, error);
      return 0;
    }
  }
  
  // This is a duplicate method that was added by mistake
  async getConnections(): Promise<Connection[]> {
    try {
      // Get all connections
      const query = db
        .select({
          connection: connections,
          requester: {
            id: users.id,
            name: users.name,
            title: users.title,
            company: users.company,
            avatarUrl: users.avatarUrl
          }
        })
        .from(connections)
        .leftJoin(users, eq(connections.requesterId, users.id))
        .where(eq(connections.receiverId, userId))
        .where(eq(connections.status, "pending"))
        .orderBy(desc(connections.createdAt));
      
      const result = await withTimeout(query, 5000, []);
      
      // Transform the result to match the expected format
      return result.map(item => ({
        id: item.connection.id,
        status: item.connection.status,
        createdAt: item.connection.createdAt,
        user: item.requester
      }));
    } catch (error) {
      console.error(`Error fetching connection requests for user ${userId}:`, error);
      return [];
    }
  }

  async updateConnectionStatus(connectionId: number, status: 'accepted' | 'rejected'): Promise<Connection | undefined> {
    try {
      const [updatedConnection] = await db
        .update(connections)
        .set({ 
          status,
          updatedAt: new Date().toISOString()
        })
        .where(eq(connections.id, connectionId))
        .returning();
      
      return updatedConnection;
    } catch (error) {
      console.error(`Error updating connection status for ID ${connectionId}:`, error);
      return undefined;
    }
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const [newNotification] = await db.insert(notifications).values(notification).returning();
      return newNotification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    try {
      const query = db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      
      return await withTimeout(query, 5000, []);
    } catch (error) {
      console.error(`Error fetching notifications for user ${userId}:`, error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      const [updatedNotification] = await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, notificationId))
        .returning();
      
      return !!updatedNotification;
    } catch (error) {
      console.error(`Error marking notification as read for ID ${notificationId}:`, error);
      return undefined;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    try {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, userId));
      
      return true;
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error);
      return false;
    }
  }

  // Article methods
  async getArticles(): Promise<Article[]> {
    // Mock implementation for now
    return [
      {
        id: 1,
        title: "How to Pitch to Investors",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        summary: "A guide for founders on creating the perfect pitch",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978",
        authorId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Fundraising Strategies for Early-Stage Startups",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        summary: "Learn how to raise your first round of funding",
        imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d",
        authorId: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "Building a Strong Founding Team",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
        summary: "Why your team matters more than your idea",
        imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
        authorId: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const articles = await this.getArticles();
    return articles.find(article => article.id === id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    // Mock implementation
    return {
      id: Date.now(),
      ...article
    };
  }

  async updateArticle(id: number, article: Partial<Article>): Promise<Article | undefined> {
    const existingArticle = await this.getArticle(id);
    if (!existingArticle) return undefined;
    
    return {
      ...existingArticle,
      ...article,
      updatedAt: new Date().toISOString()
    };
  }

  async deleteArticle(id: number): Promise<boolean> {
    // Mock implementation
    return true;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    // Mock implementation for now
    return [
      {
        id: 1,
        title: "Startup India Summit 2025",
        description: "Join the largest gathering of startups, investors, and industry leaders in India.",
        location: "Pragati Maidan, New Delhi",
        startDate: new Date(2025, 4, 15).toISOString(),
        endDate: new Date(2025, 4, 17).toISOString(),
        isVirtual: false,
        registrationLink: "https://example.com/register",
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        creatorId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Founder's Fireside Chat",
        description: "An intimate evening with successful founders sharing their journeys.",
        location: "The Leela Palace, Bengaluru",
        startDate: new Date(2025, 5, 5).toISOString(),
        endDate: new Date(2025, 5, 5).toISOString(),
        isVirtual: false,
        registrationLink: "https://example.com/register",
        imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
        creatorId: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        title: "Virtual Pitch Competition",
        description: "Pitch your startup to a panel of investors and win funding.",
        location: null,
        startDate: new Date(2025, 3, 20).toISOString(),
        endDate: new Date(2025, 3, 20).toISOString(),
        isVirtual: true,
        registrationLink: "https://example.com/register",
        imageUrl: "https://images.unsplash.com/photo-1551818255-e6e10975bc17",
        creatorId: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const events = await this.getEvents();
    return events.find(event => event.id === id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    // Mock implementation
    return {
      id: Date.now(),
      ...event
    };
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined> {
    const existingEvent = await this.getEvent(id);
    if (!existingEvent) return undefined;
    
    return {
      ...existingEvent,
      ...event,
      updatedAt: new Date().toISOString()
    };
  }

  async deleteEvent(id: number): Promise<boolean> {
    // Mock implementation
    return true;
  }

  // Settings methods
  async getSettings(): Promise<Settings> {
    // Mock implementation
    return {
      id: 1,
      siteName: "Hindustan Founders Network",
      contactEmail: "admin@hindustanfounders.com",
      maintenanceMode: false,
      signupEnabled: true,
      updatedAt: new Date().toISOString()
    };
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    // Mock implementation
    return {
      id: 1,
      siteName: settings.siteName || "Hindustan Founders Network",
      contactEmail: settings.contactEmail || "admin@hindustanfounders.com",
      maintenanceMode: settings.maintenanceMode !== undefined ? settings.maintenanceMode : false,
      signupEnabled: settings.signupEnabled !== undefined ? settings.signupEnabled : true,
      updatedAt: new Date().toISOString()
    };
  }

  // Audit log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    // Mock implementation
    return {
      id: Date.now(),
      ...log
    };
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    // Mock implementation
    return [
      {
        id: 1,
        userId: 4,
        action: "user_login",
        details: "Admin user logged in",
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: 4,
        action: "user_update",
        details: "Updated user profile",
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
        createdAt: new Date().toISOString()
      }
    ];
  }
}

// Use database storage
export const storage = new DatabaseStorage();
