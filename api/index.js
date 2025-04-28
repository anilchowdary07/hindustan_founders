import { createServer } from 'http';
import { parse } from 'url';
import serverless from 'serverless-http';
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all routes
const server = await registerRoutes(app);

// Error handling middleware
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`Error: ${message}`);
  res.status(status).json({ message });
});

// Export the serverless handler
export default serverless(app);