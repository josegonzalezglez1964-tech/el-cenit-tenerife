-- A1 · Identificador público independiente del expediente interno
-- El Cénit Testamento Digital
------------------------------

-- Esta migración normaliza el identificador público de death_cases.
--
-- IMPORTANTE:
-- - public_request_id ya existe en la base de datos remota como text nullable.
-- - Los registros existentes no contienen ningún valor en esta columna.
-- - El id interno no se modifica.
-- - public_request_id no sustituye al identificador interno.
-- - El identificador público se genera aleatoriamente.
-- - No contiene información del titular.
-- - No revela ni permite inferir el identificador interno.
-- - La actualización de la función pública se realizará
--   en una migración posterior.

-- Eliminamos el índice parcial existente.
drop index if exists public.death_cases_public_request_id_idx;

-- Eliminamos la restricción antigua de formato CENIT-XXXX-XXXX.
--
-- Esta restricción pertenecía al diseño anterior de public_request_id
-- como texto. Al convertir la columna a uuid deja de ser válida.
-- El propio tipo uuid será quien valide el formato del identificador.
alter table public.death_cases
drop constraint if exists death_cases_public_request_id_format_check;

-- Convertimos la columna existente de text a uuid.
alter table public.death_cases
alter column public_request_id type uuid
using public_request_id::uuid;

-- Los nuevos expedientes recibirán automáticamente un UUID público.
alter table public.death_cases
alter column public_request_id
set default gen_random_uuid();

-- Asignamos identificadores públicos a los expedientes existentes.
update public.death_cases
set public_request_id = gen_random_uuid()
where public_request_id is null;

-- A partir de este punto todos los expedientes deben tener
-- un identificador público.
alter table public.death_cases
alter column public_request_id set not null;

-- El identificador público debe ser único.
create unique index death_cases_public_request_id_uidx
on public.death_cases (public_request_id);
