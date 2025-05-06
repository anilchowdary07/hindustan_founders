// This is a CommonJS wrapper for the server code
// It's needed because Netlify functions use CommonJS by default

// Set environment variables first
process.env.NETLIFY = 'true';
process.env.NODE_ENV = 'production';

// Then require the app
const express = require('express');
const cookieParser = require('cookie-parser');
const { setupAuth } = require('../../dist/auth.js');
const { registerRoutes } = require('../../dist/routes.js');

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set up authentication
setupAuth(app);

// Register API routes
registerRoutes(app);

// Export the app for serverless-http
module.exports = { app };