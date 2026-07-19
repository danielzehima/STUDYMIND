import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { UnauthorizedError } from '@/lib/errors'

// À appeler en tête de tout Server Component, Server Action ou Route Handler
// qui nécessite un utilisateur authentifié.
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new UnauthorizedError()
  }

  return user
}
