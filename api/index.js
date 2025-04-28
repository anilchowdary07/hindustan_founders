import serverless from 'serverless-http';
import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import createMemoryStore from 'memorystore';

// Load environment variables
dotenv.config();

// Set Vercel flag
process.env.VERCEL = '1';
process.env.NODE_ENV = 'production';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    secure: false, // Set to true if using HTTPS
    sameSite: 'lax'
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
        // Initialize database first
        await import('../dist/db.js');
        console.log('Database module loaded');
        
        // Import auth and routes
        const { setupAuth } = await import('../dist/auth.js');
        const { default: setupRoutes } = await import('../dist/serverless-routes.js');
        
        console.log('Setting up auth...');
        setupAuth(app);
        
        console.log('Setting up routes...');
        setupRoutes(app);
        
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
        
        // Create serverless handler
        console.log('Creating serverless handler...');
        serverlessHandler = serverless(app);
        console.log('API initialization complete');
      } catch (initError) {
        console.error('Failed to initialize API:', initError);
        throw initError;
      }
    }
    
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.url}`);
    }
    
    // Handle the request
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Error in serverless handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal Server Error',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};

export default handler;