const PERIOD_LABEL: Record<"monthly" | "quarterly", string> = {
  monthly: "1 mois",
  quarterly: "1 trimestre",
};

export function invoiceEmailHtml(input: {
  amount: number;
  period: "monthly" | "quarterly";
  reference: string;
}): string {
  return `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 480px;">
      <h2 style="color: #4f46e5;">Paiement confirmé — Study Mind Pro</h2>
      <p>Merci pour votre paiement ! Votre abonnement <strong>Study Mind Pro</strong> (${PERIOD_LABEL[input.period]}) est actif.</p>
      <p><strong>Montant :</strong> ${input.amount.toLocaleString("fr-FR")} FCFA<br/>
      <strong>Référence :</strong> ${input.reference}</p>
      <p>Vous trouverez votre facture en pièce jointe.</p>
      <p style="color: #64748b; font-size: 13px;">— L'équipe Study Mind</p>
    </div>
  `;
}

export function paymentReminderEmailHtml(input: {
  amount: number;
  period: "monthly" | "quarterly";
  checkoutUrl: string;
}): string {
  return `
    <div style="font-family: sans-serif; color: #1e293b; max-width: 480px;">
      <h2 style="color: #4f46e5;">Votre passage au plan Pro n'est pas terminé</h2>
      <p>Vous avez commencé un paiement pour Study Mind Pro (${PERIOD_LABEL[input.period]}, ${input.amount.toLocaleString("fr-FR")} FCFA) mais il n'a pas été finalisé.</p>
      <p>
        <a href="${input.checkoutUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;">
          Terminer mon paiement
        </a>
      </p>
      <p style="color: #64748b; font-size: 13px;">Ce lien expire 24h après le début du paiement. Si vous ne souhaitez plus passer au plan Pro, ignorez simplement cet email.</p>
    </div>
  `;
}
