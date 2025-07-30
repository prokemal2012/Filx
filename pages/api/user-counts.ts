import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/auth';
import { read } from '../../lib/db';

interface UserCountsResponse {
  favorites: number;
  bookmarks: number;
  following: number;
}

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
  res: NextApiResponse<UserCountsResponse | { error: string }>
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
    
    const interactions = await read<SocialInteraction>('data/interactions.json');
    
    // Count user's interactions
    const userInteractions = interactions.filter(interaction => interaction.userId === userId);
    
    const favorites = userInteractions.filter(i => i.type === 'like').length;
    const bookmarks = userInteractions.filter(i => i.type === 'bookmark').length;
    const following = userInteractions.filter(i => i.type === 'follow' && i.targetType === 'user').length;

    return res.status(200).json({
      favorites,
      bookmarks,
      following
    });

  } catch (error) {
    console.error('User counts API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
