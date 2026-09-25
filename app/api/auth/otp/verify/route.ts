import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const db = await getDb();
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "No pending verification found for this email." }, { status: 400 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "This email is already verified. Please log in." }, { status: 400 });
    }

    if (!user.otpHash || !user.otpExpires) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (user.otpPurpose !== "signup") {
      return NextResponse.json({ error: "Invalid verification request." }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    if ((user.failedOtpAttempts || 0) >= 5) {
      // Clear OTP to force requesting a new one
      await db.collection("users").updateOne(
        { _id: user._id },
        { $unset: { otpHash: "", otpExpires: "" } }
      );
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new verification code." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, user.otpHash);

    if (!isValid) {
      await db.collection("users").updateOne(
        { _id: user._id },
        { $inc: { failedOtpAttempts: 1 } }
      );
      const remaining = 5 - ((user.failedOtpAttempts || 0) + 1);
      return NextResponse.json({ error: `Incorrect verification code. ${remaining} attempts remaining.` }, { status: 400 });
    }

    // OTP is valid. Mark as verified, clear OTP data.
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { isVerified: true },
        $unset: { otpHash: "", otpExpires: "", otpRequestedAt: "", failedOtpAttempts: "" }
      }
    );

    return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
