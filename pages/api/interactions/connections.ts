import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { read, getUserById } from '../../../lib/db';
import { ApiError, UserProfile } from '../../../types/api';

interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ConnectionsResponse {
  followers: UserProfile[];
  following: UserProfile[];
  followerCount: number;
  followingCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ConnectionsResponse | ApiError>
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
    // Get target user ID from query params (optional, defaults to current user)
    const targetUserId = (req.query.userId as string) || userId;

    const interactions = await read<SocialInteraction>('data/interactions.json');

    // Get followers (users who follow the target user)
    const followerInteractions = interactions.filter(
      interaction => 
        interaction.targetId === targetUserId && 
        interaction.type === 'follow' &&
        interaction.targetType === 'user'
    );

    // Get following (users the target user follows)
    const followingInteractions = interactions.filter(
      interaction => 
        interaction.userId === targetUserId && 
        interaction.type === 'follow' &&
        interaction.targetType === 'user'
    );

    // Fetch user details for followers
    const followers: UserProfile[] = [];
    for (const followerInteraction of followerInteractions) {
      const user = await getUserById(followerInteraction.userId);
      if (user) {
        const { password, ...userProfile } = user;
        followers.push(userProfile);
      }
    }

    // Fetch user details for following
    const following: UserProfile[] = [];
    for (const followingInteraction of followingInteractions) {
      const user = await getUserById(followingInteraction.targetId);
      if (user) {
        const { password, ...userProfile } = user;
        following.push(userProfile);
      }
    }

    // Sort by most recent
    followers.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    following.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      followers,
      following,
      followerCount: followers.length,
      followingCount: following.length
    });

  } catch (error) {
    console.error('Connections API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
