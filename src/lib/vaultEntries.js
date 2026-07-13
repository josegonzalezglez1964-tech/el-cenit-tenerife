import { supabase } from "./supabaseClient";

// Devuelve la configuración de cifrado del usuario (sal + texto de
// control), si ya inicializó su bóveda alguna vez.
export async function getVaultSetup(userId) {
  const { data, error } = await supabase
    .from("testamentos")
    .select("id, vault_salt, vault_check_ciphertext, vault_check_iv")
    .eq("user_id", userId)
    .maybeSingle();
  return { data, error };
}

// Guarda la sal y el texto de control la primera vez que el usuario crea
// su frase maestra. Si el usuario todavía no tiene fila en `testamentos`
// (por ejemplo, entró directo a la Bóveda sin pasar por el wizard),
// se crea una fila mínima.
export async function initVaultSetup(userId, { salt, checkCiphertext, checkIv }) {
  const { data: existing } = await supabase
    .from("testamentos")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const payload = {
    vault_salt: salt,
    vault_check_ciphertext: checkCiphertext,
    vault_check_iv: checkIv,
  };

  if (existing) {
    return supabase.from("testamentos").update(payload).eq("id", existing.id);
  }
  return supabase.from("testamentos").insert({ user_id: userId, ...payload });
}

export async function listVaultEntries(userId) {
  return supabase
    .from("vault_entries")
    .select("id, titulo, categoria, tipo, ciphertext, iv, nombre_archivo, mime_type, tamano_bytes, storage_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

// Entrada de texto: el contenido cifrado va directo en la tabla.
export async function addVaultTextEntry(userId, { titulo, categoria, ciphertext, iv }) {
  return supabase
    .from("vault_entries")
    .insert({ user_id: userId, tipo: "texto", titulo, categoria, ciphertext, iv });
}

// Entrada de archivo: el contenido cifrado (grande) va al Storage, y en
// la tabla solo queda la ruta + metadatos ligeros.
export async function addVaultFileEntry(
  userId,
  { titulo, categoria, iv, nombreArchivo, mimeType, tamanoBytes, storagePath }
) {
  return supabase.from("vault_entries").insert({
    user_id: userId,
    tipo: "archivo",
    titulo,
    categoria,
    iv,
    nombre_archivo: nombreArchivo,
    mime_type: mimeType,
    tamano_bytes: tamanoBytes,
    storage_path: storagePath,
    ciphertext: "", // no se usa para archivos
  });
}

export async function uploadEncryptedFile(storagePath, encryptedBlob) {
  return supabase.storage.from("boveda").upload(storagePath, encryptedBlob, {
    contentType: "application/octet-stream",
    upsert: false,
  });
}

export async function downloadEncryptedFile(storagePath) {
  return supabase.storage.from("boveda").download(storagePath);
}

export async function deleteVaultEntry(entry) {
  if (entry.tipo === "archivo" && entry.storage_path) {
    await supabase.storage.from("boveda").remove([entry.storage_path]);
  }
  return supabase.from("vault_entries").delete().eq("id", entry.id);
}
