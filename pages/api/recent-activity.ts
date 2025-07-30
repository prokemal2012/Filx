import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/auth';
import { getRecentActivity, getUserById, getDocumentById } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const limit = parseInt(req.query.limit as string) || 10;
  const activities = await getRecentActivity(limit * 3); // Get more to filter
  
  // Filter to only show specific activity types
  const allowedActions = [
    'user.followed',
    'document.created', 
    'profile.updated',
    'document.liked',
    'document.bookmarked'
  ];
  
  // Filter to only show current user's activities with allowed actions
  const filteredActivities = activities.filter(activity => 
    activity.userId === user.userId && allowedActions.includes(activity.action)
  ).slice(0, limit); // Take only the requested limit after filtering
  
  const enrichedActivities = await Promise.all(filteredActivities.map(async (activity) => {
    const activityUser = await getUserById(activity.userId);
    let message = `${activityUser?.name} did something`;
    let type = 'activity';
    let document = null;
    
    if (activity.action === 'user.followed' && activity.details?.targetUserName) {
      message = `${activityUser?.name} started following ${activity.details.targetUserName}`;
      type = 'follow';
    } else if (activity.action === 'document.liked' && activity.details?.documentTitle) {
      message = `${activityUser?.name} liked "${activity.details.documentTitle}"`;
      type = 'like';
      document = activity.details.documentTitle;
    } else if (activity.action === 'document.bookmarked' && activity.details?.documentTitle) {
      message = `${activityUser?.name} bookmarked "${activity.details.documentTitle}"`;
      type = 'bookmark';
      document = activity.details.documentTitle;
    } else if (activity.action === 'document.created' && activity.details?.title) {
      message = `${activityUser?.name} uploaded "${activity.details.title}"`;
      type = 'upload';
      document = activity.details.title;
    } else if (activity.action === 'profile.updated') {
      message = `${activityUser?.name} updated their profile`;
      type = 'profile';
    }
    
    return {
      ...activity,
      message,
      type,
      document,
      avatar: activityUser?.avatarUrl || '/placeholder.svg',
      time: new Date(activity.timestamp).toLocaleString()
    };
  }));

  res.status(200).json(enrichedActivities);
}

