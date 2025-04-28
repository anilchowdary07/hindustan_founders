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

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
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
    try {
      console.log("Registration attempt for username:", req.body.username);
      
      // Validate required fields first
      if (!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.role) {
        console.log("Missing required fields in registration data");
        return res.status(400).json({ 
          message: "Missing required fields", 
          details: "Username, password, name, email, and role are required" 
        });
      }
      
      try {
        // Check if username already exists
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          console.log("Username already exists:", req.body.username);
          return res.status(400).json({ message: "Username already exists" });
        }
      } catch (dbError) {
        console.error("Database error checking existing user:", dbError);
        return res.status(500).json({ 
          message: "Error checking username availability", 
          error: process.env.NODE_ENV === 'development' ? dbError.message : undefined 
        });
      }

      // Validate data against schema
      let validatedData;
      try {
        validatedData = insertUserSchema.parse(req.body);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        return res.status(400).json({ 
          message: "Invalid registration data", 
          error: validationError 
        });
      }
      
      // Hash password and create user
      try {
        const hashedPassword = await hashPassword(validatedData.password);
        const user = await storage.createUser({
          ...validatedData,
          password: hashedPassword,
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        // Log the user in
        req.login(user, (err) => {
          if (err) {
            console.error("Login error after registration:", err);
            return next(err);
          }
          console.log("User registered successfully:", user.id);
          res.status(201).json(userWithoutPassword);
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({ 
          message: "Failed to create user account", 
          error: process.env.NODE_ENV === 'development' ? createError.message : undefined 
        });
      }
    } catch (error) {
      console.error("Unexpected error in registration:", error);
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
