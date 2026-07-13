import { useState, useEffect, useRef } from "react";
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
  addVaultTextEntry,
  addVaultFileEntry,
  uploadEncryptedFile,
  downloadEncryptedFile,
  deleteVaultEntry,
} from "../lib/vaultEntries";
import {
  generateSaltBase64,
  deriveKey,
  encryptText,
  decryptText,
  encryptFile,
  decryptFileBlob,
  VAULT_CHECK_PHRASE,
} from "../lib/vaultCrypto";

const CATEGORIAS = [
  { id: "contrasenas", label: "Contraseña / acceso digital" },
  { id: "cripto", label: "Criptomonedas / clave privada" },
  { id: "mensajes", label: "Mensaje póstumo" },
  { id: "documentos", label: "Documento / nota" },
];

const FREE_TIER_BYTES = 1024 * 1024 * 1024; // 1 GB, límite del plan gratis de Supabase

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Shell({ children }) {
  const navigate = useNavigate();
  return (
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
}

export default function Boveda() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [vaultSetup, setVaultSetup] = useState(null);
  const [setupChecked, setSetupChecked] = useState(false);

  const [passphrase, setPassphrase] = useState("");
  const [passphraseConfirm, setPassphraseConfirm] = useState("");
  const [unlockError, setUnlockError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [cryptoKey, setCryptoKey] = useState(null);
  const [entries, setEntries] = useState([]);
  const [revealed, setRevealed] = useState({});

  const [entryTipo, setEntryTipo] = useState("texto"); // "texto" | "archivo"
  const [newTitulo, setNewTitulo] = useState("");
  const [newCategoria, setNewCategoria] = useState(CATEGORIAS[0].id);
  const [newContenido, setNewContenido] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

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
    setUploadError(null);
    if (!newTitulo.trim()) return;

    setBusy(true);
    try {
      if (entryTipo === "texto") {
        if (!newContenido.trim()) {
          setBusy(false);
          return;
        }
        const { ciphertext, iv } = await encryptText(cryptoKey, newContenido);
        const { error } = await addVaultTextEntry(session.user.id, {
          titulo: newTitulo,
          categoria: newCategoria,
          ciphertext,
          iv,
        });
        if (error) throw error;
      } else {
        if (!selectedFile) {
          setBusy(false);
          return;
        }
        const storagePath = `${session.user.id}/${crypto.randomUUID()}`;
        const { blob, iv } = await encryptFile(cryptoKey, selectedFile);
        const { error: uploadErr } = await uploadEncryptedFile(storagePath, blob);
        if (uploadErr) throw uploadErr;
        const { error } = await addVaultFileEntry(session.user.id, {
          titulo: newTitulo,
          categoria: newCategoria,
          iv,
          nombreArchivo: selectedFile.name,
          mimeType: selectedFile.type || "application/octet-stream",
          tamanoBytes: selectedFile.size,
          storagePath,
        });
        if (error) throw error;
      }
      setNewTitulo("");
      setNewContenido("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      refreshEntries(session.user.id);
    } catch (err) {
      setUploadError(err.message || "No se pudo guardar la entrada.");
    }
    setBusy(false);
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

  const handleDownload = async (entry) => {
    try {
      const { data: encryptedBlob, error } = await downloadEncryptedFile(entry.storage_path);
      if (error) throw error;
      const plainBlob = await decryptFileBlob(cryptoKey, encryptedBlob, entry.iv, entry.mime_type);
      const url = URL.createObjectURL(plainBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = entry.nombre_archivo || "archivo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo descifrar el archivo. ¿Es la frase maestra correcta?");
    }
  };

  const handleDelete = async (entry) => {
    await deleteVaultEntry(entry);
    refreshEntries(session.user.id);
  };

  const totalBytesUsed = entries.reduce((sum, e) => sum + (e.tamano_bytes || 0), 0);
  const usagePercent = Math.min(100, (totalBytesUsed / FREE_TIER_BYTES) * 100);

  // ---------- Render ----------

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

  if (!vaultSetup?.vault_salt) {
    return (
      <Shell>
        <h1 className="font-display text-3xl sm:text-4xl mb-4">Crea tu frase maestra.</h1>
        <div className="rounded-xl border border-clay/30 bg-clay/5 p-4 text-sm text-ink/70 mb-8">
          Esta frase cifra todo lo que guardes aquí — texto y archivos por igual. No se envía ni se
          guarda en ningún sitio — ni siquiera nosotros podemos verla ni recuperarla.{" "}
          <strong>Si la olvidas, el contenido de tu bóveda queda cifrado para siempre.</strong>{" "}
          Guárdala en un lugar seguro, distinto de tu contraseña de Google.
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

  return (
    <Shell>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl sm:text-4xl">Tu Bóveda.</h1>
        <button onClick={handleBloquear} className="text-sm text-ink/60 hover:text-ink transition-colors">
          Bloquear
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-ink/50 mb-1">
          <span>{formatBytes(totalBytesUsed)} usados</span>
          <span>1 GB gratis</span>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full bg-clay transition-all" style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      <form onSubmit={handleAddEntry} className="rounded-xl border border-line p-5 space-y-4 mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-clay">Añadir entrada</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEntryTipo("texto")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              entryTipo === "texto" ? "border-clay bg-clay/5" : "border-line"
            }`}
          >
            Texto
          </button>
          <button
            type="button"
            onClick={() => setEntryTipo("archivo")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              entryTipo === "archivo" ? "border-clay bg-clay/5" : "border-line"
            }`}
          >
            Archivo (PDF, Word, imagen...)
          </button>
        </div>

        <input
          type="text"
          value={newTitulo}
          onChange={(e) => setNewTitulo(e.target.value)}
          className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay"
          placeholder="Título (ej. Escritura de la casa)"
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

        {entryTipo === "texto" ? (
          <textarea
            value={newContenido}
            onChange={(e) => setNewContenido(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-line bg-white/60 px-4 py-3 text-sm focus:outline-none focus:border-clay resize-none"
            placeholder="El contenido secreto — se cifra antes de guardarse"
          />
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:text-cream file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-clay file:transition-colors"
            />
            {selectedFile && (
              <p className="text-xs text-ink/50 mt-2">
                {selectedFile.name} · {formatBytes(selectedFile.size)}
              </p>
            )}
          </div>
        )}

        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-ink text-cream px-6 py-2.5 text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50"
        >
          {busy ? "Cifrando y guardando..." : "Guardar cifrado"}
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
                  {entry.tipo === "archivo" && ` · ${entry.nombre_archivo} · ${formatBytes(entry.tamano_bytes)}`}
                </p>
              </div>
              <div className="flex gap-3">
                {entry.tipo === "texto" ? (
                  <button
                    onClick={() => handleReveal(entry)}
                    className="text-xs font-medium text-clay hover:text-clay-light transition-colors"
                  >
                    {revealed[entry.id] ? "Ocultar" : "Mostrar"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleDownload(entry)}
                    className="text-xs font-medium text-clay hover:text-clay-light transition-colors"
                  >
                    Descargar
                  </button>
                )}
                <button
                  onClick={() => handleDelete(entry)}
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
