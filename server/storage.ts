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
  try {
    // Create a promise that will reject after a timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    // Race the query against the timeout
    return await Promise.race([promise, timeoutPromise]);
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

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostsByUserId(userId: number): Promise<Post[]>;

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
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error(`Error getting user with ID ${id}:`, error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      if (!username) {
        console.error("getUserByUsername called with empty username");
        return undefined;
      }
      
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error(`Error getting user by username "${username}":`, error);
      throw error;
    }
  }
  
  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Validate required fields
      if (!insertUser.username || !insertUser.password || !insertUser.name || !insertUser.email || !insertUser.role) {
        throw new Error("Missing required user fields");
      }
      
      console.log("Creating user with username:", insertUser.username);
      
      // Check if we need to hash the password
      let password = insertUser.password;
      if (!password.startsWith('$2')) {
        // Password is not already hashed, so hash it
        try {
          // Import the hashPassword function from auth.ts
          const { hashPassword } = await import('./auth');
          password = await hashPassword(password);
        } catch (hashError) {
          console.error("Error hashing password:", hashError);
          // Use a simple hash for the default user if the import fails
          const crypto = await import('crypto');
          password = crypto.createHash('sha256').update(password).digest('hex');
        }
      }
      
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          password,
          profileCompleted: 20,
          isVerified: false
        })
        .returning();
        
      if (!user) {
        throw new Error("User creation failed - no user returned");
      }
      
      console.log("User created successfully with ID:", user.id);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
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
    const [pitch] = await db
      .insert(pitches)
      .values(insertPitch)
      .returning();
    return pitch;
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
    const [experience] = await db
      .insert(experiences)
      .values(insertExperience)
      .returning();
    return experience;
  }

  async getExperiencesByUserId(userId: number): Promise<Experience[]> {
    return await db
      .select()
      .from(experiences)
      .where(eq(experiences.userId, userId))
      .orderBy(desc(experiences.current));
  }

  // Job methods
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async getJobs(): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt));
  }

  async getJobsByUserId(userId: number): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.userId, userId))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobsByType(jobType: string): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .where(eq(jobs.jobType, jobType))
      .orderBy(desc(jobs.createdAt));
  }

  async getJobById(id: number): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id));
    return job;
  }
}

// Use database storage
export const storage = new DatabaseStorage();
