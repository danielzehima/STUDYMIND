# Architecture — Plateforme de révision intelligente (DeepSeek)

Document de conception pour l'Étape 1. Aucune ligne de code n'est écrite à ce stade.
Stack imposée : Next.js (App Router, frontend+backend unifiés), Tailwind CSS, Supabase
(Postgres + Auth), DeepSeek API, déploiement Vercel/GitHub.

---

## 1. Schéma de base de données Supabase (PostgreSQL)

### 1.1 Principes directeurs

- **RLS plate** : chaque table métier porte une colonne `user_id` (même quand elle est
  dérivable via une jointure, ex. `quiz_questions.user_id`), pour que chaque politique RLS
  soit un simple `auth.uid() = user_id`. Ce choix reprend le pattern du projet frère.
- **RLS = défense en profondeur, pas le mécanisme d'autorisation principal.** Toute la
  logique applicative passe par un client Supabase **service-role** côté serveur
  (`lib/supabase/admin.ts`), et chaque fonction de repository filtre explicitement par
  `user_id` extrait de la session vérifiée. RLS reste activée sur toutes les tables au cas
  où une requête cliente directe (Realtime, appel accidentel avec la clé anonyme) serait
  faite un jour.
- **404 partout, jamais 403** pour une ressource inexistante ou appartenant à un autre
  utilisateur (ne pas révéler l'existence d'une ressource).
- **Pas de stockage du fichier original.** Seul le texte extrait (`extracted_text`) est
  persisté — comme le projet frère. Aucune raison technique liée à Next.js/Vercel de
  changer cette contrainte : le fichier n'est nécessaire que le temps de l'extraction dans
  le Route Handler d'upload, puis il est jeté.
- **Enums en `text` + `CHECK`, pas en `ENUM` Postgres natif**, pour rester facilement
  extensible (ajouter un futur fournisseur de mobile money ne doit pas nécessiter une
  migration `ALTER TYPE` contrainte transactionnellement).
- Extension requise : `pgcrypto` (activée par défaut sur Supabase) pour `gen_random_uuid()`.

### 1.2 `profiles` — extension de `auth.users`

`auth.users` est géré par Supabase Auth et ne doit pas être modifié directement. `profiles`
stocke les données applicatives, créée automatiquement à l'inscription via un trigger.

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  plan        text not null default 'free' check (plan in ('free', 'pro')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

`profiles.plan` est une **copie dénormalisée** de l'état d'abonnement, maintenue à jour par
un trigger sur `subscriptions` (voir 1.4). Raison : le plan est lu à quasiment chaque requête
(gating des routes, upload, dashboard) — éviter une jointure vers `subscriptions` sur chaque
requête est plus simple et plus rapide qu'une vue calculée. `subscriptions` reste la seule
**source de vérité** pour tout ce qui touche à la facturation.

Trigger de création (à la manière du pattern Supabase standard) :

```sql
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
```

### 1.3 `plan_limits` (table de configuration, recommandée)

Plutôt que de coder en dur "3 documents" dans le code applicatif, une petite table de
référence permet d'ajuster les limites sans redéploiement :

```sql
create table public.plan_limits (
  plan                      text primary key check (plan in ('free', 'pro')),
  max_documents             integer,        -- null = illimité
  can_resolve_exercises     boolean not null default false
);

insert into public.plan_limits (plan, max_documents, can_resolve_exercises) values
  ('free', 3, false),
  ('pro', null, true);   -- valeurs à confirmer avec l'utilisateur
```

Lue par le helper `lib/subscriptions/plan-limits.ts`. Cette table n'est **pas** un
mécanisme d'intégrité (pas de contrainte DB sur `documents`), seulement une source de
configuration lue par la logique applicative — voir 1.4 pour l'enforcement réel.

### 1.4 `subscriptions`

Une ligne « état courant » par utilisateur (upsert à chaque changement). Conçue pour ne
pas verrouiller un fournisseur de paiement unique : carte (style Stripe) et mobile money
(forme différente) partagent la même table via `payment_method_type`/`payment_provider`
génériques + un `metadata jsonb` pour les champs spécifiques au fournisseur (4 derniers
chiffres de carte, numéro de téléphone mobile money, etc.).

```sql
create table public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references auth.users(id) on delete cascade,
  plan                     text not null default 'free' check (plan in ('free', 'pro')),
  status                   text not null default 'active'
                             check (status in ('active','trialing','past_due','canceled','incomplete','expired')),
  payment_method_type      text check (payment_method_type in ('card', 'mobile_money')),
  payment_provider         text,   -- ex: 'stripe', 'orange_money', 'mtn_momo', 'wave' — texte libre validé côté app
  external_customer_id     text,   -- référence client chez le fournisseur
  external_subscription_id text,   -- référence abonnement/transaction chez le fournisseur
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
```

**Important** : aucune politique RLS d'`INSERT`/`UPDATE`/`DELETE` pour le rôle
`authenticated`. Seul le service-role (webhook de paiement, ou une Server Action serveur
après vérification du paiement) peut écrire dans cette table — un utilisateur ne doit
jamais pouvoir modifier son propre plan directement.

Trigger de synchronisation vers `profiles.plan` :

```sql
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
```

### 1.5 `documents`

```sql
create table public.documents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  original_filename text not null,
  file_type         text not null check (file_type in ('pdf', 'docx', 'txt')),
  extracted_text    text not null,
  summary           text,             -- rempli après l'étape 2 du pipeline IA
  key_points        jsonb,            -- tableau de chaînes
  status            text not null default 'uploaded'
                       check (status in ('uploaded', 'processing', 'ready', 'failed')),
  error_message     text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id);
```

**Note d'implémentation — plafond de 3 documents (Free) :** ce n'est **pas** une contrainte
de base de données. Il est appliqué côté application, dans une fonction
`canUploadDocument(userId)` de `lib/subscriptions/plan-limits.ts` qui compte les documents
de l'utilisateur (`select count(*) from documents where user_id = ...`, éventuellement en
excluant `status = 'failed'` — *point à confirmer*) et compare au `max_documents` de
`plan_limits`. Cela reproduit la discipline du projet frère (enforcement applicatif, pas
contrainte DB) et permet un message d'erreur clair avec appel à l'action « passer en Pro »
plutôt qu'une violation de contrainte générique.

Le champ `status` (absent du projet frère) est ajouté car le pipeline ici combine extraction
+ appel DeepSeek dans un Route Handler potentiellement proche de la limite de durée d'une
fonction Vercel — le statut permet à l'UI d'afficher un état de chargement fiable et de
gérer un échec proprement (`failed` + `error_message`), y compris via un polling léger ou
une souscription Supabase Realtime sur cette table.

### 1.6 `quizzes`

```sql
create table public.quizzes (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create index quizzes_document_id_idx on public.quizzes (document_id);
create index quizzes_user_id_idx on public.quizzes (user_id);
```

Pas de colonne `status` : la génération de quiz reste un unique appel DeepSeek synchrone
dans le Route Handler ; la ligne n'est créée qu'en cas de succès (cf. §3).

### 1.7 `quiz_questions`

```sql
create table public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  order_index    integer not null,
  question_text  text not null,
  options        jsonb not null,       -- tableau de 4 chaînes
  correct_index  integer not null check (correct_index between 0 and 3),
  explanation    text not null default ''
);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);
```

### 1.8 `quiz_attempts`

```sql
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
```

### 1.9 `quiz_attempt_answers`

```sql
create table public.quiz_attempt_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id     uuid not null references public.quiz_questions(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  selected_index  integer,     -- null si non répondu
  is_correct      boolean not null
);

create index quiz_attempt_answers_attempt_id_idx on public.quiz_attempt_answers (attempt_id);
```

### 1.10 `exercise_resolutions` et `exercise_items` (Pro uniquement)

Mêmes principes que `quizzes`/`quiz_questions` (parent + enfants), pour la fonctionnalité
exclusive Pro « identification et résolution des exercices » :

```sql
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
  exercise_text  text not null,   -- énoncé de l'exercice identifié dans le document
  solution_text  text not null,   -- résolution détaillée générée par l'IA
  final_answer   text,            -- réponse finale courte, extraite séparément pour l'affichage
  confidence     text check (confidence in ('high', 'medium', 'low')),
  created_at     timestamptz not null default now()
);

create index exercise_resolutions_document_id_idx on public.exercise_resolutions (document_id);
create index exercise_items_resolution_id_idx on public.exercise_items (resolution_id);
```

`status`/`error_message` sur `exercise_resolutions` car ce pipeline est le plus lourd
(identification + résolution mathématique/logique, potentiellement plusieurs exercices par
document) — le plus susceptible de nécessiter un état intermédiaire visible côté UI.

### 1.11 Relations (résumé)

```
auth.users (Supabase) 1──1 profiles
auth.users            1──1 subscriptions
auth.users            1──N documents
documents             1──N quizzes
quizzes               1──N quiz_questions
quizzes               1──N quiz_attempts
quiz_attempts          1──N quiz_attempt_answers  (quiz_attempt_answers.question_id → quiz_questions)
documents              1──N exercise_resolutions
exercise_resolutions   1──N exercise_items
```

### 1.12 Politiques RLS (pattern répété par table)

Pour chaque table métier (`documents`, `quizzes`, `quiz_questions`, `quiz_attempts`,
`quiz_attempt_answers`, `exercise_resolutions`, `exercise_items`) :

```sql
alter table public.documents enable row level security;

create policy "select_own_documents" on public.documents
  for select using (auth.uid() = user_id);

create policy "insert_own_documents" on public.documents
  for insert with check (auth.uid() = user_id);

create policy "update_own_documents" on public.documents
  for update using (auth.uid() = user_id);

create policy "delete_own_documents" on public.documents
  for delete using (auth.uid() = user_id);
```

Pour `subscriptions` : uniquement une politique `select_own` (voir §1.4) — pas d'écriture
autorisée pour `authenticated`. Pour `profiles` : `select_own` + `update_own` restreint aux
colonnes non sensibles (`full_name`) — `plan` ne doit pas être modifiable par le client
(à appliquer via policy `with check` limitée ou via un trigger de protection ; *détail
d'implémentation à trancher en Étape 2*).

---

## 2. Structure de l'application Next.js (App Router)

### 2.1 Arborescence

```
app/
  (auth)/
    layout.tsx                     # layout centré, pas de sidebar
    login/page.tsx
    signup/page.tsx
  (dashboard)/
    layout.tsx                     # Sidebar + Topbar, Server Component, lit la session
    dashboard/page.tsx             # stats (Server Component, lecture directe Supabase)
    documents/page.tsx             # liste + upload
    documents/[id]/page.tsx        # détail : résumé, points clés, actions
    documents/[id]/quiz/page.tsx           # lancer/repasser un quiz (Client Component)
    documents/[id]/quiz/[quizId]/page.tsx  # jouer le quiz (Client Component interactif)
    documents/[id]/exercises/page.tsx      # résolutions d'exercices (Pro)
    history/page.tsx               # historique global des tentatives de quiz
    subscription/page.tsx          # gestion abonnement, upgrade/downgrade
  api/
    documents/route.ts                       # GET liste, POST upload
    documents/[id]/route.ts                  # GET détail, DELETE
    documents/[id]/quiz/route.ts             # POST générer, GET lister
    documents/[id]/attempts/route.ts         # GET historique tentatives pour ce document
    documents/[id]/exercises/route.ts        # POST générer (Pro), GET récupérer
    quizzes/[quizId]/route.ts                # GET quiz à jouer (réponses masquées)
    quizzes/[quizId]/submit/route.ts         # POST soumission + correction serveur
    subscription/route.ts                    # GET état abonnement
    subscription/upgrade/route.ts            # POST changer vers Pro (placeholder)
    subscription/downgrade/route.ts          # POST revenir à Free
    webhooks/payment/route.ts                # POST récepteur webhook (placeholder générique)
    stats/route.ts                           # GET stats agrégées (usage client-side/refresh)
  layout.tsx
  page.tsx                          # landing / redirection

components/
  dashboard/  (Sidebar, Topbar, StatCard, PlanBadge)
  documents/  (UploadForm [client], DocumentList, DocumentCard, StatusBadge)
  quiz/       (QuizPlayer [client], QuestionCard, ResultsSummary)
  exercises/  (ExerciseSolutionCard, ProLockedBanner)
  subscription/ (PlanComparisonTable, PaymentMethodForm placeholder)
  ui/         (primitives Tailwind : Button, Card, Badge, Input, Skeleton, Toast)

lib/
  supabase/
    server.ts       # createServerClient (@supabase/ssr) — Server Components & Route Handlers
    client.ts        # createBrowserClient — Client Components
    middleware.ts     # helper de rafraîchissement de session, appelé depuis proxy.ts
    admin.ts          # client service-role, "server-only", bypass RLS
  auth/
    session.ts        # getCurrentUser() — lève UnauthorizedError si absent
  deepseek/
    client.ts          # callDeepSeekJSON(systemPrompt, userContent, opts) générique, retry x1 à temp 0
    prompts/summary.ts
    prompts/quiz.ts
    prompts/exercises.ts
  documents/
    repository.ts       # CRUD filtré par user_id (mirroring documents_repo.py)
    extraction.ts         # extraction pdf/docx/txt
  quizzes/
    repository.ts
    grading.ts             # correction serveur, jamais côté client
  exercises/
    repository.ts
  subscriptions/
    repository.ts
    plan-limits.ts          # canUploadDocument(), requirePlan('pro')
  errors.ts                  # AppError + sous-classes, toErrorResponse()

types/
  database.types.ts    # généré via `supabase gen types typescript`
  api.ts                 # formes des requêtes/réponses API

proxy.ts
```

### 2.2 Répartition Server Components / Route Handlers / Server Actions

| Cas d'usage | Choix | Justification |
|---|---|---|
| Affichage dashboard, listes, détail document/quiz, historique | **Server Component** + `lib/supabase/server.ts` | Lecture seule, pas de mutation, bénéficie du rendu serveur direct sans aller-retour API. |
| Upload de document (extraction + appel DeepSeek résumé/quiz) | **Route Handler** (`POST /api/documents`) | Appel DeepSeek potentiellement long (10–30 s), nécessite une UI de chargement explicite côté client (`fetch` + état `isLoading`/`AbortController`), gestion fine des timeouts/erreurs. |
| Génération de quiz | **Route Handler** (`POST /api/documents/[id]/quiz`) | Même raison : appel DeepSeek, mode JSON non streamable facilement. |
| Résolution d'exercices (Pro) | **Route Handler** (`POST /api/documents/[id]/exercises`) | Pipeline le plus long ; nécessite le champ `status` + UI de chargement dédiée. |
| Soumission/correction de quiz | **Route Handler** (`POST /api/quizzes/[quizId]/submit`) | Résultat structuré consommé par un Client Component interactif. |
| Renommer/supprimer un document, toggle `cancel_at_period_end` | **Server Action** | Mutation simple, rapide, pas d'appel externe, bénéficie de `revalidatePath` directement. |
| Upgrade/downgrade abonnement (déclenchement) | **Route Handler** (`/api/subscription/upgrade|downgrade`) | Interagira à terme avec un fournisseur de paiement externe (redirection checkout) — frontière HTTP explicite dès maintenant. |
| Webhook de paiement | **Route Handler** obligatoire | Appelé par un système externe, doit répondre à une requête HTTP brute avec vérification de signature. |

### 2.3 `proxy.ts`

**Mise à jour (Étape 2) :** le scaffold a installé **Next.js 16**, qui renomme
`middleware.ts` en **`proxy.ts`** (même fonctionnement, export `proxy` au lieu de
export par défaut anonyme, fichier toujours à la racine du projet). Toute référence à
« middleware » dans ce document désigne ce fichier.

`proxy.ts` délègue à `lib/supabase/middleware.ts::updateSession()`, qui utilise
`@supabase/ssr` pour rafraîchir la session à chaque requête (cookies), et redirige :
- utilisateur non authentifié sur une route protégée → `/login`
- utilisateur authentifié sur `/login` ou `/signup` → `/dashboard`

`matcher` exclut les assets statiques (`_next/static`, `_next/image`, favicon, etc.).

### 2.4 Clients Supabase — pourquoi trois

- `lib/supabase/client.ts` : clé anonyme, utilisé uniquement dans les Client Components.
- `lib/supabase/server.ts` : clé anonyme + cookies de session, utilisé dans Server
  Components et Route Handlers pour les opérations **liées à l'utilisateur courant**
  (récupérer la session, vérifier l'auth).
- `lib/supabase/admin.ts` : **clé service-role**, ne doit jamais être importé dans un
  fichier marqué `"use client"` (protégé par le package `server-only`). Utilisé par tous
  les repositories (`documents/repository.ts`, etc.) pour effectuer les requêtes réelles,
  toujours filtrées manuellement par `user_id` — exactement le pattern du projet frère
  (service-role + filtre applicatif, RLS en secours).

---

## 3. Logique des routes API

### 3.1 Convention d'erreur uniforme

Toutes les routes renvoient, en cas d'erreur, un corps JSON `{ error_code, message }` et un
code HTTP cohérent — repris du projet frère (`AppError`/`register_error_handlers`) :

```ts
class AppError extends Error {
  constructor(public errorCode: string, message: string, public status: number) { super(message); }
}
// ex: UnauthorizedError(401, 'UNAUTHORIZED'), NotFoundError(404, 'NOT_FOUND'),
//     PlanLimitReachedError(403, 'PLAN_LIMIT_REACHED'), PlanRequiredError(403, 'PLAN_REQUIRED'), ...
```

Toute exception non gérée est capturée par un wrapper commun et convertie en
`500 INTERNAL_ERROR` générique (ne jamais laisser fuiter une trace brute au client).

### 3.2 Documents

| Route | Auth | Plan | Requête | Réponse | Erreurs |
|---|---|---|---|---|---|
| `POST /api/documents` | oui | `canUploadDocument` (limite Free/Pro via `plan_limits`) | `multipart/form-data` : fichier + `title?` | `{id, title, status}` | 400 `INVALID_FILE`, 413 `FILE_TOO_LARGE`, 415 `UNSUPPORTED_FORMAT`, 403 `PLAN_LIMIT_REACHED`, 422 `EXTRACTION_FAILED`, 502 `DEEPSEEK_INVALID_RESPONSE`, 500 |
| `GET /api/documents` | oui | — | — | `[{id, title, status, summary_excerpt, created_at}]` | 401 |
| `GET /api/documents/[id]` | oui | — | — | `{id, title, status, summary, key_points, created_at}` | 404 `NOT_FOUND` |
| `DELETE /api/documents/[id]` | oui | — | — | `204` | 404 `NOT_FOUND` |

### 3.3 Quiz

**Mise à jour (Étape 5) :** `POST /api/documents/[id]/quiz` déclenche le pipeline IA complet — il génère **à la fois** le résumé/points clés (mis à jour sur `documents.summary`/`key_points`) **et** un nouveau quiz, en un seul appel synchrone (2 appels DeepSeek successifs : résumé puis quiz). Il n'y a pas de route séparée pour le résumé seul.

| Route | Auth | Plan | Requête | Réponse | Erreurs |
|---|---|---|---|---|---|
| `POST /api/documents/[id]/quiz` | oui | — (Free inclus) | — | Quiz créé : `{id, document_id, created_at, questions:[{id, order_index, question_text, options, correct_index, explanation}]}` | 404, 422 `EXTRACTION_FAILED`, 502 `DEEPSEEK_INVALID_RESPONSE` |
| `GET /api/documents/[id]/quiz` | oui | — | — | `[{id, created_at, question_count}]` | 404 |
| `GET /api/quizzes/[quizId]` | oui | — | — | `{id, document_id, questions:[{id, order_index, question_text, options}]}` **sans** `correct_index`/`explanation` | 404 |
| `POST /api/quizzes/[quizId]/submit` | oui | — | `{answers:[{question_id, selected_index}]}` | `{attempt_id, score, total_questions, results:[{question_id, question_text, options, selected_index, correct_index, is_correct, explanation}]}` | 404, 400 `INVALID_ANSWERS` |
| `GET /api/documents/[id]/attempts` | oui | — | — | `[{attempt_id, quiz_id, score, total_questions, created_at}]` | 404 |

Correction toujours faite **côté serveur** par correspondance exacte d'index, jamais en
faisant confiance à un score envoyé par le client.

### 3.4 Résolution d'exercices (Pro)

**Mise à jour :** implémenté sur le même modèle que le quiz (§3.3) — un seul appel DeepSeek synchrone dans `POST /api/documents/[id]/exercises`, pas de polling. `exercise_resolutions.status` sert de trace en cas d'échec plutôt que de mécanisme d'état intermédiaire observable côté client. Accessible depuis la page détail d'un document (`/documents/[id]/exercises`), gating Pro appliqué à la fois côté route (`requirePlan('pro')`) et côté page (bannière d'upsell pour les comptes Free).

| Route | Auth | Plan | Requête | Réponse | Erreurs |
|---|---|---|---|---|---|
| `POST /api/documents/[id]/exercises` | oui | **`requirePlan('pro')`** | — | `{resolution_id, status}` puis `{items:[{id, order_index, exercise_text, solution_text, final_answer, confidence}]}` | 404 (document), 403 `PLAN_REQUIRED`, 422 `EXTRACTION_FAILED`, 502 `DEEPSEEK_INVALID_RESPONSE` |
| `GET /api/documents/[id]/exercises` | oui | **`requirePlan('pro')`** | — | `{resolution_id, status, items:[...]}` | 404 `NOT_FOUND` |

`requirePlan('pro')` est un helper réutilisable (`lib/subscriptions/plan-limits.ts`) qui lit
`profiles.plan` et lève `PlanRequiredError` sinon.

### 3.5 Abonnement

| Route | Auth | Plan | Requête | Réponse | Erreurs |
|---|---|---|---|---|---|
| `GET /api/subscription` | oui | — | — | `{plan, status, current_period_end, payment_method_type, payment_provider, cancel_at_period_end}` | 401 |
| `POST /api/subscription/upgrade` | oui | — | `{payment_method_type, payment_provider}` (placeholder) | `501 NOT_IMPLEMENTED` tant qu'aucun fournisseur n'est choisi — à terme : `{redirect_url}` | 501, 400 |
| `POST /api/subscription/downgrade` | oui | — | — | `{plan:'free', cancel_at_period_end:true}` (règle métier à confirmer §5) | 401 |
| `POST /api/webhooks/payment` | signature fournisseur, pas de session utilisateur | — | payload spécifique fournisseur | `200 OK` | 400 signature invalide — placeholder non branché |

### 3.6 Stats (dashboard)

| Route | Auth | Plan | Requête | Réponse |
|---|---|---|---|---|
| `GET /api/stats` | oui | — | — | `{documents_count, documents_limit, quizzes_taken, average_score, exercises_resolved_count}` |

---

## 4. Tarification (marché ivoirien) et budget DeepSeek

*Analyse ajoutée après recherche marché — juillet 2026. Chiffres à confirmer avant l'Étape 2.*

### 4.1 Comparatifs marché (Abidjan / Côte d'Ivoire, FCFA/mois)

| Service | Segment | Prix/mois |
|---|---|---|
| Spotify Premium Étudiant | Étudiant, remise dédiée | ~1 000 FCFA (1,69 $) |
| Netflix Basic (1 écran) | Grand public | ~2 800–3 000 FCFA |
| Spotify Premium Individuel | Grand public | ~3 000 FCFA (3,29 $) |
| Netflix Standard HD | Grand public | ~3 500 FCFA |
| Netflix Premium 4K | Grand public | ~5 000 FCFA |
| uLesson (Nigéria, ed-tech comparable) | Élèves secondaire | ~4 000 NGN/mois converti (≈1 500–1 700 FCFA), après une baisse de 50 % décidée face à la sensibilité au prix des familles |
| Adobe Creative Cloud Pro | Professionnel | 8 600 FCFA |
| Canal+ « Tout Canal+ » (avec Netflix inclus) | Foyer, haut de gamme | 25 000 FCFA |

Constats utiles pour ce projet :
- Le marché ivoirien pratique des prix nettement inférieurs aux tarifs US/EU (parité de pouvoir d'achat), avec des paliers psychologiques autour de **1 000 / 2 000 / 3 000 / 5 000 FCFA**.
- Les acteurs ed-tech ciblant des élèves/étudiants (ex. uLesson) pratiquent des prix **plus bas que le streaming grand public**, et n'hésitent pas à baisser encore le prix quand le pouvoir d'achat se dégrade — le segment étudiant est très sensible au prix.
- Le mobile money en Côte d'Ivoire n'est plus gratuit : ~100 FCFA de frais fixes par transaction (Orange Money/MTN/Wave) — à garder en tête pour ne pas fixer un prix Pro trop bas où les frais de transaction rogneraient une part significative de la marge.

### 4.2 Prix retenu (confirmé)

- **Free** : 0 FCFA — 3 documents, résumés, quiz (inchangé).
- **Pro** : **3 000 FCFA/mois**, ou **7 500 FCFA/trimestre** (≈ 2 500 FCFA/mois, remise ~17 % pour l'engagement trimestriel, aligné sur le calendrier scolaire).
- Positionnement : au niveau de Spotify/Netflix Basic-Standard — cohérent avec un outil utilitaire pour étudiants.
- Ces montants sont confirmés par vous ; ils remplacent la proposition initiale (2 000 / 5 000 FCFA) faite en première analyse.

### 4.3 Budget DeepSeek API (estimation mensuelle)

**⚠️ Point d'attention urgent :** les noms de modèles `deepseek-chat`/`deepseek-reasoner` (ceux utilisés par le projet frère `agent ai`) sont **dépréciés le 24/07/2026** — dans les tout prochains jours. `deepseek-chat` correspond désormais au mode non-réflexif de **DeepSeek V4 Flash**. À l'Étape 2, prévoir d'appeler directement les nouveaux identifiants de modèle (`deepseek-v4-flash` ou équivalent au moment de l'implémentation) plutôt que de copier le nom de modèle du projet frère.

**Tarifs DeepSeek V4 Flash (le plus économique, recommandé pour ce projet)** :
- Entrée (cache miss) : 0,14 $ / 1M tokens
- Entrée (cache hit) : 0,0028 $ / 1M tokens
- Sortie : 0,28 $ / 1M tokens
- 5 millions de tokens gratuits à l'inscription (couvre largement la phase de développement/tests de l'Étape 5).

**Hypothèses de calcul** (à affiner avec de vrais documents en Étape 5) :
- Document moyen (cours de 10–15 pages) ≈ 6 000–8 000 tokens de texte extrait.
- Pipeline résumé + quiz (Free) : 2 appels DeepSeek (~7 000 tokens d'entrée chacun) + sorties (~500 tokens résumé, ~1 200 tokens quiz) ≈ **~16 000 tokens/document** → **≈ 0,0024 $ (~1,4 FCFA) par document**.
- Résolution d'exercices (Pro, en plus) : ~7 000 tokens d'entrée + ~3 000 tokens de sortie ≈ **~10 000 tokens** → **≈ 0,0018 $ (~1,1 FCFA) par résolution**.
- Coût DeepSeek par document Pro complet (résumé + quiz + exercices) : **≈ 0,0042 $ (~2,5 FCFA)**.

**Projection de budget mensuel par échelle** (hypothèse : chaque utilisateur actif traite ~2–3 documents/mois) :

| Utilisateurs actifs/mois | Documents traités/mois | % utilisant Pro (exercices) | Coût DeepSeek estimé/mois |
|---|---|---|---|
| 50 (bêta) | ~100 | 0 % | < 1 $ (~300 FCFA) — couvert par le crédit gratuit |
| 500 | ~1 000 | 20 % | ~3 $ (~1 800 FCFA) |
| 5 000 | ~12 000 | 15 % | ~35 $ (~21 000 FCFA) |
| 50 000 | ~120 000 | 15 % | ~350 $ (~210 000 FCFA) |

**Conclusion** : le coût DeepSeek reste marginal comparé au revenu d'abonnement — même à 50 000 utilisateurs actifs, ~210 000 FCFA/mois de coût IA contre un revenu potentiel très supérieur si ne serait-ce que quelques % des utilisateurs passent Pro à 3 000 FCFA/mois. Le poste de coût dominant à surveiller sera plutôt l'hébergement Vercel et Supabase à l'échelle, pas l'IA. Ces chiffres restent des estimations de cadrage ; à valider avec des tests réels de volumétrie de documents (taille moyenne des cours uploadés) en Étape 5.

### 4.4 Hébergement : démarrage sur Vercel Hobby (gratuit)

Vous avez choisi de démarrer sur le forfait **Hobby (gratuit)** de Vercel plutôt que Pro (20 $/membre/mois). Deux points vérifiés à connaître avant l'Étape 2 :

- **Durée des fonctions : bonne nouvelle.** Vercel a récemment relevé la limite Hobby de 10 s à **60 s max** pour les Serverless Functions. Cela couvre confortablement les appels DeepSeek estimés à 10–30 s (§2.2) pour le résumé et le quiz. Seul le pipeline de résolution d'exercices (Pro, plusieurs exercices + appels DeepSeek plus longs) pourrait s'en approcher sur un document volumineux — à surveiller en Étape 5/6, avec un design par lots ou un `status`/polling si un document dépasse la limite.
- **⚠️ Restriction commerciale du forfait Hobby.** Les conditions d'utilisation de Vercel réservent explicitement le forfait Hobby à un usage **personnel/non commercial** : tout traitement de paiement (ce qui inclut l'abonnement Pro à 3 000 FCFA/mois de cette application) est considéré comme un usage commercial et **nécessite le forfait Pro** (20 $/mois). Vercel se réserve le droit de désactiver un déploiement Hobby utilisé commercialement, sans préavis.
  - **Implication pratique** : le forfait Hobby convient très bien pour le développement, les tests et une phase bêta fermée sans paiement réel activé (Étapes 2 à 5). Dès que le module de paiement (Étape 6, upgrade/downgrade réel) est activé en production, il faudra basculer sur Vercel Pro pour rester dans les règles.

---

## 5. Décisions à valider avec l'utilisateur

- Chiffres exacts du plan Pro : upload illimité ou plafond augmenté (ex. 50/mois) ? Prix confirmé en §4.2 (3 000 FCFA/mois ou 7 500 FCFA/trimestre) — reste à trancher le plafond documents Pro (illimité vs augmenté).
- Quel(s) fournisseur(s) de mobile money intégrer en premier (Orange Money, MTN MoMo,
  Wave, autre) et quel fournisseur carte (Stripe probable) ?
- Authentification : email/mot de passe uniquement au lancement, ou aussi OAuth (Google) ?
- Historique des tentatives de quiz : conservé indéfiniment et illimité, ou une politique de
  rétention/plafond est-elle souhaitée ?
- Si un utilisateur Pro repasse en Free (downgrade), garde-t-il un accès lecture seule aux
  résolutions d'exercices déjà générées, ou l'accès est-il totalement bloqué ?
- Le compteur du plafond « 3 documents » (Free) doit-il inclure les documents en statut
  `failed`, ou uniquement ceux effectivement `ready`/`processing` ?
- Limite de taille/type de fichier à l'upload (reprendre pdf/docx/txt comme le projet
  frère, ou élargir plus tard) ?
- Règle de downgrade : passage immédiat en Free, ou maintien du Pro jusqu'à la fin de la
  période déjà payée (`cancel_at_period_end`) ?
- `profiles.email` est copié uniquement à la création du compte — accepte-t-on qu'il se
  désynchronise si l'utilisateur change son email dans Supabase Auth ?
