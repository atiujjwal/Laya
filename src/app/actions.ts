'use server';

import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function generateAndSendOTP(email: string) {
  // 1. Generate a random 6-digit code
  const otp = randomBytes(3).toString('hex').toUpperCase(); // Simple example
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  try {
    // 2. Store in DB (Assuming you have a VerificationToken model from PrismaAdapter)
    // If using a custom model, adjust accordingly.
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: otp,
        expires: expiresAt,
      },
    });

    // 3. Send Email (Mocking this part - integrate Resend/SendGrid here)
    console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to generate OTP:', error);
    return { success: false, error: 'Failed to send OTP' };
  }
}
