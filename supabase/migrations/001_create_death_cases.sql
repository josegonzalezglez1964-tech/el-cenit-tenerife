-- A4 · Expediente de verificación de fallecimiento
-- El Cénit Testamento Digital
------------------------------

-- Esta migración crea el expediente independiente del protocolo
-- de fallecimiento y su historial de eventos.
----------------------------------------------

-- IMPORTANTE:
-- Esta estructura no confirma fallecimientos, no concede acceso
-- a la Bóveda y no almacena claves ni contenido protegido.

create table public.death_cases (
id uuid not null default gen_random_uuid (),
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),

status text not null default 'PENDIENTE_DE_REVISION',

reference_code text null,
titular_user_id uuid null,

requester_name text null,
requester_email text null,
requester_relation text null,
requester_reason text null,

truthfulness_accepted boolean not null default false,
access_terms_accepted boolean not null default false,

titular_notified_at timestamp with time zone null,
titular_response text null,

review_status text null,
incident_type text null,

closed_at timestamp with time zone null,

constraint death_cases_pkey primary key (id),

constraint death_cases_titular_user_id_fkey
foreign key (titular_user_id)
references auth.users (id)
on delete set null,

constraint death_cases_status_check
check (
status in (
'PENDIENTE_DE_REVISION',
'FALLECIMIENTO_EN_VERIFICACION',
'INFORMACION_INSUFICIENTE',
'INCIDENCIA_CONFLICTO',
'LISTO_PARA_ACREDITACION',
'BLOQUEADO_POR_TITULAR',
'CERRADO'
)
)
);

create table public.death_case_events (
id uuid not null default gen_random_uuid (),
death_case_id uuid not null,
created_at timestamp with time zone not null default now(),

event_type text not null,
actor_type text not null,

description text null,

constraint death_case_events_pkey primary key (id),

constraint death_case_events_death_case_id_fkey
foreign key (death_case_id)
references public.death_cases (id)
on delete cascade
);

create index death_cases_reference_code_idx
on public.death_cases (reference_code);

create index death_cases_titular_user_id_idx
on public.death_cases (titular_user_id);

create index death_cases_status_idx
on public.death_cases (status);

create index death_case_events_death_case_id_idx
on public.death_case_events (death_case_id);

create index death_case_events_created_at_idx
on public.death_case_events (created_at);

alter table public.death_cases enable row level security;
alter table public.death_case_events enable row level security;
