import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight, Star } from "lucide-react";
import { HomePage } from "@/components/home/HomePage";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";

export default async function Home() {
  return (
    <>
      <WebSiteJsonLd />
      <HomePage />

      <section aria-label="Consulta legal" className="relative py-24 sm:py-32">
        <Container size="xl">
          <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 sm:px-14 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold-200/60 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-100 blur-3xl"
            />
            <div className="relative grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
                  <span className="h-px w-8 bg-gold-500" />
                  Consulta gratuita
                </p>
                <h2 className="mt-5 font-display text-4xl italic text-ink sm:text-5xl leading-tight text-balance">
                  ¿Necesita ayuda con su caso migratorio?
                </h2>
                <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-gray-600 text-pretty">
                  Nuestro equipo ha representado a miles de familias en procesos de reunificación,
                  asilo, visas de trabajo y ciudadanía. Hable hoy con un abogado licenciado.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
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
                    href={withUtm(SITE.lawFirm.reviewsUrl, {
                      source: "looms",
                      medium: "cta-home",
                      campaign: "reviews",
                    })}
                    variant="ghost"
                    size="lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Star className="h-4 w-4 fill-current text-gold-500" />
                    Ver reseñas
                  </ButtonLink>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
                <QuickStat label="Años de experiencia" value="30+" />
                <QuickStat label="Familias representadas" value="10,000+" />
                <QuickStat label="Idiomas" value="ES · EN" />
                <QuickStat label="Consulta inicial" value="Gratis" highlight />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-label="Explore por categoría" className="py-24">
        <Container size="xl">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
              Biblioteca
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl italic text-ink text-balance">
              Explore las historias por categoría
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-gray-600 text-pretty">
              Testimonios organizados por el tipo de caso migratorio que afrontaron.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/categorias/${c.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-paper p-8 ring-1 ring-gray-200 transition-all duration-400 ease-apple hover:-translate-y-1 hover:ring-gold-400 hover:shadow-md"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-100 opacity-0 blur-2xl transition-opacity duration-400 group-hover:opacity-100"
                />
                <div className="relative">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-700">
                    {c.eyebrow}
                  </p>
                  <h3 className="mt-3 font-display text-2xl italic text-ink">{c.name}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-gray-600">{c.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink group-hover:text-gold-700">
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

function QuickStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-2xl bg-ink text-white p-5 ring-1 ring-ink"
          : "rounded-2xl bg-white p-5 ring-1 ring-gray-200"
      }
    >
      <p
        className={
          highlight
            ? "text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300"
            : "text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500"
        }
      >
        {label}
      </p>
      <p className={"mt-2 font-display text-3xl italic " + (highlight ? "text-white" : "text-ink")}>
        {value}
      </p>
    </div>
  );
}

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
