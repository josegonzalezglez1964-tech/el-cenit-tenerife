import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const isEmailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

// Avisa a cada heredero de que ha sido designado. Si EmailJS todavía no
// está configurado, no hace nada — así el guardado del testamento nunca
// se rompe por esto, simplemente no se envían avisos hasta que lo actives.
export async function notifyHeirs(testadorNombre, herederos) {
  if (!isEmailConfigured) {
    console.warn(
      "[notifyHeirs] EmailJS no está configurado. Faltan variables:",
      {
        VITE_EMAILJS_SERVICE_ID: Boolean(SERVICE_ID),
        VITE_EMAILJS_TEMPLATE_ID: Boolean(TEMPLATE_ID),
        VITE_EMAILJS_PUBLIC_KEY: Boolean(PUBLIC_KEY),
      }
    );
    return { skipped: true, sent: 0, failed: 0 };
  }

  const destinatarios = herederos.filter((h) => h.nombre?.trim() && h.email?.trim());

  const results = await Promise.allSettled(
    destinatarios.map((h) =>
      emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: h.email,
          to_name: h.nombre,
          from_name: testadorNombre,
          relacion: h.relacion || "heredero/a designado/a",
        },
        { publicKey: PUBLIC_KEY }
      )
    )
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[notifyHeirs] Falló el envío a ${destinatarios[i]?.email}:`, r.reason);
    } else {
      console.log(`[notifyHeirs] Enviado a ${destinatarios[i]?.email}:`, r.value);
    }
  });

  const failed = results.filter((r) => r.status === "rejected").length;
  return { skipped: false, sent: results.length - failed, failed };
}
