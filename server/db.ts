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
  max: 1, // Minimal connections for serverless
  idleTimeoutMillis: 15000, // Shorter idle timeout
  connectionTimeoutMillis: 5000,
};

// Create pool with error handling
let pool: Pool;
let dbInitialized = false;

const initializeDb = async () => {
  if (dbInitialized) return;
  
  try {
    console.log('Initializing database connection...');
    
    // In serverless environments, we want to create the pool but not test it immediately
    // This defers the actual connection until the first query
    pool = new Pool(poolConfig);
    
    // Add error handler
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit process in serverless environment
      if (process.env.VERCEL !== '1') {
        process.exit(-1);
      }
    });
    
    // Only test the connection in development mode
    if (process.env.NODE_ENV === 'development' && process.env.VERCEL !== '1') {
      try {
        const result = await pool.query('SELECT NOW()');
        console.log('Database connected successfully at:', result.rows[0].now);
      } catch (testError) {
        console.error('Database connection test failed:', testError);
        throw testError;
      }
    }
    
    dbInitialized = true;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    
    // Create a dummy pool for fallback
    pool = new Pool({
      connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
      max: 1,
    });
    
    // In development, throw the error to fail fast
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
};

// Initialize the database connection
initializeDb().catch(err => {
  console.error('Database initialization failed:', err);
});

// Create drizzle ORM instance
export { pool };
export const db = drizzle(pool, { schema });