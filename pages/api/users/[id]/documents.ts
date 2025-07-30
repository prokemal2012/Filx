import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../../lib/auth';
import { getUserById, getDocumentsByUserId, initializeDatabase } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    const { id } = req.query;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Only support GET method
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Optional authentication - allow public access to user documents
    const currentUser = await getUserFromRequest(req);

    // Find the requested user
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tag = req.query.tag as string;

    // Get all documents for the user
    let documents = await getDocumentsByUserId(id);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      documents = documents.filter(doc => 
        doc.title.toLowerCase().includes(searchLower) ||
        doc.content.toLowerCase().includes(searchLower)
      );
    }

    // Apply tag filter if provided
    if (tag) {
      documents = documents.filter(doc => 
        doc.tags && doc.tags.includes(tag)
      );
    }

    // Sort by updatedAt descending (most recent first)
    documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocuments = documents.slice(startIndex, endIndex);

    return res.status(200).json({
      documents: paginatedDocuments,
      total: documents.length,
      page,
      limit,
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (error) {
    console.error('User documents API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
