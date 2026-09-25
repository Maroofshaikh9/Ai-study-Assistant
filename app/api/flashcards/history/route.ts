import { NextResponse } from "next/server";
import { requireStudent, getOwnedDocument } from "@/lib/auth-guard";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const data = await request.json();
    const { documentId, cardCount, flashcards } = data;

    if (!documentId || !cardCount || !Array.isArray(flashcards)) {
      return NextResponse.json({ error: "Invalid flashcard data." }, { status: 400 });
    }

    // SEC-08: Validate document ownership
    const owned = await getOwnedDocument(auth.session.user.id, documentId);
    if ("error" in owned) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const documentName = owned.document.filename || String(data.documentName || "Notes");
    const db = await getDb();
    
    const result = await db.collection("flashcardHistory").insertOne({
      userId: auth.session.user.id,
      documentId,
      documentName,
      cardCount,
      flashcards,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, historyId: result.insertedId });
  } catch (error) {
    console.error("Failed to save flashcards:", error);
    return NextResponse.json({ error: "Could not save flashcards." }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const db = await getDb();
    const history = await db.collection("flashcardHistory")
      .find({ userId: auth.session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to load flashcard history:", error);
    return NextResponse.json({ error: "Could not load flashcard history." }, { status: 500 });
  }
}
