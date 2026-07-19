import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotFoundError } from "@/lib/errors";
import type { AllowedFileType } from "@/lib/config";

export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export type DocumentRecord = {
  id: string;
  user_id: string;
  title: string;
  original_filename: string;
  file_type: AllowedFileType;
  extracted_text: string;
  summary: string | null;
  key_points: string[] | null;
  status: DocumentStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export async function listDocuments(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDocument(
  userId: string,
  id: string
): Promise<DocumentRecord> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new NotFoundError("Document introuvable.");
  return data as DocumentRecord;
}

export async function createDocument(
  userId: string,
  input: {
    title: string;
    originalFilename: string;
    fileType: AllowedFileType;
    extractedText: string;
  }
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: input.title,
      original_filename: input.originalFilename,
      file_type: input.fileType,
      extracted_text: input.extractedText,
      status: "uploaded",
    })
    .select("id, title, status, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function updateDocumentAnalysis(
  userId: string,
  id: string,
  input: { summary: string; keyPoints: string[] }
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("documents")
    .update({ summary: input.summary, key_points: input.keyPoints })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function updateDocumentStatus(
  userId: string,
  id: string,
  status: DocumentStatus,
  errorMessage?: string | null
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("documents")
    .update({ status, error_message: errorMessage ?? null })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteDocument(userId: string, id: string) {
  await getDocument(userId, id); // 404 si inexistant/pas le sien
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}
