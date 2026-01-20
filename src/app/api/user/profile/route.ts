// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { secureRoute } from "@/lib/proxy";
import { prisma } from "@/lib/prisma";
import { updateUserProfileSchema } from "@/lib/validations";

// GET: Fetch current user details
export const GET = secureRoute(async (req, session) => {
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      onboarding: true,
      createdAt: true,
      // Exclude sensitive fields like passwordHash
    },
  });

  return NextResponse.json(user);
});

// PATCH: Update profile settings
export const PATCH = secureRoute(async (req, session) => {
  try {
    const body = await req.json();
    const data = updateUserProfileSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session?.user?.id },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
  }
});
