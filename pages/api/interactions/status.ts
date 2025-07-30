import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { read } from '../../../lib/db';
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

interface InteractionStatusResponse {
  liked: boolean;
  bookmarked: boolean;
  following: boolean;
  likeCount: number;
  bookmarkCount: number;
  followerCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InteractionStatusResponse | ApiError>
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
    const { targetId, targetType, documentId, userId: targetUserId } = req.query;

    // Handle legacy documentId parameter
    const actualTargetId = targetId || documentId;
    const actualTargetType = targetType || (documentId ? 'document' : targetUserId ? 'user' : null);

    if (!actualTargetId || !actualTargetType) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: [
          { field: 'targetId/documentId', message: 'Target ID or document ID is required' },
          { field: 'targetType', message: 'Target type is required (or can be inferred from documentId)' }
        ].filter(detail => {
          if (detail.field === 'targetId/documentId') return !actualTargetId;
          if (detail.field === 'targetType') return !actualTargetType;
          return false;
        })
      });
    }

    if (actualTargetType !== 'document' && actualTargetType !== 'user') {
      return res.status(400).json({
        error: 'Invalid target type',
        details: [{ field: 'targetType', message: 'Target type must be "document" or "user"' }]
      });
    }

    const interactions = await read<SocialInteraction>('data/interactions.json');

    // Get user's interactions with this target
    const userInteractions = interactions.filter(
      interaction => 
        interaction.userId === userId && 
        interaction.targetId === actualTargetId as string
    );

    // Get all interactions with this target (for counts)
    const allTargetInteractions = interactions.filter(
      interaction => interaction.targetId === actualTargetId as string
    );

    const liked = userInteractions.some(interaction => interaction.type === 'like');
    const bookmarked = userInteractions.some(interaction => interaction.type === 'bookmark');
    const following = userInteractions.some(interaction => interaction.type === 'follow');

    const likeCount = allTargetInteractions.filter(interaction => interaction.type === 'like').length;
    const bookmarkCount = allTargetInteractions.filter(interaction => interaction.type === 'bookmark').length;
    const followerCount = allTargetInteractions.filter(interaction => interaction.type === 'follow').length;

    return res.status(200).json({
      liked,
      bookmarked,
      following,
      likeCount,
      bookmarkCount,
      followerCount
    });

  } catch (error) {
    console.error('Interaction status API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
