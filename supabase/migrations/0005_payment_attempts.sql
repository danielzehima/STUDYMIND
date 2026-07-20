-- Trace chaque paiement GeniusPay initié (avant même sa confirmation) pour
-- pouvoir relancer les paniers abandonnés (voir
-- app/api/cron/payment-reminders/route.ts) et lister l'historique de
-- facturation. Écrit/lu uniquement via le service-role côté serveur.
-- À coller dans le SQL Editor du dashboard Supabase du projet.

create table public.payment_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  reference         text not null unique,
  amount            integer not null,
  period            text not null check (period in ('monthly', 'quarterly')),
  status            text not null default 'pending'
                       check (status in ('pending', 'completed', 'failed', 'cancelled', 'expired')),
  checkout_url      text,
  reminder_sent_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index payment_attempts_user_id_idx on public.payment_attempts (user_id);
create index payment_attempts_status_idx on public.payment_attempts (status);

alter table public.payment_attempts enable row level security;

create policy "select_own_payment_attempts" on public.payment_attempts for select using (auth.uid() = user_id);

-- Facture générée à la volée (PDF, voir lib/invoices/export.ts) pour chaque
-- paiement confirmé — une ligne par payment_attempts.status = 'completed'.
create table public.invoices (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  payment_attempt_id  uuid not null references public.payment_attempts(id) on delete cascade,
  reference           text not null unique,
  amount              integer not null,
  period              text not null check (period in ('monthly', 'quarterly')),
  email_sent_at       timestamptz,
  created_at          timestamptz not null default now()
);

create index invoices_user_id_idx on public.invoices (user_id);

alter table public.invoices enable row level security;

create policy "select_own_invoices" on public.invoices for select using (auth.uid() = user_id);
