import { createClient } from "@supabase/supabase-js";
import { decryptJSON } from "./_crypto.js";

// Función serverless de Vercel. Se despliega automáticamente en
// https://tu-dominio.vercel.app/api/notify-heirs — nunca se ejecuta en
// el navegador, así que las variables de entorno de aquí abajo (sin
// prefijo VITE_) nunca llegan al bundle de JavaScript del cliente.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) Verificamos que quien llama tiene una sesión real de Supabase.
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "No autenticado." });
  }

  // Creamos un cliente de Supabase que actúa "como" el usuario que llama
  // (pasando su token), así las políticas de Row Level Security se
  // aplican exactamente igual que si la petición viniera del navegador.
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: "Sesión inválida o caducada." });
  }

  // 2) Releemos el testamento y los herederos REALES de este usuario
  // desde la base de datos. No confiamos en nada que el cliente mande
  // en el cuerpo de la petición — de hecho, ni siquiera lo leemos.
  const { data: testamento, error: testError } = await supabase
    .from("testamentos")
    .select("id, nombre")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (testError || !testamento) {
    return res.status(404).json({ error: "No se encontró un testamento para este usuario." });
  }

  const { data: herederosRows, error: herederosError } = await supabase
    .from("herederos")
    .select("id, ciphertext, iv")
    .eq("testamento_id", testamento.id);

  if (herederosError) {
    return res.status(500).json({ error: "Error leyendo herederos." });
  }

  const herederos = (herederosRows || [])
    .map((row) => {
      try {
        return decryptJSON(row.ciphertext, row.iv);
      } catch (err) {
        console.error(`[notify-heirs] No se pudo descifrar heredero ${row.id}:`, err.message);
        return null;
      }
    })
    .filter(Boolean);

  const destinatarios = herederos.filter(
    (h) => h.nombre?.trim() && h.email?.trim()
  );

  if (destinatarios.length === 0) {
    return res.status(200).json({ sent: 0, failed: 0, total: 0 });
  }

  // 3) Enviamos con la API REST de EmailJS, usando la Private Key —
  // que solo existe aquí, en el servidor, jamás en el navegador.
  const SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
  const PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

  const results = await Promise.allSettled(
    destinatarios.map((h) =>
      fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: SERVICE_ID,
          template_id: TEMPLATE_ID,
          user_id: PUBLIC_KEY,
          accessToken: PRIVATE_KEY,
          template_params: {
            to_email: h.email,
            to_name: h.nombre,
            from_name: testamento.nombre,
            relacion: h.relacion || "heredero/a designado/a",
          },
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.text();
      })
    )
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[notify-heirs] Falló el envío a ${destinatarios[i]?.email}:`, r.reason);
    }
  });

  const failed = results.filter((r) => r.status === "rejected").length;
  return res.status(200).json({
    sent: results.length - failed,
    failed,
    total: destinatarios.length,
  });
}
