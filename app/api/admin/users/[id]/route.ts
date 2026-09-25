import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guard";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (params.id === auth.session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account." },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(params.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await db.collection("documents").deleteMany({ userId: user._id });
    await db.collection("users").deleteOne({ _id: user._id });

    return NextResponse.json({ message: "User deleted." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete the user.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
