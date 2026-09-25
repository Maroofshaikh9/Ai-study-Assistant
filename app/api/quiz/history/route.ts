import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-guard";
import { getDb } from "@/lib/mongodb";

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const data = await request.json();
    const { documentId, documentName, questionCount, score, correctCount, wrongCount, questions } = data;

    if (!documentId || !documentName || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Invalid quiz result data." }, { status: 400 });
    }

    const db = await getDb();
    
    // Save the attempt
    const result = await db.collection("quizAttempts").insertOne({
      userId: auth.session.user.id,
      documentId,
      documentName,
      questionCount,
      score,
      correctCount,
      wrongCount,
      questions,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, attemptId: result.insertedId });
  } catch (error) {
    console.error("Failed to save quiz attempt:", error);
    return NextResponse.json({ error: "Could not save quiz attempt." }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireStudent();
  if ("error" in auth) return auth.error;

  try {
    const db = await getDb();
    const attempts = await db.collection("quizAttempts")
      .find({ userId: auth.session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("Failed to load quiz history:", error);
    return NextResponse.json({ error: "Could not load quiz history." }, { status: 500 });
  }
}
