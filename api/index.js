import serverless from 'serverless-http';
import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import { Strategy as LocalStrategy } from 'passport-local';
import { createHash } from 'crypto';

// Load environment variables
dotenv.config();

// Set Vercel flag
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup CORS for Vercel environment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Setup session
const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000, // 24 hours
});

app.set("trust proxy", 1);
app.use(session({
  secret: process.env.SESSION_SECRET || "hindustan-founders-secret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true,
    sameSite: 'none' // Required for cross-site cookies in production
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Create a single instance of the serverless handler
let serverlessHandler;

// Wrap the handler in an async function
const handler = async (req, res) => {
  try {
    // Only register routes once
    if (!serverlessHandler) {
      console.log('Initializing API routes...');
      
      try {
        // Create a debug log file for Vercel troubleshooting
        const logMessage = `API initialization started at ${new Date().toISOString()}\n`;
        console.log(logMessage);
        
        // Initialize database first
        console.log('Loading database module...');
        const dbModule = await import('../dist/db.js');
        console.log('Database module loaded successfully');
        
        // Import auth and routes
        console.log('Loading auth and routes modules...');
        const { setupAuth } = await import('../dist/auth.js');
        const { default: setupRoutes } = await import('../dist/serverless-routes.js');
        console.log('Auth and routes modules loaded successfully');
        
        console.log('Setting up auth...');
        setupAuth(app);
        console.log('Auth setup complete');
        
        console.log('Setting up routes...');
        setupRoutes(app);
        console.log('Routes setup complete');
        
        // Error handling middleware
        app.use((err, _req, res, _next) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          console.error(`Error: ${message}`);
          res.status(status).json({ 
            message,
            error: process.env.NODE_ENV === 'development' ? err : undefined
          });
        });
        
        // Create serverless handler for Vercel with proper ES module export
        serverlessHandler = serverless(app, {
          binary: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf']
        });
        
        console.log('API initialization complete');
      } catch (initError) {
        console.error('Failed to initialize API:', initError);
        console.error('Error details:', JSON.stringify(initError, Object.getOwnPropertyNames(initError)));
        
        // Return a more helpful error response
        return {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'Failed to initialize API',
            error: initError.message,
            stack: initError.stack
          })
        };
      }
    }
    
    // Log request details
    console.log(`${req.method} ${req.url}`);
    
    // Handle the request
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Error in serverless handler:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Return a proper error response
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: 'Internal Server Error',
        error: error.message,
        stack: error.stack
      })
    };
  }
};

export default handler;