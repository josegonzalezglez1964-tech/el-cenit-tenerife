import { supabase } from "./supabaseClient";

// Dispara el envío de notificaciones a los herederos DEL USUARIO ACTUAL.
//
// A partir de ahora, este envío no se hace directamente desde el
// navegador (eso exponía las claves de EmailJS a cualquiera que abriera
// las DevTools). En su lugar, llamamos a nuestra propia función
// serverless (/api/notify-heirs), pasándole el token de sesión de
// Supabase. Esa función:
//   1) Verifica que el token es válido (usuario real y autenticado).
//   2) Vuelve a leer los herederos reales desde la base de datos —
//      IGNORA cualquier dato que el cliente pudiera mandar — así que
//      ni siquiera un usuario autenticado podría usar esto para enviar
//      correos a direcciones que no sean las que él mismo guardó.
//   3) Es la única pieza que conoce la Private Key de EmailJS, y esa
//      clave nunca sale del servidor.
export async function notifyHeirs() {
  if (!supabase) {
    console.warn("[notifyHeirs] Supabase no está configurado; no se puede autenticar el envío.");
    return { skipped: true, sent: 0, failed: 0 };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.warn("[notifyHeirs] No hay sesión activa; no se envían notificaciones.");
    return { skipped: true, sent: 0, failed: 0 };
  }

  try {
    const response = await fetch("/api/notify-heirs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[notifyHeirs] Falló el envío:", result);
      return { skipped: false, sent: 0, failed: 0, error: result };
    }

    console.log("[notifyHeirs] Resultado:", result);
    return { skipped: false, ...result };
  } catch (err) {
    console.error("[notifyHeirs] Error de red al llamar a /api/notify-heirs:", err);
    return { skipped: false, sent: 0, failed: 0, error: String(err) };
  }
}