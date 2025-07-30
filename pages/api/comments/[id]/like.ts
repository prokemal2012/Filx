import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { read, write } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface CommentLike {
  id: string;
  commentId: string;
  userId: string;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: commentId } = req.query;

  if (!commentId || typeof commentId !== 'string') {
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

    // Read existing comment likes
    let commentLikes: CommentLike[] = [];
    try {
      commentLikes = await read('data/comment-likes.json');
    } catch (error) {
      commentLikes = [];
      await write('data/comment-likes.json', commentLikes);
    }

    // Check if user already liked this comment
    const existingLike = commentLikes.find(
      like => like.commentId === commentId && like.userId === userId
    );

    if (existingLike) {
      // Unlike - remove the like
      const updatedLikes = commentLikes.filter(
        like => !(like.commentId === commentId && like.userId === userId)
      );
      await write('data/comment-likes.json', updatedLikes);
      
      // Count remaining likes for this comment
      const likeCount = updatedLikes.filter(like => like.commentId === commentId).length;
      
      return res.status(200).json({
        liked: false,
        likeCount
      });
    } else {
      // Like - add new like
      const newLike: CommentLike = {
        id: uuidv4(),
        commentId,
        userId: userId,
        createdAt: new Date().toISOString()
      };
      
      commentLikes.push(newLike);
      await write('data/comment-likes.json', commentLikes);
      
      // Count likes for this comment
      const likeCount = commentLikes.filter(like => like.commentId === commentId).length;
      
      return res.status(200).json({
        liked: true,
        likeCount
      });
    }
  } catch (error) {
    console.error('Error handling comment like:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
