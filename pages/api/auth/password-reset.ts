import { NextApiRequest, NextApiResponse } from 'next';
import { 
  getUserByEmail, 
  createPasswordReset, 
  getPasswordResetByToken, 
  markPasswordResetAsUsed,
  updateUser
} from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Create nodemailer transporter (you'll need to configure this with real email service)
const transporter = nodemailer.createTransport({
  // Configure with your email service (Gmail, SendGrid, etc.)
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
        // Request password reset
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        const user = await getUserByEmail(email);
        if (!user) {
          // Don't reveal if user exists for security
          return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
        }

        const passwordReset = await createPasswordReset(user.id);
        
        // Send password reset email
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${passwordReset.token}`;
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@filehub.com',
            to: email,
            subject: 'Password Reset Request',
            html: `
              <h2>Password Reset Request</h2>
              <p>You requested a password reset for your FileHub account.</p>
              <p>Click the link below to reset your password:</p>
              <a href="${resetUrl}">Reset Password</a>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `,
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Continue anyway - in production you might want to handle this differently
        }

        return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });

      case 'PUT':
        // Reset password with token
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
          return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const resetToken = await getPasswordResetByToken(token);
        if (!resetToken) {
          return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await hashPassword(newPassword);
        await updateUser(resetToken.userId, { password: hashedPassword });
        await markPasswordResetAsUsed(resetToken.id);

        return res.status(200).json({ message: 'Password reset successfully' });

      default:
        res.setHeader('Allow', ['POST', 'PUT']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Password reset API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
