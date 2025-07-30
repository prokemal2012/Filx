import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../lib/auth';
import { read, Document, User, Activity } from '../../lib/db';
import { ApiError } from '../../types/api';

interface SocialInteraction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'document' | 'user';
  type: 'like' | 'bookmark' | 'follow';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ExploreSection {
  id: string;
  title: string;
  type: 'trending' | 'recent' | 'popular_authors' | 'random_discovery' | 'categories';
  items: any[];
  totalCount: number;
}

interface ExploreResponse {
  sections: ExploreSection[];
  totalSections: number;
  userStats: {
    totalDocuments: number;
    totalUsers: number;
    totalCategories: number;
    userFollowing: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExploreResponse | ApiError>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;

  try {
    // Read all data
    const allDocuments = await read<Document>('data/documents.json');
    const allUsers = await read<User>('data/users.json');
    const allActivities = await read<Activity>('data/activity.json');
    const interactions = await read<SocialInteraction>('data/interactions.json');

    // Get user's following list
    const followedUserIds = interactions
      .filter(interaction => 
        interaction.userId === userId && 
        interaction.type === 'follow' &&
        interaction.targetType === 'user'
      )
      .map(interaction => interaction.targetId);

    // Filter public documents
    const publicDocuments = allDocuments.filter(doc => doc.isPublic);
    
    const sections: ExploreSection[] = [];

    // 1. TRENDING DOCUMENTS (based on recent interactions)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentInteractions = interactions.filter(i => 
      new Date(i.timestamp) > sevenDaysAgo && i.targetType === 'document'
    );

    const documentScores = new Map<string, number>();
    recentInteractions.forEach(interaction => {
      const docId = interaction.targetId;
      const current = documentScores.get(docId) || 0;
      const score = interaction.type === 'like' ? 3 : interaction.type === 'bookmark' ? 2 : 1;
      documentScores.set(docId, current + score);
    });

    const trendingDocs = Array.from(documentScores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([docId]) => publicDocuments.find(d => d.id === docId))
      .filter(Boolean)
      .map(doc => {
        const author = allUsers.find(u => u.id === doc!.userId);
        return {
          ...doc,
          author: author ? {
            id: author.id,
            name: author.name,
            avatarUrl: author.avatarUrl
          } : null,
          score: documentScores.get(doc!.id) || 0
        };
      });

    sections.push({
      id: 'trending',
      title: 'Trending Now',
      type: 'trending',
      items: trendingDocs,
      totalCount: trendingDocs.length
    });

    // 2. RECENT UPLOADS
    const recentUploads = publicDocuments
      .filter(doc => doc.userId !== userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map(doc => {
        const author = allUsers.find(u => u.id === doc.userId);
        return {
          ...doc,
          author: author ? {
            id: author.id,
            name: author.name,
            avatarUrl: author.avatarUrl
          } : null,
          isNew: (Date.now() - new Date(doc.createdAt).getTime()) < (24 * 60 * 60 * 1000) // Less than 24h old
        };
      });

    sections.push({
      id: 'recent',
      title: 'Recently Added',
      type: 'recent',
      items: recentUploads,
      totalCount: recentUploads.length
    });

    // 3. POPULAR AUTHORS
    const authorDocCounts = publicDocuments.reduce((acc, doc) => {
      acc[doc.userId] = (acc[doc.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const authorLikeCounts = interactions
      .filter(i => i.type === 'like' && i.targetType === 'document')
      .reduce((acc, interaction) => {
        const doc = publicDocuments.find(d => d.id === interaction.targetId);
        if (doc) {
          acc[doc.userId] = (acc[doc.userId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    const popularAuthors = allUsers
      .filter(author => author.id !== userId && !followedUserIds.includes(author.id))
      .map(author => ({
        ...author,
        documentCount: authorDocCounts[author.id] || 0,
        likesReceived: authorLikeCounts[author.id] || 0,
        popularityScore: (authorDocCounts[author.id] || 0) + (authorLikeCounts[author.id] || 0) * 2
      }))
      .filter(author => author.documentCount > 0)
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 6)
      .map(author => ({
        id: author.id,
        name: author.name,
        avatarUrl: author.avatarUrl,
        bio: author.bio,
        documentCount: author.documentCount,
        likesReceived: author.likesReceived,
        isFollowing: false
      }));

    sections.push({
      id: 'popular_authors',
      title: 'Popular Authors',
      type: 'popular_authors',
      items: popularAuthors,
      totalCount: popularAuthors.length
    });

    // 4. CATEGORIES OVERVIEW
    const categories = publicDocuments
      .filter(doc => doc.category)
      .reduce((acc, doc) => {
        const category = doc.category!;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            documentCount: 0,
            recentDocuments: [],
            authors: new Set<string>()
          };
        }
        acc[category].documentCount++;
        acc[category].authors.add(doc.userId);
        
        // Keep track of recent documents for preview
        if (acc[category].recentDocuments.length < 3) {
          const author = allUsers.find(u => u.id === doc.userId);
          acc[category].recentDocuments.push({
            ...doc,
            author: author ? {
              id: author.id,
              name: author.name,
              avatarUrl: author.avatarUrl
            } : null
          });
        }
        
        return acc;
      }, {} as Record<string, any>);

    const categoryItems = Object.values(categories)
      .map((cat: any) => ({
        ...cat,
        authorCount: cat.authors.size,
        authors: undefined // Remove Set object
      }))
      .sort((a: any, b: any) => b.documentCount - a.documentCount)
      .slice(0, 6);

    sections.push({
      id: 'categories',
      title: 'Browse by Category',
      type: 'categories',
      items: categoryItems,
      totalCount: Object.keys(categories).length
    });

    // 5. RANDOM DISCOVERY (serendipity section)
    const randomDocuments = publicDocuments
      .filter(doc => doc.userId !== userId)
      .sort(() => Math.random() - 0.5) // Simple randomization
      .slice(0, 6)
      .map(doc => {
        const author = allUsers.find(u => u.id === doc.userId);
        return {
          ...doc,
          author: author ? {
            id: author.id,
            name: author.name,
            avatarUrl: author.avatarUrl
          } : null,
          discoveryReason: getRandomDiscoveryReason()
        };
      });

    sections.push({
      id: 'random_discovery',
      title: 'Discover Something New',
      type: 'random_discovery',
      items: randomDocuments,
      totalCount: randomDocuments.length
    });

    // Calculate user stats
    const userStats = {
      totalDocuments: publicDocuments.length,
      totalUsers: allUsers.length,
      totalCategories: Object.keys(categories).length,
      userFollowing: followedUserIds.length
    };

    return res.status(200).json({
      sections,
      totalSections: sections.length,
      userStats
    });

  } catch (error) {
    console.error('Explore API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getRandomDiscoveryReason(): string {
  const reasons = [
    'Hidden gem',
    'Underrated content',
    'Unique perspective',
    'Creative approach',
    'Worth exploring',
    'Fresh take',
    'Interesting find',
    'Community favorite'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}
