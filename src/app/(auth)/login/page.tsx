import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/ui/Logo";
import { Mail, Lock, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Acceda a su cuenta de Looms Originals para guardar episodios y ver su historial.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{
  redirect?: string;
  error?: string;
  sent?: string;
}>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { redirect, error, sent } = await searchParams;
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-gold-100/70 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-10 h-[360px] w-[360px] rounded-full bg-gold-50 blur-[140px]"
      />

      <Container size="xl" className="pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Editorial side */}
          <div className="hidden lg:block">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-700">
              <Sparkles className="h-3.5 w-3.5" />
              Su cuenta Looms
            </p>
            <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5.5rem)] italic leading-[0.92] tracking-[-0.02em] text-white text-balance">
              Bienvenido <br />
              <span className="text-gold-gradient">de vuelta.</span>
            </h1>
            <p className="mt-7 max-w-md text-[16px] leading-[1.7] text-gray-600 text-pretty">
              Acceda con su correo. Le enviamos un enlace seguro — sin contraseñas que recordar,
              sin compartir credenciales con terceros.
            </p>

            <ul className="mt-10 space-y-4 text-[14.5px] text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-white ring-1 ring-gray-200 text-gold-700">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                <span>
                  <strong className="text-white">Magic link.</strong> Recibe un enlace por correo,
                  un click y entra.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-white ring-1 ring-gray-200 text-gold-700">
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <span>
                  <strong className="text-white">Sus datos, separados.</strong> Su cuenta editorial
                  no comparte información con la firma legal.
                </span>
              </li>
            </ul>
          </div>

          {/* Form card */}
          <div className="mx-auto w-full max-w-md rounded-3xl bg-white ring-1 ring-gray-200 shadow-[0_30px_60px_-30px_rgba(9,9,11,0.18)] px-7 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <Logo subtitle />
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] italic leading-tight text-white text-balance">
                Ingresa a Looms Originals
              </h2>
              <p className="max-w-sm text-[14px] leading-relaxed text-gray-600">
                Le enviaremos un enlace seguro por correo — sin contraseñas que recordar.
              </p>
            </div>
            <div className="mt-8">
              <LoginForm
                redirectTo={redirect ?? "/"}
                initialError={error}
                showSentBanner={sent === "1"}
              />
            </div>
            <p className="mt-8 text-center text-[12px] uppercase tracking-[0.22em] text-gray-400">
              Al continuar acepta los{" "}
              <a href="/terminos" className="text-gold-700 hover:text-gold-800">
                términos
              </a>{" "}
              y la{" "}
              <a href="/privacidad" className="text-gold-700 hover:text-gold-800">
                privacidad
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
