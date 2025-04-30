import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  // Seed the database with initial data including admin user
  await seedDatabase();
  
  const server = await registerRoutes(app);

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
  } else {
    serveStatic(app);
  }

  // Catch-all handler for undefined routes - this should be after Vite middleware
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: "Resource not found" });
  });

  // Use PORT environment variable if available, otherwise default to 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // Listen on all interfaces to support various deployment environments
  server.listen(port, () => {
    log(`Server running on port ${port}`);
  });
})();
