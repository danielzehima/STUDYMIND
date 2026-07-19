import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Client service-role : bypass RLS. Ne JAMAIS importer ce module depuis un
// fichier "use client". Toute fonction qui l'utilise doit filtrer
// manuellement par user_id (voir architecture.md §1.1).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
