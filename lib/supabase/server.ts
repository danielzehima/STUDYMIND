import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client "session utilisateur" : à utiliser dans les Server Components et Route
// Handlers pour tout ce qui touche à la session de l'utilisateur courant (jamais
// pour les requêtes de données qui doivent bypasser RLS — voir lib/supabase/admin.ts).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Appelé depuis un Server Component : sans effet si proxy.ts
            // rafraîchit déjà la session sur chaque requête.
          }
        },
      },
    }
  )
}
