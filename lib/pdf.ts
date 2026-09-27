import { parseDocumentText } from "./document-parser";

/**
 * Extracts readable text from a PDF buffer.
 * Automatically utilizes embedded text extraction with intelligent OCR fallback
 * for scanned / image-only PDFs.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return parseDocumentText("pdf", buffer);
}
