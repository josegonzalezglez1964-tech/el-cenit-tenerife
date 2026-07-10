// Cliente de Supabase — se activa solo cuando tengas tu propio proyecto creado.
// Rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env
// (mira .env.example). Mientras esas variables no existan, el resto del sitio
// sigue funcionando con normalidad; solo el guardado real en la bóveda
// quedará deshabilitado hasta que conectes tus claves.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Inicia sesión con Google. Redirige fuera de la página, así que cualquier
// estado que quieras conservar (como el borrador del wizard) debe guardarse
// en localStorage antes de llamar a esto.
export async function signInWithGoogle(redirectPath = "/") {
  if (!supabase) {
    return { error: new Error("Supabase no está configurado todavía.") };
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + redirectPath,
    },
  });
  return { error };
}

export async function signOut() {
  if (!supabase) return { error: null };
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Se suscribe a cambios de sesión (login/logout). Devuelve una función
// para cancelar la suscripción cuando el componente se desmonte.
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}
