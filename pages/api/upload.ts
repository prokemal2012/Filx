import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import pako from 'pako';
import { addDocument, initializeDatabase, addActivity } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Disable default body parsing to handle file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initializeDatabase();

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      multiples: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error uploading file' });
      }

      try {
        // Get authenticated user
        const user = await getUserFromRequest(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const file = Array.isArray(files.file) ? files.file[0] : files.file as formidable.File;
        
        if (!file || !file.filepath) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(file.originalFilename || '');
        const fileName = `${timestamp}_${file.originalFilename || 'upload'}${extension}`;
        const compressedFileName = `${fileName}.compressed`;
        
        // Read, compress and save file
        const fileContent = await fs.readFile(file.filepath);
        const compressedContent = pako.deflate(fileContent);
        const compressedPath = path.join(process.cwd(), 'uploads', compressedFileName);
        await fs.writeFile(compressedPath, compressedContent);

        // Clean up original temporary file
        await fs.unlink(file.filepath);
        
        const relativePath = `/uploads/${compressedFileName}`;

        const newDocument = await addDocument({
          userId: user.userId,
          title: (Array.isArray(fields.title) ? fields.title[0] : fields.title as string) || file.originalFilename || 'Untitled',
          content: (Array.isArray(fields.content) ? fields.content[0] : fields.content as string) || '',
          description: (Array.isArray(fields.description) ? fields.description[0] : fields.description as string) || '',
          type: file.mimetype || 'application/octet-stream',
          size: file.size,
          tags: ((Array.isArray(fields.tags) ? fields.tags[0] : fields.tags as string) || '').split(',').filter(tag => tag.trim()),
          fileName: file.originalFilename || fileName,
          filePath: relativePath,
          thumbnailUrl: (Array.isArray(fields.thumbnailUrl) ? fields.thumbnailUrl[0] : fields.thumbnailUrl as string) || '',
          isPublic: (Array.isArray(fields.isPublic) ? fields.isPublic[0] : fields.isPublic as string) === 'true',
          category: (Array.isArray(fields.category) ? fields.category[0] : fields.category as string) || 'General',
          viewCount: 0,
          downloadCount: 0
        });

        // Add activity record
        await addActivity({
          userId: user.userId,
          action: 'document.created',
          entityType: 'document',
          entityId: newDocument.id,
          details: {
            title: newDocument.title,
            category: newDocument.category,
            fileType: newDocument.type
          }
        });

        res.status(201).json({
          message: 'File uploaded and document metadata created successfully',
          document: newDocument,
        });
      } catch (uploadError) {
        console.error('File processing error:', uploadError);
        res.status(500).json({ error: 'Error processing uploaded file' });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

