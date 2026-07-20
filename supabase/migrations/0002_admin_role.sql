-- Étape 6 (suite) — rôle admin, pour piloter les abonnements de tous les
-- utilisateurs depuis un tableau de bord dédié (/admin). Voir architecture.md.
-- À coller dans le SQL Editor du dashboard Supabase du projet, comme
-- 0001_init.sql (ce projet n'est pas accessible depuis l'outil MCP connecté
-- à cette session).

alter table public.profiles add column is_admin boolean not null default false;

-- Premier compte admin. Si ce compte ne s'est pas encore inscrit, relancer
-- ce UPDATE après sa création (aucune ligne ne sera affectée avant ça).
update public.profiles set is_admin = true where email = 'horebentreprise@gmail.com';
