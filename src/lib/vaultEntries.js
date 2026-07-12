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
    .select("id, titulo, categoria, ciphertext, iv, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function addVaultEntry(userId, { titulo, categoria, ciphertext, iv }) {
  return supabase.from("vault_entries").insert({ user_id: userId, titulo, categoria, ciphertext, iv });
}

export async function deleteVaultEntry(id) {
  return supabase.from("vault_entries").delete().eq("id", id);
}
