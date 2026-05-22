import { SITE } from "@/lib/site";

function sanitize(json: unknown) {
  return JSON.stringify(json).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitize(data) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Organization + producer relationship with the law firm
// ─────────────────────────────────────────────────────────────────────
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}#organization`,
    name: SITE.name,
    legalName: "Looms Originals",
    alternateName: "Looms",
    url: SITE.url,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE.url}/og-default.jpg`,
    description: SITE.description,
    sameAs: SITE.sameAs,
    inLanguage: "es-US",
    parentOrganization: {
      "@type": "LegalService",
      "@id": `${SITE.lawFirm.url}#legal-service`,
      name: SITE.lawFirm.name,
      url: SITE.lawFirm.url,
      telephone: SITE.lawFirm.phone,
      areaServed: { "@type": "Country", name: "United States" },
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.lawFirm.addressLocality,
        addressRegion: SITE.lawFirm.addressRegion,
        addressCountry: SITE.lawFirm.addressCountry,
      },
      sameAs: SITE.sameAs,
      knowsLanguage: ["Spanish", "English"],
      serviceType: ["Immigration Law", "Family Reunification", "Asylum", "Work Visas", "Citizenship"],
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: SITE.lawFirm.phone,
        availableLanguage: ["Spanish", "English"],
        areaServed: "US",
      },
    ],
  } as const;
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────
// WebSite with SearchAction (for Google sitelinks search box)
// ─────────────────────────────────────────────────────────────────────
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}#website`,
    name: SITE.name,
    alternateName: "Looms",
    url: SITE.url,
    inLanguage: ["es-US"],
    publisher: { "@id": `${SITE.url}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/buscar?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  } as const;
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────
// Breadcrumbs — Google rich results
// ─────────────────────────────────────────────────────────────────────
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } as const;
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────
// FAQ — for category pages, about, homepage
// ─────────────────────────────────────────────────────────────────────
export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  } as const;
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────
// CollectionPage (for /series and /categorias index)
// ─────────────────────────────────────────────────────────────────────
export function CollectionPageJsonLd({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: { "@id": `${SITE.url}#website` },
    publisher: { "@id": `${SITE.url}#organization` },
    hasPart: items.map((it) => ({
      "@type": "CreativeWork",
      name: it.name,
      url: it.url,
    })),
  } as const;
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────
// Service — for the law firm consultation funnel (Service rich result)
// ─────────────────────────────────────────────────────────────────────
export function LawFirmServiceJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${SITE.lawFirm.url}#legal-service`,
    name: SITE.lawFirm.name,
    url: SITE.lawFirm.url,
    image: `${SITE.url}/og-default.jpg`,
    telephone: SITE.lawFirm.phone,
    priceRange: "$$",
    description:
      "Bufete de inmigración con más de 30 años de experiencia. Reunificación familiar, asilo, visas de trabajo, ciudadanía y defensa contra la deportación.",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.lawFirm.addressLocality,
      addressRegion: SITE.lawFirm.addressRegion,
      addressCountry: SITE.lawFirm.addressCountry,
    },
    areaServed: { "@type": "Country", name: "United States" },
    knowsLanguage: ["Spanish", "English"],
    serviceType: [
      "Immigration Law",
      "Family Reunification",
      "Asylum",
      "Work Visas",
      "Citizenship",
      "Deportation Defense",
    ],
    sameAs: SITE.sameAs,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios legales de inmigración",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Reunificación familiar (I-130)",
            description:
              "Petición de familiar inmediato y categorías preferenciales para cónyuges, hijos y hermanos.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Asilo político y VAWA",
            description:
              "Solicitudes de asilo, suspensión de remoción y protección bajo VAWA.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Visas de trabajo (H-1B / O-1 / EB)",
            description: "Visas temporales y residencia permanente basada en empleo.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Naturalización (N-400)",
            description: "Asesoría completa para la examinación de ciudadanía.",
          },
        },
      ],
    },
  } as const;
  return <JsonLd data={data} />;
}

// ─────────────────────────────────────────────────────────────────────
// WebPage primary entity wrapper
// ─────────────────────────────────────────────────────────────────────
export function WebPageJsonLd({
  url,
  name,
  description,
  type = "WebPage",
}: {
  url: string;
  name: string;
  description: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "SearchResultsPage";
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": `${SITE.url}#website` },
    publisher: { "@id": `${SITE.url}#organization` },
    inLanguage: "es-US",
  } as const;
  return <JsonLd data={data} />;
}
