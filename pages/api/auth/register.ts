import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { hashPassword, generateJWT, setAuthCookie } from '../../../lib/auth';
import { getUserByEmail, addUser, initializeDatabase } from '../../../lib/db';

// Zod schema for request validation
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize database if needed
    await initializeDatabase();

    // Validate request body with Zod
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { email, password, name } = validationResult.data;

    // Check if user with this email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new user
    const newUser = await addUser({
      email,
      name,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateJWT({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    // Set JWT in HttpOnly cookie
    setAuthCookie(res, token);

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
