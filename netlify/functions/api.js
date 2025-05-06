// netlify/functions/api.js - Converted to CommonJS for compatibility
const express = require('express');
const serverless = require('serverless-http');
const session = require('express-session');
const createMemoryStore = require('memorystore');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { createHash } = crypto;
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Debug request info
app.use((req, res, next) => {
  console.log('Netlify function received request:');
  console.log(`- URL: ${req.url}`);
  console.log(`- Method: ${req.method}`);
  console.log(`- Headers:`, req.headers);
  next();
});

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

// Parse URL-encoded bodies and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
    sameSite: 'lax', // Use lax for better compatibility
    path: '/' // Ensure cookies are available across the site
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Mock pitches for testing
const pitches = [
  {
    id: 1,
    userId: 2,
    name: "EduTech Solutions",
    description: "AI-powered personalized learning platform for K-12 students",
    logo: null,
    location: "Bangalore",
    status: "idea",
    category: "EdTech",
    createdAt: new Date("2023-12-15").toISOString(),
    websiteLink: "https://edutechsolutions.in",
    companyRegistrationStatus: "Not Registered",
    elevatorPitch: {
      problem: "Traditional education fails to address individual learning needs",
      solution: "Our AI platform adapts to each student's learning style and pace"
    },
    businessModel: "Subscription-based model with tiered pricing for schools and individual students",
    marketOpportunity: "₹15,000 crore market in India with 250 million K-12 students",
    revenue: {
      model: "Subscription",
      growth: "Projected 200% YoY for first 3 years"
    },
    fundingStage: "Bootstrapped"
  },
  {
    id: 2,
    userId: 3,
    name: "HealthTrack",
    description: "Remote patient monitoring system for chronic disease management",
    logo: null,
    location: "Mumbai",
    status: "registered",
    category: "HealthTech",
    createdAt: new Date("2023-11-20").toISOString(),
    websiteLink: "https://healthtrack.co.in",
    companyRegistrationStatus: "Registered",
    elevatorPitch: {
      problem: "Chronic disease patients lack continuous monitoring between doctor visits",
      solution: "Our IoT devices and app provide real-time health monitoring and alerts"
    },
    businessModel: "B2B2C model partnering with hospitals and insurance companies",
    marketOpportunity: "₹8,000 crore market with 200 million chronic disease patients in India",
    revenue: {
      model: "Subscription",
      growth: "Currently at ₹50 lakh ARR, growing 150% annually"
    },
    fundingStage: "Seed"
  },
  {
    id: 3,
    userId: 4,
    name: "FarmConnect",
    description: "Direct farm-to-consumer marketplace eliminating middlemen",
    logo: null,
    location: "Delhi",
    status: "idea",
    category: "AgriTech",
    createdAt: new Date("2024-01-05").toISOString(),
    websiteLink: "",
    companyRegistrationStatus: "In Process",
    elevatorPitch: {
      problem: "Farmers receive only 20-30% of the final price consumers pay for produce",
      solution: "Our platform connects farmers directly with consumers, increasing farmer income by 40-60%"
    },
    businessModel: "Marketplace model with commission on transactions",
    marketOpportunity: "₹25,000 crore addressable market with 140 million farmers in India",
    revenue: {
      model: "Marketplace",
      growth: "Targeting 100,000 farmers in year 1"
    },
    fundingStage: "Pre-Seed"
  },
  {
    id: 4,
    userId: 5,
    name: "PayEasy",
    description: "Simplified payment solutions for small businesses",
    logo: null,
    location: "Hyderabad",
    status: "registered",
    category: "FinTech",
    createdAt: new Date("2023-10-10").toISOString(),
    websiteLink: "https://payeasy.in",
    companyRegistrationStatus: "Registered",
    elevatorPitch: {
      problem: "Small businesses struggle with complex payment systems and high transaction fees",
      solution: "Our simplified, low-cost payment platform designed specifically for small Indian businesses"
    },
    businessModel: "Transaction fee model with volume-based discounts",
    marketOpportunity: "₹12,000 crore market with 63 million MSMEs in India",
    revenue: {
      model: "Transactional",
      growth: "Processing ₹2 crore monthly, growing at 30% month-on-month"
    },
    fundingStage: "Series A"
  },
  {
    id: 5,
    userId: 6,
    name: "QuickCommerce",
    description: "10-minute delivery platform for essential items",
    logo: null,
    location: "Bangalore",
    status: "registered",
    category: "E-commerce",
    createdAt: new Date("2023-09-15").toISOString(),
    websiteLink: "https://quickcommerce.co",
    companyRegistrationStatus: "Registered",
    elevatorPitch: {
      problem: "Urban consumers need immediate access to essential items",
      solution: "Network of micro-warehouses enabling 10-minute delivery of daily essentials"
    },
    businessModel: "Markup on products plus delivery fee",
    marketOpportunity: "₹35,000 crore quick commerce market in top 10 Indian cities",
    revenue: {
      model: "Transactional",
      growth: "Currently at ₹3 crore monthly GMV"
    },
    fundingStage: "Series B+"
  }
];

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
    profileStrength: 100,
    isVerified: true,
    followers: [],
    following: []
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
    profileStrength: 80,
    isVerified: true,
    followers: [3], // Investor follows the founder
    following: []
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
    profileStrength: 90,
    isVerified: false,
    followers: [],
    following: [2] // Investor follows the founder
  }
];

// Mock posts for testing
const posts = [
  {
    id: 1,
    content: "Excited to announce that we've just closed our Series A funding round! Looking forward to scaling our operations and bringing our product to more customers.",
    userId: 2,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    likes: 42,
    comments: 8,
    media: null,
    user: {
      id: 2,
      name: 'Founder User',
      role: 'founder',
      profilePicture: '/placeholder-avatar.jpg'
    }
  },
  {
    id: 2,
    content: "Just published my latest article on startup valuation methods. Check it out and let me know your thoughts!",
    userId: 3,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    likes: 28,
    comments: 5,
    media: null,
    user: {
      id: 3,
      name: 'Investor User',
      role: 'investor',
      profilePicture: '/placeholder-avatar.jpg'
    }
  },
  {
    id: 3,
    content: "We're hosting a virtual networking event next week for tech founders. DM me if you'd like to join!",
    userId: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    likes: 35,
    comments: 12,
    media: null,
    user: {
      id: 1,
      name: 'Admin User',
      role: 'admin',
      profilePicture: '/placeholder-avatar.jpg'
    }
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

// Handle login - explicit path for direct login and Netlify function path
app.post('/login', handleLogin);
app.post('/.netlify/functions/api/login', handleLogin);

// Authentication handler function
function handleLogin(req, res, next) {
  console.log('Login handler called with path:', req.path);
  console.log('Login request body:', req.body);
  
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // Emergency backdoor login for testing
  const testAccounts = ['admin', 'founder', 'investor'];
  if (testAccounts.includes(req.body.username.toLowerCase()) && 
      req.body.password.includes('123')) {
    
    console.log('Using emergency login for test account:', req.body.username);
    
    // Find the user
    const user = users.find(u => 
      u.username.toLowerCase() === req.body.username.toLowerCase());
    
    if (user) {
      // Set session manually
      req.session.passport = { user: user.id };
      
      // Set a user ID cookie as a fallback
      res.cookie('userId', user.id, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
      });
      
      console.log('Emergency login successful for:', user.username);
      console.log('Session ID:', req.sessionID);
      
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        avatarUrl: user.profilePicture, // Add avatarUrl for frontend compatibility
        bio: user.bio,
        isVerified: user.isVerified,
        followers: user.followers || [],
        following: user.following || [],
        followerCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0
      });
    }
  }
  
  // Regular authentication
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
        avatarUrl: user.profilePicture, // Add avatarUrl for frontend compatibility
        bio: user.bio,
        isVerified: user.isVerified,
        followers: user.followers || [],
        following: user.following || [],
        followerCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0
      });
    });
  })(req, res, next);
}

// Handle registration - both direct and Netlify function paths
app.post('/register', handleRegister);
app.post('/.netlify/functions/api/register', handleRegister);

function handleRegister(req, res) {
  console.log('Register request received with path:', req.path);
  console.log('Register request body:', req.body);
  
  if (!req.body.username || !req.body.password || !req.body.email || !req.body.name) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if username already exists (case insensitive)
  const existingUser = users.find(u => 
    u.username.toLowerCase() === req.body.username.toLowerCase());
    
  if (existingUser) {
    return res.status(400).json({ message: 'Username already taken' });
  }
  
  // Create new user (in a real app, this would save to a database)
  const newUser = {
    id: users.length + 1,
    username: req.body.username,
    password: createHash('sha256').update(req.body.password).digest('hex'),
    name: req.body.name,
    email: req.body.email,
    role: 'user',
    profilePicture: '/placeholder-avatar.jpg',
    bio: '',
    connections: [],
    pendingConnections: [],
    profileStrength: 20,
    isVerified: false, // New users are not verified by default
    followers: [],
    following: []
  };
  
  users.push(newUser);
  
  // Set a user ID cookie as a fallback for session issues
  res.cookie('userId', newUser.id, {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });
  
  req.login(newUser, (err) => {
    if (err) {
      console.error('Login after registration failed:', err);
      // Still proceed with registration even if login fails
      console.log('Registration successful but login failed for:', newUser.username);
    } else {
      console.log('Registration and login successful for:', newUser.username);
    }
    
    // Return user info without password
    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
      avatarUrl: newUser.profilePicture, // Add avatarUrl for frontend compatibility
      bio: newUser.bio,
      profileStrength: newUser.profileStrength,
      isVerified: newUser.isVerified,
      followers: newUser.followers || [],
      following: newUser.following || [],
      followerCount: newUser.followers ? newUser.followers.length : 0,
      followingCount: newUser.following ? newUser.following.length : 0
    });
  });
}

// Handle logout - both direct and Netlify function paths
app.get('/logout', handleLogout);
app.get('/.netlify/functions/api/logout', handleLogout);

function handleLogout(req, res) {
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
}

// Handle user info - both direct and Netlify function paths
app.get('/user', handleGetUser);
app.get('/.netlify/functions/api/user', handleGetUser);

function handleGetUser(req, res) {
  console.log('User request received with path:', req.path);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
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
      avatarUrl: req.user.profilePicture, // Add avatarUrl for frontend compatibility
      bio: req.user.bio,
      profileStrength: req.user.profileStrength,
      isVerified: req.user.isVerified,
      followers: req.user.followers || [],
      following: req.user.following || [],
      followerCount: req.user.followers ? req.user.followers.length : 0,
      followingCount: req.user.following ? req.user.following.length : 0
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
        avatarUrl: user.profilePicture, // Add avatarUrl for frontend compatibility
        bio: user.bio,
        profileStrength: user.profileStrength,
        isVerified: user.isVerified,
        followers: user.followers || [],
        following: user.following || [],
        followerCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0
      });
    }
  }
  
  console.log('User not authenticated');
  res.status(401).json({ message: 'Not authenticated' });
}

// Admin endpoint to toggle user verification status
app.patch('/api/admin/users/:userId', handleToggleVerification);
app.patch('/.netlify/functions/api/admin/users/:userId', handleToggleVerification);

function handleToggleVerification(req, res) {
  console.log('Toggle verification request received for user ID:', req.params.userId);
  console.log('Request body:', req.body);
  
  // More flexible admin check - allow userId cookie fallback
  let isAdmin = false;
  
  // Check if authenticated via session
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    isAdmin = true;
  } 
  // Fallback: Check userId cookie
  else if (req.cookies?.userId) {
    const adminUser = users.find(u => u.id === parseInt(req.cookies.userId) && u.role === 'admin');
    if (adminUser) {
      isAdmin = true;
    }
  }
  
  if (!isAdmin) {
    console.log('Unauthorized attempt to toggle verification status');
    return res.status(403).json({ message: 'Only admins can modify verification status' });
  }
  
  const userId = parseInt(req.params.userId);
  
  // Handle both isVerified as a direct property or nested in a data object
  let isVerified;
  if (req.body.isVerified !== undefined) {
    isVerified = req.body.isVerified;
  } else if (req.body.data && req.body.data.isVerified !== undefined) {
    isVerified = req.body.data.isVerified;
  } else {
    console.log('Missing isVerified field in request body:', req.body);
    return res.status(400).json({ message: 'isVerified field is required' });
  }
  
  // Find the user to update
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.log(`User with ID ${userId} not found`);
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update the user's verification status
  users[userIndex].isVerified = Boolean(isVerified);
  
  console.log(`User ${users[userIndex].username} verification status updated to: ${isVerified}`);
  
  // Return the updated user
  return res.json({
    id: users[userIndex].id,
    username: users[userIndex].username,
    name: users[userIndex].name,
    email: users[userIndex].email,
    role: users[userIndex].role,
    profilePicture: users[userIndex].profilePicture,
    avatarUrl: users[userIndex].profilePicture, // Add avatarUrl for frontend compatibility
    bio: users[userIndex].bio,
    profileStrength: users[userIndex].profileStrength,
    isVerified: users[userIndex].isVerified
  });
}

// Follow/unfollow endpoints
app.post('/api/users/:userId/follow', handleFollowUser);
app.post('/.netlify/functions/api/users/:userId/follow', handleFollowUser);

app.delete('/api/users/:userId/follow', handleUnfollowUser);
app.delete('/.netlify/functions/api/users/:userId/follow', handleUnfollowUser);

// Get user profile endpoint
app.get('/api/users/:userId', handleGetUserProfile);
app.get('/.netlify/functions/api/users/:userId', handleGetUserProfile);

function handleFollowUser(req, res) {
  console.log('Follow user request received for user ID:', req.params.userId);
  
  // Check if user is authenticated
  let currentUserId;
  
  if (req.isAuthenticated() && req.user) {
    currentUserId = req.user.id;
  } else if (req.cookies?.userId) {
    currentUserId = parseInt(req.cookies.userId);
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const targetUserId = parseInt(req.params.userId);
  
  // Can't follow yourself
  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }
  
  // Find both users
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const targetUserIndex = users.findIndex(u => u.id === targetUserId);
  
  if (currentUserIndex === -1 || targetUserIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if already following
  if (users[currentUserIndex].following.includes(targetUserId)) {
    return res.status(400).json({ message: 'Already following this user' });
  }
  
  // Update following and followers
  users[currentUserIndex].following.push(targetUserId);
  users[targetUserIndex].followers.push(currentUserId);
  
  console.log(`User ${users[currentUserIndex].username} is now following ${users[targetUserIndex].username}`);
  
  // Return updated current user
  return res.json({
    id: users[currentUserIndex].id,
    username: users[currentUserIndex].username,
    name: users[currentUserIndex].name,
    email: users[currentUserIndex].email,
    role: users[currentUserIndex].role,
    profilePicture: users[currentUserIndex].profilePicture,
    avatarUrl: users[currentUserIndex].profilePicture,
    bio: users[currentUserIndex].bio,
    profileStrength: users[currentUserIndex].profileStrength,
    isVerified: users[currentUserIndex].isVerified,
    followers: users[currentUserIndex].followers,
    following: users[currentUserIndex].following,
    followerCount: users[currentUserIndex].followers.length,
    followingCount: users[currentUserIndex].following.length
  });
}

function handleUnfollowUser(req, res) {
  console.log('Unfollow user request received for user ID:', req.params.userId);
  
  // Check if user is authenticated
  let currentUserId;
  
  if (req.isAuthenticated() && req.user) {
    currentUserId = req.user.id;
  } else if (req.cookies?.userId) {
    currentUserId = parseInt(req.cookies.userId);
  } else {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const targetUserId = parseInt(req.params.userId);
  
  // Find both users
  const currentUserIndex = users.findIndex(u => u.id === currentUserId);
  const targetUserIndex = users.findIndex(u => u.id === targetUserId);
  
  if (currentUserIndex === -1 || targetUserIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if actually following
  if (!users[currentUserIndex].following.includes(targetUserId)) {
    return res.status(400).json({ message: 'Not following this user' });
  }
  
  // Update following and followers
  users[currentUserIndex].following = users[currentUserIndex].following.filter(id => id !== targetUserId);
  users[targetUserIndex].followers = users[targetUserIndex].followers.filter(id => id !== currentUserId);
  
  console.log(`User ${users[currentUserIndex].username} has unfollowed ${users[targetUserIndex].username}`);
  
  // Return updated current user
  return res.json({
    id: users[currentUserIndex].id,
    username: users[currentUserIndex].username,
    name: users[currentUserIndex].name,
    email: users[currentUserIndex].email,
    role: users[currentUserIndex].role,
    profilePicture: users[currentUserIndex].profilePicture,
    avatarUrl: users[currentUserIndex].profilePicture,
    bio: users[currentUserIndex].bio,
    profileStrength: users[currentUserIndex].profileStrength,
    isVerified: users[currentUserIndex].isVerified,
    followers: users[currentUserIndex].followers,
    following: users[currentUserIndex].following,
    followerCount: users[currentUserIndex].followers.length,
    followingCount: users[currentUserIndex].following.length
  });
}

function handleGetUserProfile(req, res) {
  console.log('Get user profile request received for user ID:', req.params.userId);
  
  const userId = parseInt(req.params.userId);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Check if the current user is following this user
  let isFollowing = false;
  let currentUserId;
  
  if (req.isAuthenticated() && req.user) {
    currentUserId = req.user.id;
  } else if (req.cookies?.userId) {
    currentUserId = parseInt(req.cookies.userId);
  }
  
  if (currentUserId) {
    const currentUser = users.find(u => u.id === currentUserId);
    if (currentUser && currentUser.following.includes(userId)) {
      isFollowing = true;
    }
  }
  
  // Return user profile without sensitive info
  return res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    profilePicture: user.profilePicture,
    avatarUrl: user.profilePicture,
    bio: user.bio,
    isVerified: user.isVerified,
    followerCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing: isFollowing
  });
}

// Admin endpoint to get all users
app.get('/api/users', handleGetAllUsers);
app.get('/.netlify/functions/api/users', handleGetAllUsers);

function handleGetAllUsers(req, res) {
  console.log('Get all users request received');
  
  // Check if the requester is an admin
  let isAdmin = false;
  
  // Check if authenticated via session
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    isAdmin = true;
  } 
  // Fallback: Check userId cookie
  else if (req.cookies?.userId) {
    const adminUser = users.find(u => u.id === parseInt(req.cookies.userId) && u.role === 'admin');
    if (adminUser) {
      isAdmin = true;
    }
  }
  
  if (!isAdmin) {
    console.log('Unauthorized attempt to get all users');
    return res.status(403).json({ message: 'Only admins can view all users' });
  }
  
  // Return all users without passwords
  const safeUsers = users.map(user => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    avatarUrl: user.profilePicture, // Add avatarUrl for frontend compatibility
    bio: user.bio,
    profileStrength: user.profileStrength,
    isVerified: user.isVerified
  }));
  
  return res.json(safeUsers);
}

// Posts endpoints
app.get('/api/posts', handleGetPosts);
app.get('/.netlify/functions/api/posts', handleGetPosts);

function handleGetPosts(req, res) {
  console.log('Posts request received');
  
  // Check if user is authenticated
  if (req.isAuthenticated()) {
    console.log('User is authenticated, returning posts');
    return res.json(posts);
  }
  
  // For demo purposes, also return posts if not authenticated
  console.log('User not authenticated, but returning posts anyway for demo');
  res.json(posts);
}

app.get('/api/users/:userId/posts', handleGetUserPosts);
app.get('/.netlify/functions/api/users/:userId/posts', handleGetUserPosts);

function handleGetUserPosts(req, res) {
  console.log('User posts request received for user:', req.params.userId);
  
  const userId = parseInt(req.params.userId);
  const userPosts = posts.filter(post => post.userId === userId);
  
  res.json(userPosts);
}

app.post('/api/posts', handleCreatePost);
app.post('/.netlify/functions/api/posts', handleCreatePost);

function handleCreatePost(req, res) {
  console.log('Create post request received:', req.body);
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const newPost = {
    id: posts.length + 1,
    content: req.body.content,
    userId: req.user.id,
    createdAt: new Date(),
    likes: 0,
    comments: 0,
    media: req.body.media || null,
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      profilePicture: req.user.profilePicture || '/placeholder-avatar.jpg'
    }
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
}

// Test routes
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/.netlify/functions/api/test', (req, res) => {
  res.json({ message: 'API is working via Netlify path!' });
});

// Pitch endpoints
// Get all pitches
app.get('/api/pitches', handleGetPitches);
app.get('/.netlify/functions/api/pitches', handleGetPitches);

function handleGetPitches(req, res) {
  console.log('Get pitches request received');
  const { status, category, location } = req.query;
  
  let filteredPitches = [...pitches];
  
  // Filter by status if provided
  if (status) {
    filteredPitches = filteredPitches.filter(pitch => pitch.status === status);
  }
  
  // Filter by category if provided
  if (category) {
    filteredPitches = filteredPitches.filter(pitch => 
      pitch.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Filter by location if provided
  if (location) {
    filteredPitches = filteredPitches.filter(pitch => 
      pitch.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  // Add user data to each pitch
  const pitchesWithUserData = filteredPitches.map(pitch => {
    const user = users.find(u => u.id === pitch.userId);
    return {
      ...pitch,
      user: user ? {
        id: user.id,
        name: user.name,
        isVerified: user.isVerified
      } : null
    };
  });
  
  // Sort by creation date (newest first)
  pitchesWithUserData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return res.json(pitchesWithUserData);
}

// Get a specific pitch
app.get('/api/pitches/:pitchId', handleGetPitch);
app.get('/.netlify/functions/api/pitches/:pitchId', handleGetPitch);

function handleGetPitch(req, res) {
  const pitchId = parseInt(req.params.pitchId);
  const pitch = pitches.find(p => p.id === pitchId);
  
  if (!pitch) {
    return res.status(404).json({ message: 'Pitch not found' });
  }
  
  // Add user data
  const user = users.find(u => u.id === pitch.userId);
  const pitchWithUser = {
    ...pitch,
    user: user ? {
      id: user.id,
      name: user.name,
      isVerified: user.isVerified
    } : null
  };
  
  return res.json(pitchWithUser);
}

// Create a new pitch
app.post('/api/pitches', handleCreatePitch);
app.post('/.netlify/functions/api/pitches', handleCreatePitch);

function handleCreatePitch(req, res) {
  console.log('Create pitch request received');
  
  // Check if user is authenticated
  let userId;
  if (req.isAuthenticated() && req.user) {
    userId = req.user.id;
  } else if (req.cookies?.userId) {
    userId = parseInt(req.cookies.userId);
  }
  
  if (!userId) {
    return res.status(401).json({ message: 'You must be logged in to create a pitch' });
  }
  
  const { 
    name, description, location, category, status,
    websiteLink, companyRegistrationStatus, elevatorPitch,
    businessModel, marketOpportunity, revenue, fundingStage
  } = req.body;
  
  // Validate required fields
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }
  
  // Create new pitch
  const newPitch = {
    id: pitches.length > 0 ? Math.max(...pitches.map(p => p.id)) + 1 : 1,
    userId,
    name,
    description,
    logo: null, // Logo upload would be handled separately
    location,
    status,
    category,
    createdAt: new Date().toISOString(),
    websiteLink,
    companyRegistrationStatus,
    elevatorPitch,
    businessModel,
    marketOpportunity,
    revenue,
    fundingStage
  };
  
  pitches.push(newPitch);
  
  // Add user data for response
  const user = users.find(u => u.id === userId);
  const pitchWithUser = {
    ...newPitch,
    user: user ? {
      id: user.id,
      name: user.name,
      isVerified: user.isVerified
    } : null
  };
  
  return res.status(201).json(pitchWithUser);
}

// Update a pitch
app.put('/api/pitches/:pitchId', handleUpdatePitch);
app.put('/.netlify/functions/api/pitches/:pitchId', handleUpdatePitch);

function handleUpdatePitch(req, res) {
  const pitchId = parseInt(req.params.pitchId);
  
  // Check if user is authenticated
  let userId;
  if (req.isAuthenticated() && req.user) {
    userId = req.user.id;
  } else if (req.cookies?.userId) {
    userId = parseInt(req.cookies.userId);
  }
  
  if (!userId) {
    return res.status(401).json({ message: 'You must be logged in to update a pitch' });
  }
  
  // Find the pitch
  const pitchIndex = pitches.findIndex(p => p.id === pitchId);
  
  if (pitchIndex === -1) {
    return res.status(404).json({ message: 'Pitch not found' });
  }
  
  // Check if user owns the pitch or is an admin
  const isAdmin = users.find(u => u.id === userId && u.role === 'admin');
  if (pitches[pitchIndex].userId !== userId && !isAdmin) {
    return res.status(403).json({ message: 'You can only update your own pitches' });
  }
  
  // Update the pitch
  const updatedPitch = {
    ...pitches[pitchIndex],
    ...req.body,
    id: pitchId, // Ensure ID doesn't change
    userId: pitches[pitchIndex].userId // Ensure owner doesn't change
  };
  
  pitches[pitchIndex] = updatedPitch;
  
  // Add user data for response
  const user = users.find(u => u.id === updatedPitch.userId);
  const pitchWithUser = {
    ...updatedPitch,
    user: user ? {
      id: user.id,
      name: user.name,
      isVerified: user.isVerified
    } : null
  };
  
  return res.json(pitchWithUser);
}

// Delete a pitch
app.delete('/api/pitches/:pitchId', handleDeletePitch);
app.delete('/.netlify/functions/api/pitches/:pitchId', handleDeletePitch);

function handleDeletePitch(req, res) {
  const pitchId = parseInt(req.params.pitchId);
  
  // Check if user is authenticated
  let userId;
  if (req.isAuthenticated() && req.user) {
    userId = req.user.id;
  } else if (req.cookies?.userId) {
    userId = parseInt(req.cookies.userId);
  }
  
  if (!userId) {
    return res.status(401).json({ message: 'You must be logged in to delete a pitch' });
  }
  
  // Find the pitch
  const pitchIndex = pitches.findIndex(p => p.id === pitchId);
  
  if (pitchIndex === -1) {
    return res.status(404).json({ message: 'Pitch not found' });
  }
  
  // Check if user owns the pitch or is an admin
  const isAdmin = users.find(u => u.id === userId && u.role === 'admin');
  if (pitches[pitchIndex].userId !== userId && !isAdmin) {
    return res.status(403).json({ message: 'You can only delete your own pitches' });
  }
  
  // Delete the pitch
  const deletedPitch = pitches.splice(pitchIndex, 1)[0];
  
  return res.json({ message: 'Pitch deleted successfully', id: deletedPitch.id });
}

// 404 handler for all unhandled routes
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.path || req.url}`);
  res.status(404).json({ message: 'API endpoint not found' });
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

// Create the serverless handler using CommonJS syntax
const serverlessHandler = serverless(app, {
  binary: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'],
});

// Export the handler using CommonJS module.exports
module.exports.handler = async (event, context) => {
  console.log('Netlify function invoked with event:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers
  });
  
  try {
    // Call the serverless-http handler
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}