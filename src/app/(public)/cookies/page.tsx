import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Cookie } from "lucide-react";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre las cookies que usa Looms Originals y cómo gestionarlas.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Política de Cookies — Looms Originals",
    description: "Lista detallada de las cookies que usa la plataforma y su retención.",
    url: `${SITE.url}/cookies`,
    type: "article",
  },
};

const COOKIES: { name: string; purpose: string; retention: string }[] = [
  {
    name: "sb-*",
    purpose: "Sesión de Supabase (autenticación, 'Mi lista').",
    retention: "Hasta 30 días.",
  },
  {
    name: "_ga / _ga_*",
    purpose: "Google Analytics 4 — métricas agregadas de uso.",
    retention: "24 meses.",
  },
  {
    name: "_fbp",
    purpose: "Meta Pixel — atribución de campañas sociales.",
    retention: "90 días.",
  },
  {
    name: "_ttp",
    purpose: "TikTok Pixel — atribución de campañas sociales.",
    retention: "13 meses.",
  },
];

export default function CookiesPage() {
  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/cookies`}
        name="Política de Cookies — Looms Originals"
        description="Lista detallada de las cookies que usa la plataforma."
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Cookies", url: `${SITE.url}/cookies` },
        ]}
      />
      <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="md" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <Cookie className="h-3.5 w-3.5" />
            Legal · Cookies
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5.25rem)] italic leading-[0.95] tracking-[-0.018em] text-white text-balance">
            Política de <span className="text-gold-gradient">Cookies</span>
          </h1>
          <p className="mt-5 text-[14px] uppercase tracking-[0.22em] text-gray-500">
            Última actualización · 22 de abril de 2026
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 border-t border-gray-200">
        <Container size="md">
          <p className="max-w-2xl text-[16px] leading-[1.7] text-gray-700 text-pretty">
            Usamos cookies para mantener su sesión y para medir el desempeño del sitio. Puede
            desactivarlas en la configuración de su navegador; algunas funciones (como &ldquo;Mi
            lista&rdquo;) no estarán disponibles.
          </p>

          <div className="mt-12 overflow-hidden rounded-3xl ring-1 ring-white/10 bg-paper">
            <div className="grid grid-cols-[1.2fr_2fr_1fr] gap-4 px-6 py-4 bg-white border-b border-gray-200 text-[10.5px] font-semibold uppercase tracking-[0.26em] text-gold-700">
              <span>Cookie</span>
              <span>Propósito</span>
              <span>Retención</span>
            </div>
            <ul className="divide-y divide-gray-200">
              {COOKIES.map((c) => (
                <li
                  key={c.name}
                  className="grid grid-cols-[1.2fr_2fr_1fr] gap-4 px-6 py-5 items-center text-[14.5px]"
                >
                  <span className="font-mono text-[13px] text-gold-700">{c.name}</span>
                  <span className="text-gray-700">{c.purpose}</span>
                  <span className="text-gray-500">{c.retention}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
