import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Configure Neon database for WebSocket support
neonConfig.webSocketConstructor = ws;

// Check for database URL
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using fallback connection string.");
}

// Use a fallback connection string for development if needed
const connectionString = process.env.DATABASE_URL || 
  "postgresql://neondb_owner:npg_RoZcVvOq32Fx@ep-mute-dawn-a1s9kek1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Create connection pool with appropriate settings for serverless
const poolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });