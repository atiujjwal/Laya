// lib/proxy.ts

import { NextResponse } from "next/server";
import { Session } from "next-auth";
import { auth } from "../../auth";

type AuthorizedRouteHandler = (
  req: Request,
  session: Session,
) => Promise<NextResponse>;

/**
 * secureRoute: Wraps an API handler to enforce authentication.
 * Returns 401 if not logged in.
 * Passes the 'session' object to the handler if successful.
 */
export function secureRoute(handler: AuthorizedRouteHandler) {
  return async (req: Request) => {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, session);
  };
}
