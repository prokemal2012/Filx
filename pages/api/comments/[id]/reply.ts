import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { read, write, getUserById, addActivity } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  parentId?: string; // For replies
  createdAt: string;
  updatedAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: parentCommentId } = req.query;

  if (!parentCommentId || typeof parentCommentId !== 'string') {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current user (development fallback)
    const token = await getToken({ req });
    const userId = token?.sub || '1'; // Use first user as fallback for development

    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Reply is too long (max 1000 characters)' });
    }

    // Read existing comments
    let comments: Comment[] = [];
    try {
      comments = await read('data/comments.json');
    } catch (error) {
      return res.status(404).json({ error: 'Comments not found' });
    }

    // Find the parent comment to get document ID
    const parentComment = comments.find(comment => comment.id === parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }

    // Create new reply
    const newReply: Comment = {
      id: uuidv4(),
      documentId: parentComment.documentId,
      userId: userId,
      content: content.trim(),
      parentId: parentCommentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to comments array
    comments.push(newReply);

    // Save to file
    await write('data/comments.json', comments);

    // Add activity log
    await addActivity({
      userId: userId,
      action: 'comment.replied',
      entityType: 'comment',
      entityId: newReply.id,
      details: { 
        documentId: parentComment.documentId,
        parentCommentId,
        replyLength: content.length 
      }
    });

    // Get author info for response
    const author = await getUserById(userId);
    const enrichedReply = {
      ...newReply,
      author: author ? {
        id: author.id,
        name: author.name,
        username: author.username || author.email?.split('@')[0] || 'unknown',
        avatar: author.avatarUrl || '/placeholder.svg',
        verified: author.verified || false
      } : null
    };

    return res.status(201).json({
      message: 'Reply created successfully',
      reply: enrichedReply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    return res.status(500).json({ error: 'Failed to create reply' });
  }
}
