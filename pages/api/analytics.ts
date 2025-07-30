import { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentAnalytics, getUserStats } from '@/lib/db';
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
    const { type, id } = req.query;

    if (type === 'document' && id) {
      const analytics = await getDocumentAnalytics(id as string);
      return res.status(200).json({ analytics });
    } else if (type === 'user' && id) {
      const stats = await getUserStats(id as string);
      return res.status(200).json({ stats });
    } else if (type === 'user') {
      // Get current user stats
      const stats = await getUserStats(user.userId);
      return res.status(200).json({ stats });
    } else {
      return res.status(400).json({ error: 'Invalid analytics type or missing id' });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
