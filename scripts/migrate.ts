import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

// Main migration function
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("Applying schema migrations...");
  // This will create tables if they don't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      title TEXT,
      company TEXT,
      location TEXT,
      bio TEXT,
      is_verified BOOLEAN DEFAULT false,
      avatar_url TEXT,
      profile_completed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      media TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS pitches (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      logo TEXT,
      location TEXT,
      status TEXT NOT NULL,
      category TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      description TEXT,
      current BOOLEAN DEFAULT false
    );
    
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
  `);

  console.log("Migration completed successfully");
  await pool.end();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});