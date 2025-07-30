import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getNotificationsByUserId, 
  addNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
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
        const notifications = await getNotificationsByUserId(userId);
        return res.status(200).json({ notifications });

      case 'POST':
        const { title, message, type, data, targetUserId } = req.body;
        
        if (!title || !message || !type) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const notification = await addNotification({
          userId: targetUserId || userId,
          title,
          message,
          type,
          data,
          read: false,
        });

        return res.status(201).json({ notification });

      case 'PUT':
        const { notificationId, markAll } = req.body;
        
        if (markAll) {
          const count = await markAllNotificationsAsRead(userId);
          return res.status(200).json({ message: `Marked ${count} notifications as read` });
        } else if (notificationId) {
          const updated = await markNotificationAsRead(notificationId);
          if (updated) {
            return res.status(200).json({ message: 'Notification marked as read' });
          } else {
            return res.status(404).json({ error: 'Notification not found' });
          }
        } else {
          return res.status(400).json({ error: 'Missing notificationId or markAll flag' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
