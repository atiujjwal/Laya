import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/db"; // Ensure this imports your db instance from Phase 0
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema"; // Import auth tables explicitly if needed by adapter types, though DrizzleAdapter handles most

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline", // Forces Google to return a Refresh Token
          prompt: "consent", // Required to get Refresh Token on subsequent logins
          scope:
            "openid profile email https://www.googleapis.com/auth/spreadsheets", //TODO: Added sheets scope for Phase 4
        },
      },
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; // Ensure User ID is available in the session
      }
      return session;
    },
  },
});
