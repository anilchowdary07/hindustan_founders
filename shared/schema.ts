import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export const UserRole = {
  FOUNDER: "founder",
  STUDENT: "student",
  JOB_SEEKER: "job_seeker",
  INVESTOR: "investor",
  EXPLORER: "explorer",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Pitch status
export const PitchStatus = {
  IDEA: "idea",
  REGISTERED: "registered",
} as const;

export type PitchStatusType = typeof PitchStatus[keyof typeof PitchStatus];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").$type<UserRoleType>().notNull(),
  title: text("title"),
  company: text("company"),
  location: text("location"),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  avatarUrl: text("avatar_url"),
  profileCompleted: integer("profile_completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  media: text("media"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Startups/Pitches table
export const pitches = pgTable("pitches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  logo: text("logo"),
  location: text("location"),
  status: text("status").$type<PitchStatusType>().notNull(),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Experiences table
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  current: boolean("current").default(false),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, profileCompleted: true });

export const insertPostSchema = createInsertSchema(posts)
  .omit({ id: true, createdAt: true });

export const insertPitchSchema = createInsertSchema(pitches)
  .omit({ id: true, createdAt: true });

export const insertExperienceSchema = createInsertSchema(experiences)
  .omit({ id: true });

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertPitch = z.infer<typeof insertPitchSchema>;
export type Pitch = typeof pitches.$inferSelect;

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;
