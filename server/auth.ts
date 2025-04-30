import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
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
    if (!password) {
      return reject(new Error("Password cannot be empty"));
    }
    
    // Set a timeout
    const timeout = setTimeout(() => {
      console.error("Password hashing timed out, using fallback");
      // Use a simpler hash as fallback
      const fallbackHash = createHash('sha256').update(password).digest('hex');
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
      
      // Use fallback instead of rejecting to prevent registration failures
      const fallbackHash = createHash('sha256').update(password).digest('hex');
      resolve(`${fallbackHash}.fallback`);
    }
  });
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check for empty inputs
    if (!supplied || !stored) {
      console.error("Empty password or hash provided to comparePasswords");
      return false;
    }
    
    // Check if stored password has the expected format
    if (!stored.includes('.')) {
      console.error("Invalid stored password format");
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    
    // Handle fallback hash case
    if (salt === 'fallback') {
      const suppliedHash = createHash('sha256').update(supplied).digest('hex');
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
  
  // Generate a random secret if one is not provided in the environment
  if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET not set in environment variables. Using a random secret (will invalidate existing sessions on restart).");
    // Use randomBytes directly from crypto which is already imported at the top
    process.env.SESSION_SECRET = randomBytes(32).toString('hex');
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: isProduction, // Set to true in production
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax' // 'none' is required for cross-site cookies in production
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
          // Use a simple hash as fallback using the crypto module already imported at the top
          const hash = createHash('sha256');
          hashedPassword = hash.update(validatedData.password).digest('hex');
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
      } catch (dbError: unknown) {
        console.error("Database error checking existing user:", dbError);
        clearTimeout(registrationTimeout);
        return res.status(500).json({ 
          message: "Error checking username availability", 
          error: process.env.NODE_ENV === 'development' ? dbError instanceof Error ? dbError.message : String(dbError) : undefined 
        });
      }
      
      // Wait for password hashing to complete
      await hashPromise;
      
      // Create user with pre-hashed password
      try {
        // Check if hashedPassword was successfully created
        if (!hashedPassword) {
          throw new Error("Password hashing failed");
        }
        
        const user = await storage.createUser({
          ...validatedData,
          password: hashedPassword,
        });

        if (!user || !user.id) {
          throw new Error("User creation returned invalid user object");
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        // Log the user in
        req.login(user, (err) => {
          clearTimeout(registrationTimeout);
          if (err) {
            console.error("Login error after registration:", err);
            // Still return success even if auto-login fails
            console.log("User registered successfully (but auto-login failed):", user.id);
            return res.status(201).json({
              ...userWithoutPassword,
              message: "Account created successfully, but you need to log in manually."
            });
          }
          console.log("User registered successfully:", user.id);
          res.status(201).json(userWithoutPassword);
        });
      } catch (createError) {
        console.error("Error creating user:", createError);
        clearTimeout(registrationTimeout);
        
        // Check for duplicate username error from database
        const errorMessage = createError instanceof Error ? createError.message : String(createError) || "";
        if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
          return res.status(409).json({ 
            message: "Username or email already exists", 
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
          });
        }
        
        return res.status(500).json({ 
          message: "Failed to create user account", 
          error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
        });
      }
    } catch (error: unknown) {
      console.error("Unexpected error in registration:", error);
      clearTimeout(registrationTimeout);
      res.status(500).json({ 
        message: "Registration failed", 
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Validate required fields
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ 
        message: "Username and password are required" 
      });
    }
    
    // Use passport authenticate with custom callback for better error handling
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: { message: string }) => {
      if (err) {
        console.error("Error during authentication:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Log the user in
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Error during login:", loginErr);
          return res.status(500).json({ message: "Login error" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    // If user is not authenticated, just return success
    if (!req.isAuthenticated()) {
      return res.status(200).json({ message: "Already logged out" });
    }
    
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      // Destroy the session to ensure complete logout
      if (req.session) {
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Error destroying session:", sessionErr);
          }
          // Clear the cookie even if session destruction fails
          res.clearCookie('connect.sid');
          return res.status(200).json({ message: "Logged out successfully" });
        });
      } else {
        res.status(200).json({ message: "Logged out successfully" });
      }
    });
  });

  app.get("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get fresh user data from database to ensure it's up-to-date
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        // This should rarely happen, but handle it just in case
        req.logout((err) => {
          if (err) console.error("Error logging out user with missing data:", err);
          return res.status(404).json({ message: "User not found" });
        });
        return;
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
}
