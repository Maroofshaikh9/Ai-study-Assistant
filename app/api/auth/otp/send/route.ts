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
    
    // Check if a VERIFIED user already exists
    const existingUser = await db.collection("users").findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified !== false) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in instead." },
        { status: 400 }
      );
    }

    // Check rate limit: if otpRequestedAt is within last 60 seconds
    if (existingUser && existingUser.otpRequestedAt) {
      const timeSinceLastRequest = Date.now() - new Date(existingUser.otpRequestedAt).getTime();
      if (timeSinceLastRequest < 60000) {
        return NextResponse.json(
          { error: "Please wait 60 seconds before requesting another code." },
          { status: 429 }
        );
      }
    }

    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Send email
    await sendOtpEmail({ to: normalizedEmail, otp });

    // Store unverified user with OTP
    if (existingUser) {
      await db.collection("users").updateOne(
        { email: normalizedEmail },
        {
          $set: {
            otpHash,
            otpExpires,
            otpRequestedAt: new Date(),
            failedOtpAttempts: 0,
            otpPurpose: "signup",
          },
        }
      );
    } else {
      await db.collection("users").insertOne({
        email: normalizedEmail,
        isVerified: false,
        role: "student", // Default role
        otpHash,
        otpExpires,
        otpRequestedAt: new Date(),
        failedOtpAttempts: 0,
        otpPurpose: "signup",
        createdAt: new Date(),
        failedLoginAttempts: 0,
      });
    }

    return NextResponse.json({ message: "Verification code sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
