import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página no encontrada",
  description: "La historia que busca se mudó o todavía no se estrena.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden depth-wash">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
      />
      <Container size="md" className="grid min-h-[78dvh] place-items-center py-24 text-center relative">
        <div className="glass-strong relative mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl px-10 py-16 ring-gold-inset">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <span className="inline-block h-px w-8 align-middle bg-gold-500 mr-2" />
            Página no encontrada
          </p>
          <h1 className="font-display text-[clamp(4rem,12vw,8rem)] italic leading-none text-white text-balance">
            <span className="text-gold-gradient">404</span>
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-gray-600 text-pretty">
            La historia que busca se mudó o todavía no se estrena. Explore nuestra biblioteca o
            vuelva al inicio — siempre hay más de mil familias contando su camino.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/" variant="primary" size="lg">
              Volver al inicio
            </ButtonLink>
            <ButtonLink href="/series" variant="ghost" size="lg">
              Ver series
            </ButtonLink>
            <ButtonLink href="/buscar" variant="subtle" size="lg">
              Buscar
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
