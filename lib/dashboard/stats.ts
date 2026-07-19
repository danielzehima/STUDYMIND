import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type DashboardStats = {
  plan: 'free' | 'pro'
  documentsCount: number
  documentsLimit: number | null
  quizzesTaken: number
  averageScore: number | null
}

// Helper de scaffolding pour l'Étape 3 — sera recomposé à partir de
// lib/documents/repository.ts et lib/quizzes/repository.ts une fois ces
// modules créés (Étapes 4/5), en gardant le même pattern service-role +
// filtre user_id explicite (voir architecture.md §1.1).
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = (profile?.plan ?? 'free') as 'free' | 'pro'

  const [{ data: limits }, { count: documentsCount }, { data: attempts }] =
    await Promise.all([
      supabase.from('plan_limits').select('max_documents').eq('plan', plan).single(),
      supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('quiz_attempts')
        .select('score, total_questions')
        .eq('user_id', userId),
    ])

  const quizzesTaken = attempts?.length ?? 0
  const averageScore =
    quizzesTaken > 0 && attempts
      ? Math.round(
          (attempts.reduce((sum, a) => sum + a.score / a.total_questions, 0) /
            quizzesTaken) *
            100
        )
      : null

  return {
    plan,
    documentsCount: documentsCount ?? 0,
    documentsLimit: limits?.max_documents ?? null,
    quizzesTaken,
    averageScore,
  }
}
