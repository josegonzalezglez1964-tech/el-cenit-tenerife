-- Añade soporte de cifrado real a la Bóveda Privada.
-- Ejecuta esto en Supabase → SQL Editor, DESPUÉS de supabase-schema.sql.
-- Es seguro de ejecutar aunque ya tengas datos: solo añade columnas y
-- una tabla nueva, no borra ni modifica nada existente.

-- Datos necesarios para desbloquear la bóveda con la frase maestra:
-- - vault_salt: la sal aleatoria usada para derivar la clave (no es secreta)
-- - vault_check_ciphertext / vault_check_iv: un texto de control cifrado,
--   usado solo para comprobar si la frase maestra introducida es correcta,
--   sin tener que guardar la frase en ningún sitio.
alter table testamentos
  add column if not exists vault_salt text,
  add column if not exists vault_check_ciphertext text,
  add column if not exists vault_check_iv text;

-- Cada fila es UN secreto cifrado (una contraseña, una frase semilla de
-- cripto, etc.). "ciphertext" e "iv" son el contenido ya cifrado en el
-- navegador del usuario — en ningún momento llega texto plano hasta aquí.
create table if not exists vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  categoria text,
  ciphertext text not null,
  iv text not null,
  created_at timestamptz default now()
);

alter table vault_entries enable row level security;

create policy "Los usuarios gestionan sus propias entradas de boveda"
  on vault_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
