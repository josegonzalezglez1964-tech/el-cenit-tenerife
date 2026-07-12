import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isSupabaseConfigured,
  getSession,
  onAuthChange,
  signInWithGoogle,
} from "../lib/supabaseClient";
import {
  getVaultSetup,
  initVaultSetup,
  listVaultEntries,
  addVaultEntry,
  deleteVaultEntry,
} from "../lib/vaultEntries";
import {
  generateSaltBase64,
  deriveKey,
  encryptText,
  decryptText,
  VAULT_CHECK_PHRASE,
} from "../lib/vaultCrypto";

const CATEGORIAS = [
  { id: "contrasenas", label: "Contraseña / acceso digital" },
  { id: "cripto", label: "Criptomonedas / clave privada" },
  { id: "mensajes", label: "Mensaje póstumo" },
  { id: "documentos", label: "Documento / nota" },
];

export default function Boveda() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [vaultSetup, setVaultSetup] = useState(null); // { vault_salt, vault_check_ciphertext, vault_check_iv } | null
  const [setupChecked, setSetupChecked] = useState(false);

  const [passphrase, setPassphrase] = useState("");
  const [passphraseConfirm, setPassphraseConfirm] = useState("");
  const [unlockError, setUnlockError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [cryptoKey, setCryptoKey] = useState(null); // solo en memoria, nunca se persiste
  const [entries, setEntries] = useState([]);
  const [revealed, setRevealed] = useState({}); // { [entryId]: plaintext }

  const [newTitulo, setNewTitulo] = useState("");
  const [newCategoria, setNewCategoria] = useState(CATEGORIAS[0].id);
  const [newContenido, setNewContenido] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthChecked(true);
      return;
    }
    getSession().then((s) => {
      setSession(s);
      setAuthChecked(true);
    });
    const unsubscribe = onAuthChange((s) => setSession(s));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!session) return;
    getVaultSetup(session.user.id).then(({ data }) => {
      setVaultSetup(data);
      setSetupChecked(true);
    });
  }, [session]);

  const refreshEntries = async (userId) => {
    const { data } = await listVaultEntries(userId);
    setEntries(data || []);
  };

  const handleCrearFraseMaestra = async (e) => {
    e.preventDefault();
    setUnlockError(null);
    if (passphrase.length < 10) {
      setUnlockError("Usa al menos 10 caracteres para tu frase maestra.");
      return;
    }
    if (passphrase !== passphraseConfirm) {
      setUnlockError("Las dos frases no coinciden.");
      return;
    }
    setBusy(true);
    const salt = generateSaltBase64();
    const key = await deriveKey(passphrase, salt);
    const { ciphertext, iv } = await encryptText(key, VAULT_CHECK_PHRASE);
    const { error } = await initVaultSetup(session.user.id, {
      salt,
      checkCiphertext: ciphertext,
      checkIv: iv,
    });
    setBusy(false);
    if (error) {
      setUnlockError(error.message);
      return;
    }
    setCryptoKey(key);
    setVaultSetup({ vault_salt: salt, vault_check_ciphertext: ciphertext, vault_check_iv: iv });
    setPassphrase("");
    setPassphraseConfirm("");
    refreshEntries(session.user.id);
  };

  const handleDesbloquear = async (e) => {
    e.preventDefault();
    setUnlockError(null);
    setBusy(true);
    try {
      const key = await deriveKey(passphrase, vaultSetup.vault_salt);
      const check = await decryptText(key, vaultSetup.vault_check_ciphertext, vaultSetup.vault_check_iv);
      if (check !== VAULT_CHECK_PHRASE) throw new Error("mismatch");
      setCryptoKey(key);
      setPassphrase("");
      refreshEntries(session.user.id);
    } catch {
      setUnlockError("Frase maestra incorrecta. Inténtalo de nuevo.");
    }
    setBusy(false);
  };

  const handleBloquear = () => {
    setCryptoKey(null);
    setEntries([]);
    setRevealed({});
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newTitulo.trim() || !newContenido.trim()) return;
    setBusy(true);
    const { ciphertext, iv } = await encryptText(cryptoKey, newContenido);
    const { error } = await addVaultEntry(session.user.id, {
      titulo: newTitulo,
      categoria: newCategoria,
      ciphertext,
      iv,
    });
    setBusy(false);
    if (!error) {
      setNewTitulo("");
      setNewContenido("");
      refreshEntries(session.user.id);
    }
  };

  const handleReveal = async (entry) => {
    if (revealed[entry.id]) {
      setRevealed((r) => {
        const next = { ...r };
        delete next[entry.id];
        return next;
      });
      return;
    }
    try {
      const plaintext = await decryptText(cryptoKey, entry.ciphertext, entry.iv);
      setRevealed((r) => ({ ...r, [entry.id]: plaintext }));
    } catch {
      setRevealed((r) => ({ ...r, [entry.id]: "⚠️ No se pudo descifrar" }));
    }
  };

  const handleDelete = async (id) => {
    await deleteVaultEntry(id);
    refreshEntries(session.user.id);
  };

  // ---------- Render ----------

  const Shell = ({ children }) => (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="font-display text-xl tracking-tight">
            El Cénit
          </button>
          <button onClick={() => navigate("/")} className="text-sm text-ink/60 hover:text-ink transition-colors">
            Volver al inicio
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">{children}</main>
    </div>
  );

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <p className="text-ink/60">
          La Bóveda necesita Supabase conectado. Configura tus variables de entorno para activarla.
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
        <h1 className="font-display text-3xl sm:text-4xl mb-4">Tu Bóveda Privada.</h1>
        <p className="text-ink/60 mb-8">
          Inicia sesión con Google para acceder. El acceso a tu cuenta y el cifrado de tu contenido
          son dos capas distintas: iniciar sesión te identifica, pero solo tu frase maestra puede
          descifrar lo que guardes aquí.
        </p>
        <button
          onClick={() => signInWithGoogle("/boveda")}
          className="rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors"
        >
          Acceder con Google
        </button>
      </Shell>
    );
  }

  if (!setupChecked) {
    return (
      <Shell>
        <p className="text-ink/50 text-sm">Cargando tu bóveda...</p>
      </Shell>
    );
  }

  // Sin frase maestra creada todavía
  if (!vaultSetup?.vault_salt) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">Crea tu frase maestra.</h1>
        <div className="rounded-xl border border-clay/30 bg-clay/5 p-4 text-sm text-ink/70 mb-8">
          Esta frase cifra todo lo que guardes aquí. No se envía ni se guarda en ningún sitio — ni
          siquiera nosotros podemos verla ni recuperarla. <strong>Si la olvidas, el contenido de tu
          bóveda queda cifrado para siempre.</strong> Guárdala en un lugar seguro, distinto de tu
          contraseña de Google.
        </div>
        <form onSubmit={handleCrearFraseMaestra} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Frase maestra (mínimo 10 caracteres)</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
              placeholder="Algo largo y fácil de recordar solo para ti"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Repite la frase</label>
            <input
              type="password"
              value={passphraseConfirm}
              onChange={(e) => setPassphraseConfirm(e.target.value)}
              className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
            />
          </div>
          {unlockError && <p className="text-sm text-red-600">{unlockError}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50"
          >
            {busy ? "Creando..." : "Crear mi bóveda cifrada"}
          </button>
        </form>
      </Shell>
    );
  }

  // Con frase maestra creada, pero bloqueada en esta sesión
  if (!cryptoKey) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">Desbloquea tu bóveda.</h1>
        <p className="text-ink/60 mb-8">
          Por seguridad, tienes que introducir tu frase maestra en cada nueva sesión. Nunca se guarda
          en el navegador.
        </p>
        <form onSubmit={handleDesbloquear} className="space-y-6">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
            placeholder="Tu frase maestra"
            autoFocus
          />
          {unlockError && <p className="text-sm text-red-600">{unlockError}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ink text-cream px-7 py-3 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50"
          >
            {busy ? "Comprobando..." : "Desbloquear"}
          </button>
        </form>
      </Shell>
    );
  }

  // Desbloqueada: mostrar entradas + formulario para añadir
  return (
    <Shell>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl sm:text-4xl">Tu Bóveda.</h1>
        <button onClick={handleBloquear} className="text-sm text-ink/60 hover:text-ink transition-colors">
          Bloquear
        </button>
      </div>

      <form onSubmit={handleAddEntry} className="rounded-xl border border-line p-5 space-y-4 mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-clay">Añadir entrada</p>
        <input
          type="text"
          value={newTitulo}
          onChange={(e) => setNewTitulo(e.target.value)}
          className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
          placeholder="Título (ej. Acceso a mi correo principal)"
        />
        <select
          value={newCategoria}
          onChange={(e) => setNewCategoria(e.target.value)}
          className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <textarea
          value={newContenido}
          onChange={(e) => setNewContenido(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay resize-none"
          placeholder="El contenido secreto — se cifra antes de guardarse"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink text-cream px-6 py-2.5 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50"
        >
          Guardar cifrado
        </button>
      </form>

      <div className="space-y-4">
        {entries.length === 0 && (
          <p className="text-sm text-ink/50">Tu bóveda está vacía todavía.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-line p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-sm">{entry.titulo}</p>
                <p className="text-xs font-mono uppercase tracking-wide text-clay">
                  {CATEGORIAS.find((c) => c.id === entry.categoria)?.label || entry.categoria}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReveal(entry)}
                  className="text-xs font-medium text-clay hover:text-clay-light transition-colors"
                >
                  {revealed[entry.id] ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-xs font-medium text-ink/40 hover:text-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
            {revealed[entry.id] && (
              <p className="text-sm bg-ink/5 rounded-lg p-3 mt-2 whitespace-pre-wrap break-words font-mono">
                {revealed[entry.id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}
