import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ChevronRight, Star, Phone } from "lucide-react";
import { HomePage } from "@/components/home/HomePage";
import { WebSiteJsonLd, LawFirmServiceJsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/site";
import { withUtm } from "@/lib/utils";

export default async function Home() {
  return (
    <>
      <WebSiteJsonLd />
      <LawFirmServiceJsonLd />
      <HomePage />

      {/* ─── Consulta CTA — premium layered card ─── */}
      <section aria-label="Consulta legal" className="relative py-24 sm:py-32">
        <Container size="xl">
          <Reveal className="relative overflow-hidden rounded-[32px] glass-premium ring-gold-inset px-8 py-16 sm:px-16 sm:py-24">
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
                  Hable con un abogado
                </p>
                <h2 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] italic text-white leading-[0.98] text-balance">
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
                    <blockquote className="-mt-3 font-display italic text-[19px] leading-[1.4] text-white text-pretty">
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
          </Reveal>
        </Container>
      </section>
    </>
  );
}
