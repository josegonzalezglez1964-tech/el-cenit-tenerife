import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { brand, nav } from "../data/content";

export default function Navbar({ onGoogleLogin, user, onSignOut }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav
      data-testid="main-navbar"
      className="sticky top-0 z-40 backdrop-blur-xl border-b bg-cream/75 border-line text-ink"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <a className="flex items-center gap-3" data-testid="brand-link" href="#top">
          <span className="font-display text-xl tracking-tight">{brand.name}</span>
          <span className="hidden sm:inline text-xs font-mono uppercase tracking-widest text-ink/50">
            {brand.tagline}
          </span>
        </a>

        {/* Enlaces en pantallas medianas/grandes */}
        <div className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
            >
              {item.label}
            </a>
          ))}
          {user && (
            <button
              onClick={() => navigate("/boveda")}
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
            >
              Mi Bóveda
            </button>
          )}
          {user && (
            <button
              onClick={() => navigate("/mi-testamento")}
              className="text-sm font-medium text-ink/70 hover:text-ink transition-colors"
            >
              Mi Testamento
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-ink/70 truncate max-w-[160px]">{user.email}</span>
              <button
                onClick={onSignOut}
                className="rounded-full border border-ink/20 text-sm font-medium px-5 py-2 hover:border-ink/50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleLogin}
              data-testid="google-login-button"
              className="hidden sm:inline-block rounded-full bg-ink text-cream text-sm font-medium px-5 py-2 hover:bg-clay transition-colors"
            >
              Acceder con Google
            </button>
          )}

          {/* Botón hamburguesa — solo visible por debajo de md */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            className="md:hidden flex flex-col justify-center gap-1.5 w-9 h-9"
          >
            <span className={`h-0.5 w-6 bg-ink transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`h-0.5 w-6 bg-ink transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-6 bg-ink transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Panel desplegable en móvil */}
      {menuOpen && (
        <div className="md:hidden border-t border-line bg-cream px-6 py-4 space-y-3">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-ink/80 py-1"
            >
              {item.label}
            </a>
          ))}
          {user && (
            <button
              onClick={() => goTo("/boveda")}
              className="block text-sm font-medium text-ink/80 py-1"
            >
              Mi Bóveda
            </button>
          )}
          {user && (
            <button
              onClick={() => goTo("/mi-testamento")}
              className="block text-sm font-medium text-ink/80 py-1"
            >
              Mi Testamento
            </button>
          )}

          <div className="pt-3 border-t border-line">
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-ink/60 truncate">{user.email}</p>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full rounded-full border border-ink/20 text-sm font-medium px-5 py-2"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onGoogleLogin();
                }}
                className="w-full rounded-full bg-ink text-cream text-sm font-medium px-5 py-2"
              >
                Acceder con Google
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
