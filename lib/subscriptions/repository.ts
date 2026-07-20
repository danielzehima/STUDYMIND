import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Subscription = {
  plan: "free" | "pro";
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "expired";
  payment_method_type: "card" | "mobile_money" | null;
  payment_provider: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

const SUBSCRIPTION_COLUMNS =
  "plan, status, payment_method_type, payment_provider, current_period_start, current_period_end, cancel_at_period_end";

export async function getSubscription(userId: string): Promise<Subscription> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_COLUMNS)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Étape 6 : aucun fournisseur de paiement (mobile money / carte) n'est
// encore branché — voir architecture.md §5. En attendant ce choix, cette
// fonction fait passer l'abonnement à Pro directement, comme si le paiement
// avait déjà été vérifié. À remplacer par la logique post-checkout/webhook
// le jour où un vrai fournisseur est intégré.
export async function upgradeToPro(userId: string): Promise<Subscription> {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      plan: "pro",
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId)
    .select(SUBSCRIPTION_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// Downgrade immédiat : sans fournisseur de paiement réel branché, il n'y a
// pas de période déjà payée à honorer (voir upgradeToPro et architecture.md
// §5 — règle à revoir une fois un vrai fournisseur intégré).
export async function downgradeToFree(userId: string): Promise<Subscription> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      plan: "free",
      status: "active",
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select(SUBSCRIPTION_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// Appelé depuis le webhook GeniusPay (payment.success) une fois la
// signature vérifiée — voir app/api/webhooks/payment/route.ts. Idempotent :
// si ce paiement (reference) a déjà été appliqué, ne réapplique rien (les
// webhooks peuvent être livrés plusieurs fois).
export async function activateProFromPayment(
  userId: string,
  input: {
    reference: string;
    paymentMethodType: "card" | "mobile_money";
    paymentProvider: string | null;
    periodMonths: number;
  }
): Promise<void> {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("subscriptions")
    .select("external_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.external_subscription_id === input.reference) return;

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + input.periodMonths);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan: "pro",
      status: "active",
      payment_method_type: input.paymentMethodType,
      payment_provider: input.paymentProvider,
      external_subscription_id: input.reference,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    })
    .eq("user_id", userId);

  if (error) throw error;
}

export type SubscriptionWithProfile = Subscription & {
  user_id: string;
  email: string;
  full_name: string | null;
};

// Panneau admin (/admin) : liste tous les abonnements avec l'e-mail associé.
// Pas de FK directe subscriptions -> profiles (les deux référencent
// auth.users séparément, voir architecture.md §1.11), donc jointure faite
// en mémoire plutôt que via l'embedding PostgREST — même pattern que
// listAllAttempts dans lib/quizzes/repository.ts.
export async function listAllSubscriptions(): Promise<SubscriptionWithProfile[]> {
  const supabase = createAdminClient();

  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select(`user_id, ${SUBSCRIPTION_COLUMNS}`)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!subscriptions || subscriptions.length === 0) return [];

  const userIds = subscriptions.map((s) => s.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds);

  const profileByUserId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return subscriptions.map((s) => ({
    ...s,
    email: profileByUserId.get(s.user_id)?.email ?? "",
    full_name: profileByUserId.get(s.user_id)?.full_name ?? null,
  }));
}
