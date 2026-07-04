# El Cénit · Testamento Digital de Tenerife

Landing page construida con **React + Vite + Tailwind CSS v4**, replicando la
estructura de la página original: Navbar, Hero, Tesis, Cronología, Modelo,
Nodo (Tenerife), CTA final y Footer.

## Estructura del proyecto

```
el-cenit/
├── index.html
├── package.json
├── vite.config.js
├── .env.example          ← copia a .env para claves de auth
├── .gitignore
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx           ← punto de entrada de React
    ├── App.jsx            ← ensambla todas las secciones
    ├── index.css          ← fuentes, colores, tema de Tailwind
    ├── data/
    │   └── content.js     ← TODO el texto del sitio vive aquí
    └── components/
        ├── Navbar.jsx
        ├── Hero.jsx
        ├── Tesis.jsx
        ├── Timeline.jsx
        ├── Modelo.jsx
        ├── Tenerife.jsx
        ├── FinalCta.jsx
        └── Footer.jsx
```

**Para cambiar textos**: edita `src/data/content.js`. No necesitas tocar los
componentes salvo que quieras cambiar la estructura visual.

**Para cambiar colores/fuentes**: edita el bloque `@theme` en `src/index.css`.

---

## Pasos para arrancar en tu máquina

### 1. Requisitos previos
- Instala **Node.js** (versión 18 o superior): https://nodejs.org
- Instala **VS Code**: https://code.visualstudio.com
- Instala **GitHub Desktop**: https://desktop.github.com
- Ten una cuenta en **GitHub**

### 2. Descomprime y abre el proyecto
1. Descomprime el `.zip` que te compartí en la carpeta que prefieras (ej. `Documentos/Proyectos/`)
2. Abre **VS Code**
3. `Archivo → Abrir carpeta...` y selecciona la carpeta `el-cenit`
4. VS Code te sugerirá instalar las extensiones recomendadas (Tailwind CSS IntelliSense, Prettier, ES7 React snippets, GitLens) — acepta

### 3. Instala dependencias y arranca en modo desarrollo
Abre la terminal integrada de VS Code (`Ctrl+ñ` o `Terminal → Nueva Terminal`) y ejecuta:

```bash
npm install
npm run dev
```

Verás algo como `Local: http://localhost:5173/` — ábrelo en el navegador.
Cada vez que guardes un archivo, la página se actualiza sola (hot reload).

### 4. Sube el proyecto a GitHub con GitHub Desktop
1. Abre **GitHub Desktop**
2. `File → Add local repository...` → selecciona la carpeta `el-cenit`
3. Si te avisa que no es un repositorio Git, dale a **"create a repository"**
4. Escribe un resumen del primer commit, ej. "Esqueleto inicial del proyecto"
5. Click en **Commit to main**
6. Click en **Publish repository** (arriba a la derecha) — elige si público o privado
7. Listo: tu código ya está en GitHub

### 5. Flujo de trabajo diario
Cada vez que hagas cambios en VS Code:
1. Guarda los archivos
2. Ve a GitHub Desktop → verás los cambios listados
3. Escribe un mensaje breve describiendo el cambio
4. **Commit to main** → **Push origin**

### 6. Desplegar el sitio en internet (gratis)
**Opción recomendada: Vercel**
1. Ve a https://vercel.com y entra con tu cuenta de GitHub
2. **Add New → Project** → selecciona el repo `el-cenit`
3. Vercel detecta Vite automáticamente. Click **Deploy**
4. En 1-2 minutos tendrás una URL pública (ej. `el-cenit.vercel.app`)
5. A partir de ahora, cada `Push` desde GitHub Desktop despliega la nueva versión automáticamente

**Alternativa: Netlify** — el flujo es prácticamente idéntico.

### 7. (Opcional) Conectar el botón "Acceder con Google" a un login real
Ahora mismo el botón solo hace `console.log`. Para autenticación real:
1. Elige un proveedor: **Firebase Auth** (más simple), **Supabase Auth**, o **Auth0**
2. Crea un proyecto en su panel y activa el proveedor "Google"
3. Copia tus claves a un archivo `.env` (basado en `.env.example`, que ya está en `.gitignore` así que nunca se sube a GitHub)
4. Instala su SDK, ej. para Firebase: `npm install firebase`
5. Reemplaza el `handleGoogleLogin` en `src/App.jsx` con la llamada real de login

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca el servidor local con hot reload |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la build de producción para probarla |

## Stack usado
- **React 19** + **Vite** — SPA rápida
- **Tailwind CSS v4** (vía `@tailwindcss/vite`) — utilidades de estilo
- **Framer Motion** — instalado, listo para animaciones de scroll/entrada
- **lucide-react** — íconos
- **react-router-dom** — instalado por si en el futuro añades más páginas (hoy es solo una landing con anclas `#tesis`, `#timeline`, `#tenerife`)

Fuentes: Cormorant Garamond (display), Outfit (texto), JetBrains Mono (datos/etiquetas), cargadas vía Google Fonts en `src/index.css`.
