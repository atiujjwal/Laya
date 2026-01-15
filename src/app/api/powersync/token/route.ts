import { auth } from "@/auth";
import { env } from "@/env";
import { PowerSyncBackend } from "@powersync/service";
import { NextResponse } from "next/server";

// Initialize PowerSync Backend SDK
// Ideally, the private key comes from env variables or a file mount
const powersync = new PowerSyncBackend({
  schema: {}, // Schema not strictly required just for token generation
  services: {
    // This allows the SDK to sign tokens using your private key
    // Ensure POWERSYNC_PRIVATE_KEY is set in .env.local with the content of your .pem file
    key: env.POWERSYNC_PRIVATE_KEY || "",
  },
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generate a JWT for the specific user
    // This token allows them to download ONLY their bucket (defined in sync_rules.yaml)
    const token = await powersync.grantRole(session.user.id, ["user"]);

    return NextResponse.json({
      token: token.token,
      expiresAt: token.expiresAt,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("PowerSync Token Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
