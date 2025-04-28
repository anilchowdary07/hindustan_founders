// netlify/functions/api.js
import express from 'express';
import serverless from 'serverless-http';
import path from 'path';
import { fileURLToPath } from 'url';

// Import your server routes
import { setupRoutes } from '../../server/routes.js';
import { setupAuth } from '../../server/auth.js';
import { setupDb } from '../../server/db.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup database
setupDb(app);

// Setup authentication
setupAuth(app);

// Setup routes
setupRoutes(app);

// Export the serverless function
export const handler = serverless(app);