import { db, pool } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

async function initializeDatabase() {
  console.log('Initializing database schema...');
  
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        title TEXT,
        company TEXT,
        location TEXT,
        bio TEXT,
        is_verified BOOLEAN DEFAULT false,
        avatar_url TEXT,
        profile_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Users table created or already exists');

    // Create posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        media TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Posts table created or already exists');

    // Create pitches table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pitches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        logo TEXT,
        location TEXT,
        status TEXT NOT NULL,
        category TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('Pitches table created or already exists');

    // Create experiences table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        description TEXT,
        current BOOLEAN DEFAULT false
      )
    `);
    console.log('Experiences table created or already exists');

    // Create jobs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        location_type TEXT NOT NULL,
        job_type TEXT NOT NULL,
        description TEXT NOT NULL,
        responsibilities TEXT,
        requirements TEXT,
        salary TEXT,
        application_link TEXT,
        logo TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `);
    console.log('Jobs table created or already exists');

    console.log('Database schema initialization complete');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });