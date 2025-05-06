import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

export interface ErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  fallbackValue?: any;
  retry?: boolean;
  maxRetries?: number;
}

export interface ErrorState {
  hasError: boolean;
  message: string | null;
  code: string | number | null;
  timestamp: Date | null;
  retryCount: number;
}

const defaultOptions: ErrorOptions = {
  showToast: true,
  logToConsole: true,
  logToServer: false,
  retry: false,
  maxRetries: 3,
};

export function useErrorHandler() {
  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: null,
    code: null,
    timestamp: null,
    retryCount: 0,
  });

  // Log error to server
  const logErrorToServer = useCallback(async (error: Error, context?: any) => {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (logError) {
      console.error('Failed to log error to server:', logError);
    }
  }, []);

  // Handle error
  const handleError = useCallback((error: any, context?: any, options?: ErrorOptions) => {
    const opts = { ...defaultOptions, ...options };
    const errorMessage = error?.message || 'An unexpected error occurred';
    const errorCode = error?.code || error?.status || 'UNKNOWN_ERROR';
    
    // Update error state
    setErrorState({
      hasError: true,
      message: errorMessage,
      code: errorCode,
      timestamp: new Date(),
      retryCount: errorState.retryCount + (opts.retry ? 1 : 0),
    });
    
    // Show toast if enabled
    if (opts.showToast) {
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    // Log to console if enabled
    if (opts.logToConsole) {
      console.error('Error:', error);
      if (context) {
        console.error('Error Context:', context);
      }
    }
    
    // Log to server if enabled
    if (opts.logToServer) {
      logErrorToServer(error, context);
    }
    
    // Return fallback value if provided
    return opts.fallbackValue;
  }, [toast, logErrorToServer, errorState.retryCount]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: null,
      code: null,
      timestamp: null,
      retryCount: 0,
    });
  }, []);

  // Wrap async function with error handling
  const withErrorHandling = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options?: ErrorOptions
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        return handleError(error, { functionName: fn.name, arguments: args }, options) as ReturnType<T>;
      }
    };
  }, [handleError]);

  // Should retry based on retry count and max retries
  const shouldRetry = useCallback(() => {
    return errorState.retryCount < (defaultOptions.maxRetries || 3);
  }, [errorState.retryCount]);

  return {
    error: errorState,
    handleError,
    clearError,
    withErrorHandling,
    shouldRetry,
  };
}