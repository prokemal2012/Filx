import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getUserById,
  createEmailVerification, 
  getEmailVerificationByToken, 
  markEmailAsVerified,
  updateUser
} from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        // Send verification email
        const user = await getUserFromRequest(req);
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const userRecord = await getUserById(user.userId);
        if (!userRecord) {
          return res.status(404).json({ error: 'User not found' });
        }

        if (userRecord.emailVerified) {
          return res.status(400).json({ error: 'Email already verified' });
        }

        const emailVerification = await createEmailVerification(user.userId);
        
        // Send verification email
        const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${emailVerification.token}`;
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@filehub.com',
            to: userRecord.email,
            subject: 'Verify Your Email Address',
            html: `
              <h2>Email Verification</h2>
              <p>Thank you for signing up for FileHub!</p>
              <p>Please click the link below to verify your email address:</p>
              <a href="${verifyUrl}">Verify Email</a>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create this account, please ignore this email.</p>
            `,
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Continue anyway
        }

        return res.status(200).json({ message: 'Verification email sent' });

      case 'PUT':
        // Verify email with token
        const { token } = req.body;
        
        if (!token) {
          return res.status(400).json({ error: 'Token is required' });
        }

        const emailVerification = await getEmailVerificationByToken(token);
        if (!emailVerification) {
          return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        await updateUser(emailVerification.userId, { emailVerified: true });
        await markEmailAsVerified(emailVerification.id);

        return res.status(200).json({ message: 'Email verified successfully' });

      default:
        res.setHeader('Allow', ['POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Email verification API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
