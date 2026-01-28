import { auth } from "../../auth"
import type { Session } from "next-auth"

/**
 * Fetch the current server session (may be null)
 */
export async function fetchSession(): Promise<Session | null> {
  const session = await auth()
  return session ?? null
}

/**
 * Fetch session and guarantee authentication
 * Throws if user is not logged in
 */
export async function requireSession(): Promise<Session> {
  const session = await fetchSession()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  return session
}
