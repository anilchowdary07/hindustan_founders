import { pool } from '../db';

/**
 * Get all posts with pagination
 */
export async function getPosts(page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.media,
        p.created_at as "createdAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url,
          'role', u.role
        ) as author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
}

/**
 * Get a post by ID
 */
export async function getPostById(postId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.content,
        p.media,
        p.created_at as "createdAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url,
          'role', u.role
        ) as author
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [postId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting post by ID:', error);
    throw error;
  }
}

/**
 * Create a new post
 */
export async function createPost(userId: number, postData: {
  content: string;
  media?: string;
}) {
  try {
    const result = await pool.query(`
      INSERT INTO posts (
        user_id,
        content,
        media,
        created_at
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING 
        id, 
        content,
        media,
        created_at as "createdAt"
    `, [
      userId,
      postData.content,
      postData.media || null
    ]);
    
    // Get the author information
    const authorResult = await pool.query(`
      SELECT 
        id,
        name,
        avatar_url as "avatarUrl",
        role
      FROM users
      WHERE id = $1
    `, [userId]);
    
    return {
      ...result.rows[0],
      author: authorResult.rows[0]
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * Update a post
 */
export async function updatePost(postId: number, userId: number, postData: {
  content?: string;
  media?: string;
}) {
  try {
    // Build the SET clause dynamically based on provided fields
    const updates = [];
    const values = [postId, userId];
    let paramIndex = 3;
    
    if (postData.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(postData.content);
    }
    
    if (postData.media !== undefined) {
      updates.push(`media = $${paramIndex++}`);
      values.push(postData.media);
    }
    
    // If no fields to update, return the current post
    if (updates.length === 0) {
      return getPostById(postId);
    }
    
    const query = `
      UPDATE posts
      SET ${updates.join(', ')}
      WHERE id = $1 AND user_id = $2
      RETURNING 
        id, 
        content,
        media,
        created_at as "createdAt"
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      // Post not found or user doesn't have permission
      return null;
    }
    
    // Get the author information
    const authorResult = await pool.query(`
      SELECT 
        id,
        name,
        avatar_url as "avatarUrl",
        role
      FROM users
      WHERE id = $1
    `, [userId]);
    
    return {
      ...result.rows[0],
      author: authorResult.rows[0]
    };
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: number, userId: number) {
  try {
    const result = await pool.query(`
      DELETE FROM posts
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [postId, userId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}