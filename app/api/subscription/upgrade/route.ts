import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse, AppError } from "@/lib/errors";
import { createPayment, GeniusPayError } from "@/lib/geniuspay/client";

const PRICING = {
  monthly: { amount: 3000, label: "1 mois" },
  quarterly: { amount: 7500, label: "1 trimestre" },
} as const;

type Period = keyof typeof PRICING;

// Initie un paiement GeniusPay (mode checkout hébergé, voir
// lib/geniuspay/client.ts) et retourne son URL. Le passage effectif au plan
// Pro n'a lieu qu'à la réception du webhook payment.success signé
// (app/api/webhooks/payment/route.ts) — jamais directement ici.
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    const body = await request.json().catch(() => ({}));
    const period: Period = body?.period === "quarterly" ? "quarterly" : "monthly";
    const pricing = PRICING[period];

    const origin = new URL(request.url).origin;

    const payment = await createPayment({
      amount: pricing.amount,
      description: `Abonnement Study Mind Pro — ${pricing.label}`,
      customer: user.email ? { email: user.email } : undefined,
      metadata: { user_id: user.id, period },
      success_url: `${origin}/subscription?payment=pending`,
      error_url: `${origin}/subscription?payment=error`,
    });

    if (!payment.checkout_url) {
      throw new AppError(
        "PAYMENT_INIT_FAILED",
        "GeniusPay n'a pas retourné d'URL de paiement.",
        502
      );
    }

    return Response.json({ checkout_url: payment.checkout_url });
  } catch (error) {
    if (error instanceof GeniusPayError) {
      return toErrorResponse(
        new AppError("PAYMENT_INIT_FAILED", error.message, 502)
      );
    }
    return toErrorResponse(error);
  }
}
