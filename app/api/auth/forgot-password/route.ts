import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendOtpEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address, such as name@gmail.com." },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // We intentionally don't reveal if the user exists or not for security,
    // but in a forgot password flow, we have to handle it gracefully.
    // The requirement says: "For forgot-password/OTP requests, use a safe response where appropriate so the endpoint cannot easily be abused for email enumeration."
    // However, if the user does exist, we send the email.
    
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (user) {
      // Check rate limit: if otpRequestedAt is within last 60 seconds
      if (user.otpRequestedAt) {
        const timeSinceLastRequest = Date.now() - new Date(user.otpRequestedAt).getTime();
        if (timeSinceLastRequest < 60000) {
          return NextResponse.json(
            { error: "Please wait 60 seconds before requesting another code." },
            { status: 429 }
          );
        }
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpHash = await bcrypt.hash(otp, 10);
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      await sendOtpEmail({ to: normalizedEmail, otp });

      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            otpHash,
            otpExpires,
            otpRequestedAt: new Date(),
            failedOtpAttempts: 0,
            otpPurpose: "password_reset",
          },
        }
      );
    }

    // Always return a success response to prevent email enumeration
    return NextResponse.json({ message: "If an account exists, a verification code has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot Password Send Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
