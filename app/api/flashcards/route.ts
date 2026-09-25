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
    const { documentId, count = 10 } = await request.json();
    const requestedCount = Math.min(Math.max(Number(count) || 10, 5), 30);
    
    const owned = await getOwnedDocument(auth.session.user.id, documentId);

    if ("error" in owned) {
      return NextResponse.json({ error: owned.error }, { status: 404 });
    }

    const notes = shortenText(owned.document.text);
    
    if (notes.trim().length < requestedCount * 50) {
      return NextResponse.json(
        { error: `This document does not contain enough content for ${requestedCount} meaningful flashcards. Please choose a smaller number.` },
        { status: 400 }
      );
    }

    const raw = await callGroq(
      [
        {
          role: "system",
          content: `Create study flashcards from the notes. Return JSON only in this shape: {"cards":[{"front":"term or question","back":"short answer"}]}. Make exactly ${requestedCount} cards. Use only the notes. Do not invent facts or repeat concepts just to reach the count.`,
        },
        {
          role: "user",
          content: notes,
        },
      ],
      true
    );

    const parsed = extractJson(raw);
    const cards = Array.isArray(parsed.cards) ? parsed.cards : [];

    const cleaned = cards
      .filter((item: { front?: string; back?: string }) => item?.front && item?.back)
      .slice(0, requestedCount)
      .map((item: { front: string; back: string }) => ({
        front: String(item.front),
        back: String(item.back),
      }));

    if (cleaned.length === 0) {
      return NextResponse.json(
        { error: "Could not build flashcards from these notes." },
        { status: 500 }
      );
    }

    return NextResponse.json({ cards: cleaned });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate flashcards.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
