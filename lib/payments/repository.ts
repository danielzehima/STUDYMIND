import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PaymentAttemptStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export type PaymentAttempt = {
  id: string;
  user_id: string;
  reference: string;
  amount: number;
  period: "monthly" | "quarterly";
  status: PaymentAttemptStatus;
  checkout_url: string | null;
  reminder_sent_at: string | null;
  created_at: string;
};

export async function createPaymentAttempt(input: {
  userId: string;
  reference: string;
  amount: number;
  period: "monthly" | "quarterly";
  checkoutUrl: string;
}): Promise<PaymentAttempt> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_attempts")
    .insert({
      user_id: input.userId,
      reference: input.reference,
      amount: input.amount,
      period: input.period,
      checkout_url: input.checkoutUrl,
    })
    .select(
      "id, user_id, reference, amount, period, status, checkout_url, reminder_sent_at, created_at"
    )
    .single();

  if (error) throw error;
  return data;
}

// Appelé depuis le webhook GeniusPay pour tout événement de paiement
// (success/failed/cancelled/expired) — voir
// app/api/webhooks/payment/route.ts. Idempotent par nature (une simple mise
// à jour de statut, sans effet cumulatif).
export async function updatePaymentAttemptStatus(
  reference: string,
  status: PaymentAttemptStatus
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("payment_attempts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("reference", reference);

  if (error) throw error;
}

export async function getPaymentAttemptByReference(
  reference: string
): Promise<PaymentAttempt | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_attempts")
    .select(
      "id, user_id, reference, amount, period, status, checkout_url, reminder_sent_at, created_at"
    )
    .eq("reference", reference)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type PendingAttemptForReminder = PaymentAttempt & {
  email: string;
};

// Utilisé par le cron quotidien de relance (voir
// app/api/cron/payment-reminders/route.ts) : paiements initiés il y a plus
// de `olderThanMinutes`, jamais relancés, toujours "pending" (ni payés ni
// explicitement échoués/annulés/expirés côté GeniusPay).
export async function listPendingAttemptsForReminder(
  olderThanMinutes: number
): Promise<PendingAttemptForReminder[]> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000).toISOString();

  const { data: attempts, error } = await supabase
    .from("payment_attempts")
    .select(
      "id, user_id, reference, amount, period, status, checkout_url, reminder_sent_at, created_at"
    )
    .eq("status", "pending")
    .is("reminder_sent_at", null)
    .lt("created_at", cutoff);

  if (error) throw error;
  if (!attempts || attempts.length === 0) return [];

  const userIds = [...new Set(attempts.map((a) => a.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emailByUserId = new Map((profiles ?? []).map((p) => [p.id, p.email]));

  return attempts
    .map((a) => ({ ...a, email: emailByUserId.get(a.user_id) ?? "" }))
    .filter((a) => a.email);
}

export async function markReminderSent(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("payment_attempts")
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
