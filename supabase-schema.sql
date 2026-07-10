-- El Cénit — esquema inicial de base de datos
-- Ejecuta esto completo en Supabase: Panel → SQL Editor → New query → pega y "Run"

-- Tabla principal: cada fila es el borrador/testamento de un usuario
create table if not exists testamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text,
  email text,
  categorias text[] default '{}',
  mensaje text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla de herederos, ligada a un testamento
create table if not exists herederos (
  id uuid primary key default gen_random_uuid(),
  testamento_id uuid not null references testamentos(id) on delete cascade,
  nombre text not null,
  email text not null,
  relacion text,
  created_at timestamptz default now()
);

-- Activa seguridad a nivel de fila en ambas tablas.
-- A partir de aquí, sin las políticas de abajo, NADIE puede leer ni escribir nada.
alter table testamentos enable row level security;
alter table herederos enable row level security;

-- Un usuario solo puede ver, crear, editar y borrar SU PROPIO testamento
create policy "Los usuarios gestionan su propio testamento"
  on testamentos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Un usuario solo puede gestionar herederos que cuelguen de SU propio testamento
create policy "Los usuarios gestionan sus propios herederos"
  on herederos
  for all
  using (
    exists (
      select 1 from testamentos
      where testamentos.id = herederos.testamento_id
      and testamentos.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from testamentos
      where testamentos.id = herederos.testamento_id
      and testamentos.user_id = auth.uid()
    )
  );
