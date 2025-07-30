import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { 
  read, 
  write, 
  addActivity, 
  getUserById
} from '../../../lib/db';
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

interface FollowResponse {
  success: boolean;
  following: boolean;
  followerCount: number;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FollowResponse | ApiError>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;

  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        error: 'Missing required field',
        details: [{ field: 'targetUserId', message: 'Target user ID is required' }]
      });
    }

    // Can't follow yourself
    if (targetUserId === userId) {
      return res.status(400).json({
        error: 'Invalid operation',
        details: [{ field: 'targetUserId', message: 'Cannot follow yourself' }]
      });
    }

    const targetUser = await getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const interactions = await read<SocialInteraction>('data/interactions.json');

    const existingFollow = interactions.find(
      interaction => 
        interaction.userId === userId && 
        interaction.targetId === targetUserId && 
        interaction.type === 'follow'
    );

    let following: boolean;
    let updatedInteractions: SocialInteraction[];

    if (existingFollow) {
      updatedInteractions = interactions.filter(
        interaction => interaction.id !== existingFollow.id
      );
      following = false;
    } else {
      const newFollow: SocialInteraction = {
        id: crypto.randomUUID(),
        userId,
        targetId: targetUserId,
        targetType: 'user',
        type: 'follow',
        timestamp: new Date().toISOString(),
        metadata: { targetUserName: targetUser.name }
      };
      updatedInteractions = [...interactions, newFollow];
      following = true;
    }

    await write('data/interactions.json', updatedInteractions);

    // Count total followers for this user
    const followerCount = updatedInteractions.filter(
      interaction => 
        interaction.targetId === targetUserId && 
        interaction.type === 'follow'
    ).length;

    // Add activity entries for both users
    if (following) {
      // Activity for the follower
      await addActivity({
        userId,
        action: 'user.followed',
        entityType: 'user',
        entityId: targetUserId,
        details: { 
          targetUserName: targetUser.name,
          targetUserEmail: targetUser.email
        }
      });

      // Activity for the target user (being followed)
      await addActivity({
        userId: targetUserId,
        action: 'user.gained_follower',
        entityType: 'user',
        entityId: userId,
        details: { 
          followerName: (await getUserById(userId))?.name,
          followerCount
        }
      });
    } else {
      // Activity for unfollowing
      await addActivity({
        userId,
        action: 'user.unfollowed',
        entityType: 'user',
        entityId: targetUserId,
        details: { 
          targetUserName: targetUser.name,
          followerCount
        }
      });
    }

    return res.status(200).json({
      success: true,
      following,
      followerCount,
      message: following ? 'User followed successfully' : 'User unfollowed successfully'
    });

  } catch (error) {
    console.error('Follow API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
