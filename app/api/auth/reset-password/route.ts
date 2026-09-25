import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDb();
    const user = await db.collection("users").findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!user.otpHash || !user.otpExpires) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    if (user.otpPurpose !== "password_reset") {
      return NextResponse.json({ error: "Invalid reset request." }, { status: 400 });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    if ((user.failedOtpAttempts || 0) >= 5) {
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Reset password, clear OTP, unlock account, and clear failed attempts
    await db.collection("users").updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword, failedLoginAttempts: 0 },
        $unset: { otpHash: "", otpExpires: "", otpRequestedAt: "", failedOtpAttempts: "", lockedUntil: "" }
      }
    );

    return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
