-- Système de feedback utilisateur (page /feedback) — permet aux
-- utilisateurs de laisser un avis (note + message) pour aider à améliorer
-- le SaaS, consultable par l'admin depuis /admin.
-- À coller dans le SQL Editor du dashboard Supabase du projet, comme
-- 0001_init.sql et 0002_admin_role.sql (pas de migration automatique).

create table public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  message     text not null,
  rating      integer check (rating between 1 and 5),
  created_at  timestamptz not null default now()
);

create index feedback_user_id_idx on public.feedback (user_id);
create index feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

create policy "select_own_feedback" on public.feedback for select using (auth.uid() = user_id);
create policy "insert_own_feedback" on public.feedback for insert with check (auth.uid() = user_id);
