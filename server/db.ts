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

// Check for database URL and exit if not available
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set. Please set a valid database connection string.");
  // In non-serverless environments, exit the process
  if (process.env.VERCEL !== '1' && process.env.NETLIFY !== 'true') {
    process.exit(1);
  }
}

// Log environment information
console.log("Database initialization environment:", {
  NODE_ENV: process.env.NODE_ENV,
  NETLIFY: process.env.NETLIFY,
  DATABASE_URL: process.env.DATABASE_URL ? "Set (value hidden)" : "Not set"
});

// Use the environment variable for connection string
const connectionString = process.env.DATABASE_URL;

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
      const isServerless = process.env.VERCEL === '1' || process.env.NETLIFY === 'true';
      if (!isServerless) {
        // Instead of exiting, we'll try to recover by reinitializing the pool
        console.log('Attempting to recover from database error...');
        dbInitialized = false;
        setTimeout(() => {
          initializeDb().catch(reinitError => {
            console.error('Failed to reinitialize database after error:', reinitError);
            // Only exit if we can't recover after multiple attempts
            process.exit(-1);
          });
        }, 5000); // Wait 5 seconds before trying to reconnect
      } else {
        console.log('Database error in serverless environment - will attempt recovery on next request');
        dbInitialized = false;
      }
    });
    
    // Only test the connection in development mode or if explicitly requested
    const isServerless = process.env.VERCEL === '1' || process.env.NETLIFY === 'true';
    const shouldTestConnection = process.env.NODE_ENV === 'development' || process.env.TEST_DB_CONNECTION === 'true';
    
    if (shouldTestConnection && !isServerless) {
      try {
        // Set a timeout for the connection test
        const connectionTestPromise = pool.query('SELECT NOW()');
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection test timed out')), 5000);
        });
        
        const result = await Promise.race([connectionTestPromise, timeoutPromise]);
        console.log('Database connected successfully at:', result.rows[0].now);
      } catch (testError) {
        console.error('Database connection test failed:', testError);
        throw testError;
      }
    } else if (isServerless) {
      console.log('Skipping immediate database connection test in serverless environment');
    }
    
    dbInitialized = true;
  } catch (error) {
    console.error('Failed to create database pool:', error);
    
    // Create a dummy pool for fallback that returns empty results instead of failing
    pool = new Pool({
      connectionString: 'postgresql://dummy:dummy@localhost:5432/dummy',
      max: 1,
    });
    
    // Override the query method to return empty results
    const originalQuery = pool.query;
    pool.query = function(...args) {
      console.warn('Using dummy database pool - returning empty result');
      return Promise.resolve({ rows: [] });
    };
    
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