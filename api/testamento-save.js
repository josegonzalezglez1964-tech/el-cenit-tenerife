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

  // Misma guarda de seguridad que ya teníamos en el cliente:
  // nunca guardamos ni borramos herederos existentes sin al menos
  // un heredero válido.
  if (herederosValidos.length === 0) {
    return res.status(400).json({
      error:
        "Debes indicar al menos un heredero con nombre y correo electrónico.",
    });
  }

  const { data: existing, error: existingError } = await supabase
    .from("testamentos")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ error: existingError.message });
  }

  const payload = {
    user_id: userId,
    nombre: form.nombre,
    email: form.email,
    categorias: form.categorias,
    updated_at: new Date().toISOString(),
  };

  // En la versión actual, el mensaje cifrado todavía no tiene
  // columnas propias en testamentos. Por tanto, si llega cifrado,
  // no intentamos escribir columnas inexistentes.
  //
  // Si llega como texto, se conserva en la columna mensaje existente.
  if (typeof form.mensaje === "string") {
    payload.mensaje = form.mensaje;
  }

  let testamentoId = existing?.id;

  if (testamentoId) {
    const { error } = await supabase
      .from("testamentos")
      .update(payload)
      .eq("id", testamentoId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    const { data, error } = await supabase
      .from("testamentos")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    testamentoId = data.id;
  }

  // Cifra cada heredero antes de guardarlo.
  // En esta versión actual, nombre y email también se conservan
  // en sus columnas obligatorias porque la tabla los requiere.
  const filasHerederos = herederosValidos.map((h) => {
    const { ciphertext, iv } = encryptJSON({
      nombre: h.nombre,
      email: h.email,
      relacion: h.relacion || "",
    });

    return {
      testamento_id: testamentoId,
      nombre: h.nombre,
      email: h.email,
      relacion: h.relacion || null,
      ciphertext,
      iv,
    };
  });

  const { data: inserted, error: insertError } = await supabase
    .from("herederos")
    .insert(filasHerederos)
    .select("id");

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  // Si estamos actualizando un testamento existente, eliminamos
  // los herederos anteriores una vez que los nuevos se han guardado
  // correctamente.
  if (existing) {
    const nuevosIds = (inserted || []).map((h) => h.id);

    let deleteQuery = supabase
      .from("herederos")
      .delete()
      .eq("testamento_id", testamentoId);

    if (nuevosIds.length > 0) {
      deleteQuery = deleteQuery.not("id", "in", `(${nuevosIds.join(",")})`);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }
  }

  return res.status(200).json({ testamentoId });
}
