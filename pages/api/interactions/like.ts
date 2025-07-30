import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { 
  read, 
  write, 
  addActivity, 
  getDocumentById
} from '../../../lib/db';
import { ApiError } from '../../../types/api';

// Extended interaction type for social features
interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string; // documentId or userId for follows
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface LikeResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LikeResponse | ApiError>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify user authentication
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;

  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: 'Missing required field',
        details: [{ field: 'documentId', message: 'Document ID is required' }]
      });
    }

    // Verify document exists
    const document = await getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Read current interactions
    const interactions = await read<SocialInteraction>('data/interactions.json');
    
    // Check if user already liked this document
    const existingLike = interactions.find(
      interaction => 
        interaction.userId === userId && 
        interaction.targetId === documentId && 
        interaction.type === 'like'
    );

    let liked: boolean;
    let updatedInteractions: SocialInteraction[];

    if (existingLike) {
      // Unlike: remove the interaction
      updatedInteractions = interactions.filter(
        interaction => interaction.id !== existingLike.id
      );
      liked = false;
    } else {
      // Like: add new interaction
      const newLike: SocialInteraction = {
        id: crypto.randomUUID(),
        userId,
        targetId: documentId,
        targetType: 'document',
        type: 'like',
        timestamp: new Date().toISOString(),
        metadata: { 
          documentTitle: document.title,
          documentCategory: document.category,
          documentTags: document.tags || []
        }
      };
      updatedInteractions = [...interactions, newLike];
      liked = true;
    }

    // Update interactions file
    await write('data/interactions.json', updatedInteractions);

    // Count total likes for this document
    const likeCount = updatedInteractions.filter(
      interaction => 
        interaction.targetId === documentId && 
        interaction.type === 'like'
    ).length;

    // Add activity entry for feed rendering
    if (liked) {
      await addActivity({
        userId,
        action: 'document.liked',
        entityType: 'document',
        entityId: documentId,
        details: { 
          documentTitle: document.title,
          documentOwner: document.userId,
          likeCount 
        }
      });
    } else {
      // For unlike, we could add activity or just let it be silent
      await addActivity({
        userId,
        action: 'document.unliked',
        entityType: 'document',
        entityId: documentId,
        details: { 
          documentTitle: document.title,
          documentOwner: document.userId,
          likeCount 
        }
      });
    }

    return res.status(200).json({
      success: true,
      liked,
      likeCount,
      message: liked ? 'Document liked successfully' : 'Document unliked successfully'
    });

  } catch (error) {
    console.error('Like API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
