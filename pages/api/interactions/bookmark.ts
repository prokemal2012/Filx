import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { 
  read, 
  write, 
  addActivity, 
  getDocumentById
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

interface BookmarkResponse {
  success: boolean;
  bookmarked: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookmarkResponse | ApiError>
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
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: 'Missing required field',
        details: [{ field: 'documentId', message: 'Document ID is required' }]
      });
    }

    const document = await getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const interactions = await read<SocialInteraction>('data/interactions.json');

    const existingBookmark = interactions.find(
      interaction => 
        interaction.userId === userId && 
        interaction.targetId === documentId && 
        interaction.type === 'bookmark'
    );

    let bookmarked: boolean;
    let updatedInteractions: SocialInteraction[];

    if (existingBookmark) {
      updatedInteractions = interactions.filter(
        interaction => interaction.id !== existingBookmark.id
      );
      bookmarked = false;
    } else {
      const newBookmark: SocialInteraction = {
        id: crypto.randomUUID(),
        userId,
        targetId: documentId,
        targetType: 'document',
        type: 'bookmark',
        timestamp: new Date().toISOString(),
        metadata: { documentTitle: document.title }
      };
      updatedInteractions = [...interactions, newBookmark];
      bookmarked = true;
    }

    await write('data/interactions.json', updatedInteractions);

    if (bookmarked) {
      await addActivity({
        userId,
        action: 'document.bookmarked',
        entityType: 'document',
        entityId: documentId,
        details: { documentTitle: document.title }
      });
    }

    return res.status(200).json({
      success: true,
      bookmarked,
      message: bookmarked ? 'Document bookmarked successfully' : 'Document unbookmarked successfully'
    });

  } catch (error) {
    console.error('Bookmark API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
