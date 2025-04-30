// CommonJS version of the API handler for Vercel
const serverless = require('serverless-http');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const createMemoryStore = require('memorystore');
const cookieParser = require('cookie-parser');
const { Strategy: LocalStrategy } = require('passport-local');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`Vercel function received: ${req.method} ${req.path || req.url}`);
  next();
});

// Setup CORS
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

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
const MemoryStore = createMemoryStore(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // 24 hours
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'hindustan-founders-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Mock users for testing
const users = [
  {
    id: 1,
    username: 'admin',
    password: crypto.createHash('sha256').update('admin123').digest('hex'),
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    profilePicture: '/placeholder-avatar.jpg',
    bio: 'Administrator account',
    connections: [],
    pendingConnections: [],
    profileStrength: 100
  },
  {
    id: 2,
    username: 'founder',
    password: crypto.createHash('sha256').update('founder123').digest('hex'),
    name: 'Founder User',
    email: 'founder@example.com',
    role: 'founder',
    profilePicture: '/placeholder-avatar.jpg',
    bio: 'Founder account',
    connections: [],
    pendingConnections: [],
    profileStrength: 80
  },
  {
    id: 3,
    username: 'investor',
    password: crypto.createHash('sha256').update('investor123').digest('hex'),
    name: 'Investor User',
    email: 'investor@example.com',
    role: 'investor',
    profilePicture: '/placeholder-avatar.jpg',
    bio: 'Investor account',
    connections: [],
    pendingConnections: [],
    profileStrength: 90
  }
];

// Authentication strategy
passport.use(new LocalStrategy((username, password, done) => {
  console.log(`Login attempt for username: ${username}`);
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  
  // Case-insensitive username matching
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    console.log(`User not found: ${username}`);
    return done(null, false);
  }
  
  // Check for test accounts with emergency login
  const testAccounts = ['admin', 'founder', 'investor'];
  if (testAccounts.includes(username.toLowerCase()) && password.includes('123')) {
    console.log(`Emergency login for test account: ${username}`);
    return done(null, user);
  }
  
  if (user.password !== hashedPassword) {
    console.log('Invalid password');
    return done(null, false);
  }
  
  console.log(`User authenticated: ${username}`);
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// API Routes
app.post('/api/login', (req, res, next) => {
  console.log('Login request received:', req.body);
  
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ message: 'Authentication error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.status(500).json({ message: 'Login error' });
      }
      
      // Set a user ID cookie as a fallback for session issues
      res.cookie('userId', user.id, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });
      
      console.log('Login successful for:', user.username);
      console.log('Session ID:', req.sessionID);
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio
      });
    });
  })(req, res, next);
});

app.get('/api/user', (req, res) => {
  console.log('User request received with path:', req.path);
  console.log('Session ID:', req.sessionID);
  console.log('Cookies:', req.cookies);
  
  // Check if user is authenticated via session
  if (req.isAuthenticated() && req.user) {
    console.log('User is authenticated via session:', req.user.username);
    return res.json({
      id: req.user.id,
      username: req.user.username,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      bio: req.user.bio,
      profileStrength: req.user.profileStrength
    });
  }
  
  // Fallback: Check if we have a userId cookie
  const userId = req.cookies?.userId;
  if (userId) {
    const user = users.find(u => u.id === parseInt(userId));
    if (user) {
      console.log('User authenticated via userId cookie:', user.username);
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture, 
        bio: user.bio,
        profileStrength: user.profileStrength
      });
    }
  }
  
  console.log('User not authenticated');
  res.status(401).json({ message: 'Not authenticated' });
});

app.get('/api/logout', (req, res) => {
  console.log('Logout request received');
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout error' });
    }
    
    console.log('Logout successful');
    res.clearCookie('userId');
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Vercel API is working!' });
});

// 404 handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.path || req.url}`);
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Create serverless handler with explicit CommonJS export
const serverlessHandler = serverless(app, {
  binary: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf']
});

// Export using CommonJS syntax
module.exports = async (req, res) => {
  console.log(`Vercel API request: ${req.method} ${req.url}`);
  return serverlessHandler(req, res);
};
