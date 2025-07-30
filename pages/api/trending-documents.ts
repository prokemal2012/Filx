import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/auth';
import { read, getUserById } from '../../lib/db';

interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface DocumentStats {
  documentId: string;
  likes: number;
  bookmarks: number;
  views: number;
  downloads: number;
  score: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Read data
    const documents = await read('data/documents.json');
    const interactions = await read<SocialInteraction>('data/interactions.json');
    const users = await read('data/users.json');

    // Calculate document stats
    const documentStats = new Map<string, DocumentStats>();
    
    // Initialize stats for all documents
    documents.forEach(doc => {
      documentStats.set(doc.id, {
        documentId: doc.id,
        likes: 0,
        bookmarks: 0,
        views: 0,
        downloads: 0,
        score: 0
      });
    });

    // Count interactions
    interactions.forEach(interaction => {
      if (interaction.targetType === 'document') {
        const stats = documentStats.get(interaction.targetId);
        if (stats) {
          if (interaction.type === 'like') {
            stats.likes++;
          } else if (interaction.type === 'bookmark') {
            stats.bookmarks++;
          }
        }
      }
    });

    // Calculate trending score (likes * 3 + bookmarks * 2)
    documentStats.forEach(stats => {
      stats.score = (stats.likes * 3) + (stats.bookmarks * 2);
    });

    // Get top trending documents
    const trendingStats = Array.from(documentStats.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Enrich with document and author data
    const trendingDocuments = await Promise.all(
      trendingStats.map(async (stats) => {
        const document = documents.find(doc => doc.id === stats.documentId);
        if (!document) return null;

        const author = await getUserById(document.userId);
        
        return {
          id: document.id,
          title: document.title,
          description: document.description || document.content?.substring(0, 100) + '...',
          author: author?.name || 'Unknown Author',
          authorId: document.userId,
          authorAvatar: author?.avatarUrl || '/placeholder.svg',
          thumbnail: document.thumbnailUrl || '/placeholder.svg',
          category: document.category || document.tags?.[0] || 'General',
          type: document.type?.includes('pdf') ? 'PDF' : 'DOC',
          pages: Math.ceil((document.content?.length || 1000) / 500),
          likes: stats.likes,
          bookmarks: stats.bookmarks,
          views: stats.views,
          downloads: stats.downloads,
          score: stats.score,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt
        };
      })
    );

    // Filter out null results
    const validTrendingDocuments = trendingDocuments.filter(doc => doc !== null);

    return res.status(200).json(validTrendingDocuments);
  } catch (error) {
    console.error('Trending documents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
