import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isSupabaseConfigured, getSession, signInWithGoogle } from "../lib/supabaseClient";
import { getTestamento, saveTestamento, deleteTestamento } from "../lib/testamentos";

const CATEGORIAS_BOVEDA = [
  { id: "contrasenas", label: "Contraseñas y accesos digitales" },
  { id: "cripto", label: "Criptomonedas y claves privadas" },
  { id: "mensajes", label: "Mensajes póstumos" },
  { id: "documentos", label: "Documentos y archivos" },
];

const CONFIRM_TEXT = "BORRAR";

export default function MiTestamento() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testamentoId, setTestamentoId] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [savedMsg, setSavedMsg] = useState(false);

  // Estado del borrado, con confirmación explícita en dos pasos.
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const currentSession = await getSession();
      setSession(currentSession);

      if (!currentSession) {
        setLoading(false);
        return;
      }

      const { testamento, error } = await getTestamento();
      if (error) {
        setSaveError(error.message);
      } else if (testamento) {
        setTestamentoId(testamento.id);
        setForm({
          nombre: testamento.nombre || "",
          email: testamento.email || "",
          categorias: testamento.categorias || [],
          mensaje: testamento.mensaje || "",
          herederos: testamento.herederos.length
            ? testamento.herederos
            : [{ nombre: "", email: "", relacion: "" }],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

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

  const handleGuardarCambios = async () => {
    setSaving(true);
    setSaveError(null);
    setSavedMsg(false);
    const { error } = await saveTestamento(form);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  const handleBorrar = async () => {
    if (confirmText !== CONFIRM_TEXT) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteTestamento(testamentoId);
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
    } else {
      setTestamentoId(null);
      setForm(null);
      setShowConfirmDelete(false);
      setConfirmText("");
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <PageShell navigate={navigate}>
        <p className="text-ink/60">
          Modo demo: la conexión con Supabase todavía no está activa, así que
          no hay ningún testamento real que gestionar aquí.
        </p>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell navigate={navigate}>
        <p className="text-ink/60">Cargando…</p>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell navigate={navigate}>
        <p className="text-ink/60 mb-6">
          Inicia sesión para ver y gestionar tu testamento digital.
        </p>
        <button
          onClick={() => signInWithGoogle("/mi-testamento")}
          className="rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors"
        >
          Acceder con Google
        </button>
      </PageShell>
    );
  }

  if (!form) {
    return (
      <PageShell navigate={navigate}>
        <p className="text-ink/60 mb-6">
          Todavía no has creado tu testamento digital.
        </p>
        <button
          onClick={() => navigate("/testamento")}
          className="rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors"
        >
          Crear mi testamento
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell navigate={navigate}>
      <h1 className="font-display text-3xl sm:text-4xl mb-2">Mi testamento</h1>
      <p className="text-ink/60 mb-10">
        Aquí puedes revisar, editar o borrar tu testamento digital y tus
        herederos designados.
      </p>

      <div className="space-y-10">
        {/* Identidad */}
        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-clay">Identidad</p>
          <div>
            <label className="block text-sm font-medium mb-2">Nombre completo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
            />
          </div>
        </section>

        {/* Herederos */}
        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-clay">Herederos</p>
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                <input
                  type="email"
                  value={h.email}
                  onChange={(e) => updateHeir(i, "email", e.target.value)}
                  className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Relación</label>
                <input
                  type="text"
                  value={h.relacion}
                  onChange={(e) => updateHeir(i, "relacion", e.target.value)}
                  className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
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
        </section>

        {/* Bóveda / categorías + mensaje */}
        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-clay">Bóveda</p>
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
            <label className="block text-sm font-medium mb-2">Mensaje póstumo (opcional)</label>
            <textarea
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay resize-none"
            />
          </div>
        </section>

        {/* Guardar cambios */}
        <section>
          {saveError && (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              No se pudo guardar: {saveError}
            </div>
          )}
          {savedMsg && (
            <div className="mb-4 rounded-xl border border-clay/30 bg-clay/5 p-4 text-sm">
              Cambios guardados correctamente.
            </div>
          )}
          <button
            onClick={handleGuardarCambios}
            disabled={saving}
            className="w-full rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </section>

        {/* Zona peligrosa: borrar */}
        <section className="border-t border-line pt-8">
          <p className="font-mono text-xs uppercase tracking-widest text-red-700 mb-3">
            Zona de peligro
          </p>
          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="text-sm font-medium text-red-700 hover:text-red-900 transition-colors"
            >
              Borrar mi testamento y mis herederos
            </button>
          ) : (
            <div className="rounded-xl border border-red-300 bg-red-50 p-5 space-y-4">
              <p className="text-sm text-red-800">
                Esto borra tu testamento y todos tus herederos designados de
                forma permanente. No afecta a los archivos de tu Bóveda
                (esos se gestionan aparte). Esta acción no se puede deshacer.
              </p>
              <p className="text-sm text-red-800">
                Escribe <strong>{CONFIRM_TEXT}</strong> para confirmar:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border border-red-300 bg-white px-4 py-3 text-sm focus:outline-none"
                placeholder={CONFIRM_TEXT}
              />
              {deleteError && (
                <p className="text-sm text-red-700">No se pudo borrar: {deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleBorrar}
                  disabled={confirmText !== CONFIRM_TEXT || deleting}
                  className="rounded-full bg-red-700 text-white px-6 py-2.5 text-sm font-medium hover:bg-red-800 transition-colors disabled:opacity-40"
                >
                  {deleting ? "Borrando…" : "Confirmar borrado"}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setConfirmText("");
                    setDeleteError(null);
                  }}
                  className="rounded-full border border-line px-6 py-2.5 text-sm font-medium hover:bg-white/60 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function PageShell({ navigate, children }) {
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
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">{children}</main>
    </div>
  );
}
