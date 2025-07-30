import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { read, getDocumentById } from '../../../lib/db';
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

interface DocumentResponse {
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail?: string;
  category: string;
  type: string;
  pages: number;
  likes: number;
  downloads: number;
  verified?: boolean;
  savedAt?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | ApiError>
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

  const userId = user.userId;

  try {
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const interactions = await read<SocialInteraction>('data/interactions.json');

    // Get user's bookmarked documents
    const bookmarkInteractions = interactions.filter(
      interaction => 
        interaction.userId === userId && 
        interaction.type === 'bookmark' &&
        interaction.targetType === 'document'
    );

    // Sort by timestamp (most recent first)
    bookmarkInteractions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookmarks = bookmarkInteractions.slice(startIndex, endIndex);

    // Fetch document details for each bookmark
    const bookmarks: DocumentResponse[] = [];
    for (const bookmark of paginatedBookmarks) {
      const document = await getDocumentById(bookmark.targetId);
      if (document) {
        bookmarks.push(document);
      }
    }

    return res.status(200).json(bookmarks);

  } catch (error) {
    console.error('Bookmarks API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
