const API_PATH = "/api/fallecimiento/comunicar";

/**
 * Comunica a El Cénit un posible fallecimiento.
 *
 * A1 es una entrada pública: no requiere que la persona comunicante
 * tenga una sesión iniciada.
 *
 * La API será responsable de crear el expediente y devolver una
 * respuesta neutra. Esta función no consulta Supabase directamente.
 */
export async function comunicarPosibleFallecimiento(codigoReferencia = "") {
  const response = await fetch(API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      codigoReferencia: codigoReferencia.trim() || null,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      error: new Error(
        body.error || "No se ha podido registrar la comunicación."
      ),
    };
  }

  return {
    error: null,
    data: body,
  };
}