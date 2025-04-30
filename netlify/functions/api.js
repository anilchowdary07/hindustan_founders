// netlify/functions/api.js
import express from 'express';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import passport from 'passport';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import your server modules
import { setupRoutes } from '../../server/routes.js';
import { setupAuth } from '../../server/auth.js';
import { setupDb } from '../../server/db.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup CORS for cross-origin requests
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

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session with memory store for Netlify functions
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

// Setup database
try {
  console.log('Initializing database...');
  setupDb(app);
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Error initializing database:', error);
}

// Setup authentication
try {
  console.log('Setting up authentication...');
  setupAuth(app);
  console.log('Authentication setup complete');
} catch (error) {
  console.error('Error setting up authentication:', error);
}

// Setup routes
try {
  console.log('Setting up routes...');
  setupRoutes(app);
  console.log('Routes setup complete');
} catch (error) {
  console.error('Error setting up routes:', error);
}

// Add error handling middleware
app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ 
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Export the serverless function
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/zip'],
  provider: {
    // Increase timeout for Netlify functions
    timeout: 30
  }
});