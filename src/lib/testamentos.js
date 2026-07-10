import { supabase } from "./supabaseClient";

// Guarda (o actualiza) el testamento del usuario autenticado, junto con
// sus herederos. Se apoya en las políticas de Row Level Security de
// Supabase, así que solo puede escribir en filas asociadas a su propio
// user_id — eso lo garantiza la base de datos, no el código del cliente.
export async function saveTestamento(form, userId) {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado.") };
  }

  // Upsert: si el usuario ya tiene un testamento, lo actualiza; si no, lo crea.
  const { data: existing } = await supabase
    .from("testamentos")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  const payload = {
    user_id: userId,
    nombre: form.nombre,
    email: form.email,
    categorias: form.categorias,
    mensaje: form.mensaje,
    updated_at: new Date().toISOString(),
  };

  let testamentoId = existing?.id;

  if (testamentoId) {
    const { error } = await supabase
      .from("testamentos")
      .update(payload)
      .eq("id", testamentoId);
    if (error) return { error };

    // Sustituye los herederos existentes por los del formulario actual
    await supabase.from("herederos").delete().eq("testamento_id", testamentoId);
  } else {
    const { data, error } = await supabase
      .from("testamentos")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { error };
    testamentoId = data.id;
  }

  const herederosValidos = form.herederos.filter((h) => h.nombre.trim() && h.email.trim());
  if (herederosValidos.length > 0) {
    const { error } = await supabase.from("herederos").insert(
      herederosValidos.map((h) => ({
        testamento_id: testamentoId,
        nombre: h.nombre,
        email: h.email,
        relacion: h.relacion,
      }))
    );
    if (error) return { error };
  }

  return { error: null, testamentoId };
}
