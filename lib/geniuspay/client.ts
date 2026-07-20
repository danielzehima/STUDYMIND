import "server-only";

const BASE_URL = "https://geniuspay.ci/api/v1/merchant";

export class GeniusPayError extends Error {}

function authHeaders(): Record<string, string> {
  const apiKey = process.env.GENIUSPAY_API_KEY;
  const apiSecret = process.env.GENIUSPAY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new GeniusPayError("Clés GeniusPay manquantes côté serveur.");
  }

  return {
    "X-API-Key": apiKey,
    "X-API-Secret": apiSecret,
    "Content-Type": "application/json",
  };
}

export type CreatePaymentInput = {
  amount: number;
  description: string;
  customer?: { name?: string; email?: string; phone?: string };
  metadata?: Record<string, string>;
  success_url?: string;
  error_url?: string;
};

export type GeniusPayPayment = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  checkout_url?: string;
  payment_url?: string;
};

// Mode checkout (pas de payment_method) : GeniusPay retourne une
// checkout_url hébergée où le client choisit lui-même son moyen de
// paiement (Wave, Orange Money, MTN, carte...) — voir
// https://geniuspay.ci/docs/api.
export async function createPayment(
  input: CreatePaymentInput
): Promise<GeniusPayPayment> {
  const response = await fetch(`${BASE_URL}/payments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    throw new GeniusPayError(
      body?.error?.message ?? `Erreur GeniusPay (${response.status}).`
    );
  }

  return body.data as GeniusPayPayment;
}

// Utilisé en secours si un client signale un paiement "coincé" (webhook
// perdu) — permet à un admin/support de vérifier le statut réel côté
// GeniusPay sans attendre un nouveau webhook.
export async function getPayment(reference: string): Promise<GeniusPayPayment> {
  const response = await fetch(`${BASE_URL}/payments/${reference}`, {
    headers: authHeaders(),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    throw new GeniusPayError(
      body?.error?.message ?? `Erreur GeniusPay (${response.status}).`
    );
  }

  return body.data as GeniusPayPayment;
}
