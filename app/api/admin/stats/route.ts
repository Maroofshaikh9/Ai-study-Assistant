import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const db = await getDb();
    const users = await db.collection("users").countDocuments({ role: "student" });
    const admins = await db.collection("users").countDocuments({ role: "admin" });
    const notes = await db.collection("documents").countDocuments();

    return NextResponse.json({ users, admins, notes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load statistics.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
