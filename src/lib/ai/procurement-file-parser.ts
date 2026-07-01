import { mkdir, writeFile } from "fs/promises";
import path from "path";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import {
  parseProcurementLines,
  parseProcurementLinesFromRows,
} from "@/lib/ai/procurement-line-parser";

export type SupportedUploadType = "xlsx" | "csv" | "pdf" | "docx" | "txt";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const EXT_MAP: Record<string, SupportedUploadType> = {
  xlsx: "xlsx",
  xls: "xlsx",
  csv: "csv",
  pdf: "pdf",
  docx: "docx",
  txt: "txt",
};

export function resolveUploadType(fileName: string, mimeType?: string): SupportedUploadType | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (EXT_MAP[ext]) return EXT_MAP[ext];
  if (mimeType?.includes("spreadsheet")) return "xlsx";
  if (mimeType?.includes("csv")) return "csv";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType?.includes("wordprocessingml")) return "docx";
  if (mimeType?.startsWith("text/")) return "txt";
  return null;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text ?? "";
  } catch {
    const raw = buffer.toString("latin1");
    const chunks = raw.match(/\(([^)]+)\)/g) ?? [];
    return chunks.map((c) => c.slice(1, -1)).join("\n");
  }
}

async function extractTextFromBuffer(
  buffer: Buffer,
  fileType: SupportedUploadType,
): Promise<string> {
  switch (fileType) {
    case "txt":
    case "csv":
      return buffer.toString("utf8");
    case "xlsx": {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return "";
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
      const parsed = parseProcurementLinesFromRows(rows as string[][]);
      if (parsed.length > 0) {
        return parsed.map((line) => line.rawText).join("\n");
      }
      return XLSX.utils.sheet_to_csv(sheet);
    }
    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case "pdf":
      return extractPdfText(buffer);
    default:
      return "";
  }
}

export async function parseUploadedProcurementFile(
  buffer: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<{ fileType: SupportedUploadType; text: string; lines: ReturnType<typeof parseProcurementLines> }> {
  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error("File too large (max 10MB)");
  }

  const fileType = resolveUploadType(fileName, mimeType);
  if (!fileType) {
    throw new Error("Unsupported file type. Use xlsx, csv, pdf, docx, or txt.");
  }

  const text = await extractTextFromBuffer(buffer, fileType);
  const lines = parseProcurementLines(text);

  if (lines.length === 0 && fileType === "xlsx") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: "" });
    return {
      fileType,
      text,
      lines: parseProcurementLinesFromRows(rows as string[][]),
    };
  }

  return { fileType, text, lines };
}

export async function saveUploadFile(
  conversationId: string,
  fileName: string,
  buffer: Buffer,
): Promise<string> {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const dir = path.join(process.cwd(), "uploads", "ai", conversationId);
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, `${Date.now()}-${safeName}`);
  await writeFile(storagePath, buffer);
  return storagePath;
}

export function getPublicUploadPath(storagePath: string): string {
  return storagePath.replace(process.cwd(), "");
}
