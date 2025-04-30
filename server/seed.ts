import { storage } from "./storage";
import { hashPassword } from "./auth";
import { UserRole } from "@shared/schema";

/**
 * Seeds the database with initial data including an admin user
 */
export async function seedDatabase() {
  try {
    console.log("Checking for admin user...");
    
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      console.log("Admin user not found. Creating admin account...");
      
      // Hash the admin password
      const hashedPassword = await hashPassword("admin123");
      
      // Create admin user
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        name: "Admin User",
        email: "admin@hindustanfounders.com",
        role: UserRole.ADMIN,
        title: "System Administrator",
        company: "Hindustan Founders Network",
        bio: "System administrator for the Hindustan Founders Network platform.",
        location: "Mumbai, India",
      });
      
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
