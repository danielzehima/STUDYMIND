import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import { canUploadDocument } from "@/lib/subscriptions/plan-limits";
import { extractText, getFileType } from "@/lib/documents/extraction";
import { createDocument, listDocuments } from "@/lib/documents/repository";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "@/lib/config";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const documents = await listDocuments(user.id);
    return Response.json(documents);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    const formData = await request.formData();
    const file = formData.get("file");
    const titleInput = formData.get("title");

    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("INVALID_FILE", "Aucun fichier valide fourni.", 400);
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        "FILE_TOO_LARGE",
        `Le fichier dépasse la taille maximale autorisée (${MAX_FILE_SIZE_MB} Mo).`,
        413
      );
    }

    const fileType = getFileType(file.name);

    await canUploadDocument(user.id);

    const extractedText = await extractText(file);

    const title =
      typeof titleInput === "string" && titleInput.trim()
        ? titleInput.trim()
        : file.name.replace(/\.[^/.]+$/, "");

    const document = await createDocument(user.id, {
      title,
      originalFilename: file.name,
      fileType,
      extractedText,
    });

    return Response.json(document, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
