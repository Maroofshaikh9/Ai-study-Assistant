import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-guard";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const data = await request.json();
    const { documentId, documentName, length, summary } = data;

    if (!documentId || !documentName || !length || !summary) {
      return NextResponse.json({ error: "Invalid summary data." }, { status: 400 });
    }

    const db = await getDb();
    
    const result = await db.collection("summaryHistory").insertOne({
      userId: auth.session.user.id,
      documentId,
      documentName,
      length,
      summary,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, summaryId: result.insertedId });
  } catch (error) {
    console.error("Failed to save summary:", error);
    return NextResponse.json({ error: "Could not save summary." }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const db = await getDb();
    const summaries = await db.collection("summaryHistory")
      .find({ userId: auth.session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("Failed to load summary history:", error);
    return NextResponse.json({ error: "Could not load summary history." }, { status: 500 });
  }
}
