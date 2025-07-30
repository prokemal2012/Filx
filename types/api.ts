import { User } from '../lib/db';

// User profile without sensitive information
export type UserProfile = Omit<User, 'password'>;

// API Response types
export interface UserProfileResponse {
  user: UserProfile;
}

export interface UpdateUserProfileResponse {
  message: string;
  user: UserProfile;
}

export interface UserProfileUpdateRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export interface ApiError {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Document API types
export interface DocumentMetadata {
  title: string;
  content: string;
  type: string;
  size: number;
  tags?: string[];
}

export interface DocumentCreateRequest {
  title: string;
  content: string;
  type: string;
  size: number;
  tags?: string[];
}

export interface DocumentUpdateRequest {
  title?: string;
  content?: string;
  type?: string;
  size?: number;
  tags?: string[];
}

export interface DocumentResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface DocumentListResponse {
  documents: DocumentResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface DocumentCreateResponse {
  message: string;
  document: DocumentResponse;
}

export interface DocumentUpdateResponse {
  message: string;
  document: DocumentResponse;
}

export interface DocumentDeleteResponse {
  message: string;
}

// Interaction API types
export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
  message: string;
}

export interface BookmarkResponse {
  success: boolean;
  bookmarked: boolean;
  message: string;
}

export interface FollowResponse {
  success: boolean;
  following: boolean;
  followerCount: number;
  message: string;
}

export interface InteractionStatusResponse {
  liked: boolean;
  bookmarked: boolean;
  following: boolean;
  likeCount: number;
  bookmarkCount: number;
  followerCount: number;
}

export interface BookmarksResponse {
  bookmarks: DocumentResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ConnectionsResponse {
  followers: UserProfile[];
  following: UserProfile[];
  followerCount: number;
  followingCount: number;
}

export interface EnrichedActivity {
  id: string;
  userId: string;
  action: string;
  entityType: 'user' | 'document' | 'interaction';
  entityId: string;
  timestamp: string;
  details?: Record<string, any>;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  document?: {
    id: string;
    title: string;
    type: string;
  };
  targetUser?: {
    id: string;
    name: string;
  };
}

export interface FeedResponse {
  activities: EnrichedActivity[];
  total: number;
  page: number;
  limit: number;
}
