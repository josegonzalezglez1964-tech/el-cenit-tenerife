-- A1 · Entrada controlada de una comunicación de posible fallecimiento
-- El Cénit Testamento Digital
--
-- Esta migración crea una función PostgreSQL específica para registrar
-- una comunicación pública de posible fallecimiento.
--
-- IMPORTANTE:
-- - No confirma ningún fallecimiento.
-- - No determina si existe una cuenta.
-- - No concede acceso a la Bóveda.
-- - No accede a contenido protegido.
-- - No utiliza claves de cifrado.
-- - No determina derechos sucesorios.
--
-- La función se ejecuta con permisos controlados mediante SECURITY DEFINER
-- para permitir la creación del expediente sin conceder acceso directo
-- de escritura sobre las tablas a usuarios públicos.

create or replace function public.registrar_comunicacion_fallecimiento(
  p_reference_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_case_id uuid;
  v_reference_code text;
begin
  /*
   * Normalizamos el código de referencia.
   *
   * Un código vacío se considera equivalente a no proporcionar código.
   * No realizamos ninguna consulta para comprobar si el código existe.
   * Esto evita convertir A1 en un mecanismo de enumeración de cuentas.
   */
  v_reference_code := nullif(
    upper(trim(coalesce(p_reference_code, ''))),
    ''
  );

  /*
   * Protección básica de entrada.
   *
   * A1 no necesita aceptar cadenas arbitrariamente grandes.
   */
  if v_reference_code is not null
     and length(v_reference_code) > 100 then
    raise exception 'Código de referencia no válido.';
  end if;

  /*
   * Creamos el expediente independiente.
   *
   * El titular todavía no se identifica de forma interna.
   * El estado inicial es siempre PENDIENTE_DE_REVISION.
   */
  insert into public.death_cases (
    status,
    reference_code
  )
  values (
    'PENDIENTE_DE_REVISION',
    v_reference_code
  )
  returning id into v_case_id;

  /*
   * Registramos el primer evento de auditoría.
   *
   * No almacenamos contenido privado ni información innecesaria.
   */
  insert into public.death_case_events (
    death_case_id,
    event_type,
    actor_type,
    description
  )
  values (
    v_case_id,
    'COMUNICACION_RECIBIDA',
    'PUBLIC',
    'Se ha recibido una comunicación de posible fallecimiento.'
  );

  /*
   * Solo devolvemos el identificador interno del expediente.
   *
   * La existencia o inexistencia de una cuenta asociada al código
   * no se comunica en ningún momento.
   */
  return v_case_id;
end;
$$;


-- La función no debe quedar ejecutable por cualquier rol por defecto.
revoke all
on function public.registrar_comunicacion_fallecimiento(text)
from public;


-- A1 necesita poder invocar esta operación desde la entrada pública.
-- El acceso queda limitado a la ejecución de esta función concreta.
grant execute
on function public.registrar_comunicacion_fallecimiento(text)
to anon;