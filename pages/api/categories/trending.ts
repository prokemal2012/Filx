import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { read, Document, User, Activity } from '../../../lib/db';
import { ApiError } from '../../../types/api';

interface CategoryStats {
  category: string;
  documentCount: number;
  recentDocuments: Array<Document & { author: Pick<User, 'id' | 'name' | 'avatarUrl'> }>;
  recentActivity: number; // activities in last 7 days
  topContributors: Array<Pick<User, 'id' | 'name' | 'avatarUrl'> & { documentCount: number }>;
  description: string;
}

interface TrendingCategoriesResponse {
  categories: CategoryStats[];
  total: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrendingCategoriesResponse | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Read all data
    const allDocuments = await read<Document>('data/documents.json');
    const allUsers = await read<User>('data/users.json');
    const allActivities = await read<Activity>('data/activity.json');

    // Filter public documents only
    const publicDocuments = allDocuments.filter(doc => doc.isPublic && doc.category);

    // Group documents by category
    const categoryGroups = publicDocuments.reduce((acc, doc) => {
      const category = doc.category!;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    // Calculate stats for each category
    const categoryStats: CategoryStats[] = [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const [category, documents] of Object.entries(categoryGroups)) {
      // Get recent documents (last 5)
      const recentDocs = documents
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      // Enrich with author info
      const recentDocuments = recentDocs.map(doc => {
        const author = allUsers.find(u => u.id === doc.userId);
        return {
          ...doc,
          author: author ? {
            id: author.id,
            name: author.name,
            avatarUrl: author.avatarUrl
          } : {
            id: doc.userId,
            name: 'Unknown User',
            avatarUrl: undefined
          }
        };
      });

      // Count recent activity
      const categoryDocIds = documents.map(d => d.id);
      const recentActivity = allActivities.filter(activity => 
        new Date(activity.timestamp) > sevenDaysAgo &&
        activity.entityType === 'document' &&
        categoryDocIds.includes(activity.entityId)
      ).length;

      // Find top contributors
      const userDocCounts = documents.reduce((acc, doc) => {
        acc[doc.userId] = (acc[doc.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topContributors = Object.entries(userDocCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([userId, count]) => {
          const user = allUsers.find(u => u.id === userId);
          return {
            id: userId,
            name: user?.name || 'Unknown User',
            avatarUrl: user?.avatarUrl,
            documentCount: count
          };
        });

      categoryStats.push({
        category,
        documentCount: documents.length,
        recentDocuments,
        recentActivity,
        topContributors,
        description: `${documents.length} documents with ${recentActivity} recent activities`
      });
    }

    // Sort by a combination of document count and recent activity
    categoryStats.sort((a, b) => {
      const scoreA = a.documentCount + (a.recentActivity * 2);
      const scoreB = b.documentCount + (b.recentActivity * 2);
      return scoreB - scoreA;
    });

    // Apply limit
    const limitedCategories = categoryStats.slice(0, limit);

    return res.status(200).json({
      categories: limitedCategories,
      total: categoryStats.length
    });

  } catch (error) {
    console.error('Trending categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
