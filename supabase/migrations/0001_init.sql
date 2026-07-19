-- Schéma initial — voir architecture.md section 1 pour le détail et la justification
-- de chaque choix. À coller dans le SQL Editor du dashboard Supabase du projet
-- (https://supabase.com/dashboard/project/uitadaccbhnuuycfpnya/sql/new), car ce
-- projet n'est pas accessible depuis l'outil MCP connecté à cette session.

-- 1.2 profiles ---------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 1.3 plan_limits -------------------------------------------------------------

create table public.plan_limits (
  plan                      text primary key check (plan in ('free', 'pro')),
  max_documents             integer,        -- null = illimité
  can_resolve_exercises     boolean not null default false
);

insert into public.plan_limits (plan, max_documents, can_resolve_exercises) values
  ('free', 3, false),
  ('pro', null, true);

-- 1.4 subscriptions -------------------------------------------------------------

create table public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users(id) on delete cascade,
  plan                     text not null default 'free' check (plan in ('free', 'pro')),
  status                   text not null default 'active'
                             check (status in ('active','trialing','past_due','canceled','incomplete','expired')),
  payment_method_type      text check (payment_method_type in ('card', 'mobile_money')),
  payment_provider         text,
  external_customer_id     text,
  external_subscription_id text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Triggers : création profil + abonnement free à l'inscription, puis
-- synchronisation profiles.plan à chaque changement de subscriptions.

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.subscriptions (user_id, plan, status)
    values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.sync_profile_plan()
returns trigger as $$
begin
  update public.profiles
  set plan = case
    when new.status in ('active', 'trialing') then new.plan
    else 'free'
  end,
  updated_at = now()
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_subscription_change
  after insert or update on public.subscriptions
  for each row execute procedure public.sync_profile_plan();

-- 1.5 documents -------------------------------------------------------------

create table public.documents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  original_filename text not null,
  file_type         text not null check (file_type in ('pdf', 'docx', 'txt')),
  extracted_text    text not null,
  summary           text,
  key_points        jsonb,
  status            text not null default 'uploaded'
                       check (status in ('uploaded', 'processing', 'ready', 'failed')),
  error_message     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id);

-- 1.6 quizzes -------------------------------------------------------------

create table public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index quizzes_document_id_idx on public.quizzes (document_id);
create index quizzes_user_id_idx on public.quizzes (user_id);

-- 1.7 quiz_questions -------------------------------------------------------------

create table public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  order_index    integer not null,
  question_text  text not null,
  options        jsonb not null,
  correct_index  integer not null check (correct_index between 0 and 3),
  explanation    text not null default ''
);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

-- 1.8 quiz_attempts -------------------------------------------------------------

create table public.quiz_attempts (
  id               uuid primary key default gen_random_uuid(),
  quiz_id          uuid not null references public.quizzes(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  score            integer not null,
  total_questions  integer not null,
  created_at       timestamptz not null default now()
);

create index quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id);
create index quiz_attempts_user_id_idx on public.quiz_attempts (user_id);

-- 1.9 quiz_attempt_answers -------------------------------------------------------------

create table public.quiz_attempt_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id     uuid not null references public.quiz_questions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  selected_index  integer,
  is_correct      boolean not null
);

create index quiz_attempt_answers_attempt_id_idx on public.quiz_attempt_answers (attempt_id);

-- 1.10 exercise_resolutions / exercise_items (Pro) -------------------------------

create table public.exercise_resolutions (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid not null references public.documents(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  status         text not null default 'pending'
                   check (status in ('pending', 'processing', 'ready', 'failed')),
  error_message  text,
  created_at     timestamptz not null default now()
);

create table public.exercise_items (
  id             uuid primary key default gen_random_uuid(),
  resolution_id  uuid not null references public.exercise_resolutions(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  order_index    integer not null,
  exercise_text  text not null,
  solution_text  text not null,
  final_answer   text,
  confidence     text check (confidence in ('high', 'medium', 'low')),
  created_at     timestamptz not null default now()
);

create index exercise_resolutions_document_id_idx on public.exercise_resolutions (document_id);
create index exercise_items_resolution_id_idx on public.exercise_items (resolution_id);

-- 1.12 RLS -------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.plan_limits enable row level security;
alter table public.documents enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.exercise_resolutions enable row level security;
alter table public.exercise_items enable row level security;

-- profiles : lecture/écriture de son propre profil (le trigger utilise
-- security definer donc n'est pas bloqué par RLS ; le client ne devrait
-- normalement modifier que full_name côté applicatif, pas plan).
create policy "select_own_profile" on public.profiles
  for select using (auth.uid() = id);
create policy "update_own_profile" on public.profiles
  for update using (auth.uid() = id);

-- subscriptions : lecture seule pour l'utilisateur, aucune écriture cliente.
create policy "select_own_subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

-- plan_limits : lecture publique (table de configuration, pas de données sensibles).
create policy "select_plan_limits" on public.plan_limits
  for select using (true);

-- Pattern répété pour toutes les tables métier avec user_id.
create policy "select_own_documents" on public.documents for select using (auth.uid() = user_id);
create policy "insert_own_documents" on public.documents for insert with check (auth.uid() = user_id);
create policy "update_own_documents" on public.documents for update using (auth.uid() = user_id);
create policy "delete_own_documents" on public.documents for delete using (auth.uid() = user_id);

create policy "select_own_quizzes" on public.quizzes for select using (auth.uid() = user_id);
create policy "insert_own_quizzes" on public.quizzes for insert with check (auth.uid() = user_id);
create policy "delete_own_quizzes" on public.quizzes for delete using (auth.uid() = user_id);

create policy "select_own_quiz_questions" on public.quiz_questions for select using (auth.uid() = user_id);
create policy "insert_own_quiz_questions" on public.quiz_questions for insert with check (auth.uid() = user_id);

create policy "select_own_quiz_attempts" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "insert_own_quiz_attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);

create policy "select_own_quiz_attempt_answers" on public.quiz_attempt_answers for select using (auth.uid() = user_id);
create policy "insert_own_quiz_attempt_answers" on public.quiz_attempt_answers for insert with check (auth.uid() = user_id);

create policy "select_own_exercise_resolutions" on public.exercise_resolutions for select using (auth.uid() = user_id);
create policy "insert_own_exercise_resolutions" on public.exercise_resolutions for insert with check (auth.uid() = user_id);
create policy "delete_own_exercise_resolutions" on public.exercise_resolutions for delete using (auth.uid() = user_id);

create policy "select_own_exercise_items" on public.exercise_items for select using (auth.uid() = user_id);
create policy "insert_own_exercise_items" on public.exercise_items for insert with check (auth.uid() = user_id);
