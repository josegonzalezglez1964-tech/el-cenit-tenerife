import { createClient } from "@supabase/supabase-js";
import { decryptJSON } from "./_crypto.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return res.status(401).json({ error: "No autenticado." });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Sesión inválida o caducada." });
  }

  const { data: testamento, error: testError } = await supabase
    .from("testamentos")
    .select("id, nombre, email, categorias, mensaje, updated_at")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (testError) return res.status(500).json({ error: testError.message });
  if (!testamento) return res.status(200).json({ testamento: null });

  const { data: herederosRows, error: herederosError } = await supabase
    .from("herederos")
    .select("id, ciphertext, iv")
    .eq("testamento_id", testamento.id);

  if (herederosError) return res.status(500).json({ error: herederosError.message });

  const herederos = (herederosRows || [])
    .map((row) => {
      try {
        const datos = decryptJSON(row.ciphertext, row.iv);
        return { id: row.id, ...datos };
      } catch (err) {
        // Un heredero que no se puede descifrar (clave rotada, dato
        // corrupto) no debe tirar abajo toda la pantalla — se omite y
        // se registra en los logs del servidor para investigarlo.
        console.error(`[testamento-get] No se pudo descifrar heredero ${row.id}:`, err.message);
        return null;
      }
    })
    .filter(Boolean);

  return res.status(200).json({ testamento: { ...testamento, herederos } });
}
