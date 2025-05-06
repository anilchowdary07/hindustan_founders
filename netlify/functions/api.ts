// Use CommonJS require instead of ESM imports for Netlify compatibility
const serverless = require('serverless-http');

// Import our special server.js that's designed for Netlify
const { app } = require('./server.js');

// Wrap the Express app with serverless-http
module.exports = {
  handler: serverless(app, {
    provider: 'netlify',
    basePath: '/.netlify/functions/api'
  })
};