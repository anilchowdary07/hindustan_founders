import { pool } from '../db';

/**
 * Get all conversations for a user
 */
export async function getConversationsByUserId(userId: number) {
  try {
    const result = await pool.query(`
      WITH user_conversations AS (
        SELECT 
          c.id, 
          c.created_at, 
          c.updated_at
        FROM conversations c
        JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = $1 AND cp.left_at IS NULL
      ),
      conversation_last_messages AS (
        SELECT 
          m.conversation_id,
          m.content,
          m.created_at,
          m.sender_id,
          ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) as rn
        FROM messages m
        WHERE m.conversation_id IN (SELECT id FROM user_conversations)
      ),
      unread_counts AS (
        SELECT 
          m.conversation_id,
          COUNT(*) as unread_count
        FROM messages m
        LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = $1
        WHERE 
          m.conversation_id IN (SELECT id FROM user_conversations)
          AND m.sender_id != $1
          AND (mrs.is_read IS NULL OR mrs.is_read = false)
        GROUP BY m.conversation_id
      )
      SELECT 
        uc.id,
        uc.created_at,
        uc.updated_at,
        COALESCE(uc.unread_count, 0) as unread_count,
        (
          SELECT json_agg(json_build_object(
            'id', u.id,
            'name', u.name,
            'avatarUrl', u.avatar_url,
            'isOnline', false, -- This would be replaced with actual online status
            'lastSeen', NULL -- This would be replaced with actual last seen time
          ))
          FROM conversation_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.conversation_id = uc.id AND cp.user_id != $1 AND cp.left_at IS NULL
        ) as other_participants,
        (
          SELECT json_build_object(
            'id', clm.id,
            'content', clm.content,
            'createdAt', clm.created_at,
            'senderId', clm.sender_id,
            'isRead', CASE WHEN uc.unread_count > 0 THEN false ELSE true END
          )
          FROM conversation_last_messages clm
          WHERE clm.conversation_id = uc.id AND clm.rn = 1
        ) as last_message
      FROM (
        SELECT 
          uc.id, 
          uc.created_at, 
          uc.updated_at,
          COALESCE(unc.unread_count, 0) as unread_count
        FROM user_conversations uc
        LEFT JOIN unread_counts unc ON uc.id = unc.conversation_id
      ) uc
      ORDER BY 
        CASE WHEN uc.unread_count > 0 THEN 0 ELSE 1 END, -- Unread conversations first
        (SELECT MAX(created_at) FROM messages WHERE conversation_id = uc.id) DESC NULLS LAST -- Then by most recent message
    `, [userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting conversations by user ID:', error);
    throw error;
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(conversationId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.created_at,
        c.updated_at,
        (
          SELECT json_agg(json_build_object(
            'id', u.id,
            'name', u.name,
            'avatarUrl', u.avatar_url,
            'role', u.role
          ))
          FROM conversation_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.conversation_id = c.id AND cp.left_at IS NULL
        ) as participants
      FROM conversations c
      WHERE c.id = $1
    `, [conversationId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting conversation by ID:', error);
    throw error;
  }
}

/**
 * Get participants of a conversation
 */
export async function getConversationParticipants(conversationId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.avatar_url as "avatarUrl",
        u.role,
        cp.joined_at as "joinedAt"
      FROM conversation_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = $1 AND cp.left_at IS NULL
    `, [conversationId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting conversation participants:', error);
    throw error;
  }
}

/**
 * Create a new conversation
 */
export async function createConversation(participantIds: number[]) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create the conversation
    const conversationResult = await client.query(`
      INSERT INTO conversations (created_at, updated_at)
      VALUES (NOW(), NOW())
      RETURNING id, created_at, updated_at
    `);
    
    const conversationId = conversationResult.rows[0].id;
    
    // Add participants
    for (const participantId of participantIds) {
      await client.query(`
        INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
        VALUES ($1, $2, NOW())
      `, [conversationId, participantId]);
    }
    
    // Get participant details
    const participantsResult = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.avatar_url as "avatarUrl",
        u.role
      FROM conversation_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.conversation_id = $1
    `, [conversationId]);
    
    await client.query('COMMIT');
    
    return {
      id: conversationId,
      createdAt: conversationResult.rows[0].created_at,
      updatedAt: conversationResult.rows[0].updated_at,
      participants: participantsResult.rows
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating conversation:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessagesByConversationId(conversationId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.content,
        m.attachment_url as "attachmentUrl",
        m.attachment_type as "attachmentType",
        m.created_at as "createdAt",
        m.updated_at as "updatedAt",
        m.is_edited as "isEdited",
        m.is_deleted as "isDeleted",
        m.sender_id as "senderId",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'avatarUrl', u.avatar_url
        ) as sender
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [conversationId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting messages by conversation ID:', error);
    throw error;
  }
}

/**
 * Create a new message
 */
export async function createMessage(messageData: {
  conversationId: number;
  senderId: number;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
}) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create the message
    const messageResult = await client.query(`
      INSERT INTO messages (
        conversation_id, 
        sender_id, 
        content, 
        attachment_url, 
        attachment_type, 
        created_at, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING 
        id, 
        content, 
        attachment_url as "attachmentUrl", 
        attachment_type as "attachmentType", 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        is_edited as "isEdited", 
        is_deleted as "isDeleted",
        sender_id as "senderId"
    `, [
      messageData.conversationId,
      messageData.senderId,
      messageData.content,
      messageData.attachmentUrl || null,
      messageData.attachmentType || null
    ]);
    
    const message = messageResult.rows[0];
    
    // Update conversation's updated_at timestamp
    await client.query(`
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = $1
    `, [messageData.conversationId]);
    
    // Create read status entries for all participants (except sender)
    const participantsResult = await client.query(`
      SELECT user_id
      FROM conversation_participants
      WHERE conversation_id = $1 AND user_id != $2 AND left_at IS NULL
    `, [messageData.conversationId, messageData.senderId]);
    
    for (const participant of participantsResult.rows) {
      await client.query(`
        INSERT INTO message_read_status (message_id, user_id, is_read, read_at)
        VALUES ($1, $2, false, NULL)
      `, [message.id, participant.user_id]);
    }
    
    // Get sender information
    const senderResult = await client.query(`
      SELECT id, name, avatar_url as "avatarUrl"
      FROM users
      WHERE id = $1
    `, [messageData.senderId]);
    
    await client.query('COMMIT');
    
    return {
      ...message,
      sender: senderResult.rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating message:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: number, userId: number) {
  try {
    // Check if a read status entry exists
    const checkResult = await pool.query(`
      SELECT id, is_read
      FROM message_read_status
      WHERE message_id = $1 AND user_id = $2
    `, [messageId, userId]);
    
    if (checkResult.rows.length > 0) {
      // Update existing entry if not already read
      if (!checkResult.rows[0].is_read) {
        await pool.query(`
          UPDATE message_read_status
          SET is_read = true, read_at = NOW()
          WHERE id = $1
        `, [checkResult.rows[0].id]);
      }
    } else {
      // Create new entry
      await pool.query(`
        INSERT INTO message_read_status (message_id, user_id, is_read, read_at)
        VALUES ($1, $2, true, NOW())
      `, [messageId, userId]);
    }
    
    return true;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

/**
 * Get user by ID
 */
export async function getUser(userId: number) {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        avatar_url as "avatarUrl",
        role
      FROM users
      WHERE id = $1
    `, [userId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}