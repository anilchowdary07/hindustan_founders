import { createServer } from 'http';
import serverless from 'serverless-http';
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Wrap the handler in an async function to use await
const handler = async (req, res) => {
  try {
    // Dynamically import routes to avoid top-level await
    const { registerRoutes } = await import('../dist/routes.js');
    
    // Register all routes
    const server = await registerRoutes(app);
    
    // Error handling middleware
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`Error: ${message}`);
      res.status(status).json({ message });
    });
    
    // Create serverless handler
    const serverlessHandler = serverless(app);
    return serverlessHandler(req, res);
  } catch (error) {
    console.error('Error in serverless handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};

export default handler;