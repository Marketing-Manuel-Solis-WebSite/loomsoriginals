import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";
import { Mic, Newspaper, LifeBuoy, Scale, ArrowUpRight, MapPin, Phone } from "lucide-react";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacte a Looms Originals: cuatro canales para distintos temas — historias, prensa, soporte y consultas legales.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto — Looms Originals",
    description: "Hable con el equipo editorial o agende una consulta legal.",
    url: `${SITE.url}/contacto`,
    type: "website",
  },
};

const CARDS = [
  {
    icon: Mic,
    eyebrow: "Comparta su historia",
    title: "¿Tiene una historia?",
    body: "Buscamos familias dispuestas a compartir su caso migratorio. Toda conversación es confidencial.",
    email: "historias@loomsoriginal.com",
  },
  {
    icon: Newspaper,
    eyebrow: "Prensa y alianzas",
    title: "Prensa y prensa editorial",
    body: "Solicitudes de prensa, colaboraciones editoriales o entrevistas con el equipo.",
    email: "prensa@loomsoriginal.com",
  },
  {
    icon: LifeBuoy,
    eyebrow: "Soporte técnico",
    title: "Problemas con la plataforma",
    body: "¿Problemas con su cuenta, reproducción o suscripción? Le respondemos en 24h hábiles.",
    email: SITE.contactEmail,
  },
  {
    icon: Scale,
    eyebrow: "Consultas legales",
    title: "Hablar con un abogado",
    body: "Para agendar una consulta con Law Offices of Manuel Solís sobre su caso migratorio.",
    email: "info@manuelsolis.com",
  },
];

export default function ContactoPage() {
  return (
    <>
      <WebPageJsonLd
        url={`${SITE.url}/contacto`}
        name="Contacto — Looms Originals"
        description="Cuatro canales de contacto: historias, prensa, soporte y consultas legales."
        type="ContactPage"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: `${SITE.url}/` },
          { name: "Contacto", url: `${SITE.url}/contacto` },
        ]}
      />
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-paper pt-32 pb-20 md:pt-40 md:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
        />
        <Container size="xl" className="relative">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700 animate-fade">
            <span className="h-px w-10 bg-gold-500" />
            Contacto
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,8vw,6.5rem)] italic leading-[0.95] tracking-[-0.02em] text-white text-balance animate-hero-rise">
            Escríbanos.
            <br />
            <span className="text-gold-gradient">Le respondemos.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-[16.5px] leading-[1.7] text-gray-600 text-pretty">
            Cuatro canales para distintas conversaciones. Cada uno va a un equipo distinto —
            elija el que más se acerque a su intención y le respondemos directamente.
          </p>
        </Container>
      </section>

      {/* ─── Cards grid ─── */}
      <section className="bg-paper pb-24">
        <Container size="xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {CARDS.map((c, i) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.email}
                  href={`mailto:${c.email}`}
                  className="group lift-card relative flex flex-col overflow-hidden rounded-3xl glass-card p-8 hover:ring-gold-400/60 hover:bg-white"
                >
                  <span className="absolute right-7 top-7 font-display text-3xl italic leading-none text-gray-300 group-hover:text-gold-500 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    aria-hidden
                    className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-gold-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="relative">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl glass-card text-gold-700 transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-105">
                      <Icon className="h-6 w-6" strokeWidth={1.6} />
                    </div>
                    <p className="mt-6 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                      {c.eyebrow}
                    </p>
                    <h2 className="mt-3 font-display text-[28px] italic leading-tight text-white">
                      {c.title}
                    </h2>
                    <p className="mt-3 text-[14.5px] leading-[1.65] text-gray-600 text-pretty">
                      {c.body}
                    </p>
                    <div className="mt-7 flex items-center justify-between gap-3">
                      <span className="truncate text-[13.5px] font-medium text-gold-700 group-hover:text-gold-800 transition-colors">
                        {c.email}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-white transition-transform duration-400 ease-apple group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-700" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ─── Office strip ─── */}
      <section className="bg-paper py-20 border-t border-gray-200">
        <Container size="xl">
          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                <MapPin className="h-3.5 w-3.5" />
                Oficina principal
              </p>
              <p className="mt-3 font-display text-2xl italic text-white">
                {SITE.lawFirm.addressLocality}, {SITE.lawFirm.addressRegion}
              </p>
              <p className="mt-1 text-[14px] text-gray-600">
                Atención a clientes en todo Estados Unidos.
              </p>
            </div>
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                <Phone className="h-3.5 w-3.5" />
                Teléfono
              </p>
              <a
                href={`tel:${SITE.lawFirm.phone}`}
                className="mt-3 block font-display text-2xl italic text-white hover:text-gold-700 transition-colors"
              >
                {SITE.lawFirm.phoneDisplay}
              </a>
              <p className="mt-1 text-[14px] text-gray-600">Lunes a viernes · 8am – 6pm CT</p>
            </div>
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-700">
                <span className="h-px w-6 bg-gold-500" />
                Idiomas
              </p>
              <p className="mt-3 font-display text-2xl italic text-white">Español · English</p>
              <p className="mt-1 text-[14px] text-gray-600">
                Atención bilingüe en toda la práctica.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
