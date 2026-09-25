// Import the inner module so pdf-parse does not try to open its sample PDF.
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const result = await pdfParse(buffer);
    const text = (result.text || "").replace(/\s+/g, " ").trim();

    if (!text) {
      throw new Error("No readable text was found in this PDF.");
    }

    return text;
  } catch (error) {
    if (error instanceof Error && error.message.includes("readable text")) {
      throw error;
    }
    throw new Error("Could not extract text from this PDF.");
  }
}
