-- Formulaire de contact public (page /contact, lien Footer) — soumissions
-- possibles sans compte, donc user_id nullable. Écrit uniquement via le
-- service-role côté serveur (app/api/contact/route.ts), jamais depuis le
-- client avec la clé anonyme : RLS activée sans policy = accès refusé par
-- défaut pour anon/authenticated (défense en profondeur, voir 0001_init.sql
-- §1.1).
-- À coller dans le SQL Editor du dashboard Supabase du projet.

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;
