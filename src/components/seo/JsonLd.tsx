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

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
    sameAs: [SITE.social.youtube, SITE.social.instagram, SITE.social.tiktok, SITE.social.facebook],
    description:
      "Estudio editorial de historias migrantes producido por Bufete Manuel Solís.",
    parentOrganization: {
      "@type": "LegalService",
      name: SITE.lawFirm.name,
      url: SITE.lawFirm.url,
    },
  } as const;
  return <JsonLd data={data} />;
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: ["es-US"],
    publisher: { "@type": "Organization", name: SITE.name },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/buscar?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  } as const;
  return <JsonLd data={data} />;
}

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
