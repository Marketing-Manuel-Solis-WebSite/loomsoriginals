import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container size="md" className="grid min-h-[70dvh] place-items-center py-24 text-center">
      <div className="glass-strong mx-auto flex max-w-lg flex-col items-center gap-5 rounded-3xl px-10 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
          Página no encontrada
        </p>
        <h1 className="font-display text-7xl italic text-ink">404</h1>
        <p className="max-w-md text-[15px] text-gray-600 text-pretty">
          La historia que busca se mudó o todavía no se estrena. Explore nuestra biblioteca o vuelva
          al inicio.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" variant="primary">
            Volver al inicio
          </ButtonLink>
          <ButtonLink href="/series" variant="ghost">
            Ver series
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
