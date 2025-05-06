import { useState, useEffect, useRef, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'error';

interface UseWebSocketOptions {
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectOnClose?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
) {
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectOnClose = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  // Function to establish WebSocket connection
  const connect = useCallback(() => {
    if (!url) return;

    // Close existing connection if any
    if (websocketRef.current) {
      websocketRef.current.close();
    }

    try {
      setStatus('connecting');
      const ws = new WebSocket(url);
      websocketRef.current = ws;

      ws.onopen = (event) => {
        setStatus('open');
        reconnectAttemptsRef.current = 0;
        if (onOpen) onOpen(event);
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
        if (onMessage) onMessage(event);
      };

      ws.onclose = (event) => {
        setStatus('closed');
        if (onClose) onClose(event);

        // Attempt to reconnect if enabled and not manually closed
        if (reconnectOnClose && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        setStatus('error');
        if (onError) onError(event);
      };
    } catch (error) {
      setStatus('error');
      console.error('WebSocket connection error:', error);
    }
  }, [url, onOpen, onMessage, onClose, onError, reconnectOnClose, reconnectInterval, maxReconnectAttempts]);

  // Connect on mount or when URL changes
  useEffect(() => {
    connect();

    return () => {
      // Clean up on unmount
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [url, connect]);

  // Function to send messages
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(data);
      return true;
    }
    return false;
  }, []);

  // Function to manually close the connection
  const closeConnection = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
    }
  }, []);

  return {
    status,
    lastMessage,
    sendMessage,
    closeConnection,
  };
}