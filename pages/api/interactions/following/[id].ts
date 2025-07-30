import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../../lib/auth';
import { read } from '../../../../lib/db';
import { ApiError } from '../../../../types/api';

interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ isFollowing: boolean } | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify user authentication
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const interactions = await read<SocialInteraction>('data/interactions.json');

    // Check if current user is following the target user
    const isFollowing = interactions.some(
      interaction => 
        interaction.userId === user.userId && 
        interaction.targetId === id &&
        interaction.targetType === 'user' &&
        interaction.type === 'follow'
    );

    return res.status(200).json({ isFollowing });

  } catch (error) {
    console.error('Following check API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
