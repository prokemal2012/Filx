import { NextApiRequest, NextApiResponse } from 'next';
import { read } from '../../lib/db';

interface TrendingTopic {
  id: string;
  name: string;
  count: number;
  category?: string;
  growth?: number; // percentage growth
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read documents and interactions to calculate trending topics
    const documents = await read('data/documents.json');
    const activities = await read('data/activity.json');
    
    // Calculate trending topics based on document tags and recent activity
    const tagCounts: { [key: string]: number } = {};
    const recentActivity: { [key: string]: number } = {};
    
    // Count tags from documents
    documents.forEach((doc: any) => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
      
      if (doc.category) {
        tagCounts[doc.category] = (tagCounts[doc.category] || 0) + 1;
      }
    });
    
    // Count recent activity (last 7 days) to determine "trending" aspect
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    activities.forEach((activity: any) => {
      if (new Date(activity.createdAt) > sevenDaysAgo) {
        if (activity.entityType === 'document' && activity.details?.tags) {
          activity.details.tags.forEach((tag: string) => {
            recentActivity[tag] = (recentActivity[tag] || 0) + 1;
          });
        }
      }
    });
    
    // Generate trending topics combining overall count and recent activity
    const trendingTopics: TrendingTopic[] = Object.entries(tagCounts)
      .map(([tag, count]) => {
        const recentCount = recentActivity[tag] || 0;
        const growth = count > 0 ? (recentCount / count) * 100 : 0;
        
        return {
          id: tag.toLowerCase().replace(/\s+/g, '-'),
          name: tag,
          count,
          growth: Math.round(growth),
          category: getCategoryForTag(tag)
        };
      })
      .sort((a, b) => {
        // Sort by growth first, then by total count
        if (b.growth !== a.growth) {
          return b.growth - a.growth;
        }
        return b.count - a.count;
      })
      .slice(0, 20); // Top 20 trending topics
    
    // Add some default trending topics if we don't have enough data
    if (trendingTopics.length < 5) {
      const defaultTopics = [
        { id: 'ai-ml', name: 'AI & ML', count: 15, growth: 45, category: 'Technology' },
        { id: 'web-development', name: 'Web Development', count: 12, growth: 32, category: 'Technology' },
        { id: 'data-science', name: 'Data Science', count: 10, growth: 28, category: 'Technology' },
        { id: 'design', name: 'Design', count: 8, growth: 22, category: 'Creative' },
        { id: 'business', name: 'Business', count: 7, growth: 18, category: 'Business' }
      ];
      
      // Add default topics that aren't already in the list
      defaultTopics.forEach(defaultTopic => {
        if (!trendingTopics.find(topic => topic.id === defaultTopic.id)) {
          trendingTopics.push(defaultTopic);
        }
      });
    }
    
    return res.status(200).json({
      topics: trendingTopics.slice(0, 10), // Return top 10
      total: trendingTopics.length,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    
    // Return fallback trending topics in case of error
    const fallbackTopics = [
      { id: 'ai-ml', name: 'AI & ML', count: 15, growth: 45, category: 'Technology' },
      { id: 'web-development', name: 'Web Development', count: 12, growth: 32, category: 'Technology' },
      { id: 'data-science', name: 'Data Science', count: 10, growth: 28, category: 'Technology' },
      { id: 'design', name: 'Design', count: 8, growth: 22, category: 'Creative' },
      { id: 'business', name: 'Business', count: 7, growth: 18, category: 'Business' }
    ];
    
    return res.status(200).json({
      topics: fallbackTopics,
      total: fallbackTopics.length,
      lastUpdated: new Date().toISOString(),
      fallback: true
    });
  }
}

function getCategoryForTag(tag: string): string {
  const lowerTag = tag.toLowerCase();
  
  if (lowerTag.includes('ai') || lowerTag.includes('ml') || lowerTag.includes('tech') || 
      lowerTag.includes('dev') || lowerTag.includes('code') || lowerTag.includes('programming')) {
    return 'Technology';
  }
  
  if (lowerTag.includes('design') || lowerTag.includes('art') || lowerTag.includes('creative')) {
    return 'Creative';
  }
  
  if (lowerTag.includes('business') || lowerTag.includes('marketing') || lowerTag.includes('finance')) {
    return 'Business';
  }
  
  if (lowerTag.includes('science') || lowerTag.includes('research') || lowerTag.includes('data')) {
    return 'Science';
  }
  
  if (lowerTag.includes('education') || lowerTag.includes('learning') || lowerTag.includes('tutorial')) {
    return 'Education';
  }
  
  return 'General';
}
