import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const generateOTP = async (identifier: string) => {
  // Clean up old tokens
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  // Generate secure code
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 10 * 60 * 1000); // 10 mins

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return verificationToken;
};

export const validateOTP = async (identifier: string, token: string) => {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier, token },
  });

  if (!existingToken) return false;

  const hasExpired = new Date() > existingToken.expires;

  await prisma.verificationToken.delete({
    where: {
      identifier_token: { identifier, token },
    },
  });

  if (hasExpired) return false;

  return true;
};
