// netlify/functions/api.js
import express from 'express';
import serverless from 'serverless-http';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import { createHash } from 'crypto';

// Load environment variables
dotenv.config();

const app = express();

// Setup CORS for cross-origin requests
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

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session with memory store for Netlify functions
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
    secure: false, // Set to false for development
    httpOnly: true,
    sameSite: 'lax' // Use lax for better compatibility
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Mock users for testing
const users = [
  {
    id: 1,
    username: 'admin',
    password: createHash('sha256').update('admin123').digest('hex'),
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
    password: createHash('sha256').update('founder123').digest('hex'),
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
    password: createHash('sha256').update('investor123').digest('hex'),
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

// Setup simple authentication
passport.use(new LocalStrategy((username, password, done) => {
  console.log(`Login attempt for username: ${username}`);
  const hashedPassword = createHash('sha256').update(password).digest('hex');
  const user = users.find(u => u.username === username);
  
  if (!user) {
    console.log(`User not found: ${username}`);
    return done(null, false);
  }
  
  if (user.password !== hashedPassword) {
    console.log('Invalid password');
    return done(null, false);
  }
  
  console.log(`User authenticated: ${username}`);
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  console.log(`Serializing user: ${user.id}`);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log(`Deserializing user: ${id}`);
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// API Routes
app.post('/login', (req, res, next) => {
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
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      console.log('Login successful for:', userWithoutPassword.username);
      res.status(200).json(userWithoutPassword);
    });
  })(req, res, next);
});

app.post('/register', (req, res) => {
  console.log('Register request received:', req.body);
  
  // Validate required fields
  if (!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  // Check if username already exists
  if (users.some(u => u.username === req.body.username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    username: req.body.username,
    password: createHash('sha256').update(req.body.password).digest('hex'),
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    profilePicture: '/placeholder-avatar.jpg',
    bio: '',
    connections: [],
    pendingConnections: [],
    profileStrength: 30
  };
  
  users.push(newUser);
  
  // Log the user in
  req.login(newUser, (err) => {
    if (err) {
      console.error('Login error after registration:', err);
      return res.status(500).json({ message: 'Login error after registration' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    console.log('Registration successful for:', userWithoutPassword.username);
    res.status(201).json(userWithoutPassword);
  });
});

app.get('/user', (req, res) => {
  console.log('User request received');
  
  if (!req.isAuthenticated()) {
    console.log('User not authenticated');
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Remove password from response
  const { password, ...userWithoutPassword } = req.user;
  console.log('User data sent for:', userWithoutPassword.username);
  res.json(userWithoutPassword);
});

app.post('/logout', (req, res) => {
  console.log('Logout request received');
  
  if (!req.isAuthenticated()) {
    return res.status(200).json({ message: 'Already logged out' });
  }
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    if (req.session) {
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          console.error('Session destruction error:', sessionErr);
        }
        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      res.status(200).json({ message: 'Logged out successfully' });
    }
  });
});

// Default route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add error handling middleware
app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ 
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Export the serverless function
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/zip']
});