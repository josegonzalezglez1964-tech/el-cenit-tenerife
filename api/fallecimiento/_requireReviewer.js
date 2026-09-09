import { createClient } from "@supabase/supabase-js";

/**
 * Comprueba que la petición pertenece a un usuario autenticado
 * y que ese usuario está autorizado como revisor activo del protocolo.
 *
 * No accede directamente a death_cases.
 * La autorización se delega en la función SQL es_revisor_activo().
 *
 * Devuelve:
 * - { user, error: null } si el usuario es un revisor activo.
 * - { user: null, error: { status, message } } si no está autorizado
 *   o la sesión no es válida.
 */
export async function requireReviewer(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

  if (!token) {
    return {
      user: null,
      error: {
        status: 401,
        message: "No autenticado.",
      },
    };
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: userData, error: userError } =
    await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    return {
      user: null,
      error: {
        status: 401,
        message: "Sesión inválida o caducada.",
      },
    };
  }

  const { data: isReviewer, error: reviewerError } = await supabase.rpc(
    "es_revisor_activo"
  );

  if (reviewerError) {
    console.error(
      "[requireReviewer] Error comprobando autorización:",
      reviewerError.message
    );

    return {
      user: null,
      error: {
        status: 500,
        message: "No se pudo comprobar la autorización.",
      },
    };
  }

  if (isReviewer !== true) {
    return {
      user: null,
      error: {
        status: 403,
        message: "No autorizado.",
      },
    };
  }

  return {
    user: userData.user,
    error: null,
  };
}