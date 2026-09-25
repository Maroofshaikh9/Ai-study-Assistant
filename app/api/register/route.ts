import { NextResponse } from "next/server";

export const runtime = "nodejs";
import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address, such as name@gmail.com." },
        { status: 400 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." },
        { status: 400 }
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@studymate.local")
      .trim()
      .toLowerCase();
    if (email === adminEmail) {
      return NextResponse.json(
        { error: "This email is reserved for the administrator." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db.collection("users").findOne({ email });

    // Ensure the user was created by the OTP flow and verified
    if (!existing || !existing.isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first before creating an account." },
        { status: 400 }
      );
    }
    
    // If they already have a password, they are already a full user
    if (existing.password) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").updateOne(
      { _id: existing._id },
      {
        $set: {
          name,
          password: hashedPassword,
          createdAt: new Date(),
          failedLoginAttempts: 0,
        }
      }
    );

    return NextResponse.json({ message: "Account created. You can log in now." });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Could not create the account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
