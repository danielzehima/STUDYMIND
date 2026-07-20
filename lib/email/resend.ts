import "server-only";
import { Resend } from "resend";

// Sans domaine vérifié dans Resend, seul l'envoi depuis onboarding@resend.dev
// vers l'adresse du propriétaire du compte fonctionne (mode sandbox) — voir
// resend.com/docs/dashboard/domains/introduction. Renseigner
// RESEND_FROM_EMAIL avec une adresse sur un domaine vérifié en production.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Study Mind <onboarding@resend.dev>";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

export type EmailAttachment = { filename: string; content: Buffer };

// N'échoue jamais bruyamment si RESEND_API_KEY est absent — les emails
// (factures, relances, notifications) sont toujours secondaires à l'action
// principale déjà effectuée (paiement activé, etc.), voir
// app/api/webhooks/payment/route.ts et app/api/cron/payment-reminders/route.ts.
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ sent: boolean }> {
  const resend = getClient();

  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY manquant — email "${input.subject}" à ${input.to} non envoyé.`
    );
    return { sent: false };
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: input.to,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    console.error("[email] Échec d'envoi:", error);
    return { sent: false };
  }

  return { sent: true };
}
