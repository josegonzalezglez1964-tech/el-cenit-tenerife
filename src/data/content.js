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
    {
      pre: "España ya reconoce este derecho: el artículo 96 de la ",
      stat: "LOPDGDD (Ley Orgánica 3/2018)",
      post: " regula el derecho al testamento digital, y Cataluña (Ley 10/2017) permite designar un administrador digital. El Cénit convierte ese marco legal en una herramienta que cualquiera puede usar.",
    },
  ],
  cards: [
    {
      title: "Bóveda Privada",
      description:
        "Cifrado con los estándares post-cuánticos del NIST (ML-KEM / FIPS 203, ML-DSA / FIPS 204). Contraseñas, cripto, mensajes póstumos — protegidos también frente a la computación cuántica.",
    },
    {
      title: "Red de Herederos",
      description:
        "Designa tu albacea digital al amparo del artículo 96 de la LOPDGDD. Cada heredero validado amplía tu bóveda.",
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
        "221 zettabytes anuales conforman el nuevo patrimonio. El Reglamento Europeo de IA entra en aplicación general el 2 de agosto de 2026, obligando a asistentes conversacionales —como el Asistente Cénit— a identificarse como IA ante el usuario. En paralelo, el plazo de inscripción ZEC cierra el 31 de diciembre de 2026, y la NSA marca 2030-2033 como los años clave para migrar a cifrado post-cuántico, antes de que la computación cuántica pueda descifrar mañana lo que alguien archive hoy.",
      tags: ["Transparencia IA obligatoria (ago 2026)", "Migración post-cuántica 2030-2033", "Cumplimiento LOPDGDD 3/2018"],
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
    "Inspirados en los mecanismos de crecimiento de Dropbox y Robinhood, calibrados aquí para la urgencia emocional y legal del testamento digital.",
  cards: [
    {
      title: "Incentivado",
      description: "+250 MB de bóveda por cada heredero o albacea digital validado.",
      footnote: "Red de confianza intergeneracional.",
    },
    {
      title: "Contacto casual",
      description: "Notificaciones de 'Legado Seguro' a los contactos de emergencia designados.",
      footnote: "Exposición indirecta a usuarios de alto valor.",
    },
    {
      title: "Colaborativo",
      description: "Bóvedas familiares con firma multiparte, compatibles con el testamento cerrado ante notario.",
      footnote: "Retención por efecto de red familiar.",
    },
  ],
};

export const tenerife = {
  eyebrow: "04 · Nodo",
  title: "Santa Cruz de Tenerife.",
  titleHighlight: "Alquimia fiscal.",
  description:
    "La Zona Especial Canaria combinada con la Reserva para Inversiones convierte a Tenerife en el puerto fiscal natural del legado digital europeo. INtech Tenerife —el parque científico y tecnológico del Cabildo, con los enclaves IACtec y NanoTEC— y la Universidad de La Laguna proveen el talento. Tenerife es también nodo físico real de internet: los cables submarinos ACE, WACS y 2Africa conectan aquí Europa, África y América, con una nueva ruta hacia Marruecos en construcción. El plazo de inscripción ZEC cierra el 31 de diciembre de 2026, sin prórroga.",
  landmark: "Teide · 3 718 m · referencia notarial del cénit",
  stats: [
    { label: "ZEC", value: "4%", caption: "Impuesto sobre Sociedades · vigente hasta 2032" },
    { label: "RIC", value: "90%", caption: "Reducción de base imponible" },
    { label: "I+D+i", value: "25–59%", caption: "Deducciones tecnológicas (Art. 35 LIS)" },
    { label: "ULL", value: "∞", caption: "Talento en astrofísica (IAC) y biomedicina" },
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