import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateProFromPayment } from "@/lib/subscriptions/repository";
import {
  getPaymentAttemptByReference,
  updatePaymentAttemptStatus,
  type PaymentAttemptStatus,
} from "@/lib/payments/repository";
import { createInvoiceIfMissing, markInvoiceEmailSent } from "@/lib/invoices/repository";
import { buildInvoicePdf } from "@/lib/invoices/export";
import { sendEmail } from "@/lib/email/resend";
import { invoiceEmailHtml } from "@/lib/email/templates";

const REPLAY_WINDOW_SECONDS = 300;

const STATUS_BY_EVENT: Record<string, PaymentAttemptStatus> = {
  "payment.success": "completed",
  "payment.failed": "failed",
  "payment.cancelled": "cancelled",
  "payment.expired": "expired",
};

function isValidSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf-8");
  const signatureBuffer = Buffer.from(signature, "utf-8");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

async function handlePaymentSuccess(reference: string, fallbackUserId?: string) {
  const attempt = await getPaymentAttemptByReference(reference);
  const userId = attempt?.user_id ?? fallbackUserId;

  if (!userId) {
    console.error(
      "[webhooks/payment] payment.success sans payment_attempt ni user_id exploitable",
      { reference }
    );
    return;
  }

  const period = attempt?.period ?? "monthly";
  const amount = attempt?.amount ?? (period === "quarterly" ? 12000 : 5000);

  await activateProFromPayment(userId, {
    reference,
    paymentMethodType: "mobile_money",
    paymentProvider: null,
    periodMonths: period === "quarterly" ? 3 : 1,
  });

  if (!attempt) return; // Pas de payment_attempt -> pas de facture rattachable.

  const invoice = await createInvoiceIfMissing({
    userId,
    paymentAttemptId: attempt.id,
    reference,
    amount,
    period,
  });

  if (invoice.email_sent_at) return; // Déjà envoyée (webhook livré 2x).

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.email) return;

  const pdf = await buildInvoicePdf({
    invoiceId: invoice.id,
    reference,
    amount,
    period,
    customerEmail: profile.email,
    issuedAt: new Date(invoice.created_at),
  });

  const result = await sendEmail({
    to: profile.email,
    subject: "Votre facture Study Mind Pro",
    html: invoiceEmailHtml({ amount, period, reference }),
    attachments: [{ filename: `facture-${reference}.pdf`, content: pdf }],
  });

  if (result.sent) {
    await markInvoiceEmailSent(invoice.id);
  }
}

// Récepteur de webhook GeniusPay — voir https://geniuspay.ci/docs/api
// (section Webhooks). Format de signature :
// HMAC-SHA256(timestamp + "." + json_payload, whsec_secret), comparée en
// temps constant. On lit le corps en texte brut (pas de re-sérialisation)
// pour que le HMAC soit calculé exactement sur les octets envoyés.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[webhooks/payment] GENIUSPAY_WEBHOOK_SECRET manquant.");
    return Response.json(
      { error_code: "CONFIG_ERROR", message: "Configuration serveur incomplète." },
      { status: 500 }
    );
  }

  if (!signature || !timestamp) {
    return Response.json(
      { error_code: "INVALID_SIGNATURE", message: "En-têtes de signature manquants." },
      { status: 401 }
    );
  }

  if (!isValidSignature(rawBody, timestamp, signature, secret)) {
    return Response.json(
      { error_code: "INVALID_SIGNATURE", message: "Signature invalide." },
      { status: 401 }
    );
  }

  const timestampAge = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(timestampAge) || timestampAge > REPLAY_WINDOW_SECONDS) {
    return Response.json(
      { error_code: "TIMESTAMP_EXPIRED", message: "Timestamp expiré." },
      { status: 400 }
    );
  }

  let payload: {
    event?: string;
    data?: {
      reference?: string;
      metadata?: { user_id?: string; period?: string };
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { error_code: "INVALID_PAYLOAD", message: "Payload JSON invalide." },
      { status: 400 }
    );
  }

  const event = payload.event;
  const reference = payload.data?.reference;
  const mappedStatus = event ? STATUS_BY_EVENT[event] : undefined;

  if (mappedStatus && typeof reference === "string") {
    await updatePaymentAttemptStatus(reference, mappedStatus).catch((error) => {
      console.error("[webhooks/payment] échec mise à jour payment_attempts", error);
    });

    if (event === "payment.success") {
      await handlePaymentSuccess(reference, payload.data?.metadata?.user_id);
    }
  }

  // cashout.*, payment.initiated, payment.refunded, webhook.test : rien à
  // synchroniser pour l'instant.

  return Response.json({ received: true });
}
