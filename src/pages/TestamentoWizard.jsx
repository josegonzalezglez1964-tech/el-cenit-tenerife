import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured, getSession, signInWithGoogle } from "../lib/supabaseClient";
import { saveTestamento } from "../lib/testamentos";

const DRAFT_KEY = "cenit_draft";

const STEPS = [
  { id: "identidad", label: "Identidad" },
  { id: "herederos", label: "Herederos" },
  { id: "boveda", label: "Bóveda" },
  { id: "revision", label: "Revisión" },
];

const initialForm = {
  nombre: "",
  email: "",
  herederos: [{ nombre: "", email: "", relacion: "" }],
  categorias: [],
  mensaje: "",
};

const CATEGORIAS_BOVEDA = [
  { id: "contrasenas", label: "Contraseñas y accesos digitales" },
  { id: "cripto", label: "Criptomonedas y claves privadas" },
  { id: "mensajes", label: "Mensajes póstumos" },
  { id: "documentos", label: "Documentos y archivos" },
];

export default function TestamentoWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Al cargar: comprueba si hay sesión, y si venimos de un redirect de
  // Google con un borrador pendiente en localStorage, lo restaura y
  // termina de guardarlo automáticamente.
  useEffect(() => {
    async function restoreAndMaybeSave() {
      if (!isSupabaseConfigured) return;
      const currentSession = await getSession();
      setSession(currentSession);

      const pending = localStorage.getItem(DRAFT_KEY);
      if (pending && currentSession) {
        const draft = JSON.parse(pending);
        setForm(draft);
        setStep(STEPS.length - 1);
        setSaving(true);
        const { error } = await saveTestamento(draft, currentSession.user.id);
        setSaving(false);
        localStorage.removeItem(DRAFT_KEY);
        if (error) {
          setSaveError(error.message);
        } else {
          setSaved(true);
        }
      }
    }
    restoreAndMaybeSave();
  }, []);

  const isLastStep = step === STEPS.length - 1;
  const isFirstStep = step === 0;

  const canAdvance = () => {
    if (step === 0) return form.nombre.trim() && form.email.trim();
    if (step === 1) return form.herederos.some((h) => h.nombre.trim() && h.email.trim());
    if (step === 2) return form.categorias.length > 0;
    return true;
  };

  const updateHeir = (index, field, value) => {
    setForm((f) => {
      const herederos = [...f.herederos];
      herederos[index] = { ...herederos[index], [field]: value };
      return { ...f, herederos };
    });
  };

  const addHeir = () => {
    setForm((f) => ({
      ...f,
      herederos: [...f.herederos, { nombre: "", email: "", relacion: "" }],
    }));
  };

  const removeHeir = (index) => {
    setForm((f) => ({
      ...f,
      herederos: f.herederos.filter((_, i) => i !== index),
    }));
  };

  const toggleCategoria = (id) => {
    setForm((f) => ({
      ...f,
      categorias: f.categorias.includes(id)
        ? f.categorias.filter((c) => c !== id)
        : [...f.categorias, id],
    }));
  };

  const handleGuardar = async () => {
    if (!isSupabaseConfigured) {
      // Modo demo: sin Supabase conectado, solo simulamos el guardado.
      console.log("Borrador del testamento digital (demo):", form);
      setSaved(true);
      return;
    }

    if (session) {
      // Ya hay sesión iniciada: guardamos directamente.
      setSaving(true);
      setSaveError(null);
      const { error } = await saveTestamento(form, session.user.id);
      setSaving(false);
      if (error) {
        setSaveError(error.message);
      } else {
        setSaved(true);
      }
      return;
    }

    // No hay sesión: guardamos el formulario en localStorage y mandamos
    // al usuario a iniciar sesión con Google. Al volver, el useEffect de
    // arriba recupera el borrador y termina de guardarlo solo.
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    const { error } = await signInWithGoogle("/testamento");
    if (error) setSaveError(error.message);
  };

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="font-display text-xl tracking-tight"
          >
            El Cénit
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-ink/60 hover:text-ink transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        {!isSupabaseConfigured && (
          <div className="mb-8 rounded-xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-ink/70">
            Modo demo: la autenticación y el guardado real todavía no están
            conectados. Puedes probar el flujo completo, pero al final se
            simula el guardado en vez de escribirlo en tu bóveda real.
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-clay" : "bg-line"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-clay mb-2">
          Paso {step + 1} de {STEPS.length} · {STEPS[step].label}
        </p>

        {/* Step 0 — Identidad */}
        {step === 0 && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl mb-2">
              Empecemos por ti.
            </h1>
            <p className="text-ink/60 mb-8">
              Esta información identifica tu testamento digital. Podrás
              editarla más adelante.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">Nombre completo</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
                placeholder="Tu nombre y apellidos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        )}

        {/* Step 1 — Herederos */}
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl mb-2">
              Designa a tus herederos.
            </h1>
            <p className="text-ink/60 mb-8">
              Al amparo del artículo 96 de la LOPDGDD, designa aquí a tu
              albacea o herederos digitales.
            </p>
            {form.herederos.map((h, i) => (
              <div key={i} className="rounded-xl border border-line p-5 space-y-4 relative">
                {form.herederos.length > 1 && (
                  <button
                    onClick={() => removeHeir(i)}
                    className="absolute top-4 right-4 text-xs text-ink/40 hover:text-clay"
                  >
                    Eliminar
                  </button>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={h.nombre}
                    onChange={(e) => updateHeir(i, "nombre", e.target.value)}
                    className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
                    placeholder="Nombre del heredero"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    value={h.email}
                    onChange={(e) => updateHeir(i, "email", e.target.value)}
                    className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
                    placeholder="heredero@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Relación</label>
                  <input
                    type="text"
                    value={h.relacion}
                    onChange={(e) => updateHeir(i, "relacion", e.target.value)}
                    className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
                    placeholder="Ej. hijo/a, cónyuge, albacea de confianza"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addHeir}
              className="text-sm font-medium text-clay hover:text-clay-light transition-colors"
            >
              + Añadir otro heredero
            </button>
          </div>
        )}

        {/* Step 2 — Bóveda */}
        {step === 2 && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl mb-2">
              ¿Qué guardará tu bóveda?
            </h1>
            <p className="text-ink/60 mb-8">
              Elige qué tipos de contenido quieres custodiar. El contenido
              real se añade después, cifrado, una vez configurada tu cuenta.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {CATEGORIAS_BOVEDA.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategoria(cat.id)}
                  className={`text-left rounded-xl border p-5 transition-colors ${
                    form.categorias.includes(cat.id)
                      ? "border-clay bg-clay/5"
                      : "border-line bg-white/40 hover:bg-white/70"
                  }`}
                >
                  <p className="font-medium text-sm">{cat.label}</p>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Mensaje póstumo (opcional)
              </label>
              <textarea
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay resize-none"
                placeholder="Un mensaje para tus herederos, si quieres dejarlo ya escrito."
              />
            </div>
          </div>
        )}

        {/* Step 3 — Revisión */}
        {step === 3 && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl sm:text-4xl mb-2">
              Revisa antes de guardar.
            </h1>
            <p className="text-ink/60 mb-8">
              Esto es un borrador. Podrás editarlo todo después de crear tu
              cuenta.
            </p>

            <div className="rounded-xl border border-line p-5 space-y-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-clay mb-1">Identidad</p>
                <p className="text-sm">{form.nombre || "—"} · {form.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-clay mb-1">Herederos</p>
                {form.herederos.filter((h) => h.nombre).map((h, i) => (
                  <p key={i} className="text-sm">
                    {h.nombre} ({h.relacion || "sin relación indicada"}) — {h.email}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-clay mb-1">Bóveda</p>
                <p className="text-sm">
                  {form.categorias.length
                    ? form.categorias
                        .map((id) => CATEGORIAS_BOVEDA.find((c) => c.id === id)?.label)
                        .join(", ")
                    : "Ninguna categoría seleccionada"}
                </p>
              </div>
            </div>

            {saved ? (
              <div className="rounded-xl border border-clay/30 bg-clay/5 p-5 text-sm">
                {isSupabaseConfigured
                  ? "Guardado en tu bóveda. Puedes volver a esta página cuando quieras para editarlo."
                  : "Borrador guardado localmente. Cuando conectemos tu cuenta con Google, esto se sincronizará con tu bóveda real."}
              </div>
            ) : (
              <>
                {saveError && (
                  <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                    No se pudo guardar: {saveError}
                  </div>
                )}
                <button
                  onClick={handleGuardar}
                  disabled={saving}
                  className="w-full rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Guardando..."
                    : isSupabaseConfigured && !session
                    ? "Acceder con Google y guardar"
                    : "Guardar borrador"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={isFirstStep}
            className="text-sm font-medium text-ink/60 hover:text-ink disabled:opacity-0 transition-colors"
          >
            ← Atrás
          </button>
          {!isLastStep && (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canAdvance()}
              className="rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-30 disabled:hover:bg-ink"
            >
              Continuar →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
