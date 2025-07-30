import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  addActivity,
  addInteraction
} from '../../../lib/db';
import { 
  DocumentResponse, 
  DocumentUpdateRequest, 
  DocumentUpdateResponse,
  DocumentDeleteResponse,
  ApiError 
} from '../../../types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DocumentResponse | DocumentUpdateResponse | DocumentDeleteResponse | ApiError>
) {
  // Verify user authentication
  const user = await getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = user.userId;
  const documentId = req.query.id as string;

  if (!documentId) {
    return res.status(400).json({ error: 'Document ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetDocument(req, res, userId, documentId);
      case 'PATCH':
        return await handleUpdateDocument(req, res, userId, documentId);
      case 'DELETE':
        return await handleDeleteDocument(req, res, userId, documentId);
      default:
        res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Document API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetDocument(
  req: NextApiRequest,
  res: NextApiResponse<DocumentResponse | ApiError>,
  userId: string,
  documentId: string
) {
  try {
    const document = await getDocumentById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document or if it's public
    if (document.userId !== userId && !document.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get author information
    const { getUserById } = require('../../../lib/db');
    const author = await getUserById(document.userId);

    // Enhance document with author information
    const enrichedDocument = {
      ...document,
      author: author ? {
        id: author.id,
        name: author.name,
        username: author.username || author.email?.split('@')[0] || 'unknown',
        avatar: author.avatarUrl || '/placeholder.svg'
      } : {
        id: document.userId,
        name: 'Unknown Author',
        username: 'unknown',
        avatar: '/placeholder.svg'
      }
    };

    // Log interaction for analytics
    await addInteraction({
      userId,
      documentId,
      type: 'view',
      metadata: { action: 'get', documentTitle: document.title }
    });

    return res.status(200).json(enrichedDocument);
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ error: 'Failed to fetch document' });
  }
}

async function handleUpdateDocument(
  req: NextApiRequest,
  res: NextApiResponse<DocumentUpdateResponse | ApiError>,
  userId: string,
  documentId: string
) {
  try {
    const existingDocument = await getDocumentById(documentId);

    if (!existingDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (existingDocument.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate request body
    const updates: DocumentUpdateRequest = req.body;
    const { title, content, type, size, tags } = updates;

    // Validate fields if provided
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({
        error: 'Invalid input',
        details: [{ field: 'title', message: 'Title cannot be empty' }]
      });
    }

    if (type !== undefined) {
      const allowedTypes = [
        'text/plain', 'text/markdown', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml', 'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav'
      ];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          error: 'Invalid file type',
          details: [{ field: 'type', message: `File type ${type} is not supported` }]
        });
      }
    }

    if (size !== undefined) {
      if (typeof size !== 'number' || size < 0) {
        return res.status(400).json({
          error: 'Invalid input',
          details: [{ field: 'size', message: 'Size must be a non-negative number' }]
        });
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          details: [{ field: 'size', message: 'File size cannot exceed 10MB' }]
        });
      }
    }

    // Prepare update object
    const updateData: Partial<DocumentUpdateRequest> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (size !== undefined) updateData.size = size;
    if (tags !== undefined) updateData.tags = tags.map(tag => tag.trim());

    // Update document
    const updatedDocument = await updateDocument(documentId, updateData);

    if (!updatedDocument) {
      return res.status(500).json({ error: 'Failed to update document' });
    }

    // Log activity
    await addActivity({
      userId,
      action: 'document.updated',
      entityType: 'document',
      entityId: documentId,
      details: { 
        updatedFields: Object.keys(updateData),
        title: updatedDocument.title 
      }
    });

    // Log interaction
    await addInteraction({
      userId,
      documentId,
      type: 'edit',
      metadata: { 
        action: 'update', 
        updatedFields: Object.keys(updateData),
        documentTitle: updatedDocument.title
      }
    });

    return res.status(200).json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ error: 'Failed to update document' });
  }
}

async function handleDeleteDocument(
  req: NextApiRequest,
  res: NextApiResponse<DocumentDeleteResponse | ApiError>,
  userId: string,
  documentId: string
) {
  try {
    const existingDocument = await getDocumentById(documentId);

    if (!existingDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (existingDocument.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete document
    const deleted = await deleteDocument(documentId);

    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete document' });
    }

    // Log activity
    await addActivity({
      userId,
      action: 'document.deleted',
      entityType: 'document',
      entityId: documentId,
      details: { 
        title: existingDocument.title,
        type: existingDocument.type,
        size: existingDocument.size
      }
    });

    // Log interaction
    await addInteraction({
      userId,
      documentId,
      type: 'view', // We use 'view' as there's no 'delete' type in the enum
      metadata: { 
        action: 'delete',
        documentTitle: existingDocument.title
      }
    });

    return res.status(200).json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Failed to delete document' });
  }
}
