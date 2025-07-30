import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/auth';
import { read, getUserById, getDocumentById, Activity, Document, User } from '../../lib/db';
import { ApiError, EnrichedActivity } from '../../types/api';

interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface TrendingDocument {
  document: Document;
  author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  stats: {
    likes: number;
    views: number;
    downloads: number;
    bookmarks: number;
    comments: number;
  };
  score: number;
}

interface FeedItem {
  id: string;
  type: 'activity' | 'trending' | 'recent_document' | 'suggested_user' | 'popular_category';
  timestamp: string;
  data: any;
}

interface FeedResponse {
  items: FeedItem[];
  activities: EnrichedActivity[];
  trending: TrendingDocument[];
  recentDocuments: Array<Document & { author: Pick<User, 'id' | 'name' | 'avatarUrl'> }>;
  total: number;
  hasMore: boolean;
  stats: {
    followingCount: number;
    activitiesCount: number;
    trendingCount: number;
    recentCount: number;
  };
}

// Helper function to calculate user preferences based on interactions
function calculateUserPreferences(interactions: SocialInteraction[], userId: string) {
  const userInteractions = interactions.filter(i => i.userId === userId);
  const preferences = {
    categories: new Map<string, number>(),
    tags: new Map<string, number>(),
    authors: new Map<string, number>()
  };
  
  // Weight different interaction types
  const weights = { like: 3, bookmark: 5, follow: 2 };
  
  userInteractions.forEach(interaction => {
    const weight = weights[interaction.type as keyof typeof weights] || 1;
    
    if (interaction.targetType === 'user' && interaction.type === 'follow') {
      preferences.authors.set(interaction.targetId, (preferences.authors.get(interaction.targetId) || 0) + weight);
    }
    
    if (interaction.metadata) {
      if (interaction.metadata.category) {
        preferences.categories.set(interaction.metadata.category, (preferences.categories.get(interaction.metadata.category) || 0) + weight);
      }
      if (interaction.metadata.tags && Array.isArray(interaction.metadata.tags)) {
        interaction.metadata.tags.forEach((tag: string) => {
          preferences.tags.set(tag, (preferences.tags.get(tag) || 0) + weight);
        });
      }
    }
  });
  
  return preferences;
}

// Helper function to score documents based on user preferences
function scoreDocument(document: Document, preferences: any, followedUserIds: string[]) {
  let score = 0;
  
  // High priority for followed users' documents
  if (followedUserIds.includes(document.userId)) {
    score += 100;
  }
  
  // Score based on category preference
  if (document.category && preferences.categories.has(document.category)) {
    score += preferences.categories.get(document.category) * 2;
  }
  
  // Score based on tags preference
  if (document.tags) {
    document.tags.forEach(tag => {
      if (preferences.tags.has(tag)) {
        score += preferences.tags.get(tag);
      }
    });
  }
  
  // Score based on author preference
  if (preferences.authors.has(document.userId)) {
    score += preferences.authors.get(document.userId) * 1.5;
  }
  
  // Boost newer documents
  const daysSinceCreated = (Date.now() - new Date(document.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 20 - daysSinceCreated); // Up to 20 points for very recent documents
  
  // Boost public documents
  if (document.isPublic) {
    score += 5;
  }
  
  return score;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeedResponse | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;

  try {
    // Get pagination parameters
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const feedType = req.query.type as string || 'mixed'; // 'following', 'trending', 'recent', 'mixed'

    // Read all data sources
    const interactions = await read<SocialInteraction>('data/interactions.json');
    const allActivities = await read<Activity>('data/activity.json');
    const allDocuments = await read<Document>('data/documents.json');
    const allUsers = await read<User>('data/users.json');
    
    // Get users that the current user follows
    const followedUserIds = interactions
      .filter(interaction => 
        interaction.userId === userId && 
        interaction.type === 'follow' &&
        interaction.targetType === 'user'
      )
      .map(interaction => interaction.targetId);
    
    // Calculate user preferences
    const userPreferences = calculateUserPreferences(interactions, userId);
    
    // Filter out user's own documents and score the rest
    const scoredDocuments = allDocuments
      .filter(doc => doc.userId !== userId) // Exclude user's own posts
      .map(doc => ({
        ...doc,
        score: scoreDocument(doc, userPreferences, followedUserIds)
      }));
    
    // Sort documents by score
    scoredDocuments.sort((a, b) => b.score - a.score);

    // Get users that follow the current user (followers)
    const followerUserIds = interactions
      .filter(interaction => 
        interaction.targetId === userId && 
        interaction.type === 'follow' &&
        interaction.targetType === 'user'
      )
      .map(interaction => interaction.userId);

    // Build comprehensive feed items from scored documents
    const feedItems: FeedItem[] = scoredDocuments.map(doc => ({
      id: `document-${doc.id}`,
      type: 'recent_document',
      timestamp: doc.createdAt,
      data: {
        ...doc,
        author: allUsers.find(u => u.id === doc.userId) || { id: doc.userId, name: 'Unknown', avatarUrl: '' }
      }
    }));

    // Add activities to the feed (exclude follow activities)
    const enrichedActivities: EnrichedActivity[] = [];
    if (followedUserIds.length > 0) {
      const followingActivities = allActivities
        .filter(activity => 
          followedUserIds.includes(activity.userId) &&
          activity.action !== 'user.followed' && // Exclude follow activities
          activity.entityType === 'document' // Only document-related activities
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      for (const activity of followingActivities) {
        const activityUser = await getUserById(activity.userId);
        if (!activityUser) continue;

        const enrichedActivity: EnrichedActivity = {
          ...activity,
          user: {
            id: activityUser.id,
            name: activityUser.name,
            avatarUrl: activityUser.avatarUrl
          }
        };

        if (activity.entityType === 'document') {
          const document = await getDocumentById(activity.entityId);
          if (document) {
            enrichedActivity.document = { id: document.id, title: document.title, type: document.type };
          }
        }

        enrichedActivities.push(enrichedActivity);
        feedItems.unshift({ // Add to the beginning for chronological order
          id: `activity-${activity.id}`,
          type: 'activity',
          timestamp: activity.timestamp,
          data: enrichedActivity
        });
      }
    }

    // Sort all feed items by timestamp and apply pagination
    feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const paginatedItems = feedItems.slice(offset, offset + limit);
    const hasMore = feedItems.length > offset + limit;

    return res.status(200).json({
      items: paginatedItems,
      activities: [], // Already included in items
      trending: [], // Not used in this version
      recentDocuments: [], // Already included in items
      total: feedItems.length,
      hasMore,
      stats: {
        followingCount: followedUserIds.length,
        activitiesCount: enrichedActivities.length,
        trendingCount: 0,
        recentCount: scoredDocuments.length
      }
    });

  } catch (error) {
    console.error('Feed API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
