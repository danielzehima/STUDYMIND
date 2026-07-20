import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Depuis Next.js 16, "Middleware" est renommé "Proxy" (même fonctionnement,
// fichier proxy.ts au lieu de middleware.ts). Voir architecture.md §2.3.
export function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Exclut aussi les endpoints appelés par des services externes
    // (webhook GeniusPay, Vercel Cron) : ils n'ont pas de session à
    // rafraîchir, et faire tourner ce middleware Edge dessus expose à un
    // bug connu de Vercel ("INVALID_REQUEST_METHOD") sur les requêtes
    // POST envoyées avec l'en-tête "Expect: 100-continue" par certains
    // clients HTTP serveur-à-serveur — voir
    // github.com/vercel/vercel/issues/8003.
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks/payment|api/cron/payment-reminders|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
