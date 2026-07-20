import {
  listPendingAttemptsForReminder,
  markReminderSent,
  updatePaymentAttemptStatus,
} from "@/lib/payments/repository";
import { sendEmail } from "@/lib/email/resend";
import { paymentReminderEmailHtml } from "@/lib/email/templates";

const REMINDER_AFTER_MINUTES = 120; // 2h après l'initiation du paiement
const CHECKOUT_EXPIRY_HOURS = 24; // durée de validité du lien GeniusPay

// Déclenché quotidiennement par Vercel Cron (voir vercel.json). Vercel
// ajoute automatiquement l'en-tête "Authorization: Bearer $CRON_SECRET"
// quand cette variable d'env est configurée sur le projet — voir
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret) {
    console.error("[cron/payment-reminders] CRON_SECRET manquant.");
    return Response.json({ error: "CONFIG_ERROR" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const attempts = await listPendingAttemptsForReminder(REMINDER_AFTER_MINUTES);

  let reminded = 0;
  let expired = 0;

  for (const attempt of attempts) {
    const ageHours = (Date.now() - new Date(attempt.created_at).getTime()) / 3_600_000;

    if (ageHours >= CHECKOUT_EXPIRY_HOURS || !attempt.checkout_url) {
      await updatePaymentAttemptStatus(attempt.reference, "expired");
      expired += 1;
      continue;
    }

    const result = await sendEmail({
      to: attempt.email,
      subject: "Terminez votre passage au plan Pro",
      html: paymentReminderEmailHtml({
        amount: attempt.amount,
        period: attempt.period,
        checkoutUrl: attempt.checkout_url,
      }),
    });

    if (result.sent) {
      await markReminderSent(attempt.id);
      reminded += 1;
    }
  }

  return Response.json({ checked: attempts.length, reminded, expired });
}
