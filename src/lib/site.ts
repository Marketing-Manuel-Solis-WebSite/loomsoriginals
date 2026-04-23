export const SITE = {
  name: "Loom Originals",
  tagline: "Historias que reúnen familias",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://loomsoriginal.com",
  lawFirm: {
    name: "Bufete Manuel Solís",
    url: "https://manuelsolis.com",
    consultationUrl: "https://manuelsolis.com/consulta",
    phone: "+1-800-898-9338",
    whatsapp: "https://wa.me/18008989338",
  },
  social: {
    youtube: "https://www.youtube.com/@BufeteManuelSolis",
    instagram: "https://www.instagram.com/loomoriginals",
    tiktok: "https://www.tiktok.com/@loomoriginals",
    facebook: "https://www.facebook.com/loomoriginals",
    x: "https://x.com/loomoriginals",
  },
  locales: ["es", "en"] as const,
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
  en: [
    { href: "/en", label: "Home" },
    { href: "/en/series", label: "Series" },
    { href: "/en/categories", label: "Categories" },
    { href: "/en/search", label: "Search" },
  ],
} as const;
