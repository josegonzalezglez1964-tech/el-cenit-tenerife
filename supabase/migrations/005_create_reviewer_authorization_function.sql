-- A2 · Función de autorización de revisores
-- El Cénit Testamento Digital
--
-- Esta función comprueba si el usuario actualmente autenticado
-- está registrado como revisor activo del protocolo.
--
-- IMPORTANTE:
-- - No recibe un user_id desde el navegador.
-- - Utiliza auth.uid() para identificar al usuario autenticado.
-- - No concede acceso directo a death_case_reviewers.
-- - No concede acceso a death_cases.
-- - La función se utilizará como comprobación de autorización
--   desde las APIs internas del protocolo.

create or replace function public.es_revisor_activo()
returns boolean
language sql
security definer
set search_path = pg_catalog, public
stable
as $$
  select exists (
    select 1
    from public.death_case_reviewers
    where user_id = auth.uid()
      and active = true
  );
$$;

-- La función no debe quedar disponible para llamadas anónimas.
revoke all on function public.es_revisor_activo() from public;

-- Los usuarios autenticados pueden ejecutar la comprobación,
-- pero no obtienen acceso directo a la tabla.
grant execute on function public.es_revisor_activo()
to authenticated;