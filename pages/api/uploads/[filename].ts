import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import pako from 'pako';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = req.query;
  
  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    const fullPath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!fs.statSync(fullPath).isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }

    // Check if file is compressed
    if (filename.endsWith('.compressed')) {
      const compressedContent = fs.readFileSync(fullPath);
      const decompressedContent = pako.inflate(compressedContent);

      // Get original file extension
      const originalExt = path.extname(filename.replace('.compressed', '')).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (originalExt) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
        default:
          contentType = 'image/jpeg'; // Default to JPEG for avatars
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', decompressedContent.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(Buffer.from(decompressedContent));
    } else {
      // Serve uncompressed file directly
      const content = fs.readFileSync(fullPath);
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.webp':
          contentType = 'image/webp';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', content.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(content);
    }
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
