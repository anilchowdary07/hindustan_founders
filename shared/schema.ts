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
  ADMIN: "admin",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Pitch status
export const PitchStatus = {
  IDEA: "idea",
  REGISTERED: "registered",
  FUNDED: "funded",
  ACQUIRED: "acquired",
} as const;

export type PitchStatusType = typeof PitchStatus[keyof typeof PitchStatus];

// Job types
export const JobType = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
  FREELANCE: "freelance",
} as const;

export type JobTypeType = typeof JobType[keyof typeof JobType];

// Job locations
export const JobLocation = {
  REMOTE: "remote",
  HYBRID: "hybrid",
  ON_SITE: "on-site",
} as const;

export type JobLocationType = typeof JobLocation[keyof typeof JobLocation];

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

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  locationType: text("location_type").$type<JobLocationType>().notNull(),
  jobType: text("job_type").$type<JobTypeType>().notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  salary: text("salary"),
  applicationLink: text("application_link"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
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

export const insertJobSchema = createInsertSchema(jobs)
  .omit({ id: true, createdAt: true });

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertPitch = z.infer<typeof insertPitchSchema>;
export type Pitch = typeof pitches.$inferSelect;

export type InsertExperience = z.infer<typeof insertExperienceSchema>;
export type Experience = typeof experiences.$inferSelect;

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;

// Connections table
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConnectionSchema = createInsertSchema(connections)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // connection, message, mention, job, pitch
  content: text("content").notNull(),
  read: boolean("read").default(false),
  relatedId: integer("related_id"), // ID of the related entity (post, connection, etc.)
  relatedType: text("related_type"), // Type of the related entity (post, connection, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true });

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Conversations table
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Conversation participants table
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  userId: integer("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants)
  .omit({ id: true, joinedAt: true });

export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isEdited: boolean("is_edited").default(false),
  isDeleted: boolean("is_deleted").default(false),
});

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, createdAt: true, updatedAt: true, isEdited: true, isDeleted: true });

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Message read status table
export const messageReadStatus = pgTable("message_read_status", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: integer("user_id").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
});

export const insertMessageReadStatusSchema = createInsertSchema(messageReadStatus)
  .omit({ id: true, readAt: true });

export type InsertMessageReadStatus = z.infer<typeof insertMessageReadStatusSchema>;
export type MessageReadStatus = typeof messageReadStatus.$inferSelect;
