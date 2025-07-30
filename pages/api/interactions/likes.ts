import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { read, getDocumentById } from '../../../lib/db';
import { ApiError } from '../../../types/api';

// Extended interaction type for social features
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
  res: NextApiResponse<any[] | ApiError>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify user authentication
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;

  try {
    // Read current interactions
    const interactions = await read<SocialInteraction>('data/interactions.json');
    
    // Filter for user's likes on documents
    const userLikes = interactions.filter(
      interaction => 
        interaction.userId === userId && 
        interaction.type === 'like' &&
        interaction.targetType === 'document'
    );

    // Get document details for each liked document
    const likedDocuments = await Promise.all(
      userLikes.map(async (like) => {
        try {
          const document = await getDocumentById(like.targetId);
          if (document) {
            return {
              ...document,
              likedAt: like.timestamp,
              savedAt: new Date(like.timestamp).toLocaleDateString()
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching document ${like.targetId}:`, error);
          return null;
        }
      })
    );

    // Filter out null documents (documents that no longer exist)
    const validLikedDocuments = likedDocuments.filter(doc => doc !== null);

    // Sort by most recently liked
    validLikedDocuments.sort((a, b) => 
      new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime()
    );

    return res.status(200).json(validLikedDocuments);

  } catch (error) {
    console.error('Likes API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
