// Récepteur de webhook générique — placeholder non branché à un fournisseur
// réel (voir architecture.md §3.5/§5 : choix du fournisseur mobile money/
// carte encore ouvert). Renvoie 501 tant qu'aucune vérification de signature
// ni logique de synchronisation d'abonnement n'est implémentée.
export async function POST() {
  return Response.json(
    {
      error_code: "NOT_IMPLEMENTED",
      message: "Aucun fournisseur de paiement n'est encore branché.",
    },
    { status: 501 }
  );
}
