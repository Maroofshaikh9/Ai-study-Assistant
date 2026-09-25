import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-guard";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const data = await request.json();
    const { chatId, documentId, documentName, messages } = data;

    if (!documentId || !documentName || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid chat data." }, { status: 400 });
    }

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
