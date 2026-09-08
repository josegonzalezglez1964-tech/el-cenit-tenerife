-- A2 · Autorización interna de revisores
-- El Cénit Testamento Digital
--
-- Esta migración crea la lista explícita de usuarios autorizados
-- para revisar expedientes del protocolo de fallecimiento.
--
-- IMPORTANTE:
-- - La autenticación del usuario continúa dependiendo de Supabase Auth.
-- - Esta tabla determina exclusivamente si un usuario está autorizado
--   para actuar como revisor del protocolo.
-- - No concede acceso a testamentos ni a la Bóveda.
-- - No concede acceso público a los expedientes.
-- - La tabla no tendrá políticas RLS que permitan su modificación
--   desde el navegador.

create table public.death_case_reviewers (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  active boolean not null default true,

  constraint death_case_reviewers_pkey
    primary key (id),

  constraint death_case_reviewers_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade,

  constraint death_case_reviewers_user_id_key
    unique (user_id)
);

create index death_case_reviewers_active_idx
on public.death_case_reviewers (active);

alter table public.death_case_reviewers
enable row level security;

-- No se crean políticas RLS para usuarios públicos ni autenticados.
-- La autorización será comprobada exclusivamente desde las APIs
-- protegidas del protocolo.