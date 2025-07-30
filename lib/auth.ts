import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Verify a password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate a JWT
export const generateJWT = (payload: object): string => {
  const secret = process.env.JWT_SECRET || 'your_secret_key'; // Make sure to set an environment variable in production
  const expiresIn = '7d'; // 1-week expiry
  return jwt.sign(payload, secret, { expiresIn });
};

// Verify a JWT
export const verifyJWT = (token: string): object | string => {
  const secret = process.env.JWT_SECRET || 'your_secret_key';
  return jwt.verify(token, secret);
};

// Set authentication cookie
export const setAuthCookie = (res: NextApiResponse, token: string): void => {
  const cookie = serialize('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    path: '/'
  });
  res.setHeader('Set-Cookie', cookie);
};

// Clear authentication cookie
export const clearAuthCookie = (res: NextApiResponse): void => {
  const cookie = serialize('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/'
  });
  res.setHeader('Set-Cookie', cookie);
};

// Extract user from request (JWT)
export const getUserFromRequest = async (req: NextApiRequest): Promise<{ userId: string; email: string; name: string } | null> => {
  try {
    const authCookie = req.cookies.auth;
    if (!authCookie) {
      return null;
    }

    const decoded = verifyJWT(authCookie) as any;
    if (!decoded || !decoded.userId) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    return null;
  }
};

// Get user by email (for NextAuth)
export const getUserByEmail = async (email: string) => {
  const { getUserByEmail: dbGetUserByEmail } = await import('./db');
  return await dbGetUserByEmail(email);
};

