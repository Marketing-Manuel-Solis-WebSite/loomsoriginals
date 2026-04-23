export const SITE = {
  name: "Loom Originals",
  tagline: "Historias que reúnen familias",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://loomsoriginal.com",
  description:
    "Un estudio editorial de historias migrantes en Estados Unidos, producido por Bufete Manuel Solís.",

  lawFirm: {
    name: "Bufete Manuel Solís",
    shortName: "Manuel Solís",
    url: "https://manuelsolis.com",
    reviewsUrl: "https://manuelsolisreviews.com",
    consultationUrl: "https://manuelsolis.com/consulta",
    phone: "+1-346-460-7278",
    phoneDisplay: "+1 (346) 460-7278",
    whatsapp: "https://wa.me/13464607278",
    addressLocality: "Houston",
    addressRegion: "TX",
    addressCountry: "US",
  },

  social: {
    youtube: "https://www.youtube.com/@BufeteManuelSolis",
    instagram: "https://www.instagram.com/abogadomanuelsolisoficial/",
    facebook: "https://www.facebook.com/AbogadoManuelSolisOficial",
    tiktok: "https://www.tiktok.com/@abogadosmanuelsolis",
  },

  sameAs: [
    "https://manuelsolis.com",
    "https://manuelsolisreviews.com",
    "https://www.instagram.com/abogadomanuelsolisoficial/",
    "https://www.facebook.com/AbogadoManuelSolisOficial",
    "https://www.tiktok.com/@abogadosmanuelsolis",
    "https://www.youtube.com/@BufeteManuelSolis",
  ],

  locales: ["es"] as const,
  defaultLocale: "es" as const,

  contactEmail: "contacto@loomsoriginal.com",
  legalEmail: "privacidad@loomsoriginal.com",
} as const;

export type Locale = (typeof SITE.locales)[number];

export const NAV = {
  es: [
    { href: "/", label: "Inicio" },
    { href: "/series", label: "Series" },
    { href: "/categorias", label: "Categorías" },
    { href: "/buscar", label: "Buscar" },
  ],
} as const;
