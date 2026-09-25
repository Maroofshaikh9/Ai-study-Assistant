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

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected PDF file is empty." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // SEC-05: Verify PDF signature (%PDF-)
    if (buffer.length < 5 || buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json(
        { error: "The uploaded file is not a valid PDF document." },
        { status: 400 }
      );
    }

    let text = "";
    try {
      // pdf-parse extracts readable text before the file is stored.
      text = await extractTextFromPdf(buffer);
    } catch (parseError) {
      const msg =
        parseError instanceof Error
          ? parseError.message
          : "Invalid or corrupted PDF file.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // SEC-05: Sanitize filename (strip directory traversal, control chars, clamp to 100 chars)
    const rawName = file.name || "document.pdf";
    const baseName = rawName.replace(/^.*[\\\/]/, "").trim();
    const sanitizedName = baseName
      .replace(/[^\w\s.-]/g, "_")
      .replace(/\s+/g, " ")
      .slice(0, 100);

    const finalFilename = sanitizedName.toLowerCase().endsWith(".pdf")
      ? sanitizedName
      : `${sanitizedName || "document"}.pdf`;

    const db = await getDb();
    const result = await db.collection("documents").insertOne({
      userId: new ObjectId(auth.session.user.id),
      filename: finalFilename,
      size: file.size,
      text,
      createdAt: new Date(),
    });

    return NextResponse.json({
      id: result.insertedId.toString(),
      filename: finalFilename,
      message: "Notes uploaded successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload the PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
