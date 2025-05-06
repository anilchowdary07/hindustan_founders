import { pool } from '../db';

/**
 * Get all connections for a user
 */
export async function getConnectionsByUserId(userId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.user_id_1 as "userId1",
        c.user_id_2 as "userId2",
        c.status,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        CASE 
          WHEN c.user_id_1 = $1 THEN json_build_object(
            'id', u2.id,
            'name', u2.name,
            'avatarUrl', u2.avatar_url,
            'role', u2.role,
            'title', u2.title,
            'company', u2.company
          )
          ELSE json_build_object(
            'id', u1.id,
            'name', u1.name,
            'avatarUrl', u1.avatar_url,
            'role', u1.role,
            'title', u1.title,
            'company', u1.company
          )
        END as user
      FROM connections c
      JOIN users u1 ON c.user_id_1 = u1.id
      JOIN users u2 ON c.user_id_2 = u2.id
      WHERE (c.user_id_1 = $1 OR c.user_id_2 = $1)
      ORDER BY c.updated_at DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting connections by user ID:', error);
    throw error;
  }
}

/**
 * Get connection requests for a user
 */
export async function getConnectionRequestsByUserId(userId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.user_id_1 as "userId1",
        c.status,
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        json_build_object(
          'id', u1.id,
          'name', u1.name,
          'avatarUrl', u1.avatar_url,
          'role', u1.role,
          'title', u1.title,
          'company', u1.company
        ) as user
      FROM connections c
      JOIN users u1 ON c.user_id_1 = u1.id
      WHERE c.user_id_2 = $1 AND c.status = 'pending'
      ORDER BY c.created_at DESC
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting connection requests by user ID:', error);
    throw error;
  }
}

/**
 * Create a new connection request
 */
export async function createConnectionRequest(userId1: number, userId2: number) {
  try {
    // Check if a connection already exists
    const checkResult = await pool.query(`
      SELECT id, status
      FROM connections
      WHERE 
        (user_id_1 = $1 AND user_id_2 = $2) OR
        (user_id_1 = $2 AND user_id_2 = $1)
    `, [userId1, userId2]);
    
    if (checkResult.rows.length > 0) {
      return {
        id: checkResult.rows[0].id,
        status: checkResult.rows[0].status,
        alreadyExists: true
      };
    }
    
    // Create new connection request
    const result = await pool.query(`
      INSERT INTO connections (
        user_id_1,
        user_id_2,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, 'pending', NOW(), NOW())
      RETURNING 
        id, 
        user_id_1 as "userId1",
        user_id_2 as "userId2",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [userId1, userId2]);
    
    return {
      ...result.rows[0],
      alreadyExists: false
    };
  } catch (error) {
    console.error('Error creating connection request:', error);
    throw error;
  }
}

/**
 * Update a connection status
 */
export async function updateConnectionStatus(connectionId: number, status: 'accepted' | 'rejected') {
  try {
    const result = await pool.query(`
      UPDATE connections
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING 
        id, 
        user_id_1 as "userId1",
        user_id_2 as "userId2",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [status, connectionId]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating connection status:', error);
    throw error;
  }
}

/**
 * Get connection suggestions for a user
 */
export async function getConnectionSuggestions(userId: number, limit = 10) {
  try {
    // Get users who are not already connected or have pending requests
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.avatar_url as "avatarUrl",
        u.role,
        u.title,
        u.company,
        COUNT(DISTINCT c2.id) as mutual_connections
      FROM users u
      LEFT JOIN connections c ON 
        (c.user_id_1 = $1 AND c.user_id_2 = u.id) OR
        (c.user_id_1 = u.id AND c.user_id_2 = $1)
      -- Find mutual connections
      LEFT JOIN connections c1 ON 
        (c1.user_id_1 = $1 OR c1.user_id_2 = $1) AND
        c1.status = 'accepted'
      LEFT JOIN connections c2 ON 
        ((c2.user_id_1 = u.id OR c2.user_id_2 = u.id) AND
        (c2.user_id_1 = CASE WHEN c1.user_id_1 = $1 THEN c1.user_id_2 ELSE c1.user_id_1 END OR
         c2.user_id_2 = CASE WHEN c1.user_id_1 = $1 THEN c1.user_id_2 ELSE c1.user_id_1 END)) AND
        c2.status = 'accepted'
      WHERE 
        u.id != $1 AND
        c.id IS NULL
      GROUP BY u.id
      ORDER BY mutual_connections DESC, RANDOM()
      LIMIT $2
    `, [userId, limit]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting connection suggestions:', error);
    throw error;
  }
}