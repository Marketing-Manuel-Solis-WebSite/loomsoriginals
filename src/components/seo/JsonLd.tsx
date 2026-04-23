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
    legalName: "Loom Originals",
    alternateName: "Loom",
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
    alternateName: "Loom",
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
