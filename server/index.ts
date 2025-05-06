import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { seedDemoData } from "./demo-data";
import { addDemoContent } from "./add-demo-content";
import { storage } from "./storage";
import cookieParser from "cookie-parser";
import { setupWebSocketServer } from "./websocket";

// Create Express app
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Add cookie parser middleware

// Add CORS headers for WebSocket support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the app
const initializeApp = async () => {
  // Seed the database with initial data including admin user
  await seedDatabase();
  
  // Seed demo data for better user experience
  try {
    await seedDemoData(storage);
    // Add additional demo content
    await addDemoContent(storage);
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
  
  const server = await registerRoutes(app);
  
  // Setup WebSocket server
  const wsServer = setupWebSocketServer(server);
  
  // Store WebSocket server in app for use in routes
  (app as any).wsServer = wsServer;

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Get status code from error if available, default to 500
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log the error with stack trace in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error (${status}): ${message}`);
      console.error(err.stack);
    } else {
      // In production, log less information
      console.error(`Error (${status}): ${message}`);
    }
    
    // Don't expose error details in production
    const responseBody = {
      message,
      ...(process.env.NODE_ENV === 'development' ? { 
        stack: err.stack,
        details: err.details || err.data
      } : {})
    };
    
    res.status(status).json(responseBody);
  });
  
  // importantly setup vite in development before the catch-all handler
  // so the vite middleware can handle client-side routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
    
    // Use PORT environment variable if available, otherwise default to 5000
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    
    // Listen on all interfaces to support various deployment environments
    server.listen(port, '0.0.0.0', () => {
      log(`Server running on port ${port}`);
      log(`WebSocket server running on ws://localhost:${port}`);
    });
  } else {
    serveStatic(app);
  }

  // Catch-all handler for undefined routes - this should be after Vite middleware
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Resource not found" });
  });

  return server;
};

// Check if this is being run directly (not imported by Netlify functions)
// In Netlify functions, we just want to export the app, not start the server
if (!process.env.NETLIFY) {
  initializeApp().catch(err => {
    console.error("Failed to initialize app:", err);
    process.exit(1);
  });
}
