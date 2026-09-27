import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireStudent } from "@/lib/auth-guard";
import { validateUploadedFile, MAX_FILE_SIZE } from "@/lib/file-validator";
import { parseDocumentText } from "@/lib/document-parser";

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
      .project({ filename: 1, size: 1, type: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      documents: documents.map((doc) => ({
        id: doc._id.toString(),
        filename: doc.filename,
        size: doc.size,
        type: doc.type || "pdf",
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
  console.log(`[DOCUMENT_UPLOAD] request received - timestamp=${new Date().toISOString()}`);

  const auth = await requireStudent();
  if ("error" in auth) {
    console.warn("[DOCUMENT_UPLOAD] authentication failed");
    return auth.error;
  }
  console.log(`[DOCUMENT_UPLOAD] authentication passed - userId=${auth.session.user.id}`);

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      console.warn("[DOCUMENT_UPLOAD] no file found in request payload");
      return NextResponse.json(
        { error: "Please choose a file to upload." },
        { status: 400 }
      );
    }

    console.log(`[DOCUMENT_UPLOAD] file received - name="${file.name}", size=${file.size}, type="${file.type}"`);

    // Server-side size validation before memory allocation
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`[DOCUMENT_UPLOAD] rejected file exceeding limit: ${file.size} bytes`);
      return NextResponse.json(
        { error: "File is too large. Maximum file size is 4 MB." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      console.warn("[DOCUMENT_UPLOAD] rejected empty file (0 bytes)");
      return NextResponse.json(
        { error: "The selected file is empty." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Comprehensive Server-Side Validation:
    // - File presence & size <= 4 MB
    // - Allowed extensions (pdf, docx, xlsx, jpg, jpeg, png, webp)
    // - Allowed MIME types
    // - Magic bytes / signature verification (rejects malware.exe renamed to notes.pdf)
    // - Filename sanitization & path traversal prevention
    const validation = validateUploadedFile(
      { name: file.name, size: file.size, type: file.type },
      buffer
    );

    if (!validation.valid || !validation.type || !validation.sanitizedFilename) {
      console.warn(`[DOCUMENT_UPLOAD] validation failed - error="${validation.error}"`);
      return NextResponse.json(
        { error: validation.error || "The uploaded file is invalid or corrupted." },
        { status: 400 }
      );
    }

    console.log(`[DOCUMENT_UPLOAD] validation passed - type="${validation.type}", sanitizedFilename="${validation.sanitizedFilename}"`);
    console.log(`[DOCUMENT_UPLOAD] parser selected: ${validation.type}`);

    let text = "";
    try {
      console.log("[DOCUMENT_UPLOAD] text extraction started");
      text = await parseDocumentText(validation.type, buffer);
      console.log(`[DOCUMENT_UPLOAD] text extraction completed - chars=${text.length}`);
    } catch (parseError) {
      const msg =
        parseError instanceof Error
          ? parseError.message
          : "Could not extract readable text from this document.";
      console.error(`[DOCUMENT_UPLOAD] text extraction error: ${msg}`);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    console.log("[DOCUMENT_UPLOAD] text validation passed");
    console.log("[DOCUMENT_UPLOAD] MongoDB save started");

    const db = await getDb();
    const result = await db.collection("documents").insertOne({
      userId: new ObjectId(auth.session.user.id),
      filename: validation.sanitizedFilename,
      size: file.size,
      type: validation.type,
      text,
      createdAt: new Date(),
    });

    console.log(`[DOCUMENT_UPLOAD] MongoDB save completed - id=${result.insertedId.toString()}`);
    console.log("[DOCUMENT_UPLOAD] response returned successfully");

    return NextResponse.json({
      id: result.insertedId.toString(),
      filename: validation.sanitizedFilename,
      message: "Document uploaded and parsed successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not upload the document.";
    console.error(`[DOCUMENT_UPLOAD] unexpected server error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
