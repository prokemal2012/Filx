import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { 
  getDocumentsByUserId, 
  addDocument,
  addActivity,
  addInteraction,
  read,
  getUserById,
  getInteractionCounts,
  getUserInteractionStatus
} from '../../../lib/db';
import { 
  DocumentListResponse, 
  DocumentCreateRequest, 
  DocumentCreateResponse,
  ApiError 
} from '../../../types/api';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DocumentListResponse | DocumentCreateResponse | ApiError>
) {
  // For explore endpoint, return all public documents
  if (req.query.explore === 'true') {
    try {
      // Get current user for interaction status
      const token = await getToken({ req });
      const currentUserId = token?.sub || 'd0721b90-db82-4367-8909-74344287aece';
      
      const allDocuments = await read('data/documents.json');
      
      // Transform documents for explore page with real interaction data
      const exploreDocuments = await Promise.all(
        allDocuments.map(async (doc: any) => {
          const author = await getUserById(doc.userId);
          const interactionCounts = await getInteractionCounts(doc.id);
          const userStatus = await getUserInteractionStatus(currentUserId, doc.id);
          const isFollowing = await getUserInteractionStatus(currentUserId, doc.userId, 'follow');
          
          return {
            id: doc.id,
            title: doc.title,
            description: doc.description || (doc.content ? doc.content.substring(0, 200) + '...' : 'No description available'),
            author: author?.name || 'Unknown Author',
            authorId: author?.id || doc.userId,
            authorUsername: author?.username || author?.email?.split('@')[0] || 'unknown',
            authorAvatar: author?.avatarUrl || '/placeholder.svg',
            category: doc.tags?.[0] || doc.category || 'General',
            type: doc.type?.includes('pdf') ? 'PDF' : 'DOC',
            pages: Math.ceil((doc.content?.length || 1000) / 500),
            likes: interactionCounts.likes || 0,
            downloads: interactionCounts.downloads || 0,
            bookmarks: interactionCounts.bookmarks || 0,
            comments: interactionCounts.comments || 0,
            isLiked: userStatus.isLiked || false,
            isBookmarked: userStatus.isBookmarked || false,
            isFollowingAuthor: isFollowing.isFollowing || false,
            thumbnail: doc.thumbnailUrl || '/placeholder.svg',
            verified: author?.verified || false,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
          };
        })
      );
      
      return res.status(200).json(exploreDocuments);
    } catch (error) {
      console.error('Explore documents error:', error);
      return res.status(200).json([]);
    }
  }
  
  // For development, bypass authentication
  // const token = await getToken({ req });
  // if (!token || !token.sub) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  // const userId = token.sub;
  
  const userId = 'd0721b90-db82-4367-8909-74344287aece'; // Use real user ID

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetDocuments(req, res, userId);
      case 'POST':
        return await handleCreateDocument(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Documents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetDocuments(
  req: NextApiRequest,
  res: NextApiResponse<DocumentListResponse | ApiError>,
  userId: string
) {
  try {
    // Get query parameters for pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tag = req.query.tag as string;

    // Get all documents for the user
    let documents = await getDocumentsByUserId(userId);

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

    // Log interaction for analytics
    await addInteraction({
      userId,
      documentId: 'list', // Special case for list view
      type: 'view',
      metadata: { page, limit, search, tag, totalResults: documents.length }
    });

    return res.status(200).json({
      documents: paginatedDocuments,
      total: documents.length,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

async function handleCreateDocument(
  req: NextApiRequest,
  res: NextApiResponse<DocumentCreateResponse | ApiError>,
  userId: string
) {
  try {
    // Validate request body
    const { title, content, type, size, tags, description, category, fileName }: any = req.body;

    if (!title || !content || !type || typeof size !== 'number') {
      return res.status(400).json({
        error: 'Missing required fields',
        details: [
          { field: 'title', message: 'Title is required' },
          { field: 'content', message: 'Content is required' },
          { field: 'type', message: 'Type is required' },
          { field: 'size', message: 'Size must be a number' }
        ].filter(detail => {
          if (detail.field === 'title') return !title;
          if (detail.field === 'content') return !content;
          if (detail.field === 'type') return !type;
          if (detail.field === 'size') return typeof size !== 'number';
          return false;
        })
      });
    }

    // Validate file type (basic validation)
    const allowedTypes = [
      'text/plain', 'text/markdown', 'text/html', 'text/css', 'text/javascript',
      'application/json', 'application/xml', 'application/pdf',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: [{ field: 'type', message: `File type ${type} is not supported` }]
      });
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (size > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        details: [{ field: 'size', message: 'File size cannot exceed 50MB' }]
      });
    }

    // Create document metadata
    const document = await addDocument({
      userId,
      title: title.trim(),
      content: description || content,
      type,
      size,
      tags: tags?.map((tag: string) => tag.trim()) || []
    });

    // Log activity
    await addActivity({
      userId,
      action: 'document.created',
      entityType: 'document',
      entityId: document.id,
      details: { title: document.title, type: document.type, size: document.size }
    });

    // Log interaction
    await addInteraction({
      userId,
      documentId: document.id,
      type: 'edit',
      metadata: { action: 'create', size }
    });

    return res.status(201).json({
      message: 'Document metadata created successfully',
      document
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ error: 'Failed to create document' });
  }
}
