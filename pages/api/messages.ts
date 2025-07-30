import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getMessagesBetweenUsers, 
  getConversations, 
  addMessage, 
  markMessageAsRead,
  addNotification,
  getUserById
} from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;

  try {
    switch (req.method) {
      case 'GET':
        const { otherUserId } = req.query;
        
        if (otherUserId) {
          // Get messages between two users
          const messages = await getMessagesBetweenUsers(userId, otherUserId as string);
          return res.status(200).json({ messages });
        } else {
          // Get all conversations
          const conversations = await getConversations(userId);
          
          // Enhance conversations with user details
          const enhancedConversations = await Promise.all(
            conversations.map(async (conv) => {
              const otherUser = await getUserById(conv.userId);
              return {
                ...conv,
                user: otherUser ? {
                  id: otherUser.id,
                  name: otherUser.name,
                  avatarUrl: otherUser.avatarUrl,
                } : null
              };
            })
          );
          
          return res.status(200).json({ conversations: enhancedConversations });
        }

      case 'POST':
        const { receiverId, content, type = 'text' } = req.body;
        
        if (!receiverId || !content) {
          return res.status(400).json({ error: 'Missing receiverId or content' });
        }

        const message = await addMessage({
          senderId: userId,
          receiverId,
          content,
          type,
          read: false,
        });

        // Create notification for receiver
        const receiver = await getUserById(receiverId);
        if (receiver) {
          await addNotification({
            userId: receiverId,
            type: 'message',
            title: 'New Message',
            message: `You have a new message from ${user.name}`,
            data: { messageId: message.id, senderId: userId },
            read: false,
          });
        }

        return res.status(201).json({ message });

      case 'PUT':
        const { messageId } = req.body;
        
        if (!messageId) {
          return res.status(400).json({ error: 'Missing messageId' });
        }

        const updated = await markMessageAsRead(messageId);
        if (updated) {
          return res.status(200).json({ message: 'Message marked as read' });
        } else {
          return res.status(404).json({ error: 'Message not found' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Messages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
