import { supabase } from "./supabaseClient";

// Guarda (o actualiza) el testamento del usuario autenticado, junto con
// sus herederos. Se apoya en las políticas de Row Level Security de
// Supabase, así que solo puede escribir en filas asociadas a su propio
// user_id — eso lo garantiza la base de datos, no el código del cliente.
export async function saveTestamento(form, userId) {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado.") };
  }

  // Guarda de seguridad: nunca guardamos un testamento sin al menos un
  // heredero válido. Esto evita que un formulario vacío (por ejemplo,
  // tras recargar la página a media prueba) borre herederos reales sin
  // reemplazarlos por nada.
  const herederosValidos = form.herederos.filter((h) => h.nombre.trim() && h.email.trim());
  if (herederosValidos.length === 0) {
    return {
      error: new Error(
        "Debes indicar al menos un heredero con nombre y correo electrónico antes de guardar."
      ),
    };
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
  } else {
    const { data, error } = await supabase
      .from("testamentos")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { error };
    testamentoId = data.id;
  }

  // Insertamos los herederos NUEVOS antes de borrar los antiguos. Así,
  // si algo falla en el insert, los herederos existentes se quedan
  // intactos en vez de perderse en una tabla vacía a medio camino.
  const { error: insertError } = await supabase.from("herederos").insert(
    herederosValidos.map((h) => ({
      testamento_id: testamentoId,
      nombre: h.nombre,
      email: h.email,
      relacion: h.relacion,
    }))
  );
  if (insertError) return { error: insertError };

  // Solo ahora, con los nuevos ya guardados con éxito, borramos los
  // herederos de la versión anterior (identificados por fecha, para no
  // borrar los que acabamos de insertar).
  if (existing) {
    await supabase
      .from("herederos")
      .delete()
      .eq("testamento_id", testamentoId)
      .lt("created_at", payload.updated_at);
  }

  return { error: null, testamentoId };
}

// Lee el testamento del usuario autenticado, junto con sus herederos.
// Devuelve { testamento: null } si todavía no ha creado ninguno.
export async function getTestamento(userId) {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado."), testamento: null };
  }

  const { data: testamento, error: testError } = await supabase
    .from("testamentos")
    .select("id, nombre, email, categorias, mensaje, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (testError) return { error: testError, testamento: null };
  if (!testamento) return { error: null, testamento: null };

  const { data: herederos, error: herederosError } = await supabase
    .from("herederos")
    .select("id, nombre, email, relacion")
    .eq("testamento_id", testamento.id);

  if (herederosError) return { error: herederosError, testamento: null };

  return {
    error: null,
    testamento: { ...testamento, herederos: herederos || [] },
  };
}

// Borra el testamento del usuario y, en cascada (a nivel de base de
// datos, gracias al "on delete cascade" del esquema), todos sus
// herederos asociados. No afecta a los contenidos de la Bóveda
// (vault_entries), que son independientes.
export async function deleteTestamento(testamentoId) {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado.") };
  }
  const { error } = await supabase.from("testamentos").delete().eq("id", testamentoId);
  return { error };
}