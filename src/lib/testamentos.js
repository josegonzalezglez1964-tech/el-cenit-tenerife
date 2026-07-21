import { supabase } from "./supabaseClient";

// A partir de ahora, guardar y leer el testamento pasa por nuestras
// propias funciones serverless (/api/testamento-save y
// /api/testamento-get), en vez de hablar directamente con Supabase
// desde el navegador. El motivo: los datos de los herederos (nombre,
// email, relación) se cifran con una clave que SOLO existe en el
// servidor — así que solo el servidor puede escribirlos o leerlos en
// claro. El navegador nunca ve esa clave, ni falta que le hace.

async function authFetch(path, options = {}) {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado.") };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { error: new Error("No hay sesión activa.") };
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: new Error(body.error || `Error ${response.status}`) };
  }
  return { data: body };
}

// Guarda (o actualiza) el testamento del usuario autenticado, junto con
// sus herederos (que la función serverless cifra antes de guardarlos).
export async function saveTestamento(form) {
  const { data, error } = await authFetch("/api/testamento-save", {
    method: "POST",
    body: JSON.stringify(form),
  });
  if (error) return { error };
  return { error: null, testamentoId: data.testamentoId };
}

// Lee el testamento del usuario autenticado. La función serverless
// descifra los herederos antes de devolverlos — el navegador solo ve
// texto plano en el momento en que el propio dueño, ya autenticado, lo
// pide para su propia pantalla.
export async function getTestamento() {
  const { data, error } = await authFetch("/api/testamento-get", { method: "GET" });
  if (error) return { error, testamento: null };
  return { error: null, testamento: data.testamento };
}

// Borrar no necesita pasar por el servidor de cifrado — borrar una fila
// no expone ningún contenido, y las políticas de Row Level Security de
// Supabase ya garantizan que solo puedes borrar tu propio testamento.
export async function deleteTestamento(testamentoId) {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado.") };
  }
  const { error } = await supabase.from("testamentos").delete().eq("id", testamentoId);
  return { error };
}
