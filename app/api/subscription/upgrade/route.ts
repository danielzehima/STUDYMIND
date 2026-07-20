import { getCurrentUser } from "@/lib/auth/session";
import { toErrorResponse } from "@/lib/errors";
import { upgradeToPro } from "@/lib/subscriptions/repository";

// Placeholder tant qu'aucun fournisseur de paiement (mobile money / carte)
// n'est choisi et intégré — voir architecture.md §5. Passe directement
// l'utilisateur au plan Pro, sans vérification de paiement réelle.
export async function POST() {
  try {
    const user = await getCurrentUser();
    const subscription = await upgradeToPro(user.id);
    return Response.json(subscription);
  } catch (error) {
    return toErrorResponse(error);
  }
}
