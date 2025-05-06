import { Server as HttpServer } from 'http';
import WebSocket from 'ws';
import { storage } from './storage';

// User connection mapping
interface ConnectedUser {
  userId: number;
  socket: WebSocket;
}

// Message types
type MessageType = 'chat' | 'notification' | 'typing' | 'read' | 'connection';

interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

export function setupWebSocketServer(server: HttpServer) {
  // Create WebSocket server with a specific path
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });
  
  // Store connected users
  const connectedUsers: ConnectedUser[] = [];
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    let currentUserId: number | null = null;
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message) as WebSocketMessage;
        
        // Handle authentication message
        if (data.type === 'connection' && data.payload.userId) {
          currentUserId = data.payload.userId;
          
          // Store the connection
          const existingUserIndex = connectedUsers.findIndex(u => u.userId === currentUserId);
          if (existingUserIndex !== -1) {
            // Replace existing connection
            connectedUsers[existingUserIndex].socket = ws;
          } else {
            // Add new connection
            connectedUsers.push({ userId: currentUserId, socket: ws });
          }
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'connection',
            payload: { status: 'connected', userId: currentUserId }
          }));
          
          console.log(`User ${currentUserId} authenticated via WebSocket`);
          
          // Send any pending notifications
          const notifications = await storage.getNotificationsByUserId(currentUserId);
          if (notifications && notifications.length > 0) {
            ws.send(JSON.stringify({
              type: 'notification',
              payload: { notifications }
            }));
          }
          
          return;
        }
        
        // Ensure user is authenticated for other message types
        if (!currentUserId) {
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Not authenticated' }
          }));
          return;
        }
        
        // Handle different message types
        switch (data.type) {
          case 'chat':
            handleChatMessage(currentUserId, data.payload);
            break;
            
          case 'typing':
            handleTypingIndicator(currentUserId, data.payload);
            break;
            
          case 'read':
            handleReadReceipt(currentUserId, data.payload);
            break;
            
          default:
            console.warn(`Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' }
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (currentUserId) {
        // Remove user from connected users
        const index = connectedUsers.findIndex(u => u.userId === currentUserId);
        if (index !== -1) {
          connectedUsers.splice(index, 1);
        }
        console.log(`User ${currentUserId} disconnected from WebSocket`);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Handle chat messages
  async function handleChatMessage(senderId: number, payload: any) {
    try {
      const { conversationId, content } = payload;
      
      if (!conversationId || !content) {
        return;
      }
      
      // Save message to database
      const message = await storage.createMessage({
        conversationId,
        senderId,
        content
      });
      
      // Get conversation participants
      const conversation = await storage.getConversationById(conversationId);
      
      if (!conversation) {
        return;
      }
      
      // Send message to all participants who are connected
      conversation.participants.forEach(participant => {
        if (participant.userId !== senderId) { // Don't send back to sender
          const recipientConnection = connectedUsers.find(u => u.userId === participant.userId);
          
          if (recipientConnection) {
            recipientConnection.socket.send(JSON.stringify({
              type: 'chat',
              payload: {
                message,
                conversationId
              }
            }));
          }
          
          // Create notification for offline users
          if (!recipientConnection) {
            storage.createNotification({
              userId: participant.userId,
              type: 'message',
              content: `New message from ${senderId}`,
              read: false,
              relatedId: senderId
            }).catch(err => console.error('Error creating notification:', err));
          }
        }
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  }
  
  // Handle typing indicators
  function handleTypingIndicator(userId: number, payload: any) {
    try {
      const { conversationId, isTyping } = payload;
      
      if (!conversationId) {
        return;
      }
      
      // Get conversation participants
      storage.getConversationById(conversationId).then(conversation => {
        if (!conversation) {
          return;
        }
        
        // Send typing indicator to all participants except sender
        conversation.participants.forEach(participant => {
          if (participant.userId !== userId) {
            const recipientConnection = connectedUsers.find(u => u.userId === participant.userId);
            
            if (recipientConnection) {
              recipientConnection.socket.send(JSON.stringify({
                type: 'typing',
                payload: {
                  userId,
                  conversationId,
                  isTyping
                }
              }));
            }
          }
        });
      }).catch(err => console.error('Error getting conversation:', err));
    } catch (error) {
      console.error('Error handling typing indicator:', error);
    }
  }
  
  // Handle read receipts
  function handleReadReceipt(userId: number, payload: any) {
    try {
      const { conversationId, messageId } = payload;
      
      if (!conversationId) {
        return;
      }
      
      // Mark message as read in database
      storage.markMessageAsRead(messageId, userId).then(() => {
        // Get conversation participants
        return storage.getConversationById(conversationId);
      }).then(conversation => {
        if (!conversation) {
          return;
        }
        
        // Send read receipt to all participants except reader
        conversation.participants.forEach(participant => {
          if (participant.userId !== userId) {
            const recipientConnection = connectedUsers.find(u => u.userId === participant.userId);
            
            if (recipientConnection) {
              recipientConnection.socket.send(JSON.stringify({
                type: 'read',
                payload: {
                  userId,
                  conversationId,
                  messageId
                }
              }));
            }
          }
        });
      }).catch(err => console.error('Error handling read receipt:', err));
    } catch (error) {
      console.error('Error handling read receipt:', error);
    }
  }
  
  // Function to broadcast notifications to a specific user
  function sendNotificationToUser(userId: number, notification: any) {
    const userConnection = connectedUsers.find(u => u.userId === userId);
    
    if (userConnection) {
      userConnection.socket.send(JSON.stringify({
        type: 'notification',
        payload: { notification }
      }));
    }
  }
  
  // Export function to send notifications
  return {
    sendNotificationToUser
  };
}