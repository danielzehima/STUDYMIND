import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlanLimitReachedError, PlanRequiredError } from "@/lib/errors";

export async function canUploadDocument(userId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan ?? "free") as "free" | "pro";

  const { data: limits } = await supabase
    .from("plan_limits")
    .select("max_documents")
    .eq("plan", plan)
    .single();

  if (limits?.max_documents == null) {
    return; // illimité
  }

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if ((count ?? 0) >= limits.max_documents) {
    throw new PlanLimitReachedError(
      `Limite de ${limits.max_documents} documents atteinte pour le plan Gratuit. Passez au plan Pro pour un accès illimité.`
    );
  }
}

// À appeler en tête de toute route/Server Action réservée au plan Pro
// (ex. future résolution d'exercices — voir architecture.md §3.4).
export async function requirePlan(
  userId: string,
  requiredPlan: "pro"
): Promise<void> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan ?? "free") as "free" | "pro";

  if (requiredPlan === "pro" && plan !== "pro") {
    throw new PlanRequiredError();
  }
}
