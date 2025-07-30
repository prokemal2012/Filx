import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import pako from 'pako';
import { getUserFromRequest } from '../../../lib/auth';
import { updateUser, getUserById } from '../../../lib/db';

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
    // Get authenticated user
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit for avatars
      multiples: false,
      filter: function (part) {
        // Only allow image files
        return part.mimetype?.startsWith('image/') || false;
      }
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error uploading file' });
      }

      try {
        const file = Array.isArray(files.avatar) ? files.avatar[0] : files.avatar as formidable.File;
        
        if (!file || !file.filepath) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate file type
        if (!file.mimetype?.startsWith('image/')) {
          return res.status(400).json({ error: 'Only image files are allowed' });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(file.originalFilename || '');
        const fileName = `avatar_${user.userId}_${timestamp}${extension}`;
        const compressedFileName = `${fileName}.compressed`;
        
        // Read, compress and save file
        const fileContent = await fs.readFile(file.filepath);
        const compressedContent = pako.deflate(fileContent);
        const compressedPath = path.join(process.cwd(), 'uploads', compressedFileName);
        await fs.writeFile(compressedPath, compressedContent);

        // Clean up original temporary file
        await fs.unlink(file.filepath);
        
        const avatarUrl = `/uploads/${compressedFileName}`;

        // Update user's avatar URL in database
        const updatedUser = await updateUser(user.userId, { avatarUrl });
        
        if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
          message: 'Avatar uploaded successfully',
          avatarUrl,
          user: { ...updatedUser, password: undefined }
        });
      } catch (uploadError) {
        console.error('File processing error:', uploadError);
        res.status(500).json({ error: 'Error processing uploaded file' });
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
