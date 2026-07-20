import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Feedback = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string;
};

export type FeedbackWithProfile = Feedback & {
  user_id: string;
  email: string;
  full_name: string | null;
};

export async function createFeedback(
  userId: string,
  message: string,
  rating: number | null
): Promise<Feedback> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("feedback")
    .insert({ user_id: userId, message, rating })
    .select("id, message, rating, created_at")
    .single();

  if (error) throw error;
  return data;
}

// Panneau admin (/admin) : mêmes principes que listAllSubscriptions —
// jointure en mémoire avec profiles, pas d'embedding PostgREST (voir
// lib/subscriptions/repository.ts).
export async function listAllFeedback(limit = 100): Promise<FeedbackWithProfile[]> {
  const supabase = createAdminClient();

  const { data: feedback, error } = await supabase
    .from("feedback")
    .select("id, user_id, message, rating, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!feedback || feedback.length === 0) return [];

  const userIds = [...new Set(feedback.map((f) => f.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return feedback.map((f) => ({
    ...f,
    email: profileByUserId.get(f.user_id)?.email ?? "",
    full_name: profileByUserId.get(f.user_id)?.full_name ?? null,
  }));
}
