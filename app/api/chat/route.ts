import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { requireStudent, getOwnedDocument } from "@/lib/auth-guard";
import { callGroq, shortenText } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  const userLimit = await checkRateLimit(`ai:user:${auth.session.user.id}`, 15, 60);
  if (!userLimit.allowed) {
    return NextResponse.json(
      { error: "You are generating study materials too quickly. Please wait a moment." },
      { status: 429 }
    );
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

    // Support both "text" and legacy "extractedText" fields.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawText: string = (owned.document as any).text || (owned.document as any).extractedText || "";

    // Guard: if no text is stored, return 422
    if (!rawText.trim()) {
      return NextResponse.json(
        {
          error:
            "This document has no readable text stored. " +
            "Please delete it on the My Study Materials page and re-upload it " +
            "so OCR can extract the text.",
        },
        { status: 422 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filename = String((owned.document as any).filename || "Selected Document");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docType = String((owned.document as any).type || "document");
    const notes = shortenText(rawText);

    const systemPrompt = `You are StudyMate, an expert academic study tutor.
You are helping the student study their selected ${docType} file: "${filename}".

The full text, OCR transcription, tables, and contents from this ${docType} are provided below:
<study_notes>
${notes}
</study_notes>

CRITICAL GUIDELINES FOR ANSWERING:
1. All text, tables, and information extracted from the student\'s document or image ("${filename}") are provided in <study_notes>.
2. When the student refers to "this image", "this document", "this table", "this chart", "this diagram", "this file", "this page", or says "analyze this", "explain this", "summarize this", or asks questions about specific data/text, answer directly using the content in <study_notes>.
3. Never say you cannot view or access the image/document. You have the exact extracted text and data in <study_notes>.
4. If the document contains tabular data, numbers, or structured lists, format your response cleanly using Markdown tables and bullet points.
5. Base your answers strictly on the facts and information in <study_notes>. Do not hallucinate or invent details not supported by the document.`;

    const groqMessages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      ...history.map((item) => ({
        role: item.role as "user" | "assistant",
        content: String(item.content || "").slice(0, 1000),
      })),
      {
        role: "user" as const,
        content: question.slice(0, 1000),
      },
    ];

    const answer = await callGroq(groqMessages);

    return NextResponse.json({ answer });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not answer the question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
