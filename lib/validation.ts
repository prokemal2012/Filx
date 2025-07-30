import { z } from 'zod';

// URL validation that allows both full URLs, data URLs, local paths, and empty strings
export const urlOrEmpty = z.string().refine((val) => {
  if (val === '') return true;
  
  // Allow data URLs (base64 encoded images)
  if (val.startsWith('data:')) return true;
  
  // Allow local paths
  if (val.startsWith('/') || val.startsWith('./')) return true;
  
  // Allow full URLs
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}, 'Invalid URL format');

// Common validation schemas
export const userProfileValidation = {
  name: z.string()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Name contains invalid characters'),
  
  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters'),
  
  location: z.string()
    .max(100, 'Location cannot exceed 100 characters'),
  
  website: urlOrEmpty,
  
  avatarUrl: urlOrEmpty,
  
  coverUrl: urlOrEmpty,
};

// Helper function to clean URL fields (convert empty strings to null)
export const cleanUrlFields = <T extends Record<string, any>>(data: T): T => {
  const cleaned = { ...data };
  
  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === 'string' && value === '') {
      cleaned[key as keyof T] = null as any;
    }
  }
  
  return cleaned;
};

// Helper function to sanitize user input
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// Check if URL is from allowed domains (for security)
export const isAllowedImageDomain = (url: string): boolean => {
  if (!url) return true; // Empty URLs are allowed
  
  // Allow data URLs (base64 encoded images from file uploads)
  if (url.startsWith('data:image/')) {
    return true;
  }
  
  // Allow local file URLs (for uploaded files)
  if (url.startsWith('/uploads/') || url.startsWith('./uploads/')) {
    return true;
  }
  
  try {
    const parsedUrl = new URL(url);
    const allowedDomains = [
      'cdn.example.com',
      'images.unsplash.com',
      'via.placeholder.com',
      'i.imgur.com',
      'gravatar.com',
      'www.gravatar.com',
      'secure.gravatar.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'platform-lookaside.fbsbx.com',
      'scontent.xx.fbcdn.net',
      // Add more allowed domains as needed
    ];
    
    // For development, allow localhost and common image hosts
    if (process.env.NODE_ENV === 'development') {
      allowedDomains.push('localhost', '127.0.0.1');
    }
    
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
};
