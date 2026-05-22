import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import { ShieldCheck, Database, BarChart3, UserCheck, Building2 } from "lucide-react";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Cómo Looms Originals recopila, usa y protege sus datos. Producción de Law Offices of Manuel Solís.",
  alternates: { canonical: "/privacidad" },
  openGraph: {
    title: "Política de Privacidad — Looms Originals",
    description: "Cómo recopilamos, usamos y protegemos sus datos.",
    url: `${SITE.url}/privacidad`,
    type: "article",
  },
};

const SECTIONS: { heading: string; body: string[]; icon: typeof ShieldCheck }[] = [
  {
    heading: "Información que recopilamos",
    icon: Database,
    body: [
      "Correo electrónico y nombre cuando usted crea una cuenta.",
      "Historial de visualización, favoritos y preferencias de idioma mientras usa la plataforma.",
      "Datos técnicos (navegador, sistema operativo, dirección IP truncada) para analítica agregada.",
    ],
  },
  {
    heading: "Cómo usamos sus datos",
    icon: ShieldCheck,
    body: [
      "Para ofrecer funciones personalizadas como 'Continuar viendo' y 'Mi lista'.",
      "Para medir qué episodios son más útiles para nuestra audiencia.",
      "Para comunicarle, sólo si usted se suscribió, sobre nuevos episodios.",
    ],
  },
  {
    heading: "Pixeles y analítica de terceros",
    icon: BarChart3,
    body: [
      "Usamos Google Analytics 4, Meta Pixel y TikTok Pixel para medir rendimiento.",
      "Puede ver más en nuestra Política de Cookies. Todos estos servicios respetan Do Not Track.",
    ],
  },
  {
    heading: "Sus derechos",
    icon: UserCheck,
    body: [
      "Puede solicitar acceso, rectificación, portabilidad o eliminación de sus datos escribiendo a privacidad@loomsoriginal.com.",
      "Cumplimos con GDPR para residentes en la Unión Europea y con CCPA para residentes en California.",
    ],
  },
  {
    heading: "Relación con Law Offices of Manuel Solís",
    icon: Building2,
    body: [
      "Looms Originals es una producción editorial de Law Offices of Manuel Solís. Sus datos en esta plataforma son distintos y separados de cualquier expediente legal que tenga con la firma.",
      "No enviaremos sus datos de usuario al equipo legal sin su consentimiento explícito.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/privacidad`}
        name="Política de Privacidad — Looms Originals"
        description="Cómo recopilamos, usamos y protegemos sus datos."
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Privacidad", url: `${SITE.url}/privacidad` },
        ]}
      />
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper pt-32 pb-16 md:pt-40 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="md" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <span className="h-px w-10 bg-gold-500" />
            Legal · Privacidad
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.5rem,7vw,5.25rem)] italic leading-[0.95] tracking-[-0.018em] text-white text-balance">
            Política de <span className="text-gold-gradient">Privacidad</span>
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
                    <ul className="mt-4 space-y-3 text-[15.5px] leading-[1.65] text-gray-700">
                      {s.body.map((b, j) => (
                        <li key={j} className="flex gap-3">
                          <span className="mt-2.5 h-1 w-1.5 shrink-0 rounded-full bg-gold-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-12 text-[15px] text-gray-600">
            ¿Preguntas?{" "}
            <a
              href={`mailto:${SITE.legalEmail}`}
              className="text-gold-700 underline-offset-4 hover:text-gold-800 hover:underline"
            >
              {SITE.legalEmail}
            </a>
          </p>
        </Container>
      </section>
    </>
  );
}
