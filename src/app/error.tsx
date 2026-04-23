"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("route error", error);
  }, [error]);

  return (
    <Container size="md" className="grid min-h-[70dvh] place-items-center py-24 text-center">
      <div className="glass-strong mx-auto flex max-w-lg flex-col items-center gap-5 rounded-3xl px-10 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-700">
          Error inesperado
        </p>
        <h1 className="font-display text-5xl italic text-ink">Algo salió mal</h1>
        <p className="max-w-md text-sm text-gray-600">
          Tuvimos un problema cargando esta página. Inténtelo nuevamente en un momento.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} variant="primary">
            Reintentar
          </Button>
          <ButtonLink href="/" variant="ghost">
            Volver al inicio
          </ButtonLink>
        </div>
        {error.digest ? (
          <p className="mt-4 text-[10px] font-mono uppercase tracking-widest text-gray-400">
            ref {error.digest}
          </p>
        ) : null}
      </div>
    </Container>
  );
}
