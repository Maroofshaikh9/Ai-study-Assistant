import fs from "fs";
import path from "path";
import { SupportedFileType } from "./file-validator";
// Import the inner module so pdf-parse does not try to open its sample PDF
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import * as xlsx from "xlsx";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

/**
 * Extracts embedded JPEG streams directly from a PDF buffer.
 * Scanned PDFs (e.g. from CamScanner, mobile scans, flatbed scanners) store each page
 * as a DCTDecode JPEG stream. Extracting these streams directly provides 100% loss-free
 * access to page images without requiring native C++ canvas or poppler dependencies.
 */
export function extractJpegsFromPdf(buffer: Buffer): Buffer[] {
  const jpegs: Buffer[] = [];
  const startMarker = Buffer.from([0xff, 0xd8, 0xff]);
  const endMarker = Buffer.from([0xff, 0xd9]);

  let startIndex = 0;
  while ((startIndex = buffer.indexOf(startMarker, startIndex)) !== -1) {
    const endIndex = buffer.indexOf(endMarker, startIndex + 3);
    if (endIndex !== -1) {
      const imgBuf = buffer.subarray(startIndex, endIndex + 2);
      // Filter out tiny thumbnails/icons (< 4KB)
      if (imgBuf.length > 4096) {
        jpegs.push(imgBuf);
      }
      startIndex = endIndex + 2;
    } else {
      break;
    }
  }
  return jpegs;
}

/**
 * Resolves explicit absolute paths for Tesseract worker, core WASM, and language traineddata.
 * This prevents Webpack / Next.js from resolving broken relative paths inside server bundles
 * and prevents infinite worker initialization hangs.
 */
function getTesseractConfig(): Record<string, unknown> {
  const cwd = process.cwd();
  const nodeModules = path.join(cwd, "node_modules");
  const candidateWorker = path.join(
    nodeModules,
    "tesseract.js",
    "src",
    "worker-script",
    "node",
    "index.js"
  );
  const candidateCore = path.join(nodeModules, "tesseract.js-core");

  const options: Record<string, unknown> = {
    langPath: cwd,
    cachePath: cwd,
    gzip: false,
  };

  try {
    if (fs.existsSync(candidateWorker)) {
      options.workerPath = candidateWorker;
    }
  } catch {}

  try {
    if (fs.existsSync(candidateCore)) {
      options.corePath = candidateCore;
    }
  } catch {}

  // If eng.traineddata is not in cwd, fallback to /tmp or allow auto-fetch in Vercel
  if (!fs.existsSync(path.join(cwd, "eng.traineddata"))) {
    options.langPath = process.env.VERCEL ? "/tmp" : cwd;
    options.cachePath = process.env.VERCEL ? "/tmp" : cwd;
    options.gzip = true;
  }

  return options;
}

/**
 * Execution timeout wrapper to guarantee that no worker or async operation
 * can leave a pending Promise hanging indefinitely.
 */
function runWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Parses and extracts usable study text from any supported document type:
 * - PDF (Native text extraction with automatic OCR fallback for scanned/image-only PDFs)
 * - DOCX (Microsoft Word text extraction via Mammoth, ignoring dangerous macros)
 * - XLSX (Microsoft Excel structured cell extraction via SheetJS across all sheets)
 * - JPEG / PNG / WebP (OCR extraction via Tesseract.js with explicit worker paths and timeouts)
 */
export async function parseDocumentText(
  type: SupportedFileType,
  buffer: Buffer
): Promise<string> {
  switch (type) {
    case "docx": {
      try {
        const result = await mammoth.extractRawText({ buffer });
        const text = (result.value || "").trim();
        const alphaCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
        if (!text || alphaCount < 5) {
          throw new Error("No readable text was found in this Word document.");
        }
        return text;
      } catch (err) {
        if (err instanceof Error && err.message.includes("readable text")) {
          throw err;
        }
        throw new Error("Could not extract readable text from this Word document.");
      }
    }

    case "xlsx": {
      try {
        const workbook = xlsx.read(buffer, { type: "buffer" });
        let output = "";

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) continue;

          // Convert sheet to array of rows, ignoring completely blank rows
          const rows = xlsx.utils.sheet_to_json<unknown[]>(worksheet, {
            header: 1,
            blankrows: false,
          });

          if (!rows || rows.length === 0) continue;

          let sheetContent = "";
          for (const row of rows) {
            if (Array.isArray(row)) {
              const cleanedCells = row
                .map((cell) =>
                  cell !== null && cell !== undefined ? String(cell).trim() : ""
                )
                .filter((cell) => cell.length > 0);

              if (cleanedCells.length > 0) {
                sheetContent += cleanedCells.join(" | ") + "\n";
              }
            }
          }

          if (sheetContent.trim()) {
            output += `\n=== Sheet: ${sheetName} ===\n` + sheetContent;
          }
        }

        const text = output.trim();
        const alphaCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
        if (!text || alphaCount < 5) {
          throw new Error("No readable text was found in this Excel spreadsheet.");
        }
        return text;
      } catch (err) {
        if (err instanceof Error && err.message.includes("readable text")) {
          throw err;
        }
        throw new Error("Could not extract readable text from this Excel spreadsheet.");
      }
    }

    case "jpeg":
    case "png":
    case "webp": {
      let worker: Tesseract.Worker | null = null;
      try {
        console.log("[DOCUMENT_UPLOAD] OCR started");
        const tesseractConfig = getTesseractConfig();

        // Safe worker initialization with 15-second timeout
        worker = await runWithTimeout(
          Tesseract.createWorker("eng", 1, tesseractConfig),
          15000,
          "OCR engine initialization timed out. Please try again."
        );

        // Safe image recognition with 30-second timeout
        const res = await runWithTimeout(
          worker.recognize(buffer),
          30000,
          "Document image processing timed out. Please try a clearer or smaller image."
        );

        const ocrText = (res.data?.text || "").trim();
        console.log("[DOCUMENT_UPLOAD] OCR completed");

        const alphaCount = (ocrText.match(/[a-zA-Z0-9]/g) || []).length;
        if (!ocrText || alphaCount < 10) {
          throw new Error(
            "We couldn't read enough text from this image. Please upload a clearer image."
          );
        }
        return ocrText;
      } catch (err) {
        if (
          err instanceof Error &&
          (err.message.includes("clearer image") ||
            err.message.includes("timed out") ||
            err.message.includes("readable text"))
        ) {
          throw err;
        }
        throw new Error("Could not extract readable text from this image document.");
      } finally {
        if (worker) {
          try {
            await worker.terminate();
          } catch {}
        }
      }
    }

    case "pdf": {
      let embeddedText = "";
      try {
        const result = await pdfParse(buffer);
        embeddedText = (result.text || "").replace(/\s+/g, " ").trim();
      } catch {
        embeddedText = "";
      }

      // Fast Path: Normal PDF with embedded text layer (>= 40 alphanumeric characters)
      const alphaCount = (embeddedText.match(/[a-zA-Z0-9]/g) || []).length;
      if (alphaCount >= 40) {
        return embeddedText;
      }

      // Fallback Path: Scanned or image-based PDF
      // Extract embedded page JPEG streams and run Tesseract OCR
      const jpegs = extractJpegsFromPdf(buffer);
      if (jpegs.length > 0) {
        let worker: Tesseract.Worker | null = null;
        let combinedOcrText = "";
        try {
          console.log("[DOCUMENT_UPLOAD] OCR started (scanned PDF fallback)");
          const tesseractConfig = getTesseractConfig();

          worker = await runWithTimeout(
            Tesseract.createWorker("eng", 1, tesseractConfig),
            15000,
            "OCR engine initialization timed out. Please try again."
          );

          // Process up to 5 pages to maintain responsive serverless execution
          const pagesToOcr = jpegs.slice(0, 5);
          for (let i = 0; i < pagesToOcr.length; i++) {
            const pageBuf = pagesToOcr[i];
            const res = await runWithTimeout(
              worker.recognize(pageBuf),
              20000,
              `Scanned page ${i + 1} OCR timed out.`
            );
            const pageText = (res.data?.text || "").trim();
            if (pageText) {
              combinedOcrText += `\n\n--- Scanned Page ${i + 1} ---\n` + pageText;
            }
          }
          console.log("[DOCUMENT_UPLOAD] OCR completed (scanned PDF fallback)");
        } catch (ocrErr) {
          console.warn("Scanned PDF OCR warning:", ocrErr instanceof Error ? ocrErr.message : ocrErr);
        } finally {
          if (worker) {
            try {
              await worker.terminate();
            } catch {}
          }
        }

        const ocrAlphaCount = (combinedOcrText.match(/[a-zA-Z0-9]/g) || []).length;
        if (ocrAlphaCount >= 15) {
          return combinedOcrText.trim();
        }
      }

      // If embedded text is sparse (<40 chars) but has some words and no images were found
      if (alphaCount >= 15) {
        return embeddedText;
      }

      throw new Error(
        "No readable text was detected in this document. Please upload a clearer document."
      );
    }

    default:
      throw new Error(
        "This file type is not supported. Please upload PDF, DOCX, XLSX, JPG, PNG, or WEBP."
      );
  }
}
