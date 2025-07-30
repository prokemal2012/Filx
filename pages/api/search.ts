import { NextApiRequest, NextApiResponse } from 'next';
import { searchDocuments, searchUsers } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { q, type = 'all', tags, category, userId, dateFrom, dateTo } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = q as string;
    const results: any = {};

    if (type === 'documents' || type === 'all') {
      const filters = {
        tags: tags ? (tags as string).split(',') : undefined,
        category: category as string,
        userId: userId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      };

      results.documents = await searchDocuments(query, filters);
    }

    if (type === 'users' || type === 'all') {
      results.users = await searchUsers(query);
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
