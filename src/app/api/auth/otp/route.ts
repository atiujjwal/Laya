// app/api/auth/otp/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateOTP } from "@/lib/tokens";
//TODO:  import { sendSMS } from '@/lib/sms'; // Implementation depends on Twilio/SNS
//TODO:  import { sendEmail } from '@/lib/mail'; // Implementation depends on Resend/Nodemailer

// Strict validation prevents injection attacks
const otpSchema = z.object({
  identifier: z.string().min(3, "Identifier is required"),
  type: z.enum(["email", "mobile"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, type } = otpSchema.parse(body);

    // Generate OTP (Database Write)
    const tokenData = await generateOTP(identifier);

    // Send via Provider (Abstracted)
    if (type === "mobile") {
      // await sendSMS(identifier, tokenData.token);
      console.log(`[DEV MODE] SMS to ${identifier}: ${tokenData.token}`);
    } else {
      // await sendEmail(identifier, tokenData.token);
      console.log(`[DEV MODE] Email to ${identifier}: ${tokenData.token}`);
    }

    return NextResponse.json({ success: true, message: "OTP Sent" });
  } catch (error) {
    console.error("OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Rate limit may be exceeded." },
      { status: 500 },
    );
  }
}
