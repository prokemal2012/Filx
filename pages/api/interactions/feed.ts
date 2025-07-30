import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { read, getRecentActivity, getUserById, getDocumentById } from '../../../lib/db';
import { ApiError } from '../../../types/api';

interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Activity {
  id: string;
  userId: string;
  action: string;
  entityType: 'user' | 'document' | 'interaction';
  entityId: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface EnrichedActivity extends Activity {
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

interface FeedResponse {
  activities: EnrichedActivity[];
  total: number;
  page: number;
  limit: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FeedResponse | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = await getToken({ req });
  if (!token || !token.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = token.sub;

  try {
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const includeOwn = req.query.includeOwn === 'true';

    const interactions = await read<SocialInteraction>('data/interactions.json');

    // Get users that the current user follows
    const followingUserIds = interactions
      .filter(interaction => 
        interaction.userId === userId && 
        interaction.type === 'follow' &&
        interaction.targetType === 'user'
      )
      .map(interaction => interaction.targetId);

    // Include current user's activities if requested or if no following users
    const relevantUserIds = includeOwn || followingUserIds.length === 0 ? [...followingUserIds, userId] : followingUserIds;

    // Get all activities
    const allActivities = await read<Activity>('data/activity.json');

    // Filter activities from followed users (and optionally own activities)
    const relevantActivities = allActivities.filter(activity => 
      relevantUserIds.includes(activity.userId)
    );

    // Sort by timestamp (most recent first)
    relevantActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivities = relevantActivities.slice(startIndex, endIndex);

    // Enrich activities with user and entity details
    const enrichedActivities: any[] = [];
    
    for (const activity of paginatedActivities) {
      // Get activity user
      const activityUser = await getUserById(activity.userId);
      if (!activityUser) continue;

      const enrichedActivity: any = {
        ...activity,
        user: {
          id: activityUser.id,
          name: activityUser.name,
          avatarUrl: activityUser.avatarUrl
        },
        author: {
          name: activityUser.name,
          username: activityUser.email?.split('@')[0] || 'user',
          avatar: activityUser.avatarUrl || '/placeholder.svg',
          verified: false
        }
      };

      // Add document details if it's a document-related activity
      if (activity.entityType === 'document') {
        const document = await getDocumentById(activity.entityId);
        if (document) {
          // Count likes and bookmarks for this document
          const documentLikes = interactions.filter(i => 
            i.targetId === document.id && 
            i.targetType === 'document' && 
            i.type === 'like'
          ).length;
          
          const documentBookmarks = interactions.filter(i => 
            i.targetId === document.id && 
            i.targetType === 'document' && 
            i.type === 'bookmark'
          ).length;
          
          // Check if current user has liked/bookmarked this document
          const userLiked = interactions.some(i => 
            i.userId === userId && 
            i.targetId === document.id && 
            i.targetType === 'document' && 
            i.type === 'like'
          );
          
          const userBookmarked = interactions.some(i => 
            i.userId === userId && 
            i.targetId === document.id && 
            i.targetType === 'document' && 
            i.type === 'bookmark'
          );
          
          enrichedActivity.document = {
            id: document.id,
            title: document.title,
            description: document.content.substring(0, 150) + '...',
            type: document.type,
            category: document.tags?.[0] || 'General',
            pages: Math.ceil(document.content.length / 500),
            thumbnail: '/placeholder.svg'
          };
          
          // Add interaction data
          enrichedActivity.likes = documentLikes;
          enrichedActivity.bookmarks = documentBookmarks;
          enrichedActivity.comments = 0; // Comments not implemented yet
          enrichedActivity.shares = 0;   // Shares not implemented yet
          enrichedActivity.isLiked = userLiked;
          enrichedActivity.isBookmarked = userBookmarked;
        }
      } else {
        // For non-document activities, set default interaction values
        enrichedActivity.likes = 0;
        enrichedActivity.bookmarks = 0;
        enrichedActivity.comments = 0;
        enrichedActivity.shares = 0;
        enrichedActivity.isLiked = false;
        enrichedActivity.isBookmarked = false;
      }

      enrichedActivities.push(enrichedActivity);
    }

    return res.status(200).json({
      activities: enrichedActivities,
      total: relevantActivities.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Feed API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
