import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { getUserFromRequest } from '../../../lib/auth';
import { getUserById, updateUser, initializeDatabase } from '../../../lib/db';
import { userProfileValidation, cleanUrlFields, sanitizeString, isAllowedImageDomain } from '../../../lib/validation';

// Zod schema for PATCH request validation
const updateUserSchema = z.object({
  name: userProfileValidation.name.optional(),
  bio: userProfileValidation.bio.optional(),
  avatarUrl: userProfileValidation.avatarUrl.optional(),
  coverUrl: userProfileValidation.coverUrl.optional(),
  location: userProfileValidation.location.optional(),
  website: userProfileValidation.website.optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize database if needed
    await initializeDatabase();

    const { id } = req.query;
    
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // GET - Retrieve user profile
    if (req.method === 'GET') {
      // Find the requested user
      const user = await getUserById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get interactions data to calculate stats
      const { read } = require('../../../lib/db');
      const interactions = await read('data/interactions.json');
      
      const followerCount = interactions.filter((i: any) => 
        i.targetId === id && i.targetType === 'user' && i.type === 'follow'
      ).length;
      
      const followingCount = interactions.filter((i: any) => 
        i.userId === id && i.targetType === 'user' && i.type === 'follow'
      ).length;

      // Get document count
      const documents = await read('data/documents.json');
      const documentCount = documents.filter((d: any) => d.authorId === id).length;

      // Return user profile without password but with stats
      const { password, ...baseProfile } = user;
      const userProfile = {
        ...baseProfile,
        avatar: baseProfile.avatarUrl,
        bio: baseProfile.bio || '',
        location: baseProfile.location || '',
        website: baseProfile.website || '',
        joinedAt: baseProfile.createdAt,
        followers: followerCount,
        following: followingCount,
        documents: documentCount,
        verified: baseProfile.verified || false
      };
      
      res.status(200).json(userProfile);
      return;
    }

    // PATCH - Update user profile
    if (req.method === 'PATCH') {
      // Get the requesting user from JWT
      const currentUser = await getUserFromRequest(req);
      
      // Check if user is authenticated
      if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if the user is trying to update their own profile
      if (currentUser.userId !== id) {
        return res.status(403).json({ error: 'You can only update your own profile' });
      }

      // Validate request body with Zod
      const validationResult = updateUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      let updates = validationResult.data;

      // Sanitize string fields
      if (updates.name) {
        updates.name = sanitizeString(updates.name);
      }
      if (updates.bio) {
        updates.bio = sanitizeString(updates.bio);
      }

      // Additional URL validation for security (check allowed domains)
      if (updates.avatarUrl && updates.avatarUrl !== '' && !isAllowedImageDomain(updates.avatarUrl)) {
        return res.status(400).json({ 
          error: 'Avatar URL from unauthorized domain',
          details: [{ field: 'avatarUrl', message: 'Please use an image from an allowed domain' }]
        });
      }
      
      if (updates.coverUrl && updates.coverUrl !== '' && !isAllowedImageDomain(updates.coverUrl)) {
        return res.status(400).json({ 
          error: 'Cover URL from unauthorized domain',
          details: [{ field: 'coverUrl', message: 'Please use an image from an allowed domain' }]
        });
      }

      // Clean URL fields (convert empty strings to null)
      const cleanedUpdates = cleanUrlFields(updates);

      // Update the user
      const updatedUser = await updateUser(id, cleanedUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Log profile update activity
      const { addActivity } = require('../../../lib/db');
      await addActivity({
        userId: currentUser.userId,
        action: 'profile.updated',
        entityType: 'user',
        entityId: currentUser.userId,
        details: { 
          updatedFields: Object.keys(cleanedUpdates),
          userName: updatedUser.name
        }
      });

      // Return updated user profile without password
      const { password, ...userProfile } = updatedUser;
      res.status(200).json({ 
        message: 'Profile updated successfully',
        user: userProfile 
      });
      return;
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('User API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
