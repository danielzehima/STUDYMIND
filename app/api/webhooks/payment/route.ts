import crypto from "node:crypto";
import { activateProFromPayment } from "@/lib/subscriptions/repository";

const REPLAY_WINDOW_SECONDS = 300;

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
      payment_method?: string;
      provider?: string;
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

  if (payload.event === "payment.success") {
    const userId = payload.data?.metadata?.user_id;
    const reference = payload.data?.reference;

    if (typeof userId === "string" && typeof reference === "string") {
      await activateProFromPayment(userId, {
        reference,
        paymentMethodType:
          payload.data?.payment_method === "card" ? "card" : "mobile_money",
        paymentProvider: payload.data?.provider ?? null,
        periodMonths: payload.data?.metadata?.period === "quarterly" ? 3 : 1,
      });
    } else {
      console.error(
        "[webhooks/payment] payment.success sans user_id/reference exploitable",
        payload.data
      );
    }
  }

  // payment.failed / cancelled / expired / refunded, cashout.* : rien à
  // synchroniser, l'utilisateur reste sur son plan actuel (jamais dégradé
  // automatiquement suite à un paiement non confirmé).

  return Response.json({ received: true });
}
