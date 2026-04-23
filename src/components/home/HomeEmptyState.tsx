import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export function HomeEmptyState() {
  return (
    <section className="relative grid min-h-[80dvh] place-items-center overflow-hidden bg-navy-950">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(26,43,76,0.8),transparent_60%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />
      <Container size="xl" className="relative z-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-gold-500">
          Serie original de Loom
        </p>
        <h1 className="mt-6 font-display text-[clamp(3rem,10vw,9rem)] italic leading-[0.95] tracking-[-0.02em] text-ivory-50 text-balance">
          Historias que <br />
          <span className="text-gold-gradient">reúnen familias</span>
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-ivory-200/80 text-pretty sm:text-lg">
          Conectando con nuestra base de datos. La biblioteca aparecerá aquí en cuanto se configuren
          las variables de Supabase.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/sobre" variant="secondary" size="lg">
            Sobre Loom Originals
          </ButtonLink>
          <ButtonLink
            href="https://manuelsolis.com?utm_source=looms&utm_medium=empty-home&utm_campaign=launch"
            variant="primary"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Conocer al Bufete Manuel Solís
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
