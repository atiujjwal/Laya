// auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import { validateOTP } from '@/lib/tokens';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' }, // JWT is required for the Edge compatibility
  providers: [
    // Google Provider (Critical for Phase 2 Sheets Sync)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent', // Forces refresh token generation
        },
      },
    }),

    // Custom OTP Provider (Mobile/Email)
    Credentials({
      name: 'OTP',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        code: { label: 'OTP Code', type: 'text' },
      },

      async authorize(credentials) {

        if (!credentials?.identifier || !credentials?.code) {
          throw new Error('Missing email or OTP');
        }

        const identifier = credentials.identifier as string;
        const code = credentials.code as string;

        // Verify the OTP against database
        const isValid = await validateOTP(identifier, code);

        if (!isValid) {
          throw new Error('Invalid or Expired OTP');
        }

        // Find or Create the user
        // We use 'upsert' to handle both signup and login seamlessly
        const user = await prisma.user.upsert({
          where: { email: identifier }, // Logic assumes identifier is email. For phone, we'd need a separate logic branch.
          update: {
            // Update logic if needed, e.g., lastLogin
          },
          create: {
            email: identifier,
            name: identifier.split('@')[0], // Default name
            onboarding: true,
          },
        });

        return user;
      },
    }),
  ],
  callbacks: {
    // Extend the JWT with Google Tokens (needed for Sheets Sync later)
    async jwt({ token, account }) {
      if (account) {
        if (account.access_token) token.accessToken = account.access_token;
        if (account.refresh_token) token.refreshToken = account.refresh_token;
      }
      return token;
    },
    // Expose User ID to the client session
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom login page (we will build this in Phase 7)
    error: '/error', // Error page
  },
});
