import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { requireStudent, getOwnedDocument } from "@/lib/auth-guard";
import { callGroq, shortenText } from "@/lib/groq";

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const { documentId, length = "Medium" } = await request.json();
    const owned = await getOwnedDocument(auth.session.user.id, documentId);

    if ("error" in owned) {
      return NextResponse.json({ error: owned.error }, { status: 404 });
    }

    const notes = shortenText(owned.document.text);
    
    let lengthInstruction = "a balanced summary covering the important concepts with moderate detail";
    if (length === "Short") {
      lengthInstruction = "a concise revision summary containing only the most important concepts";
    } else if (length === "Large") {
      lengthInstruction = "a detailed study summary covering substantially more information from the selected PDF (but do not invent facts if the document is short)";
    }

    const summary = await callGroq([
      {
        role: "system",
        content:
          `You are a study assistant for college students. Summarise the notes in clear paragraphs and short bullet points. Produce ${lengthInstruction}. Use only the given notes. Do not invent facts.`,
      },
      {
        role: "user",
        content: `Summarise these study notes:\n\n${notes}`,
      },
    ]);

    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate a summary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
