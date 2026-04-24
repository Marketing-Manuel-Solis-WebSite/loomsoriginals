import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight, Star, Phone } from "lucide-react";
import { HomePage } from "@/components/home/HomePage";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";

export default async function Home() {
  return (
    <>
      <WebSiteJsonLd />
      <HomePage />

      {/* ─── Numbers strip with editorial feel ─── */}
      <section className="relative bg-paper py-20">
        <Container size="xl">
          <div className="divider-ornament mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">
              El bufete en números
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="group relative rounded-3xl bg-white p-8 ring-1 ring-gray-200 transition-all hover:ring-gold-400 hover:shadow-lg"
              >
                <span className="absolute right-5 top-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-display text-5xl italic leading-none text-ink group-hover:text-gold-700 transition-colors">
                  {s.value}
                </p>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  {s.label}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-600">{s.sub}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── Consulta CTA — premium layered card ─── */}
      <section aria-label="Consulta legal" className="relative py-24 sm:py-32">
        <Container size="xl">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-cream via-white to-parchment ring-1 ring-black/5 shadow-xl px-8 py-16 sm:px-16 sm:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold-200/80 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gold-100 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute right-10 top-10 hidden font-display text-[10rem] italic leading-none text-gold-100 select-none md:block"
            >
              ¿?
            </div>

            <div className="relative grid gap-12 md:grid-cols-[1.3fr_1fr] md:items-center md:gap-16">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
                  <span className="h-px w-10 bg-gold-500" />
                  Consulta gratuita
                </p>
                <h2 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] italic text-ink leading-[0.98] text-balance">
                  ¿Necesita ayuda con su caso migratorio?
                </h2>
                <p className="mt-6 max-w-xl text-[16.5px] leading-[1.75] text-gray-700 text-pretty">
                  Nuestro equipo ha representado a miles de familias en procesos de reunificación,
                  asilo, visas de trabajo y ciudadanía. Hable hoy con un abogado licenciado.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-3">
                  <ButtonLink
                    href={withUtm(SITE.lawFirm.consultationUrl, {
                      source: "looms",
                      medium: "cta-home",
                      campaign: "consulta",
                    })}
                    variant="primary"
                    size="lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Agende su consulta
                    <ChevronRight className="h-5 w-5" />
                  </ButtonLink>
                  <ButtonLink
                    href={`tel:${SITE.lawFirm.phone}`}
                    variant="ghost"
                    size="lg"
                  >
                    <Phone className="h-4 w-4" />
                    {SITE.lawFirm.phoneDisplay}
                  </ButtonLink>
                </div>
                <a
                  href={withUtm(SITE.lawFirm.reviewsUrl, {
                    source: "looms",
                    medium: "cta-home",
                    campaign: "reviews",
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-700 hover:text-gold-800"
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Leer reseñas verificadas de clientes →
                </a>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-gold-300 to-transparent" />
                <div className="space-y-8 pl-6">
                  <figure>
                    <span className="font-display text-5xl italic leading-none text-gold-500">
                      “
                    </span>
                    <blockquote className="-mt-3 font-display italic text-[19px] leading-[1.4] text-ink text-pretty">
                      Manuel y su equipo me ayudaron a traer a mi hijo después de 18 años de espera.
                      Nos tomaron de la mano en cada paso.
                    </blockquote>
                    <figcaption className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                      — Lourdes G. · Cliente del bufete
                    </figcaption>
                  </figure>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─── Categories grid — premium editorial ─── */}
      <section aria-label="Explore por categoría" className="py-24 bg-white">
        <Container size="xl">
          <div className="divider-ornament mb-14">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em]">
              Explore por categoría
            </span>
          </div>
          <div className="mx-auto max-w-3xl text-center mb-14">
            <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] italic text-ink leading-[0.98] text-balance">
              Seis caminos, <span className="text-gold-gradient">una misión</span>
            </h2>
            <p className="mt-6 text-[16.5px] leading-relaxed text-gray-600 text-pretty">
              Testimonios organizados por el tipo de caso migratorio que afrontaron.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                className="group relative overflow-hidden rounded-[28px] bg-paper p-8 ring-1 ring-gray-200 transition-all duration-400 ease-apple hover:-translate-y-2 hover:ring-gold-400 hover:shadow-xl hover:bg-white"
              >
                <span className="absolute right-6 top-6 font-display text-2xl italic leading-none text-gray-300 group-hover:text-gold-500 transition-colors">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  aria-hidden
                  className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-gold-100 opacity-0 blur-2xl transition-opacity duration-400 group-hover:opacity-100"
                />
                <div className="relative">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-700">
                    {c.eyebrow}
                  </p>
                  <h3 className="mt-4 font-display text-[28px] italic leading-tight text-ink">
                    {c.name}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{c.description}</p>
                  <span className="mt-8 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink group-hover:text-gold-700 transition-colors">
                    Explorar <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

const STATS = [
  { value: "30+", label: "Años de ejercicio", sub: "Tres décadas representando familias migrantes." },
  { value: "10K+", label: "Familias representadas", sub: "Historias únicas, una firma constante." },
  { value: "ES·EN", label: "Idiomas", sub: "Atención bilingüe en toda la práctica." },
  { value: "Gratis", label: "Consulta inicial", sub: "Evaluamos su caso sin costo." },
];

const CATEGORIES = [
  {
    slug: "reunificacion-familiar",
    eyebrow: "I-130 · F2B · Inmediate Relative",
    name: "Reunificación Familiar",
    description: "Historias de familias que lograron volver a estar juntas tras años de espera.",
  },
  {
    slug: "asilo",
    eyebrow: "Protección · VAWA · TPS",
    name: "Asilo",
    description: "Testimonios de personas que encontraron protección en Estados Unidos.",
  },
  {
    slug: "visas-de-trabajo",
    eyebrow: "H-1B · L-1 · O-1",
    name: "Visas de Trabajo",
    description: "El camino laboral hacia la residencia legal.",
  },
  {
    slug: "ciudadania",
    eyebrow: "N-400 · Examen de civismo",
    name: "Ciudadanía",
    description: "Del residente permanente al ciudadano estadounidense.",
  },
  {
    slug: "deportacion",
    eyebrow: "Notice to Appear · 240A",
    name: "Deportación y Defensa",
    description: "Estrategias de defensa contra procesos de remoción.",
  },
  {
    slug: "casos-reales",
    eyebrow: "Testimonios verificados",
    name: "Casos Reales",
    description: "Casos reales del Bufete Manuel Solís, contados por sus protagonistas.",
  },
] as const;
