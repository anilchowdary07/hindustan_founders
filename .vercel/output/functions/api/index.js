var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// dist/db.js
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import dotenv from "dotenv";
var __defProp2, __export2, schema_exports, UserRole, PitchStatus, JobType, JobLocation, users, posts, pitches, experiences, jobs, insertUserSchema, insertPostSchema, insertPitchSchema, insertExperienceSchema, insertJobSchema, connectionString, poolConfig, pool, dbInitialized, initializeDb, db;
var init_db = __esm({
  "dist/db.js"() {
    "use strict";
    __defProp2 = Object.defineProperty;
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    schema_exports = {};
    __export2(schema_exports, {
      JobLocation: () => JobLocation,
      JobType: () => JobType,
      PitchStatus: () => PitchStatus,
      UserRole: () => UserRole,
      experiences: () => experiences,
      insertExperienceSchema: () => insertExperienceSchema,
      insertJobSchema: () => insertJobSchema,
      insertPitchSchema: () => insertPitchSchema,
      insertPostSchema: () => insertPostSchema,
      insertUserSchema: () => insertUserSchema,
      jobs: () => jobs,
      pitches: () => pitches,
      posts: () => posts,
      users: () => users
    });
    UserRole = {
      FOUNDER: "founder",
      STUDENT: "student",
      JOB_SEEKER: "job_seeker",
      INVESTOR: "investor",
      EXPLORER: "explorer"
    };
    PitchStatus = {
      IDEA: "idea",
      REGISTERED: "registered",
      FUNDED: "funded",
      ACQUIRED: "acquired"
    };
    JobType = {
      FULL_TIME: "full_time",
      PART_TIME: "part_time",
      CONTRACT: "contract",
      INTERNSHIP: "internship",
      FREELANCE: "freelance"
    };
    JobLocation = {
      REMOTE: "remote",
      HYBRID: "hybrid",
      ON_SITE: "on-site"
    };
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      role: text("role").$type().notNull(),
      title: text("title"),
      company: text("company"),
      location: text("location"),
      bio: text("bio"),
      isVerified: boolean("is_verified").default(false),
      avatarUrl: text("avatar_url"),
      profileCompleted: integer("profile_completed").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    posts = pgTable("posts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      content: text("content").notNull(),
      media: text("media"),
      createdAt: timestamp("created_at").defaultNow()
    });
    pitches = pgTable("pitches", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      logo: text("logo"),
      location: text("location"),
      status: text("status").$type().notNull(),
      category: text("category"),
      createdAt: timestamp("created_at").defaultNow()
    });
    experiences = pgTable("experiences", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      title: text("title").notNull(),
      company: text("company").notNull(),
      startDate: text("start_date").notNull(),
      endDate: text("end_date"),
      description: text("description"),
      current: boolean("current").default(false)
    });
    jobs = pgTable("jobs", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull(),
      title: text("title").notNull(),
      company: text("company").notNull(),
      location: text("location").notNull(),
      locationType: text("location_type").$type().notNull(),
      jobType: text("job_type").$type().notNull(),
      description: text("description").notNull(),
      responsibilities: text("responsibilities"),
      requirements: text("requirements"),
      salary: text("salary"),
      applicationLink: text("application_link"),
      logo: text("logo"),
      createdAt: timestamp("created_at").defaultNow(),
      expiresAt: timestamp("expires_at")
    });
    insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, profileCompleted: true });
    insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true });
    insertPitchSchema = createInsertSchema(pitches).omit({ id: true, createdAt: true });
    insertExperienceSchema = createInsertSchema(experiences).omit({ id: true });
    insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true });
    if (process.env.NODE_ENV !== "production") {
      dotenv.config();
    }
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not set. Please set a valid database connection string.");
      if (process.env.VERCEL !== "1") {
        process.exit(1);
      }
    }
    connectionString = process.env.DATABASE_URL;
    poolConfig = {
      connectionString,
      max: 1,
      // Minimal connections for serverless
      idleTimeoutMillis: 15e3,
      // Shorter idle timeout
      connectionTimeoutMillis: 5e3
    };
    dbInitialized = false;
    initializeDb = async () => {
      if (dbInitialized) return;
      try {
        console.log("Initializing database connection...");
        pool = new Pool(poolConfig);
        pool.on("error", (err) => {
          console.error("Unexpected error on idle client", err);
          if (process.env.VERCEL !== "1") {
            console.log("Attempting to recover from database error...");
            dbInitialized = false;
            setTimeout(() => {
              initializeDb().catch((reinitError) => {
                console.error("Failed to reinitialize database after error:", reinitError);
                process.exit(-1);
              });
            }, 5e3);
          }
        });
        if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
          try {
            const connectionTestPromise = pool.query("SELECT NOW()");
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Database connection test timed out")), 5e3);
            });
            const result = await Promise.race([connectionTestPromise, timeoutPromise]);
            console.log("Database connected successfully at:", result.rows[0].now);
          } catch (testError) {
            console.error("Database connection test failed:", testError);
            throw testError;
          }
        }
        dbInitialized = true;
      } catch (error) {
        console.error("Failed to create database pool:", error);
        pool = new Pool({
          connectionString: "postgresql://dummy:dummy@localhost:5432/dummy",
          max: 1
        });
        const originalQuery = pool.query;
        pool.query = function(...args) {
          console.warn("Using dummy database pool - returning empty result");
          return Promise.resolve({ rows: [] });
        };
        if (process.env.NODE_ENV === "development") {
          throw error;
        }
      }
    };
    initializeDb().catch((err) => {
      console.error("Database initialization failed:", err);
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// dist/auth.js
var auth_exports = {};
__export(auth_exports, {
  comparePasswords: () => comparePasswords,
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { pgTable as pgTable2, text as text2, serial as serial2, integer as integer2, boolean as boolean2, timestamp as timestamp2 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema2 } from "drizzle-zod";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { Pool as Pool2, neonConfig as neonConfig2 } from "@neondatabase/serverless";
import { drizzle as drizzle2 } from "drizzle-orm/neon-serverless";
import ws2 from "ws";
import dotenv2 from "dotenv";
import { eq, desc } from "drizzle-orm";
import createMemoryStore2 from "memorystore";
async function withTimeout(promise, timeoutMs = 5e3, fallback = null) {
  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const result = await Promise.race([
      promise.then((result2) => {
        clearTimeout(timeoutId);
        return result2;
      }),
      timeoutPromise
    ]);
    return result;
  } catch (error) {
    console.error("Operation failed or timed out:", error);
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}
async function hashPassword(password, timeoutMs = 5e3) {
  return new Promise(async (resolve, reject) => {
    if (!password) {
      return reject(new Error("Password cannot be empty"));
    }
    const timeout = setTimeout(() => {
      console.error("Password hashing timed out, using fallback");
      const fallbackHash = createHash("sha256").update(password).digest("hex");
      resolve(`${fallbackHash}.fallback`);
    }, timeoutMs);
    try {
      const salt = randomBytes(8).toString("hex");
      const buf = await scryptAsync(password, salt, 32);
      clearTimeout(timeout);
      resolve(`${buf.toString("hex")}.${salt}`);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Error in password hashing:", error);
      const fallbackHash = createHash("sha256").update(password).digest("hex");
      resolve(`${fallbackHash}.fallback`);
    }
  });
}
async function comparePasswords(supplied, stored) {
  try {
    if (!supplied || !stored) {
      console.error("Empty password or hash provided to comparePasswords");
      return false;
    }
    if (!stored.includes(".")) {
      console.error("Invalid stored password format");
      return false;
    }
    const [hashed, salt] = stored.split(".");
    if (salt === "fallback") {
      const suppliedHash = createHash("sha256").update(supplied).digest("hex");
      return hashed === suppliedHash;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 32);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAuth(app2) {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";
  if (isVercel && app2.get("session-initialized")) {
    console.log("Session already initialized, skipping...");
    return;
  }
  const sessionStore2 = isVercel ? new (createMemoryStore2(session2))({
    checkPeriod: 864e5
    // 24 hours
  }) : storage.sessionStore;
  if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET not set in environment variables. Using a random secret (will invalidate existing sessions on restart).");
    process.env.SESSION_SECRET = randomBytes(32).toString("hex");
  }
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore2,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24 * 7,
      // 1 week
      secure: isProduction,
      // Set to true in production
      sameSite: "lax"
    }
  };
  app2.set("session-initialized", true);
  app2.set("trust proxy", 1);
  if (!app2.get("session-middleware-applied")) {
    app2.use(session2(sessionSettings));
    app2.set("session-middleware-applied", true);
  }
  if (!app2.get("passport-initialized")) {
    app2.use(passport.initialize());
    app2.use(passport.session());
    app2.set("passport-initialized", true);
  }
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !await comparePasswords(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const registrationTimeout = setTimeout(() => {
      console.error("Registration timed out");
      if (!res.headersSent) {
        res.status(500).json({
          message: "Registration timed out. Please try again."
        });
      }
    }, 5e4);
    try {
      console.log("Registration attempt for username:", req.body.username);
      if (!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.role) {
        console.log("Missing required fields in registration data");
        clearTimeout(registrationTimeout);
        return res.status(400).json({
          message: "Missing required fields",
          details: "Username, password, name, email, and role are required"
        });
      }
      let validatedData;
      try {
        validatedData = insertUserSchema2.parse(req.body);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        clearTimeout(registrationTimeout);
        return res.status(400).json({
          message: "Invalid registration data",
          error: validationError
        });
      }
      let hashedPassword;
      const hashPromise = (async () => {
        try {
          hashedPassword = await hashPassword(validatedData.password);
        } catch (hashError) {
          console.error("Error hashing password:", hashError);
          const hash = createHash("sha256");
          hashedPassword = hash.update(validatedData.password).digest("hex");
        }
      })();
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
          error: process.env.NODE_ENV === "development" ? dbError.message : void 0
        });
      }
      await hashPromise;
      try {
        if (!hashedPassword) {
          throw new Error("Password hashing failed");
        }
        const user = await storage.createUser({
          ...validatedData,
          password: hashedPassword
        });
        if (!user || !user.id) {
          throw new Error("User creation returned invalid user object");
        }
        const { password, ...userWithoutPassword } = user;
        req.login(user, (err) => {
          clearTimeout(registrationTimeout);
          if (err) {
            console.error("Login error after registration:", err);
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
        const errorMessage = createError.message || "";
        if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
          return res.status(409).json({
            message: "Username or email already exists",
            error: process.env.NODE_ENV === "development" ? errorMessage : void 0
          });
        }
        return res.status(500).json({
          message: "Failed to create user account",
          error: process.env.NODE_ENV === "development" ? errorMessage : void 0
        });
      }
    } catch (error) {
      console.error("Unexpected error in registration:", error);
      clearTimeout(registrationTimeout);
      res.status(500).json({
        message: "Registration failed",
        error: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Error during authentication:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Error during login:", loginErr);
          return res.status(500).json({ message: "Login error" });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json({ message: "Already logged out" });
    }
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      if (req.session) {
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Error destroying session:", sessionErr);
          }
          res.clearCookie("connect.sid");
          return res.status(200).json({ message: "Logged out successfully" });
        });
      } else {
        res.status(200).json({ message: "Logged out successfully" });
      }
    });
  });
  app2.get("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        req.logout((err) => {
          if (err) console.error("Error logging out user with missing data:", err);
          return res.status(404).json({ message: "User not found" });
        });
        return;
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
}
var __defProp3, __export3, schema_exports2, UserRole2, PitchStatus2, JobType2, JobLocation2, users2, posts2, pitches2, experiences2, jobs2, insertUserSchema2, insertPostSchema2, insertPitchSchema2, insertExperienceSchema2, insertJobSchema2, connectionString2, poolConfig2, pool2, dbInitialized2, initializeDb2, db2, MemoryStore, PostgresSessionStore, DatabaseStorage, storage, scryptAsync;
var init_auth = __esm({
  "dist/auth.js"() {
    "use strict";
    __defProp3 = Object.defineProperty;
    __export3 = (target, all) => {
      for (var name in all)
        __defProp3(target, name, { get: all[name], enumerable: true });
    };
    schema_exports2 = {};
    __export3(schema_exports2, {
      JobLocation: () => JobLocation2,
      JobType: () => JobType2,
      PitchStatus: () => PitchStatus2,
      UserRole: () => UserRole2,
      experiences: () => experiences2,
      insertExperienceSchema: () => insertExperienceSchema2,
      insertJobSchema: () => insertJobSchema2,
      insertPitchSchema: () => insertPitchSchema2,
      insertPostSchema: () => insertPostSchema2,
      insertUserSchema: () => insertUserSchema2,
      jobs: () => jobs2,
      pitches: () => pitches2,
      posts: () => posts2,
      users: () => users2
    });
    UserRole2 = {
      FOUNDER: "founder",
      STUDENT: "student",
      JOB_SEEKER: "job_seeker",
      INVESTOR: "investor",
      EXPLORER: "explorer"
    };
    PitchStatus2 = {
      IDEA: "idea",
      REGISTERED: "registered",
      FUNDED: "funded",
      ACQUIRED: "acquired"
    };
    JobType2 = {
      FULL_TIME: "full_time",
      PART_TIME: "part_time",
      CONTRACT: "contract",
      INTERNSHIP: "internship",
      FREELANCE: "freelance"
    };
    JobLocation2 = {
      REMOTE: "remote",
      HYBRID: "hybrid",
      ON_SITE: "on-site"
    };
    users2 = pgTable2("users", {
      id: serial2("id").primaryKey(),
      username: text2("username").notNull().unique(),
      password: text2("password").notNull(),
      name: text2("name").notNull(),
      email: text2("email").notNull(),
      role: text2("role").$type().notNull(),
      title: text2("title"),
      company: text2("company"),
      location: text2("location"),
      bio: text2("bio"),
      isVerified: boolean2("is_verified").default(false),
      avatarUrl: text2("avatar_url"),
      profileCompleted: integer2("profile_completed").default(0),
      createdAt: timestamp2("created_at").defaultNow()
    });
    posts2 = pgTable2("posts", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull(),
      content: text2("content").notNull(),
      media: text2("media"),
      createdAt: timestamp2("created_at").defaultNow()
    });
    pitches2 = pgTable2("pitches", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull(),
      name: text2("name").notNull(),
      description: text2("description").notNull(),
      logo: text2("logo"),
      location: text2("location"),
      status: text2("status").$type().notNull(),
      category: text2("category"),
      createdAt: timestamp2("created_at").defaultNow()
    });
    experiences2 = pgTable2("experiences", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull(),
      title: text2("title").notNull(),
      company: text2("company").notNull(),
      startDate: text2("start_date").notNull(),
      endDate: text2("end_date"),
      description: text2("description"),
      current: boolean2("current").default(false)
    });
    jobs2 = pgTable2("jobs", {
      id: serial2("id").primaryKey(),
      userId: integer2("user_id").notNull(),
      title: text2("title").notNull(),
      company: text2("company").notNull(),
      location: text2("location").notNull(),
      locationType: text2("location_type").$type().notNull(),
      jobType: text2("job_type").$type().notNull(),
      description: text2("description").notNull(),
      responsibilities: text2("responsibilities"),
      requirements: text2("requirements"),
      salary: text2("salary"),
      applicationLink: text2("application_link"),
      logo: text2("logo"),
      createdAt: timestamp2("created_at").defaultNow(),
      expiresAt: timestamp2("expires_at")
    });
    insertUserSchema2 = createInsertSchema2(users2).omit({ id: true, createdAt: true, profileCompleted: true });
    insertPostSchema2 = createInsertSchema2(posts2).omit({ id: true, createdAt: true });
    insertPitchSchema2 = createInsertSchema2(pitches2).omit({ id: true, createdAt: true });
    insertExperienceSchema2 = createInsertSchema2(experiences2).omit({ id: true });
    insertJobSchema2 = createInsertSchema2(jobs2).omit({ id: true, createdAt: true });
    if (process.env.NODE_ENV !== "production") {
      dotenv2.config();
    }
    neonConfig2.webSocketConstructor = ws2;
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not set. Please set a valid database connection string.");
      if (process.env.VERCEL !== "1") {
        process.exit(1);
      }
    }
    connectionString2 = process.env.DATABASE_URL;
    poolConfig2 = {
      connectionString: connectionString2,
      max: 1,
      // Minimal connections for serverless
      idleTimeoutMillis: 15e3,
      // Shorter idle timeout
      connectionTimeoutMillis: 5e3
    };
    dbInitialized2 = false;
    initializeDb2 = async () => {
      if (dbInitialized2) return;
      try {
        console.log("Initializing database connection...");
        pool2 = new Pool2(poolConfig2);
        pool2.on("error", (err) => {
          console.error("Unexpected error on idle client", err);
          if (process.env.VERCEL !== "1") {
            console.log("Attempting to recover from database error...");
            dbInitialized2 = false;
            setTimeout(() => {
              initializeDb2().catch((reinitError) => {
                console.error("Failed to reinitialize database after error:", reinitError);
                process.exit(-1);
              });
            }, 5e3);
          }
        });
        if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
          try {
            const connectionTestPromise = pool2.query("SELECT NOW()");
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error("Database connection test timed out")), 5e3);
            });
            const result = await Promise.race([connectionTestPromise, timeoutPromise]);
            console.log("Database connected successfully at:", result.rows[0].now);
          } catch (testError) {
            console.error("Database connection test failed:", testError);
            throw testError;
          }
        }
        dbInitialized2 = true;
      } catch (error) {
        console.error("Failed to create database pool:", error);
        pool2 = new Pool2({
          connectionString: "postgresql://dummy:dummy@localhost:5432/dummy",
          max: 1
        });
        const originalQuery = pool2.query;
        pool2.query = function(...args) {
          console.warn("Using dummy database pool - returning empty result");
          return Promise.resolve({ rows: [] });
        };
        if (process.env.NODE_ENV === "development") {
          throw error;
        }
      }
    };
    initializeDb2().catch((err) => {
      console.error("Database initialization failed:", err);
    });
    db2 = drizzle2(pool2, { schema: schema_exports2 });
    MemoryStore = createMemoryStore(session);
    PostgresSessionStore = connectPg(session);
    DatabaseStorage = class {
      sessionStore;
      constructor() {
        this.sessionStore = new PostgresSessionStore({
          pool: pool2,
          createTableIfMissing: true
        });
      }
      // User methods
      async getUser(id) {
        try {
          if (!id || isNaN(id)) {
            console.error("Invalid user ID provided:", id);
            return void 0;
          }
          const query = db2.select().from(users2).where(eq(users2.id, id));
          const result = await withTimeout(query, 5e3, []);
          return result[0];
        } catch (error) {
          console.error(`Error getting user with ID ${id}:`, error);
          return void 0;
        }
      }
      async getUserByUsername(username) {
        try {
          if (!username) {
            console.error("getUserByUsername called with empty username");
            return void 0;
          }
          const query = db2.select().from(users2).where(eq(users2.username, username));
          const result = await withTimeout(query, 5e3, []);
          return result[0];
        } catch (error) {
          console.error(`Error getting user by username "${username}":`, error);
          return void 0;
        }
      }
      async getUsers() {
        try {
          const query = db2.select().from(users2);
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error("Error getting all users:", error);
          return [];
        }
      }
      async createUser(insertUser) {
        try {
          if (!insertUser.username || !insertUser.password || !insertUser.name || !insertUser.email || !insertUser.role) {
            throw new Error("Missing required user fields");
          }
          console.log("Creating user with username:", insertUser.username);
          const existingUser = await this.getUserByUsername(insertUser.username);
          if (existingUser) {
            throw new Error(`Username '${insertUser.username}' already exists`);
          }
          if (!insertUser.password.includes(".")) {
            console.warn("Warning: Password does not appear to be hashed. This might be a security issue.");
          }
          const insertQuery = db2.insert(users2).values({
            ...insertUser,
            profileCompleted: 20,
            isVerified: false
          }).returning();
          const result = await withTimeout(insertQuery, 1e4);
          const user = result[0];
          if (!user) {
            throw new Error("User creation failed - no user returned");
          }
          console.log("User created successfully with ID:", user.id);
          return user;
        } catch (error) {
          console.error("Error creating user:", error);
          const errorMessage = error.message || "";
          if (errorMessage.includes("duplicate") || errorMessage.includes("unique constraint")) {
            if (errorMessage.includes("username")) {
              throw new Error("Username already exists");
            } else if (errorMessage.includes("email")) {
              throw new Error("Email already exists");
            } else {
              throw new Error("A user with these details already exists");
            }
          }
          throw error;
        }
      }
      async updateUser(id, userData) {
        try {
          const [updatedUser] = await withTimeout(
            db2.update(users2).set(userData).where(eq(users2.id, id)).returning(),
            5e3
          );
          return updatedUser;
        } catch (error) {
          console.error(`Error updating user with ID ${id}:`, error);
          throw error;
        }
      }
      // Post methods
      async createPost(insertPost) {
        try {
          const [post] = await db2.insert(posts2).values(insertPost).returning();
          const [user] = await db2.select({
            id: users2.id,
            name: users2.name,
            username: users2.username,
            role: users2.role,
            company: users2.company,
            title: users2.title,
            avatarUrl: users2.avatarUrl,
            isVerified: users2.isVerified
          }).from(users2).where(eq(users2.id, insertPost.userId));
          return {
            ...post,
            user
          };
        } catch (error) {
          console.error("Error creating post:", error);
          throw error;
        }
      }
      async getPosts() {
        try {
          const query = db2.select({
            post: posts2,
            user: {
              id: users2.id,
              name: users2.name,
              username: users2.username,
              role: users2.role,
              company: users2.company,
              title: users2.title,
              avatarUrl: users2.avatarUrl,
              isVerified: users2.isVerified
            }
          }).from(posts2).leftJoin(users2, eq(posts2.userId, users2.id)).orderBy(desc(posts2.createdAt)).limit(20);
          const result = await withTimeout(query, 5e3, []);
          return result.map((item) => ({
            ...item.post,
            user: item.user
          }));
        } catch (error) {
          console.error("Error fetching posts:", error);
          return [];
        }
      }
      async getPostsByUserId(userId) {
        try {
          const query = db2.select({
            post: posts2,
            user: {
              id: users2.id,
              name: users2.name,
              username: users2.username,
              role: users2.role,
              company: users2.company,
              title: users2.title,
              avatarUrl: users2.avatarUrl,
              isVerified: users2.isVerified
            }
          }).from(posts2).leftJoin(users2, eq(posts2.userId, users2.id)).where(eq(posts2.userId, userId)).orderBy(desc(posts2.createdAt)).limit(20);
          const result = await withTimeout(query, 5e3, []);
          return result.map((item) => ({
            ...item.post,
            user: item.user
          }));
        } catch (error) {
          console.error(`Error fetching posts for user ${userId}:`, error);
          return [];
        }
      }
      // Pitch methods
      async createPitch(insertPitch) {
        try {
          if (!insertPitch.userId || !insertPitch.name || !insertPitch.description || !insertPitch.status) {
            throw new Error("Missing required pitch fields");
          }
          const [pitch] = await withTimeout(
            db2.insert(pitches2).values(insertPitch).returning(),
            5e3
          );
          if (!pitch) {
            throw new Error("Pitch creation failed - no pitch returned");
          }
          return pitch;
        } catch (error) {
          console.error("Error creating pitch:", error);
          throw error;
        }
      }
      async getPitches() {
        try {
          const query = db2.select().from(pitches2).orderBy(desc(pitches2.createdAt)).limit(20);
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error("Error fetching pitches:", error);
          return [];
        }
      }
      async getPitchesByUserId(userId) {
        try {
          const query = db2.select().from(pitches2).where(eq(pitches2.userId, userId)).orderBy(desc(pitches2.createdAt)).limit(20);
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error(`Error fetching pitches for user ${userId}:`, error);
          return [];
        }
      }
      async getPitchesByStatus(status) {
        try {
          const query = db2.select().from(pitches2).where(eq(pitches2.status, status)).orderBy(desc(pitches2.createdAt)).limit(20);
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error(`Error fetching pitches with status ${status}:`, error);
          return [];
        }
      }
      // Experience methods
      async createExperience(insertExperience) {
        try {
          if (!insertExperience.userId || !insertExperience.title || !insertExperience.company || !insertExperience.startDate) {
            throw new Error("Missing required experience fields");
          }
          const [experience] = await withTimeout(
            db2.insert(experiences2).values(insertExperience).returning(),
            5e3
          );
          if (!experience) {
            throw new Error("Experience creation failed - no experience returned");
          }
          return experience;
        } catch (error) {
          console.error("Error creating experience:", error);
          throw error;
        }
      }
      async getExperiencesByUserId(userId) {
        try {
          const query = db2.select().from(experiences2).where(eq(experiences2.userId, userId)).orderBy(desc(experiences2.current));
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error(`Error fetching experiences for user ${userId}:`, error);
          return [];
        }
      }
      // Job methods
      async createJob(insertJob) {
        try {
          if (!insertJob.userId || !insertJob.title || !insertJob.company || !insertJob.location || !insertJob.locationType || !insertJob.jobType || !insertJob.description) {
            throw new Error("Missing required job fields");
          }
          const [job] = await withTimeout(
            db2.insert(jobs2).values(insertJob).returning(),
            5e3
          );
          if (!job) {
            throw new Error("Job creation failed - no job returned");
          }
          return job;
        } catch (error) {
          console.error("Error creating job:", error);
          throw error;
        }
      }
      async getJobs() {
        try {
          const query = db2.select().from(jobs2).orderBy(desc(jobs2.createdAt));
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error("Error fetching jobs:", error);
          return [];
        }
      }
      async getJobsByUserId(userId) {
        try {
          const query = db2.select().from(jobs2).where(eq(jobs2.userId, userId)).orderBy(desc(jobs2.createdAt));
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error(`Error fetching jobs for user ${userId}:`, error);
          return [];
        }
      }
      async getJobsByType(jobType) {
        try {
          const query = db2.select().from(jobs2).where(eq(jobs2.jobType, jobType)).orderBy(desc(jobs2.createdAt));
          return await withTimeout(query, 5e3, []);
        } catch (error) {
          console.error(`Error fetching jobs of type ${jobType}:`, error);
          return [];
        }
      }
      async getJobById(id) {
        try {
          const query = db2.select().from(jobs2).where(eq(jobs2.id, id));
          const [job] = await withTimeout(query, 5e3, []);
          return job;
        } catch (error) {
          console.error(`Error fetching job with ID ${id}:`, error);
          return void 0;
        }
      }
    };
    storage = new DatabaseStorage();
    scryptAsync = promisify(scrypt);
  }
});

// dist/serverless-routes.js
var serverless_routes_exports = {};
__export(serverless_routes_exports, {
  default: () => setupRoutes
});
import { pgTable as pgTable3, text as text3, serial as serial3, integer as integer3, boolean as boolean3, timestamp as timestamp3 } from "drizzle-orm/pg-core";
import { createInsertSchema as createInsertSchema3 } from "drizzle-zod";
import { Pool as Pool3, neonConfig as neonConfig3 } from "@neondatabase/serverless";
import { drizzle as drizzle3 } from "drizzle-orm/neon-serverless";
import ws3 from "ws";
import dotenv3 from "dotenv";
import session3 from "express-session";
import createMemoryStore3 from "memorystore";
import connectPg2 from "connect-pg-simple";
import { eq as eq2, desc as desc2 } from "drizzle-orm";
import passport2 from "passport";
import { Strategy as LocalStrategy2 } from "passport-local";
import session22 from "express-session";
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual as timingSafeEqual2, createHash as createHash2 } from "crypto";
import { promisify as promisify2 } from "util";
import createMemoryStore22 from "memorystore";
import multer from "multer";
async function withTimeout2(promise, timeoutMs = 5e3, fallback = null) {
  let timeoutId;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    const result = await Promise.race([
      promise.then((result2) => {
        clearTimeout(timeoutId);
        return result2;
      }),
      timeoutPromise
    ]);
    return result;
  } catch (error) {
    console.error("Operation failed or timed out:", error);
    if (fallback !== null) {
      return fallback;
    }
    throw error;
  }
}
async function hashPassword2(password, timeoutMs = 5e3) {
  return new Promise(async (resolve, reject) => {
    if (!password) {
      return reject(new Error("Password cannot be empty"));
    }
    const timeout = setTimeout(() => {
      console.error("Password hashing timed out, using fallback");
      const fallbackHash = createHash2("sha256").update(password).digest("hex");
      resolve(`${fallbackHash}.fallback`);
    }, timeoutMs);
    try {
      const salt = randomBytes2(8).toString("hex");
      const buf = await scryptAsync2(password, salt, 32);
      clearTimeout(timeout);
      resolve(`${buf.toString("hex")}.${salt}`);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Error in password hashing:", error);
      const fallbackHash = createHash2("sha256").update(password).digest("hex");
      resolve(`${fallbackHash}.fallback`);
    }
  });
}
async function comparePasswords2(supplied, stored) {
  try {
    if (!supplied || !stored) {
      console.error("Empty password or hash provided to comparePasswords");
      return false;
    }
    if (!stored.includes(".")) {
      console.error("Invalid stored password format");
      return false;
    }
    const [hashed, salt] = stored.split(".");
    if (salt === "fallback") {
      const suppliedHash = createHash2("sha256").update(supplied).digest("hex");
      return hashed === suppliedHash;
    }
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync2(supplied, salt, 32);
    return timingSafeEqual2(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAuth2(app2) {
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";
  if (isVercel && app2.get("session-initialized")) {
    console.log("Session already initialized, skipping...");
    return;
  }
  const sessionStore2 = isVercel ? new (createMemoryStore22(session22))({
    checkPeriod: 864e5
    // 24 hours
  }) : storage2.sessionStore;
  if (!process.env.SESSION_SECRET) {
    console.warn("SESSION_SECRET not set in environment variables. Using a random secret (will invalidate existing sessions on restart).");
    process.env.SESSION_SECRET = randomBytes2(32).toString("hex");
  }
  const sessionSettings = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore2,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24 * 7,
      // 1 week
      secure: isProduction,
      // Set to true in production
      sameSite: "lax"
    }
  };
  app2.set("session-initialized", true);
  app2.set("trust proxy", 1);
  if (!app2.get("session-middleware-applied")) {
    app2.use(session22(sessionSettings));
    app2.set("session-middleware-applied", true);
  }
  if (!app2.get("passport-initialized")) {
    app2.use(passport2.initialize());
    app2.use(passport2.session());
    app2.set("passport-initialized", true);
  }
  passport2.use(
    new LocalStrategy2(async (username, password, done) => {
      const user = await storage2.getUserByUsername(username);
      if (!user || !await comparePasswords2(password, user.password)) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
  passport2.serializeUser((user, done) => done(null, user.id));
  passport2.deserializeUser(async (id, done) => {
    const user = await storage2.getUser(id);
    done(null, user);
  });
  app2.post("/api/register", async (req, res, next) => {
    const registrationTimeout = setTimeout(() => {
      console.error("Registration timed out");
      if (!res.headersSent) {
        res.status(500).json({
          message: "Registration timed out. Please try again."
        });
      }
    }, 5e4);
    try {
      console.log("Registration attempt for username:", req.body.username);
      if (!req.body.username || !req.body.password || !req.body.name || !req.body.email || !req.body.role) {
        console.log("Missing required fields in registration data");
        clearTimeout(registrationTimeout);
        return res.status(400).json({
          message: "Missing required fields",
          details: "Username, password, name, email, and role are required"
        });
      }
      let validatedData;
      try {
        validatedData = insertUserSchema3.parse(req.body);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        clearTimeout(registrationTimeout);
        return res.status(400).json({
          message: "Invalid registration data",
          error: validationError
        });
      }
      let hashedPassword;
      const hashPromise = (async () => {
        try {
          hashedPassword = await hashPassword2(validatedData.password);
        } catch (hashError) {
          console.error("Error hashing password:", hashError);
          const hash = createHash2("sha256");
          hashedPassword = hash.update(validatedData.password).digest("hex");
        }
      })();
      let existingUser;
      try {
        existingUser = await storage2.getUserByUsername(req.body.username);
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
          error: process.env.NODE_ENV === "development" ? dbError.message : void 0
        });
      }
      await hashPromise;
      try {
        if (!hashedPassword) {
          throw new Error("Password hashing failed");
        }
        const user = await storage2.createUser({
          ...validatedData,
          password: hashedPassword
        });
        if (!user || !user.id) {
          throw new Error("User creation returned invalid user object");
        }
        const { password, ...userWithoutPassword } = user;
        req.login(user, (err) => {
          clearTimeout(registrationTimeout);
          if (err) {
            console.error("Login error after registration:", err);
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
        const errorMessage = createError.message || "";
        if (errorMessage.includes("duplicate") || errorMessage.includes("unique")) {
          return res.status(409).json({
            message: "Username or email already exists",
            error: process.env.NODE_ENV === "development" ? errorMessage : void 0
          });
        }
        return res.status(500).json({
          message: "Failed to create user account",
          error: process.env.NODE_ENV === "development" ? errorMessage : void 0
        });
      }
    } catch (error) {
      console.error("Unexpected error in registration:", error);
      clearTimeout(registrationTimeout);
      res.status(500).json({
        message: "Registration failed",
        error: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app2.post("/api/login", (req, res, next) => {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }
    passport2.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Error during authentication:", err);
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Error during login:", loginErr);
          return res.status(500).json({ message: "Login error" });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(200).json({ message: "Already logged out" });
    }
    req.logout((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      if (req.session) {
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Error destroying session:", sessionErr);
          }
          res.clearCookie("connect.sid");
          return res.status(200).json({ message: "Logged out successfully" });
        });
      } else {
        res.status(200).json({ message: "Logged out successfully" });
      }
    });
  });
  app2.get("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage2.getUser(req.user.id);
      if (!user) {
        req.logout((err) => {
          if (err) console.error("Error logging out user with missing data:", err);
          return res.status(404).json({ message: "User not found" });
        });
        return;
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching current user:", error);
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
}
function setupRoutes(app2) {
  app2.use((req, res, next) => {
    const allowedOrigins = ["http://localhost:3000", "http://localhost:5000", process.env.FRONTEND_URL].filter(Boolean);
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    } else if (process.env.NODE_ENV !== "production") {
      res.header("Access-Control-Allow-Origin", "*");
    }
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", environment: process.env.NODE_ENV });
  });
  app2.post("/api/posts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertPostSchema3.parse({
        ...req.body,
        userId: req.user.id
      });
      const post = await storage2.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Invalid post data", error });
    }
  });
  app2.post("/api/posts/with-image", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }
      try {
        const file = req.file;
        if (!file) {
          return res.status(400).json({ message: "No image file provided" });
        }
        const mediaPath = `/uploads/placeholder-${Date.now()}.jpg`;
        const validatedData = insertPostSchema3.parse({
          content: req.body.content,
          userId: req.user.id,
          media: mediaPath
        });
        const post = await storage2.createPost(validatedData);
        res.status(201).json(post);
      } catch (error) {
        console.error("Error creating post with image:", error);
        res.status(400).json({ message: "Invalid post data", error });
      }
    });
  });
  app2.get("/api/posts", async (req, res) => {
    try {
      const posts22 = await storage2.getPosts();
      res.json(posts22);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts", error });
    }
  });
  app2.get("/api/users/:userId/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const posts22 = await storage2.getPostsByUserId(userId);
      res.json(posts22);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Failed to fetch user posts", error });
    }
  });
  app2.post("/api/pitches", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertPitchSchema3.parse({
        ...req.body,
        userId: req.user.id
      });
      const pitch = await storage2.createPitch(validatedData);
      res.status(201).json(pitch);
    } catch (error) {
      console.error("Error creating pitch:", error);
      res.status(400).json({ message: "Invalid pitch data", error });
    }
  });
  app2.get("/api/pitches", async (req, res) => {
    try {
      const status = req.query.status;
      let pitches22;
      if (status) {
        pitches22 = await storage2.getPitchesByStatus(status);
      } else {
        pitches22 = await storage2.getPitches();
      }
      const enrichedPitches = await Promise.all(
        pitches22.map(async (pitch) => {
          const user = await storage2.getUser(pitch.userId);
          return {
            ...pitch,
            user: user ? {
              id: user.id,
              name: user.name,
              role: user.role,
              company: user.company,
              isVerified: user.isVerified
            } : null
          };
        })
      );
      res.json(enrichedPitches);
    } catch (error) {
      console.error("Error fetching pitches:", error);
      res.status(500).json({ message: "Failed to fetch pitches", error });
    }
  });
  app2.get("/api/users/:userId/pitches", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pitches22 = await storage2.getPitchesByUserId(userId);
      res.json(pitches22);
    } catch (error) {
      console.error("Error fetching user pitches:", error);
      res.status(500).json({ message: "Failed to fetch user pitches", error });
    }
  });
  app2.post("/api/experiences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertExperienceSchema3.parse({
        ...req.body,
        userId: req.user.id
      });
      const experience = await storage2.createExperience(validatedData);
      res.status(201).json(experience);
    } catch (error) {
      console.error("Error creating experience:", error);
      res.status(400).json({ message: "Invalid experience data", error });
    }
  });
  app2.get("/api/users/:userId/experiences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const experiences22 = await storage2.getExperiencesByUserId(userId);
      res.json(experiences22);
    } catch (error) {
      console.error("Error fetching user experiences:", error);
      res.status(500).json({ message: "Failed to fetch user experiences", error });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const users22 = await storage2.getUsers();
      const sanitizedUsers = users22.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        title: user.title,
        company: user.company,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });
  app2.get("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage2.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const sanitizedUser = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        title: user.title,
        company: user.company,
        location: user.location,
        bio: user.bio,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      };
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });
  app2.patch("/api/users/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = parseInt(req.params.userId);
      const updatedUser = await storage2.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Invalid user data", error });
    }
  });
  app2.post("/api/users/:userId/avatar", (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      upload.single("avatar")(req, res, async (err) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              message: "File too large",
              error: "The uploaded file exceeds the 10MB size limit."
            });
          }
          return res.status(400).json({ message: "File upload failed", error: err.message });
        }
        try {
          const file = req.file;
          if (!file) {
            return res.status(400).json({ message: "No image file provided" });
          }
          const avatarUrl = `/uploads/avatar-${req.user.id}-${Date.now()}.jpg`;
          const userId = parseInt(req.params.userId);
          const updatedUser = await storage2.updateUser(userId, { avatarUrl });
          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }
          res.status(200).json({
            message: "Avatar uploaded successfully",
            user: updatedUser
          });
        } catch (error) {
          console.error("Error processing avatar upload:", error);
          res.status(500).json({ message: "Failed to process avatar upload", error });
        }
      });
    } catch (error) {
      console.error("Error in avatar upload route:", error);
      res.status(500).json({ message: "Avatar upload failed", error });
    }
  });
  app2.get("/api/connections", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json([]);
  });
  app2.get("/api/connections/requests", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json([]);
  });
  app2.post("/api/change-password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      const user = await storage2.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { comparePasswords: comparePasswords22, hashPassword: hashPassword22 } = await Promise.resolve().then(() => (init_auth2(), auth_exports2));
      const isPasswordValid = await comparePasswords22(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashedPassword = await hashPassword22(newPassword);
      const updatedUser = await storage2.updateUser(req.user.id, {
        password: hashedPassword
      });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password", error });
    }
  });
  app2.patch("/api/users/:userId/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.id !== parseInt(req.params.userId)) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = parseInt(req.params.userId);
      res.json({ message: "Notification settings updated successfully" });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings", error });
    }
  });
  app2.post("/api/jobs", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const validatedData = insertJobSchema3.parse({
        ...req.body,
        userId: req.user.id
      });
      const job = await storage2.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: "Invalid job data", error });
    }
  });
  app2.get("/api/jobs", async (req, res) => {
    try {
      const jobType = req.query.type;
      let jobs22;
      if (jobType) {
        jobs22 = await storage2.getJobsByType(jobType);
      } else {
        jobs22 = await storage2.getJobs();
      }
      const enrichedJobs = await Promise.all(
        jobs22.map(async (job) => {
          const user = await storage2.getUser(job.userId);
          return {
            ...job,
            user: user ? {
              id: user.id,
              name: user.name,
              company: user.company,
              isVerified: user.isVerified
            } : null
          };
        })
      );
      res.json(enrichedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs", error });
    }
  });
  app2.get("/api/jobs/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage2.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      const user = await storage2.getUser(job.userId);
      const enrichedJob = {
        ...job,
        user: user ? {
          id: user.id,
          name: user.name,
          company: user.company,
          isVerified: user.isVerified
        } : null
      };
      res.json(enrichedJob);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job", error });
    }
  });
  app2.get("/api/users/:userId/jobs", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const jobs22 = await storage2.getJobsByUserId(userId);
      res.json(jobs22);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      res.status(500).json({ message: "Failed to fetch user jobs", error });
    }
  });
  return app2;
}
var __defProp4, __getOwnPropNames2, __esm2, __export4, schema_exports3, UserRole3, PitchStatus3, JobType3, JobLocation3, users3, posts3, pitches3, experiences3, jobs3, insertUserSchema3, insertPostSchema3, insertPitchSchema3, insertExperienceSchema3, insertJobSchema3, init_schema, connectionString3, poolConfig3, pool3, dbInitialized3, initializeDb3, db3, init_db2, MemoryStore2, PostgresSessionStore2, DatabaseStorage2, storage2, init_storage, auth_exports2, scryptAsync2, init_auth2, upload;
var init_serverless_routes = __esm({
  "dist/serverless-routes.js"() {
    "use strict";
    __defProp4 = Object.defineProperty;
    __getOwnPropNames2 = Object.getOwnPropertyNames;
    __esm2 = (fn, res) => function __init() {
      return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
    };
    __export4 = (target, all) => {
      for (var name in all)
        __defProp4(target, name, { get: all[name], enumerable: true });
    };
    schema_exports3 = {};
    __export4(schema_exports3, {
      JobLocation: () => JobLocation3,
      JobType: () => JobType3,
      PitchStatus: () => PitchStatus3,
      UserRole: () => UserRole3,
      experiences: () => experiences3,
      insertExperienceSchema: () => insertExperienceSchema3,
      insertJobSchema: () => insertJobSchema3,
      insertPitchSchema: () => insertPitchSchema3,
      insertPostSchema: () => insertPostSchema3,
      insertUserSchema: () => insertUserSchema3,
      jobs: () => jobs3,
      pitches: () => pitches3,
      posts: () => posts3,
      users: () => users3
    });
    init_schema = __esm2({
      "shared/schema.ts"() {
        "use strict";
        UserRole3 = {
          FOUNDER: "founder",
          STUDENT: "student",
          JOB_SEEKER: "job_seeker",
          INVESTOR: "investor",
          EXPLORER: "explorer"
        };
        PitchStatus3 = {
          IDEA: "idea",
          REGISTERED: "registered",
          FUNDED: "funded",
          ACQUIRED: "acquired"
        };
        JobType3 = {
          FULL_TIME: "full_time",
          PART_TIME: "part_time",
          CONTRACT: "contract",
          INTERNSHIP: "internship",
          FREELANCE: "freelance"
        };
        JobLocation3 = {
          REMOTE: "remote",
          HYBRID: "hybrid",
          ON_SITE: "on-site"
        };
        users3 = pgTable3("users", {
          id: serial3("id").primaryKey(),
          username: text3("username").notNull().unique(),
          password: text3("password").notNull(),
          name: text3("name").notNull(),
          email: text3("email").notNull(),
          role: text3("role").$type().notNull(),
          title: text3("title"),
          company: text3("company"),
          location: text3("location"),
          bio: text3("bio"),
          isVerified: boolean3("is_verified").default(false),
          avatarUrl: text3("avatar_url"),
          profileCompleted: integer3("profile_completed").default(0),
          createdAt: timestamp3("created_at").defaultNow()
        });
        posts3 = pgTable3("posts", {
          id: serial3("id").primaryKey(),
          userId: integer3("user_id").notNull(),
          content: text3("content").notNull(),
          media: text3("media"),
          createdAt: timestamp3("created_at").defaultNow()
        });
        pitches3 = pgTable3("pitches", {
          id: serial3("id").primaryKey(),
          userId: integer3("user_id").notNull(),
          name: text3("name").notNull(),
          description: text3("description").notNull(),
          logo: text3("logo"),
          location: text3("location"),
          status: text3("status").$type().notNull(),
          category: text3("category"),
          createdAt: timestamp3("created_at").defaultNow()
        });
        experiences3 = pgTable3("experiences", {
          id: serial3("id").primaryKey(),
          userId: integer3("user_id").notNull(),
          title: text3("title").notNull(),
          company: text3("company").notNull(),
          startDate: text3("start_date").notNull(),
          endDate: text3("end_date"),
          description: text3("description"),
          current: boolean3("current").default(false)
        });
        jobs3 = pgTable3("jobs", {
          id: serial3("id").primaryKey(),
          userId: integer3("user_id").notNull(),
          title: text3("title").notNull(),
          company: text3("company").notNull(),
          location: text3("location").notNull(),
          locationType: text3("location_type").$type().notNull(),
          jobType: text3("job_type").$type().notNull(),
          description: text3("description").notNull(),
          responsibilities: text3("responsibilities"),
          requirements: text3("requirements"),
          salary: text3("salary"),
          applicationLink: text3("application_link"),
          logo: text3("logo"),
          createdAt: timestamp3("created_at").defaultNow(),
          expiresAt: timestamp3("expires_at")
        });
        insertUserSchema3 = createInsertSchema3(users3).omit({ id: true, createdAt: true, profileCompleted: true });
        insertPostSchema3 = createInsertSchema3(posts3).omit({ id: true, createdAt: true });
        insertPitchSchema3 = createInsertSchema3(pitches3).omit({ id: true, createdAt: true });
        insertExperienceSchema3 = createInsertSchema3(experiences3).omit({ id: true });
        insertJobSchema3 = createInsertSchema3(jobs3).omit({ id: true, createdAt: true });
      }
    });
    init_db2 = __esm2({
      "server/db.ts"() {
        "use strict";
        init_schema();
        if (process.env.NODE_ENV !== "production") {
          dotenv3.config();
        }
        neonConfig3.webSocketConstructor = ws3;
        if (!process.env.DATABASE_URL) {
          console.error("DATABASE_URL not set. Please set a valid database connection string.");
          if (process.env.VERCEL !== "1") {
            process.exit(1);
          }
        }
        connectionString3 = process.env.DATABASE_URL;
        poolConfig3 = {
          connectionString: connectionString3,
          max: 1,
          // Minimal connections for serverless
          idleTimeoutMillis: 15e3,
          // Shorter idle timeout
          connectionTimeoutMillis: 5e3
        };
        dbInitialized3 = false;
        initializeDb3 = async () => {
          if (dbInitialized3) return;
          try {
            console.log("Initializing database connection...");
            pool3 = new Pool3(poolConfig3);
            pool3.on("error", (err) => {
              console.error("Unexpected error on idle client", err);
              if (process.env.VERCEL !== "1") {
                console.log("Attempting to recover from database error...");
                dbInitialized3 = false;
                setTimeout(() => {
                  initializeDb3().catch((reinitError) => {
                    console.error("Failed to reinitialize database after error:", reinitError);
                    process.exit(-1);
                  });
                }, 5e3);
              }
            });
            if (process.env.NODE_ENV === "development" && process.env.VERCEL !== "1") {
              try {
                const connectionTestPromise = pool3.query("SELECT NOW()");
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => reject(new Error("Database connection test timed out")), 5e3);
                });
                const result = await Promise.race([connectionTestPromise, timeoutPromise]);
                console.log("Database connected successfully at:", result.rows[0].now);
              } catch (testError) {
                console.error("Database connection test failed:", testError);
                throw testError;
              }
            }
            dbInitialized3 = true;
          } catch (error) {
            console.error("Failed to create database pool:", error);
            pool3 = new Pool3({
              connectionString: "postgresql://dummy:dummy@localhost:5432/dummy",
              max: 1
            });
            const originalQuery = pool3.query;
            pool3.query = function(...args) {
              console.warn("Using dummy database pool - returning empty result");
              return Promise.resolve({ rows: [] });
            };
            if (process.env.NODE_ENV === "development") {
              throw error;
            }
          }
        };
        initializeDb3().catch((err) => {
          console.error("Database initialization failed:", err);
        });
        db3 = drizzle3(pool3, { schema: schema_exports3 });
      }
    });
    init_storage = __esm2({
      "server/storage.ts"() {
        "use strict";
        init_schema();
        init_db2();
        MemoryStore2 = createMemoryStore3(session3);
        PostgresSessionStore2 = connectPg2(session3);
        DatabaseStorage2 = class {
          sessionStore;
          constructor() {
            this.sessionStore = new PostgresSessionStore2({
              pool: pool3,
              createTableIfMissing: true
            });
          }
          // User methods
          async getUser(id) {
            try {
              if (!id || isNaN(id)) {
                console.error("Invalid user ID provided:", id);
                return void 0;
              }
              const query = db3.select().from(users3).where(eq2(users3.id, id));
              const result = await withTimeout2(query, 5e3, []);
              return result[0];
            } catch (error) {
              console.error(`Error getting user with ID ${id}:`, error);
              return void 0;
            }
          }
          async getUserByUsername(username) {
            try {
              if (!username) {
                console.error("getUserByUsername called with empty username");
                return void 0;
              }
              const query = db3.select().from(users3).where(eq2(users3.username, username));
              const result = await withTimeout2(query, 5e3, []);
              return result[0];
            } catch (error) {
              console.error(`Error getting user by username "${username}":`, error);
              return void 0;
            }
          }
          async getUsers() {
            try {
              const query = db3.select().from(users3);
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error("Error getting all users:", error);
              return [];
            }
          }
          async createUser(insertUser) {
            try {
              if (!insertUser.username || !insertUser.password || !insertUser.name || !insertUser.email || !insertUser.role) {
                throw new Error("Missing required user fields");
              }
              console.log("Creating user with username:", insertUser.username);
              const existingUser = await this.getUserByUsername(insertUser.username);
              if (existingUser) {
                throw new Error(`Username '${insertUser.username}' already exists`);
              }
              if (!insertUser.password.includes(".")) {
                console.warn("Warning: Password does not appear to be hashed. This might be a security issue.");
              }
              const insertQuery = db3.insert(users3).values({
                ...insertUser,
                profileCompleted: 20,
                isVerified: false
              }).returning();
              const result = await withTimeout2(insertQuery, 1e4);
              const user = result[0];
              if (!user) {
                throw new Error("User creation failed - no user returned");
              }
              console.log("User created successfully with ID:", user.id);
              return user;
            } catch (error) {
              console.error("Error creating user:", error);
              const errorMessage = error.message || "";
              if (errorMessage.includes("duplicate") || errorMessage.includes("unique constraint")) {
                if (errorMessage.includes("username")) {
                  throw new Error("Username already exists");
                } else if (errorMessage.includes("email")) {
                  throw new Error("Email already exists");
                } else {
                  throw new Error("A user with these details already exists");
                }
              }
              throw error;
            }
          }
          async updateUser(id, userData) {
            try {
              const [updatedUser] = await withTimeout2(
                db3.update(users3).set(userData).where(eq2(users3.id, id)).returning(),
                5e3
              );
              return updatedUser;
            } catch (error) {
              console.error(`Error updating user with ID ${id}:`, error);
              throw error;
            }
          }
          // Post methods
          async createPost(insertPost) {
            try {
              const [post] = await db3.insert(posts3).values(insertPost).returning();
              const [user] = await db3.select({
                id: users3.id,
                name: users3.name,
                username: users3.username,
                role: users3.role,
                company: users3.company,
                title: users3.title,
                avatarUrl: users3.avatarUrl,
                isVerified: users3.isVerified
              }).from(users3).where(eq2(users3.id, insertPost.userId));
              return {
                ...post,
                user
              };
            } catch (error) {
              console.error("Error creating post:", error);
              throw error;
            }
          }
          async getPosts() {
            try {
              const query = db3.select({
                post: posts3,
                user: {
                  id: users3.id,
                  name: users3.name,
                  username: users3.username,
                  role: users3.role,
                  company: users3.company,
                  title: users3.title,
                  avatarUrl: users3.avatarUrl,
                  isVerified: users3.isVerified
                }
              }).from(posts3).leftJoin(users3, eq2(posts3.userId, users3.id)).orderBy(desc2(posts3.createdAt)).limit(20);
              const result = await withTimeout2(query, 5e3, []);
              return result.map((item) => ({
                ...item.post,
                user: item.user
              }));
            } catch (error) {
              console.error("Error fetching posts:", error);
              return [];
            }
          }
          async getPostsByUserId(userId) {
            try {
              const query = db3.select({
                post: posts3,
                user: {
                  id: users3.id,
                  name: users3.name,
                  username: users3.username,
                  role: users3.role,
                  company: users3.company,
                  title: users3.title,
                  avatarUrl: users3.avatarUrl,
                  isVerified: users3.isVerified
                }
              }).from(posts3).leftJoin(users3, eq2(posts3.userId, users3.id)).where(eq2(posts3.userId, userId)).orderBy(desc2(posts3.createdAt)).limit(20);
              const result = await withTimeout2(query, 5e3, []);
              return result.map((item) => ({
                ...item.post,
                user: item.user
              }));
            } catch (error) {
              console.error(`Error fetching posts for user ${userId}:`, error);
              return [];
            }
          }
          // Pitch methods
          async createPitch(insertPitch) {
            try {
              if (!insertPitch.userId || !insertPitch.name || !insertPitch.description || !insertPitch.status) {
                throw new Error("Missing required pitch fields");
              }
              const [pitch] = await withTimeout2(
                db3.insert(pitches3).values(insertPitch).returning(),
                5e3
              );
              if (!pitch) {
                throw new Error("Pitch creation failed - no pitch returned");
              }
              return pitch;
            } catch (error) {
              console.error("Error creating pitch:", error);
              throw error;
            }
          }
          async getPitches() {
            try {
              const query = db3.select().from(pitches3).orderBy(desc2(pitches3.createdAt)).limit(20);
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error("Error fetching pitches:", error);
              return [];
            }
          }
          async getPitchesByUserId(userId) {
            try {
              const query = db3.select().from(pitches3).where(eq2(pitches3.userId, userId)).orderBy(desc2(pitches3.createdAt)).limit(20);
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error(`Error fetching pitches for user ${userId}:`, error);
              return [];
            }
          }
          async getPitchesByStatus(status) {
            try {
              const query = db3.select().from(pitches3).where(eq2(pitches3.status, status)).orderBy(desc2(pitches3.createdAt)).limit(20);
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error(`Error fetching pitches with status ${status}:`, error);
              return [];
            }
          }
          // Experience methods
          async createExperience(insertExperience) {
            try {
              if (!insertExperience.userId || !insertExperience.title || !insertExperience.company || !insertExperience.startDate) {
                throw new Error("Missing required experience fields");
              }
              const [experience] = await withTimeout2(
                db3.insert(experiences3).values(insertExperience).returning(),
                5e3
              );
              if (!experience) {
                throw new Error("Experience creation failed - no experience returned");
              }
              return experience;
            } catch (error) {
              console.error("Error creating experience:", error);
              throw error;
            }
          }
          async getExperiencesByUserId(userId) {
            try {
              const query = db3.select().from(experiences3).where(eq2(experiences3.userId, userId)).orderBy(desc2(experiences3.current));
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error(`Error fetching experiences for user ${userId}:`, error);
              return [];
            }
          }
          // Job methods
          async createJob(insertJob) {
            try {
              if (!insertJob.userId || !insertJob.title || !insertJob.company || !insertJob.location || !insertJob.locationType || !insertJob.jobType || !insertJob.description) {
                throw new Error("Missing required job fields");
              }
              const [job] = await withTimeout2(
                db3.insert(jobs3).values(insertJob).returning(),
                5e3
              );
              if (!job) {
                throw new Error("Job creation failed - no job returned");
              }
              return job;
            } catch (error) {
              console.error("Error creating job:", error);
              throw error;
            }
          }
          async getJobs() {
            try {
              const query = db3.select().from(jobs3).orderBy(desc2(jobs3.createdAt));
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error("Error fetching jobs:", error);
              return [];
            }
          }
          async getJobsByUserId(userId) {
            try {
              const query = db3.select().from(jobs3).where(eq2(jobs3.userId, userId)).orderBy(desc2(jobs3.createdAt));
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error(`Error fetching jobs for user ${userId}:`, error);
              return [];
            }
          }
          async getJobsByType(jobType) {
            try {
              const query = db3.select().from(jobs3).where(eq2(jobs3.jobType, jobType)).orderBy(desc2(jobs3.createdAt));
              return await withTimeout2(query, 5e3, []);
            } catch (error) {
              console.error(`Error fetching jobs of type ${jobType}:`, error);
              return [];
            }
          }
          async getJobById(id) {
            try {
              const query = db3.select().from(jobs3).where(eq2(jobs3.id, id));
              const [job] = await withTimeout2(query, 5e3, []);
              return job;
            } catch (error) {
              console.error(`Error fetching job with ID ${id}:`, error);
              return void 0;
            }
          }
        };
        storage2 = new DatabaseStorage2();
      }
    });
    auth_exports2 = {};
    __export4(auth_exports2, {
      comparePasswords: () => comparePasswords2,
      hashPassword: () => hashPassword2,
      setupAuth: () => setupAuth2
    });
    init_auth2 = __esm2({
      "server/auth.ts"() {
        "use strict";
        init_storage();
        init_schema();
        scryptAsync2 = promisify2(scrypt2);
      }
    });
    init_storage();
    init_schema();
    upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      // 10MB limit
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image files are allowed!"));
        }
      }
    });
  }
});

// api/index.js
import serverless from "serverless-http";
import express from "express";
import dotenv4 from "dotenv";
import passport3 from "passport";
import session4 from "express-session";
import createMemoryStore4 from "memorystore";
dotenv4.config();
process.env.VERCEL = "1";
process.env.NODE_ENV = "production";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var MemoryStore3 = createMemoryStore4(session4);
var sessionStore = new MemoryStore3({
  checkPeriod: 864e5
  // 24 hours
});
app.set("trust proxy", 1);
app.use(session4({
  secret: process.env.SESSION_SECRET || "hindustan-founders-secret",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1e3 * 60 * 60 * 24 * 7,
    // 1 week
    secure: false,
    // Set to true if using HTTPS
    sameSite: "lax"
  }
}));
app.use(passport3.initialize());
app.use(passport3.session());
var serverlessHandler;
var handler = async (req, res) => {
  try {
    if (!serverlessHandler) {
      console.log("Initializing API routes...");
      try {
        await Promise.resolve().then(() => (init_db(), db_exports));
        console.log("Database module loaded");
        const { setupAuth: setupAuth3 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const { default: setupRoutes2 } = await Promise.resolve().then(() => (init_serverless_routes(), serverless_routes_exports));
        console.log("Setting up auth...");
        setupAuth3(app);
        console.log("Setting up routes...");
        setupRoutes2(app);
        app.use((err, _req, res2, _next) => {
          const status = err.status || err.statusCode || 500;
          const message = err.message || "Internal Server Error";
          console.error(`Error: ${message}`);
          res2.status(status).json({
            message,
            error: process.env.NODE_ENV === "development" ? err : void 0
          });
        });
        console.log("Creating serverless handler...");
        serverlessHandler = serverless(app);
        console.log("API initialization complete");
      } catch (initError) {
        console.error("Failed to initialize API:", initError);
        throw initError;
      }
    }
    if (process.env.NODE_ENV === "development") {
      console.log(`${req.method} ${req.url}`);
    }
    return serverlessHandler(req, res);
  } catch (error) {
    console.error("Error in serverless handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : void 0
      })
    };
  }
};
var index_default = handler;
export {
  index_default as default
};
