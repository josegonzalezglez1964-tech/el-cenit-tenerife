-- Añade soporte de archivos cifrados a la Bóveda.
-- Ejecuta esto en Supabase → SQL Editor, DESPUÉS de supabase-vault-schema.sql.
-- Aditivo: no borra ni modifica nada existente.

-- Columnas nuevas para distinguir entradas de texto vs. archivo.
alter table vault_entries
  add column if not exists tipo text not null default 'texto',
  add column if not exists nombre_archivo text,
  add column if not exists mime_type text,
  add column if not exists tamano_bytes bigint,
  add column if not exists storage_path text;

-- Bucket PRIVADO (public = false) para los archivos cifrados.
-- "Privado" aquí es una capa extra de defensa, no la protección
-- principal — la protección real es que el contenido ya está cifrado
-- antes de llegar aquí, así que aunque alguien accediera al archivo
-- crudo, solo vería bytes sin sentido sin la frase maestra.
insert into storage.buckets (id, name, public)
values ('boveda', 'boveda', false)
on conflict (id) do nothing;

-- Cada usuario solo puede subir/leer/actualizar/borrar archivos dentro
-- de su propia carpeta, identificada por su user_id como primer
-- segmento de la ruta (ej. "093a5f04-.../nombre-del-archivo").
create policy "Subir archivos propios de boveda"
  on storage.objects for insert
  with check (bucket_id = 'boveda' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Leer archivos propios de boveda"
  on storage.objects for select
  using (bucket_id = 'boveda' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Actualizar archivos propios de boveda"
  on storage.objects for update
  using (bucket_id = 'boveda' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Borrar archivos propios de boveda"
  on storage.objects for delete
  using (bucket_id = 'boveda' and (storage.foldername(name))[1] = auth.uid()::text);
