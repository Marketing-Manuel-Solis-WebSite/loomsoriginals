"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button, ButtonLink } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

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
    <section className="relative isolate overflow-hidden depth-wash">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[140px]"
      />
      <Container size="md" className="grid min-h-[78dvh] place-items-center py-24 text-center relative">
        <div className="glass-strong relative mx-auto flex max-w-xl flex-col items-center gap-5 rounded-3xl px-10 py-16 ring-gold-inset">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white ring-1 ring-gold-300 text-gold-700">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.6} />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
            <span className="inline-block h-px w-8 align-middle bg-gold-500 mr-2" />
            Error inesperado
          </p>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] italic leading-[0.98] text-white">
            Algo <span className="text-gold-gradient">salió mal</span>
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-gray-600 text-pretty">
            Tuvimos un problema cargando esta página. Reintente en un momento o vuelva al inicio.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} variant="primary" size="lg">
              Reintentar
            </Button>
            <ButtonLink href="/" variant="ghost" size="lg">
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
    </section>
  );
}
