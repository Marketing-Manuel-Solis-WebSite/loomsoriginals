import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Scale, FileText, KeyRound, RefreshCcw, Gavel } from "lucide-react";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos de Uso",
  description: "Términos de uso de la plataforma Looms Originals.",
  alternates: { canonical: "/terminos" },
  openGraph: {
    title: "Términos de Uso — Looms Originals",
    description: "Las condiciones bajo las que usted accede al contenido de Looms.",
    url: `${SITE.url}/terminos`,
    type: "article",
  },
};

const SECTIONS = [
  {
    icon: Scale,
    heading: "Naturaleza editorial",
    body: [
      "Al usar loomsoriginal.com usted acepta estos términos. El contenido publicado en este sitio es editorial e informativo. No constituye asesoría legal ni crea una relación abogado-cliente con Law Offices of Manuel Solís.",
    ],
  },
  {
    icon: FileText,
    heading: "Contenido de la plataforma",
    body: [
      "El video, texto y arte son propiedad de Law Offices of Manuel Solís o de sus licenciantes.",
      "Se permite compartir enlaces. No se permite copiar, redistribuir o usar el contenido con fines comerciales sin permiso por escrito.",
    ],
  },
  {
    icon: KeyRound,
    heading: "Cuentas de usuario",
    body: [
      "Usted es responsable de la seguridad de su cuenta.",
      "No comparta su enlace mágico de acceso. Si nota actividad sospechosa, escríbanos de inmediato.",
    ],
  },
  {
    icon: RefreshCcw,
    heading: "Modificaciones",
    body: [
      "Podemos modificar estos términos en cualquier momento.",
      "Publicaremos la fecha de la última actualización al inicio de la página.",
    ],
  },
  {
    icon: Gavel,
    heading: "Jurisdicción",
    body: [
      "Cualquier controversia relacionada con esta plataforma se resolverá bajo las leyes del estado de Texas, Estados Unidos.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/terminos`}
        name="Términos de Uso — Looms Originals"
        description="Las condiciones bajo las que usted accede al contenido de Looms."
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Términos", url: `${SITE.url}/terminos` },
        ]}
      />
      <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="md" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <span className="h-px w-10 bg-gold-500" />
            Legal · Términos
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5.25rem)] italic leading-[0.95] tracking-[-0.018em] text-white text-balance">
            Términos de <span className="text-gold-gradient">Uso</span>
          </h1>
          <p className="mt-5 text-[14px] uppercase tracking-[0.22em] text-gray-500">
            Última actualización · 22 de abril de 2026
          </p>
        </Container>
      </section>

      <section className="bg-paper py-20 border-t border-gray-200">
        <Container size="md">
          <div className="space-y-10">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <article
                  key={s.heading}
                  className="grid gap-5 rounded-3xl glass-card p-7 sm:grid-cols-[auto_1fr] sm:gap-8 sm:p-9"
                >
                  <div className="flex sm:flex-col sm:items-start sm:gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl glass-card text-gold-700 shrink-0">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </div>
                    <span className="ml-auto sm:ml-0 font-display text-3xl italic leading-none text-gray-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-[26px] italic leading-tight text-white">
                      {s.heading}
                    </h2>
                    <div className="mt-4 space-y-3 text-[15.5px] leading-[1.65] text-gray-700">
                      {s.body.map((p, j) => (
                        <p key={j}>{p}</p>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
