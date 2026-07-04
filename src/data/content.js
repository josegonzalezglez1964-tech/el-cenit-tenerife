// Todo el contenido textual del sitio vive aquí.
// Edita estos objetos para cambiar textos sin tocar los componentes.
//
// Datos de referencia actualizados a julio de 2026:
// - Volumen de datos globales 2026: ~221 zettabytes/año (IDC Global DataSphere, DemandSage)
// - Mercado de plataformas de testamento digital: 1.850M$ (2025) → 2.020M$ (2026) → 3.670M$ (2034), CAGR 8,2%
// - ZEC: 4% IS, vigente hasta 2032. Plazo de inscripción: 31 dic 2026 (sin prórroga)
// - RIC: hasta 90% de reducción de base imponible
// - Deducciones I+D+i: 25% base, hasta 42% sobre exceso + 17% adicional por personal investigador (Art. 35 LIS)

export const brand = {
  name: "El Cénit",
  tagline: "Tenerife · ZEC",
};

export const nav = [
  { label: "Tesis", href: "#tesis" },
  { label: "2026—2126", href: "#timeline" },
  { label: "Tenerife", href: "#tenerife" },
];

export const hero = {
  eyebrow: "Informe estratégico · 2026 — 2126",
  titleLine1: "El cénit de la",
  titleHighlight: "convergencia",
  description:
    "Una arquitectura para custodiar tu identidad, tu patrimonio y tu legado a través de cien años de inteligencia artificial, biotecnología y expansión orbital — operada desde Santa Cruz de Tenerife.",
  ctaPrimary: "Comenzar mi testamento digital",
  ctaSecondary: "Leer la tesis",
  ribbon: [
    "ZONA ESPECIAL CANARIA",
    "4% IS",
    "RIC 90%",
    "ULL",
    "INTECH",
    "LOPDGDD 3/2018",
    "TEIDE",
    "2026—2126",
  ],
};

export const tesis = {
  eyebrow: "01 · Tesis",
  title: "El residuo digital es el nuevo patrimonio.",
  paragraphs: [
    {
      pre: "Solo en 2026 la humanidad generará más de ",
      stat: "221 zettabytes",
      post: " de datos. Ese residuo —fotografías, cripto, conversaciones, archivos, voz— se ha convertido en un activo crítico que sobrevive al cuerpo biológico.",
    },
    {
      pre: "El mercado global de plataformas de testamento digital pasa de ",
      stat: "1.850M$ (2025)",
      mid: " a ",
      stat2: "2.020M$ (2026)",
      post: ", camino a superar los 3.670M$ en 2034. Pero la fricción técnica y la urgencia emocional siguen sin resolverse. El Cénit es nuestra respuesta.",
    },
  ],
  cards: [
    {
      title: "Bóveda Privada",
      description:
        "Cifrado simulado reticular-postcuántico. Contraseñas, cripto, mensajes póstumos.",
    },
    {
      title: "Red de Herederos",
      description: "Designa, valida y cuantifica. Cada validación amplía tu bóveda.",
    },
    {
      title: "Asistente Cénit",
      description: "Claude Sonnet 5 redacta cláusulas y mensajes desde tu intención.",
    },
  ],
};

export const timeline = {
  eyebrow: "02 · Cronología",
  title: "Cien años de convergencia.",
  description:
    "Desde la economía del más allá digital hasta la colonización orbital de la conciencia. Una hoja de ruta para 2026—2126 anclada en Santa Cruz de Tenerife.",
  stages: [
    {
      range: "2026-2031",
      number: "01",
      title: "Génesis del Patrimonio Digital",
      description:
        "221 zettabytes anuales. El residuo digital se vuelve activo. El mercado de testamentos digitales pasa de 1.850M$ a 2.020M$ solo entre 2025 y 2026, con el plazo de inscripción ZEC cerrando el 31 de diciembre de 2026.",
      tags: ["Bóvedas familiares", "Bucles virales incentivados", "Cumplimiento LOPDGDD 3/2018"],
    },
    {
      range: "2031-2051",
      number: "02",
      title: "Soberanía Algorítmica",
      description:
        "Las AGIs gestionan herencias multigeneracionales. Tenerife consolida la ZEC como puerto fiscal del legado digital europeo.",
      tags: ["Cláusulas auto-ejecutables", "Identidad continua", "Genómica + ULL"],
    },
    {
      range: "2051-2091",
      number: "03",
      title: "Bóvedas Orbitales",
      description:
        "Réplicas de conciencia almacenadas en centros de datos orbitales. La identidad sobrevive al cuerpo biológico.",
      tags: ["Cifrado lattice-postcuántico", "Custodia interplanetaria", "Sucesión multi-firma"],
    },
    {
      range: "2091 — 2126",
      number: "04",
      title: "Colonización Digital del Sistema Solar",
      description:
        "El testamento se convierte en protocolo: el legado migra entre nodos terrestres, lunares y marcianos. Tenerife sigue siendo el nodo notarial.",
      tags: ["Federación de identidades", "Notariado de Canarias", "Continuidad post-biológica"],
    },
  ],
};

export const modelo = {
  eyebrow: "03 · Modelo",
  title: "Bucles virales del legado.",
  description:
    "Inspirados en Dropbox y Robinhood, calibrados para la urgencia emocional del testamento.",
  cards: [
    {
      title: "Incentivado",
      description: "+250 MB de bóveda por cada heredero validado.",
      footnote: "Red de confianza intergeneracional.",
    },
    {
      title: "Contacto casual",
      description: "Notificaciones de 'Legado Seguro' a contactos de emergencia.",
      footnote: "Exposición indirecta a usuarios de alto valor.",
    },
    {
      title: "Colaborativo",
      description: "Bóvedas familiares con firma multiparte simulada.",
      footnote: "Retención por efecto de red familiar.",
    },
  ],
};

export const tenerife = {
  eyebrow: "04 · Nodo",
  title: "Santa Cruz de Tenerife.",
  titleHighlight: "Alquimia fiscal.",
  description:
    "La Zona Especial Canaria combinada con la Reserva para Inversiones convierte a Tenerife en el puerto fiscal natural del legado digital europeo. INtech y la Universidad de La Laguna proveen el talento. El plazo de inscripción ZEC cierra el 31 de diciembre de 2026, sin prórroga.",
  landmark: "Teide · 3 718 m · referencia notarial del cénit",
  stats: [
    { label: "ZEC", value: "4%", caption: "Impuesto sobre Sociedades · vigente hasta 2032" },
    { label: "RIC", value: "90%", caption: "Reducción de base imponible" },
    { label: "I+D+i", value: "25–59%", caption: "Deducciones tecnológicas (Art. 35 LIS)" },
    { label: "ULL", value: "∞", caption: "Talento en astrofísica y biomedicina" },
  ],
};

export const finalCta = {
  title: "Tu legado no espera al cuerpo.",
  description:
    "Inicia sesión con Google, configura tu bóveda y deja una huella necesaria para los próximos cien años.",
  cta: "Acceder con Google",
};

export const footer = {
  copyright: "© 2026 El Cénit · Santa Cruz de Tenerife · ZEC",
  version: "v1.1 · Convergencia",
};