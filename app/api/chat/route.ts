import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { requireStudent, getOwnedDocument } from "@/lib/auth-guard";
import { callGroq, shortenText } from "@/lib/groq";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const question = String(body.question || "").trim();
    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history.slice(-6)
      : [];

    if (!question) {
      return NextResponse.json(
        { error: "Please type a question." },
        { status: 400 }
      );
    }

    const owned = await getOwnedDocument(auth.session.user.id, body.documentId);
    if ("error" in owned) {
      return NextResponse.json({ error: owned.error }, { status: 404 });
    }

    const notes = shortenText(owned.document.text);
    const answer = await callGroq([
      {
        role: "system",
        content:
          "You are StudyMate, a doubt solver for students. Answer using the uploaded notes. If the notes do not contain the answer, say so clearly and give a short helpful hint.",
      },
      {
        role: "user",
        content: `Notes:\n${notes}`,
      },
      ...history.map((item) => ({
        role: item.role,
        content: String(item.content || "").slice(0, 1000),
      })),
      {
        role: "user",
        content: question.slice(0, 1000),
      },
    ]);

    return NextResponse.json({ answer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not answer the question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
