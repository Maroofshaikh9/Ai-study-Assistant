export type SupportedFileType = "pdf" | "docx" | "xlsx" | "jpeg" | "png" | "webp";

export interface FileValidationResult {
  valid: boolean;
  type?: SupportedFileType;
  sanitizedFilename?: string;
  error?: string;
}

export const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

const ALLOWED_EXTENSIONS: Record<string, SupportedFileType> = {
  pdf: "pdf",
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
  docx: "docx",
  xlsx: "xlsx",
};

const ALLOWED_MIME_TYPES: Record<string, SupportedFileType> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpeg",
  "image/pjpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};

/**
 * Validates an uploaded file server-side:
 * 1. Checks file presence & size (<= 4 MB)
 * 2. Sanitizes the filename (prevents path traversal and control characters)
 * 3. Validates extension against strict whitelist
 * 4. Validates MIME type against strict whitelist
 * 5. Verifies magic bytes / file signatures to prevent executable renaming attacks (e.g., malware.exe -> notes.pdf)
 */
export function validateUploadedFile(
  file: { name: string; size: number; type?: string },
  buffer: Buffer
): FileValidationResult {
  // 1. File size check
  if (!file.size || file.size <= 0) {
    return { valid: false, error: "The selected file is empty." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File is too large. Maximum file size is 4 MB.",
    };
  }

  if (buffer.length === 0) {
    return { valid: false, error: "The uploaded file is invalid or corrupted." };
  }

  // 2. Sanitize filename (strip directory traversal, dangerous characters, clamp length)
  const rawName = file.name || "document";
  const baseName = rawName.replace(/^.*[\\\/]/, "").trim();
  const sanitized = baseName
    .replace(/[^\w\s.-]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 100);

  const ext = (sanitized.split(".").pop() || "").toLowerCase();

  // 3. Strict extension check
  const expectedType = ALLOWED_EXTENSIONS[ext];
  if (!expectedType) {
    return {
      valid: false,
      error:
        "This file type is not supported. Please upload PDF, DOCX, XLSX, JPG, PNG, or WEBP.",
    };
  }

  // 4. MIME type check if supplied
  if (file.type) {
    const mimeLower = file.type.toLowerCase();
    const mimeType = ALLOWED_MIME_TYPES[mimeLower];
    // Allow application/octet-stream or application/zip only if magic bytes match docx/xlsx
    if (
      mimeType &&
      mimeType !== expectedType &&
      !(
        (expectedType === "docx" || expectedType === "xlsx") &&
        (mimeLower === "application/zip" || mimeLower === "application/octet-stream" || mimeLower === "application/x-zip-compressed")
      )
    ) {
      return {
        valid: false,
        error:
          "This file type is not supported. Please upload PDF, DOCX, XLSX, JPG, PNG, or WEBP.",
      };
    }
  }

  // 5. Magic Byte / File Signature Validation
  if (expectedType === "pdf") {
    // PDF must start with %PDF- (hex: 25 50 44 46 2D)
    if (
      buffer.length < 5 ||
      buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
    ) {
      return {
        valid: false,
        error: "The uploaded file is not a valid PDF document.",
      };
    }
  } else if (expectedType === "jpeg") {
    // JPEG starts with FF D8 FF
    if (
      buffer.length < 3 ||
      buffer[0] !== 0xff ||
      buffer[1] !== 0xd8 ||
      buffer[2] !== 0xff
    ) {
      return {
        valid: false,
        error: "The uploaded file is not a valid JPEG image.",
      };
    }
  } else if (expectedType === "png") {
    // PNG starts with 89 50 4E 47 0D 0A 1A 0A
    const pngMagic = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    if (buffer.length < 8 || !buffer.subarray(0, 8).equals(pngMagic)) {
      return {
        valid: false,
        error: "The uploaded file is not a valid PNG image.",
      };
    }
  } else if (expectedType === "webp") {
    // WebP starts with RIFF....WEBP
    if (
      buffer.length < 12 ||
      buffer.subarray(0, 4).toString("ascii") !== "RIFF" ||
      buffer.subarray(8, 12).toString("ascii") !== "WEBP"
    ) {
      return {
        valid: false,
        error: "The uploaded file is not a valid WebP image.",
      };
    }
  } else if (expectedType === "docx") {
    // DOCX is a zip archive starting with PK\x03\x04 containing word/ or [Content_Types].xml
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x50 ||
      buffer[1] !== 0x4b ||
      buffer[2] !== 0x03 ||
      buffer[3] !== 0x04
    ) {
      return {
        valid: false,
        error: "The uploaded file is not a valid Microsoft Word (.docx) document.",
      };
    }
    const sample = buffer.toString("binary", 0, Math.min(buffer.length, 4096));
    if (!sample.includes("word/") && !sample.includes("[Content_Types].xml")) {
      return {
        valid: false,
        error: "The uploaded file is not a valid Microsoft Word (.docx) document.",
      };
    }
  } else if (expectedType === "xlsx") {
    // XLSX is a zip archive starting with PK\x03\x04 containing xl/ or [Content_Types].xml
    if (
      buffer.length < 4 ||
      buffer[0] !== 0x50 ||
      buffer[1] !== 0x4b ||
      buffer[2] !== 0x03 ||
      buffer[3] !== 0x04
    ) {
      return {
        valid: false,
        error: "The uploaded file is not a valid Microsoft Excel (.xlsx) spreadsheet.",
      };
    }
    const sample = buffer.toString("binary", 0, Math.min(buffer.length, 4096));
    if (!sample.includes("xl/") && !sample.includes("[Content_Types].xml")) {
      return {
        valid: false,
        error: "The uploaded file is not a valid Microsoft Excel (.xlsx) spreadsheet.",
      };
    }
  }

  return {
    valid: true,
    type: expectedType,
    sanitizedFilename: sanitized,
  };
}
