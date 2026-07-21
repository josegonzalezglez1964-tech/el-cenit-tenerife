-- Añade cifrado del lado del servidor a los datos de herederos.
-- Ejecuta esto en Supabase → SQL Editor, DESPUÉS de supabase-schema.sql.
-- Es seguro de ejecutar aunque ya tengas datos: solo añade columnas
-- nuevas, no borra las existentes.
--
-- A partir de ahora, nombre/email/relacion de cada heredero se guardan
-- cifrados (AES-256-GCM) con una clave que SOLO existe en el servidor
-- (variable de entorno HEREDEROS_ENC_KEY en Vercel) — nunca en el
-- navegador, nunca en Supabase junto al dato cifrado. Un volcado de la
-- base de datos, o un vistazo casual al panel de Supabase, ya no
-- muestra nombres ni emails de herederos en texto plano.
alter table herederos
  add column if not exists ciphertext text,
  add column if not exists iv text;

-- Las columnas antiguas (nombre, email, relacion) se dejan de usar a
-- partir de ahora, pero no las borramos todavía por seguridad — hazlo
-- manualmente más adelante, cuando confirmes que todo funciona bien
-- con las nuevas columnas cifradas:
--
--   alter table herederos drop column nombre;
--   alter table herederos drop column email;
--   alter table herederos drop column relacion;
