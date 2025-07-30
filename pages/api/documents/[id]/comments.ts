import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { read, write, getUserById, addActivity } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    verified: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: documentId } = req.query;

  if (!documentId || typeof documentId !== 'string') {
    return res.status(400).json({ error: 'Invalid document ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetComments(req, res, documentId);
      case 'POST':
        return await handleCreateComment(req, res, documentId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Comments API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetComments(
  req: NextApiRequest,
  res: NextApiResponse,
  documentId: string
) {
  try {
    // Read comments from file
    let comments: Comment[] = [];
    try {
      comments = await read('data/comments.json');
    } catch (error) {
      // If file doesn't exist, initialize empty array
      comments = [];
      await write('data/comments.json', comments);
    }

    // Filter comments for this document
    const documentComments = comments.filter(comment => comment.documentId === documentId);

    // Enrich comments with author information
    const enrichedComments = await Promise.all(
      documentComments.map(async (comment) => {
        const author = await getUserById(comment.userId);
        return {
          ...comment,
          likes: comment.likes || 0,
          timestamp: new Date(comment.createdAt).toLocaleString(),
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username || author.email?.split('@')[0] || 'unknown',
            avatar: author.avatarUrl || '/placeholder.svg',
            verified: author.verified || false
          } : {
            id: comment.userId,
            name: 'Unknown User',
            username: 'unknown', 
            avatar: '/placeholder.svg',
            verified: false
          }
        };
      })
    );

    // Sort by creation date (newest first)
    enrichedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      comments: enrichedComments,
      total: enrichedComments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

async function handleCreateComment(
  req: NextApiRequest,
  res: NextApiResponse,
  documentId: string
) {
  try {
    // Get current user from auth
    const token = await getToken({ req });
    const userId = token?.sub || '5'; // Use 'hiya' user as fallback for development

    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Comment is too long (max 1000 characters)' });
    }

    // Read existing comments
    let comments: Comment[] = [];
    try {
      comments = await read('data/comments.json');
    } catch (error) {
      comments = [];
    }

    // Create new comment
    const newComment: Comment = {
      id: uuidv4(),
      documentId,
      userId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to comments array
    comments.push(newComment);

    // Save to file
    await write('data/comments.json', comments);

    // Add activity log
    await addActivity({
      userId,
      action: 'comment.created',
      entityType: 'comment',
      entityId: newComment.id,
      details: { documentId, commentLength: content.length }
    });

    // Get author info for response
    const author = await getUserById(userId);
    const enrichedComment = {
      ...newComment,
      author: author ? {
        id: author.id,
        name: author.name,
        username: author.username || author.email?.split('@')[0] || 'unknown',
        avatarUrl: author.avatarUrl || '/placeholder.svg',
        verified: author.verified || false
      } : null
    };

    return res.status(201).json({
      message: 'Comment created successfully',
      comment: enrichedComment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
}
