import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth (Google)
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),

  // PowerSync (Sync Layer)
  // This is the private key used to sign tokens for the client.
  // Generate one using `openssl genrsa -out powersync-private.key 2048`
  POWERSYNC_PRIVATE_KEY: z.string().min(1).optional(),
  POWERSYNC_URL: z.string().url().default("http://localhost:8080"),

  // AI (Phase 3)
  OPENAI_API_KEY: z.string().optional(),

  // Node Environment
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

// Validate process.env
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
