import { users, type User, type InsertUser, posts, type Post, type InsertPost, pitches, type Pitch, type InsertPitch, experiences, type Experience, type InsertExperience } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private pitches: Map<number, Pitch>;
  private experiences: Map<number, Experience>;
  sessionStore: session.SessionStore;
  currentUserId: number;
  currentPostId: number;
  currentPitchId: number;
  currentExperienceId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.pitches = new Map();
    this.experiences = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentPitchId = 1;
    this.currentExperienceId = 1;
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
}

export const storage = new MemStorage();
