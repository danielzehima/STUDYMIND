import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminStats = {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  documentsCount: number;
  quizAttemptsCount: number;
  exercisesResolvedCount: number;
  estimatedMrrFcfa: number;
  feedbackCount: number;
  averageRating: number | null;
  contactMessagesCount: number;
};

// Prix Pro confirmé (architecture.md §4.2) — sert uniquement à estimer le
// MRR affiché à l'admin, pas une source de vérité de facturation.
const PRO_PRICE_FCFA = 3000;

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient();

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: documentsCount },
    { count: quizAttemptsCount },
    { count: exercisesResolvedCount },
    { data: ratedFeedback, count: feedbackCount },
    { count: contactMessagesCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("plan", "pro"),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }),
    supabase
      .from("exercise_items")
      .select("id", { count: "exact", head: true }),
    supabase.from("feedback").select("rating", { count: "exact" }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
  ]);

  const total = totalUsers ?? 0;
  const pro = proUsers ?? 0;

  const ratings = (ratedFeedback ?? [])
    .map((f) => f.rating)
    .filter((r): r is number => typeof r === "number");
  const averageRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
      : null;

  return {
    totalUsers: total,
    freeUsers: total - pro,
    proUsers: pro,
    documentsCount: documentsCount ?? 0,
    quizAttemptsCount: quizAttemptsCount ?? 0,
    exercisesResolvedCount: exercisesResolvedCount ?? 0,
    estimatedMrrFcfa: pro * PRO_PRICE_FCFA,
    feedbackCount: feedbackCount ?? 0,
    averageRating,
    contactMessagesCount: contactMessagesCount ?? 0,
  };
}
