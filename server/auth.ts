import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Add a timeout to the password hashing function
export async function hashPassword(password: string, timeoutMs = 5000) {
  return new Promise<string>(async (resolve, reject) => {
    // Set a timeout
    const timeout = setTimeout(() => {
      console.error("Password hashing timed out, using fallback");
      // Use a simpler hash as fallback
      const crypto = require('crypto');
      const fallbackHash = crypto.createHash('sha256').update(password).digest('hex');
      resolve(`${fallbackHash}.fallback`);
    }, timeoutMs);
    
    try {
      // Use a smaller key length for better performance (32 instead of 64)
      const salt = randomBytes(8).toString("hex"); // Smaller salt
      const buf = (await scryptAsync(password, salt, 32)) as Buffer;
      clearTimeout(timeout);
      resolve(`${buf.toString("hex")}.${salt}`);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Error in password hashing:", error);
      reject(error);
    }
  });
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    
    // Handle fallback hash case
    if (salt === 'fallback') {
      const crypto = require('crypto');
      const suppliedHash = crypto.createHash('sha256').update(supplied).digest('hex');
      return hashed === suppliedHash;
    }
    
    // Handle regular scrypt hash
    const hashedBuf = Buffer.from(hashed, "hex");
    // Use the same key length as in hashPassword (32)
    const suppliedBuf = (await scryptAsync(supplied, salt, 32)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false; // Fail closed on error
  }
}

export function setupAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  // If we're in a serverless environment and session middleware is already set up, skip
  if (isVercel && app.get('session-initialized')) {
    console.log('Session already initialized, skipping...');
    return;
  }
  
  // Create memory store for serverless environments
  const sessionStore = isVercel 
    ? new (createMemoryStore(session))({
        checkPeriod: 86400000, // 24 hours
      })
    : storage.sessionStore;
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "hindustan-founders-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: false, // Set to true if using HTTPS
      sameSite: 'lax'
    }
  };

  // Mark session as initialized to prevent duplicate initialization
  app.set('session-initialized', true);
  app.set("trust proxy", 1);
  
  // Only set up session if not already set up
  if (!app.get('session-middleware-applied')) {
    app.use(session(sessionSettings));
    app.set('session-middleware-applied', true);
  }
  
  // Initialize passport if not already initialized
  if (!app.get('passport-initialized')) {
    app.use(passport.initialize());
    app.use(passport.session());
    app.set('passport-initialized', true);
  }

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    // Create a timeout for the entire registration process
    const registrationTimeout = setTimeout(() => {
      console.error("Registration timed out");
      if (!res.headersSent) {
        res.status(500).json({ 
          message: "Registration timed out. Please try again." 
        });
      }
    }, 50000); // 50 seconds timeout (just under Vercel's 60s limit)
    
    try {
      console.log("Registration attempt for username:", req.body.username);
      
      // Validate required fields first - this is fast and should be done first
      if (!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.role) {
        console.log("Missing required fields in registration data");
        clearTimeout(registrationTimeout);
        return res.status(400).json({ 
          message: "Missing required fields", 
          details: "Username, password, name, email, and role are required" 
        });
      }
      
      // Validate data against schema - also fast
      let validatedData;
      try {
        validatedData = insertUserSchema.parse(req.body);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        clearTimeout(registrationTimeout);
        return res.status(400).json({ 
          message: "Invalid registration data", 
          error: validationError 
        });
      }
      
      // Pre-hash the password before checking if username exists
      // This way we can do both operations in parallel
      let hashedPassword;
      const hashPromise = (async () => {
        try {
          hashedPassword = await hashPassword(validatedData.password);
        } catch (hashError) {
          console.error("Error hashing password:", hashError);
          // Use a simple hash as fallback
          const crypto = await import('crypto');
          hashedPassword = crypto.createHash('sha256').update(validatedData.password).digest('hex');
        }
      })();
      
      // Check if username already exists
      let existingUser;
      try {
        existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          console.log("Username already exists:", req.body.username);
          clearTimeout(registrationTimeout);
          return res.status(400).json({ message: "Username already exists" });
        }
      } catch (dbError) {
        console.error("Database error checking existing user:", dbError);
        clearTimeout(registrationTimeout);
        return res.status(500).json({ 
          message: "Error checking username availability", 
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined 
        });
      }
      
      // Wait for password hashing to complete
      await hashPromise;
      
      // Create user with pre-hashed password
      try {
        const user = await storage.createUser({
          ...validatedData,
          password: hashedPassword,
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        // Log the user in
        req.login(user, (err) => {
          clearTimeout(registrationTimeout);
          if (err) {
            console.error("Login error after registration:", err);
            return next(err);
          }
          console.log("User registered successfully:", user.id);
          res.status(201).json(userWithoutPassword);
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        clearTimeout(registrationTimeout);
        return res.status(500).json({ 
          message: "Failed to create user account", 
          error: process.env.NODE_ENV === 'development' ? createError.message : undefined 
        });
      }
    } catch (error) {
      console.error("Unexpected error in registration:", error);
      clearTimeout(registrationTimeout);
      res.status(500).json({ 
        message: "Registration failed", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
