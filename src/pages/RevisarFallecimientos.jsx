import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isSupabaseConfigured,
  getSession,
  onAuthChange,
  signInWithGoogle,
} from "../lib/supabaseClient";

function Shell({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
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

      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
        {children}
      </main>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RevisarFallecimientos() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [casos, setCasos] = useState([]);
  const [casosLoading, setCasosLoading] = useState(false);
  const [casosError, setCasosError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthChecked(true);
      return;
    }

    getSession().then((currentSession) => {
      setSession(currentSession);
      setAuthChecked(true);
    });

    const unsubscribe = onAuthChange((currentSession) => {
      setSession(currentSession);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;

    let cancelled = false;

    const cargarCasos = async () => {
      setCasosLoading(true);
      setCasosError(null);

      try {
        const response = await fetch("/api/fallecimiento/casos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          const error = new Error(
            data?.error || "No se pudieron consultar los expedientes."
          );
          error.status = response.status;
          throw error;
        }

        if (!cancelled) {
          setCasos(data.casos || []);
        }
      } catch (error) {
        if (!cancelled) {
          setCasos([]);
          setCasosError(error);
        }
      } finally {
        if (!cancelled) {
          setCasosLoading(false);
        }
      }
    };

    cargarCasos();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">
          Revisión de expedientes
        </h1>

        <p className="text-ink/60">
          El acceso interno necesita Supabase conectado.
        </p>
      </Shell>
    );
  }

  if (!authChecked) {
    return (
      <Shell>
        <p className="text-ink/50 text-sm">Comprobando sesión...</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">
          Revisión de expedientes
        </h1>

        <p className="text-ink/60 mb-8">
          Inicia sesión para comprobar si tu cuenta está autorizada como
          revisor del protocolo.
        </p>

        <button
          onClick={() => signInWithGoogle("/revisar-fallecimientos")}
          className="rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors"
        >
          Acceder con Google
        </button>
      </Shell>
    );
  }

  if (casosLoading) {
    return (
      <Shell>
        <p className="text-ink/50 text-sm">
          Comprobando autorización y cargando expedientes...
        </p>
      </Shell>
    );
  }

  if (casosError?.status === 403) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">
          Acceso no autorizado.
        </h1>

        <p className="text-ink/60">
          Tu cuenta está autenticada, pero no está autorizada para revisar
          expedientes del protocolo.
        </p>
      </Shell>
    );
  }

  if (casosError?.status === 401) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">
          Sesión no válida.
        </h1>

        <p className="text-ink/60">
          La sesión ha caducado o ya no es válida. Vuelve a iniciar sesión.
        </p>
      </Shell>
    );
  }

  if (casosError) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">
          No se pudieron cargar los expedientes.
        </h1>

        <p className="text-ink/60">
          Se produjo un error al consultar el sistema. Inténtalo de nuevo.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-clay mb-3">
          Protocolo de fallecimiento
        </p>

        <h1 className="font-display text-3xl sm:text-4xl mb-3">
          Revisión de expedientes.
        </h1>

        <p className="text-ink/60">
          Expedientes disponibles para revisión interna.
        </p>
      </div>

      <div className="rounded-xl border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <p className="text-sm font-medium">
            {casos.length} expediente{casos.length === 1 ? "" : "s"}
          </p>

          <p className="text-xs text-ink/50 truncate max-w-[240px]">
            {session.user.email}
          </p>
        </div>

        {casos.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-ink/50">
              No hay expedientes disponibles para revisión.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {casos.map((caso) => (
              <article key={caso.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-sm mb-1">
                      {caso.reference_code || "Sin referencia"}
                    </p>

                    <p className="text-sm text-ink/70">
                      {caso.requester_name || "Solicitante no indicado"}
                    </p>

                    <p className="text-xs text-ink/50 mt-1">
                      {caso.requester_relation || "Relación no indicada"}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-mono uppercase tracking-wide text-clay">
                      {caso.status || "SIN ESTADO"}
                    </p>

                    <p className="text-xs text-ink/50 mt-1">
                      {formatDate(caso.created_at)}
                    </p>
                  </div>
                </div>

                {caso.requester_reason && (
                  <div className="mt-4 rounded-lg bg-ink/5 p-4">
                    <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-2">
                      Motivo comunicado
                    </p>

                    <p className="text-sm text-ink/70 whitespace-pre-wrap">
                      {caso.requester_reason}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
