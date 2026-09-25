import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireStudent } from "@/lib/auth-guard";
import { extractTextFromPdf } from "@/lib/pdf";
import { MAX_PDF_SIZE } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const db = await getDb();
    const documents = await db
      .collection("documents")
      .find({ userId: new ObjectId(auth.session.user.id) })
      .project({ filename: 1, size: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
        size: doc.size,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load notes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireStudent();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please choose a PDF file." },
        { status: 400 }
      );
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { error: "PDF must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // pdf-parse extracts readable text before the file is stored.
    const text = await extractTextFromPdf(buffer);

    const db = await getDb();
    const result = await db.collection("documents").insertOne({
      userId: new ObjectId(auth.session.user.id),
      filename: file.name,
      size: file.size,
      text,
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      filename: file.name,
      message: "Notes uploaded successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload the PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
