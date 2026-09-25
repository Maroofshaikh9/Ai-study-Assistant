import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { requireStudent, getOwnedDocument } from "@/lib/auth-guard";
import { callGroq, extractJson, shortenText } from "@/lib/groq";


export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const { documentId, count = 5 } = await request.json();
    const requestedCount = Math.min(Math.max(Number(count) || 5, 5), 30);
    
    const owned = await getOwnedDocument(auth.session.user.id, documentId);

    if ("error" in owned) {
      return NextResponse.json({ error: owned.error }, { status: 404 });
    }

    const notes = shortenText(owned.document.text);
    
    if (notes.trim().length < requestedCount * 100) {
      return NextResponse.json(
        { error: `This document does not contain enough content for ${requestedCount} meaningful questions. Please choose a smaller number of questions.` },
        { status: 400 }
      );
    }

    const raw = await callGroq(
      [
        {
          role: "system",
          content: `Create a multiple-choice quiz from the notes. Return JSON only in this shape: {"questions":[{"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."}]}. answer is the index of the correct option. Make exactly ${requestedCount} questions. Use only the notes.`,
        },
        {
          role: "user",
          content: notes,
        },
      ],
      true
    );

    const parsed = extractJson(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const cleaned = questions
      .filter(
        (item: { question?: string; options?: string[]; answer?: number }) =>
          item?.question && Array.isArray(item.options) && item.options.length >= 2
      )
      .slice(0, requestedCount)
      .map(
        (item: { question: string; options: string[]; answer: number; explanation?: string }) => ({
          question: String(item.question),
          options: item.options.map((option: string | number) => String(option)).slice(0, 4),
          answer: Number(item.answer) || 0,
          explanation: item.explanation ? String(item.explanation) : "",
        })
      );

    if (cleaned.length === 0) {
      return NextResponse.json(
        { error: "Could not build a quiz from these notes." },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: cleaned });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate a quiz.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
