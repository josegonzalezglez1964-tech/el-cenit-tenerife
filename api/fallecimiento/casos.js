import { createClient } from "@supabase/supabase-js";
import { requireReviewer } from "./_requireReviewer.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { user, error } = await requireReviewer(req);

  if (error) {
    return res.status(error.status).json({
      error: error.message,
    });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";

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

  const { data: casos, error: casosError } = await supabase.rpc(
    "listar_expedientes_revisor"
  );

  if (casosError) {
    console.error(
      `[fallecimiento/casos] Error consultando expedientes para ${user.id}:`,
      casosError.message
    );

    return res.status(500).json({
      error: "No se pudieron consultar los expedientes.",
    });
  }

  return res.status(200).json({
    casos: casos || [],
  });
}