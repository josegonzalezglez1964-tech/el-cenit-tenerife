import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
    });
  }

  const form = req.body || {};

  const codigoReferencia =
    typeof form.codigoReferencia === "string"
      ? form.codigoReferencia.trim()
      : "";

  if (codigoReferencia.length > 100) {
    return res.status(400).json({
      error: "La solicitud no es válida.",
    });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.rpc(
    "registrar_comunicacion_fallecimiento",
    {
      p_reference_code: codigoReferencia || null,
    }
  );

  if (error) {
    console.error("Error registrando comunicación A1:", error);

    return res.status(500).json({
      error: "No se ha podido registrar la comunicación.",
    });
  }

  /*
   * La respuesta pública es deliberadamente neutra.
   *
   * No se comunica si el código corresponde a un titular,
   * ni se devuelve información del expediente.
   */
  return res.status(200).json({
    success: true,
    message:
      "La comunicación ha sido recibida y será revisada conforme al protocolo.",
    requestId: data,
  });
}