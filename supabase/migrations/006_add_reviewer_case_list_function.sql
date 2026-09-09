-- A2 · Consulta controlada de expedientes por revisores
-- El Cénit Testamento Digital
--
-- Esta función permite obtener el listado de expedientes
-- únicamente al usuario autenticado que sea revisor activo.
--
-- IMPORTANTE:
-- - No recibe un user_id desde el navegador.
-- - Utiliza auth.uid() para identificar al usuario autenticado.
-- - Comprueba que el usuario sea revisor activo.
-- - No concede acceso directo a death_cases.
-- - La consulta se realiza mediante SECURITY DEFINER.
-- - La función solo devuelve los campos necesarios para la
--   revisión inicial de expedientes.

create or replace function public.listar_expedientes_revisor()
returns table (
  id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  status text,
  reference_code text,
  public_request_id uuid,
  requester_name text,
  requester_email text,
  requester_relation text,
  requester_reason text,
  truthfulness_accepted boolean,
  access_terms_accepted boolean,
  titular_notified_at timestamp with time zone,
  titular_response text,
  review_status text,
  incident_type text,
  closed_at timestamp with time zone
)
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select
    dc.id,
    dc.created_at,
    dc.updated_at,
    dc.status,
    dc.reference_code,
    dc.public_request_id,
    dc.requester_name,
    dc.requester_email,
    dc.requester_relation,
    dc.requester_reason,
    dc.truthfulness_accepted,
    dc.access_terms_accepted,
    dc.titular_notified_at,
    dc.titular_response,
    dc.review_status,
    dc.incident_type,
    dc.closed_at
  from public.death_cases dc
  where exists (
    select 1
    from public.death_case_reviewers dcr
    where dcr.user_id = auth.uid()
      and dcr.active = true
  )
  order by dc.created_at desc;
$$;

-- La función no debe quedar disponible para usuarios anónimos.
revoke all on function public.listar_expedientes_revisor()
from public;

-- Solo usuarios autenticados pueden ejecutar la función.
-- La propia función comprueba además que sean revisores activos.
grant execute on function public.listar_expedientes_revisor()
to authenticated;