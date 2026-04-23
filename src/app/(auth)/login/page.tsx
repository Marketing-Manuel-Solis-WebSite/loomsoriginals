import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Acceda a su cuenta de Loom Originals para guardar episodios y ver su historial.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ redirect?: string; error?: string; sent?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { redirect, error, sent } = await searchParams;
  return (
    <section className="relative grid min-h-[80dvh] place-items-center overflow-hidden bg-navy-950 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.12),transparent_55%)]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 grain" />
      <Container size="sm" className="relative">
        <div className="glass-strong mx-auto max-w-md rounded-3xl px-8 py-10">
          <div className="flex flex-col items-center gap-2">
            <Logo subtitle />
            <h1 className="mt-6 text-center font-display text-4xl italic leading-tight text-ivory-50">
              Ingresa a Loom Originals
            </h1>
            <p className="max-w-sm text-center text-[13.5px] leading-relaxed text-ivory-200/75">
              Le enviaremos un enlace seguro por correo — sin contraseñas que recordar.
            </p>
          </div>
          <LoginForm redirectTo={redirect ?? "/"} initialError={error} showSentBanner={sent === "1"} />
        </div>
      </Container>
    </section>
  );
}
