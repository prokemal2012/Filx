import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { verifyPassword, generateJWT, setAuthCookie } from '../../../lib/auth';
import { getUserByEmail, updateUser, initializeDatabase } from '../../../lib/db';

// Zod schema for request validation
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
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
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login timestamp
    await updateUser(user.id, {
      lastLoginAt: new Date().toISOString(),
    });

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    // Set JWT in HttpOnly cookie
    setAuthCookie(res, token);

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Login successful',
      user: {
        ...userWithoutPassword,
        lastLoginAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
