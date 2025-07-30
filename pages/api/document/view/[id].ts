import { NextApiRequest, NextApiResponse } from 'next';
import { getDocumentById, getUserById } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';
import fs from 'fs';
import path from 'path';
import pako from 'pako';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, type } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Document ID is required' });
  }

  try {
    const document = await getDocumentById(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.isPublic && document.userId !== user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (type === 'details') {
      const author = await getUserById(document.userId);
      const enrichedDocument = {
        ...document,
        author: {
          name: author.name,
          avatarUrl: author.avatarUrl,
        },
      };
      return res.status(200).json(enrichedDocument);
    }

    const filePath = path.join(process.cwd(), document.filePath);
    const fileExtension = path.extname(document.fileName).toLowerCase();

    if (fs.existsSync(filePath)) {
      const compressedContent = fs.readFileSync(filePath);
      const decompressedContent = pako.inflate(compressedContent);
      
      if (fileExtension === '.txt' || fileExtension === '.md') {
        const content = Buffer.from(decompressedContent).toString('utf-8');
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(content);
      } else {
        res.setHeader('Content-Type', document.type);
        res.setHeader('Content-Disposition', `inline; filename="${document.fileName}"`);
        res.setHeader('Content-Length', decompressedContent.length);
        res.send(Buffer.from(decompressedContent));
      }
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
