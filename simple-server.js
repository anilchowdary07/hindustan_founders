const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add a mock API endpoint for testing
app.get('/api/user', (req, res) => {
  res.status(200).json({
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    role: 'user'
  });
});

// Add a mock API endpoint for posts
app.get('/api/posts', (req, res) => {
  res.status(200).json([
    {
      id: 1,
      title: 'First Post',
      content: 'This is the first post',
      userId: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'This is the second post',
      userId: 1,
      createdAt: new Date().toISOString()
    }
  ]);
});

// Handle all other API routes
app.all('/api/*', (req, res) => {
  res.status(200).json({ message: 'API endpoint not implemented yet' });
});

// For any other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to test the API`);
});