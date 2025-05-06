import { pool } from '../db';

/**
 * Validate ID format
 */
function validateId(id: unknown): number {
  const parsed = Number(id);
  if (isNaN(parsed)) throw new Error('Invalid ID format');
  return parsed;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: unknown) {
  const id = validateId(userId);
  
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        username,
        name, 
        email,
        role,
        title,
        company,
        location,
        bio,
        is_verified as "isVerified",
        avatar_url as "avatarUrl",
        profile_completed as "profileCompleted",
        created_at as "createdAt"
      FROM users
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        username,
        password,
        name, 
        email,
        role,
        title,
        company,
        location,
        bio,
        is_verified as "isVerified",
        avatar_url as "avatarUrl",
        profile_completed as "profileCompleted",
        created_at as "createdAt"
      FROM users
      WHERE username = $1
    `, [username]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  username: string;
  password: string;
  name: string;
  email: string;
  role: string;
}) {
  try {
    const result = await pool.query(`
      INSERT INTO users (
        username,
        password,
        name,
        email,
        role,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING 
        id, 
        username,
        name, 
        email,
        role,
        created_at as "createdAt"
    `, [
      userData.username,
      userData.password,
      userData.name,
      userData.email,
      userData.role
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function updateUser(userId: unknown, userData: {
  name?: string;
  email?: string;
  title?: string;
  company?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  const id = validateId(userId);
  
  try {
    // Build the SET clause dynamically based on provided fields
    const updates = [];
    const values = [id];
    let paramIndex = 2;
    
    if (userData.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(userData.name);
    }
    
    if (userData.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(userData.email);
    }
    
    if (userData.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(userData.title);
    }
    
    if (userData.company !== undefined) {
      updates.push(`company = $${paramIndex++}`);
      values.push(userData.company);
    }
    
    if (userData.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(userData.location);
    }
    
    if (userData.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      values.push(userData.bio);
    }
    
    if (userData.avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(userData.avatarUrl);
    }
    
    // If no fields to update, return the current user
    if (updates.length === 0) {
      return getUserById(userId);
    }
    
    // Calculate profile completion percentage
    updates.push(`profile_completed = (
      CASE 
        WHEN name IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN email IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN title IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN company IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN bio IS NOT NULL THEN 20 ELSE 0 END
    )`);
    
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING 
        id, 
        username,
        name, 
        email,
        role,
        title,
        company,
        location,
        bio,
        is_verified as "isVerified",
        avatar_url as "avatarUrl",
        profile_completed as "profileCompleted",
        created_at as "createdAt"
    `;
    
    const result = await pool.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}