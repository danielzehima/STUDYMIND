import "server-only";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { AppError } from "@/lib/errors";
import {
  ALLOWED_FILE_TYPES,
  MAX_TEXT_CHARS,
  type AllowedFileType,
} from "@/lib/config";

export function getFileType(filename: string): AllowedFileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && (ALLOWED_FILE_TYPES as readonly string[]).includes(ext)) {
    return ext as AllowedFileType;
  }
  throw new AppError(
    "UNSUPPORTED_FORMAT",
    "Format de fichier non supporté (pdf, docx, txt uniquement).",
    415
  );
}

export async function extractText(file: File): Promise<string> {
  const fileType = getFileType(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    if (fileType === "pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      text = result.text;
    } else if (fileType === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString("utf-8");
    }
  } catch (error) {
    console.error("[extractText]", error);
    throw new AppError(
      "EXTRACTION_FAILED",
      "Impossible d'extraire le texte de ce document.",
      422
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new AppError(
      "EXTRACTION_FAILED",
      "Ce document ne contient aucun texte exploitable.",
      422
    );
  }

  return trimmed.slice(0, MAX_TEXT_CHARS);
}
