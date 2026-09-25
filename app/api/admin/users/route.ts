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
    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    const counts = await db
      .collection("documents")
      .aggregate([{ $group: { _id: "$userId", count: { $sum: 1 } } }])
      .toArray();

    const countMap = new Map(
      counts.map((item) => [item._id.toString(), item.count])
    );

    return NextResponse.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        notes: countMap.get(user._id.toString()) || 0,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
