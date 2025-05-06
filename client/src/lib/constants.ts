// Base API URL (automatically detects environment)
export const API_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api'
  : '/api';

// File upload limits
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/jpg,image/webp,image/gif";
export const ACCEPTED_DOC_TYPES = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const ACCEPTED_MEDIA_TYPES = "video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;

// localStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data'
};

// Time constants (in milliseconds)
export const TIME = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
};
