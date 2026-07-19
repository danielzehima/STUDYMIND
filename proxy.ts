import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Depuis Next.js 16, "Middleware" est renommé "Proxy" (même fonctionnement,
// fichier proxy.ts au lieu de middleware.ts). Voir architecture.md §2.3.
export function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
