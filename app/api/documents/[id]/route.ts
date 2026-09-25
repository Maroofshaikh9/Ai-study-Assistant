import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireStudent } from "@/lib/auth-guard";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  try {
    const db = await getDb();
    const result = await db.collection("documents").deleteOne({
      _id: new ObjectId(params.id),
      userId: new ObjectId(auth.session.user.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted." });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete the note.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
