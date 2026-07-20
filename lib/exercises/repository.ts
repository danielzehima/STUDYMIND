import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GeneratedExerciseItem } from "@/lib/deepseek/prompts/exercises";

export type ExerciseResolution = {
  id: string;
  status: "pending" | "processing" | "ready" | "failed";
  error_message: string | null;
  created_at: string;
  items: Array<{
    id: string;
    order_index: number;
    exercise_text: string;
    solution_text: string;
    final_answer: string | null;
    confidence: "high" | "medium" | "low" | null;
  }>;
};

export async function createResolution(userId: string, documentId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("exercise_resolutions")
    .insert({ user_id: userId, document_id: documentId, status: "processing" })
    .select("id, status, created_at")
    .single();

  if (error) throw error;
  return data;
}

export async function markResolutionReady(
  userId: string,
  resolutionId: string,
  items: GeneratedExerciseItem[]
) {
  const supabase = createAdminClient();

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("exercise_items").insert(
      items.map((item, index) => ({
        resolution_id: resolutionId,
        user_id: userId,
        order_index: index,
        exercise_text: item.exercise_text,
        solution_text: item.solution_text,
        final_answer: item.final_answer || null,
        confidence: item.confidence,
      }))
    );
    if (itemsError) throw itemsError;
  }

  const { error } = await supabase
    .from("exercise_resolutions")
    .update({ status: "ready" })
    .eq("id", resolutionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function markResolutionFailed(
  userId: string,
  resolutionId: string,
  message: string
) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("exercise_resolutions")
    .update({ status: "failed", error_message: message })
    .eq("id", resolutionId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getLatestResolutionForDocument(
  userId: string,
  documentId: string
): Promise<ExerciseResolution | null> {
  const supabase = createAdminClient();
  const { data: resolution, error } = await supabase
    .from("exercise_resolutions")
    .select("id, status, error_message, created_at")
    .eq("user_id", userId)
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!resolution) return null;

  const { data: items, error: itemsError } = await supabase
    .from("exercise_items")
    .select("id, order_index, exercise_text, solution_text, final_answer, confidence")
    .eq("resolution_id", resolution.id)
    .order("order_index");

  if (itemsError) throw itemsError;

  return { ...resolution, items: items ?? [] };
}
