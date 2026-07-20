import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Invoice = {
  id: string;
  user_id: string;
  payment_attempt_id: string;
  reference: string;
  amount: number;
  period: "monthly" | "quarterly";
  email_sent_at: string | null;
  created_at: string;
};

const INVOICE_COLUMNS =
  "id, user_id, payment_attempt_id, reference, amount, period, email_sent_at, created_at";

// Une facture par référence GeniusPay (contrainte unique en base) —
// idempotent si le webhook payment.success est livré plusieurs fois.
export async function createInvoiceIfMissing(input: {
  userId: string;
  paymentAttemptId: string;
  reference: string;
  amount: number;
  period: "monthly" | "quarterly";
}): Promise<Invoice> {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .eq("reference", input.reference)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_id: input.userId,
      payment_attempt_id: input.paymentAttemptId,
      reference: input.reference,
      amount: input.amount,
      period: input.period,
    })
    .select(INVOICE_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function markInvoiceEmailSent(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("invoices")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function listInvoicesForUser(userId: string): Promise<Invoice[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getInvoice(userId: string, id: string): Promise<Invoice | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
