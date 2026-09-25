import { NextResponse } from "next/server";
import { requireStudent, getOwnedDocument } from "@/lib/auth-guard";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const data = await request.json();
    const { chatId, documentId, messages } = data;

    if (!documentId || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid chat data." }, { status: 400 });
    }

    // SEC-08: Validate document ownership
    const owned = await getOwnedDocument(auth.session.user.id, documentId);
    if ("error" in owned) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const documentName = owned.document.filename || String(data.documentName || "Notes");
    const db = await getDb();
    
    if (chatId) {
      await db.collection("chatHistory").updateOne(
        { _id: new ObjectId(chatId), userId: auth.session.user.id },
        { $set: { messages, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, chatId });
    } else {
      const result = await db.collection("chatHistory").insertOne({
        userId: auth.session.user.id,
        documentId,
        documentName,
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ success: true, chatId: result.insertedId });
    }
  } catch (error) {
    console.error("Failed to save chat:", error);
    return NextResponse.json({ error: "Could not save chat." }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const db = await getDb();
    const history = await db.collection("chatHistory")
      .find({ userId: auth.session.user.id })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return NextResponse.json({ error: "Could not load chat history." }, { status: 500 });
  }
}
