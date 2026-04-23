import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronRight } from "lucide-react";
import { HomePage } from "@/components/home/HomePage";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";

export default async function Home() {
  return (
    <>
      <WebSiteJsonLd />
      <HomePage />
      <Container size="xl" className="py-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl px-8 py-16 sm:px-14 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-500">
                Consulta gratuita — Bufete Manuel Solís
              </p>
              <h2 className="mt-4 font-display text-3xl italic text-ivory-50 sm:text-5xl leading-tight text-balance">
                ¿Necesita ayuda con su caso migratorio?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ivory-200/85 text-pretty">
                Nuestro equipo ha representado a miles de familias en procesos de reunificación,
                asilo, visas de trabajo y ciudadanía. Hable hoy con un abogado licenciado.
              </p>
            </div>
            <ButtonLink
              href="https://manuelsolis.com/consulta?utm_source=looms&utm_medium=cta-home&utm_campaign=consulta"
              variant="primary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Agende su consulta
              <ChevronRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
