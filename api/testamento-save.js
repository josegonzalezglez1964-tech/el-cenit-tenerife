import { createClient } from "@supabase/supabase-js";
import { encryptJSON } from "./_crypto.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
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
  const userId = userData.user.id;

  const form = req.body || {};
  const herederosValidos = (form.herederos || []).filter(
    (h) => h?.nombre?.trim() && h?.email?.trim()
  );

  // Misma guarda de seguridad que ya teníamos en el cliente: nunca
  // guardamos (ni borramos herederos existentes) sin al menos uno válido.
  if (herederosValidos.length === 0) {
    return res.status(400).json({
      error: "Debes indicar al menos un heredero con nombre y correo electrónico.",
    });
  }

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
    updated_at: new Date().toISOString(),
  };

  // El mensaje llega de dos formas posibles:
  // - Ya cifrado por el navegador (form.mensajeCiphertext/mensajeIv):
  //   lo guardamos tal cual, como datos opacos. Nunca vemos el texto.
  // - En claro (form.mensaje, el caso del wizard inicial, que todavía
  //   no pide la frase maestra): se guarda igual que hasta ahora.
  if (form.mensajeCiphertext && form.mensajeIv) {
    payload.mensaje_ciphertext = form.mensajeCiphertext;
    payload.mensaje_iv = form.mensajeIv;
    payload.mensaje = null;
  } else if (typeof form.mensaje === "string") {
    payload.mensaje = form.mensaje;
  }

  let testamentoId = existing?.id;

  if (testamentoId) {
    const { error } = await supabase.from("testamentos").update(payload).eq("id", testamentoId);
    if (error) return res.status(500).json({ error: error.message });
  } else {
    const { data, error } = await supabase
      .from("testamentos")
      .insert(payload)
      .select("id")
      .single();
    if (error) return res.status(500).json({ error: error.message });
    testamentoId = data.id;
  }

  // Cifra cada heredero (nombre + email + relación, como un único blob
  // JSON) antes de que toque la base de datos. El texto plano nunca se
  // escribe en Supabase, en ningún momento.
  const filasHerederos = herederosValidos.map((h) => {
    const { ciphertext, iv } = encryptJSON({
      nombre: h.nombre,
      email: h.email,
      relacion: h.relacion || "",
    });
    return { testamento_id: testamentoId, ciphertext, iv };
  });

  const { data: inserted, error: insertError } = await supabase
    .from("herederos")
    .insert(filasHerederos)
    .select("id");
  if (insertError) return res.status(500).json({ error: insertError.message });

  // Igual que antes: borramos los herederos viejos SOLO después de que
  // los nuevos ya estén guardados con éxito, e identificándolos por ID
  // real (no por fecha).
  if (existing) {
    const nuevosIds = (inserted || []).map((h) => h.id);
    let deleteQuery = supabase.from("herederos").delete().eq("testamento_id", testamentoId);
    if (nuevosIds.length > 0) {
      deleteQuery = deleteQuery.not("id", "in", `(${nuevosIds.join(",")})`);
    }
    await deleteQuery;
  }

  return res.status(200).json({ testamentoId });
}