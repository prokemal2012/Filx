import { NextApiRequest, NextApiResponse } from 'next';

type Category = {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Category[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { read } = await import('../../lib/db');
    const documents = await read('data/documents.json');
    
    // Extract categories from document tags
    const categoryMap = new Map<string, number>();
    
    documents.forEach((doc: any) => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag: string) => {
          const count = categoryMap.get(tag) || 0;
          categoryMap.set(tag, count + 1);
        });
      }
    });

    // Define category icons and colors
    const categoryIcons: { [key: string]: { icon: string; color: string } } = {
      'Technology': { icon: '💻', color: 'bg-blue-100 text-blue-800' },
      'Science': { icon: '🔬', color: 'bg-green-100 text-green-800' },
      'Business': { icon: '💼', color: 'bg-purple-100 text-purple-800' },
      'Education': { icon: '📚', color: 'bg-orange-100 text-orange-800' },
      'Health': { icon: '🏥', color: 'bg-red-100 text-red-800' },
      'Arts': { icon: '🎨', color: 'bg-pink-100 text-pink-800' },
      'General': { icon: '📄', color: 'bg-gray-100 text-gray-800' }
    };

    // Convert to category objects
    const categories: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      count,
      icon: categoryIcons[name]?.icon || '📄',
      color: categoryIcons[name]?.color || 'bg-gray-100 text-gray-800'
    }));

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count);

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
