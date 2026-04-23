"use client";

import { useState, useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const GOOGLE_ERRORS: Record<string, string> = {
  access_denied: "Canceló el inicio de sesión con Google.",
  server_error: "El proveedor de Google no respondió. Intente de nuevo.",
};

export function LoginForm({
  redirectTo,
  initialError,
  showSentBanner,
}: {
  redirectTo: string;
  initialError?: string;
  showSentBanner?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(!!showSentBanner);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    initialError ? GOOGLE_ERRORS[initialError] ?? "Error al iniciar sesión." : null
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(
              redirectTo
            )}`,
          },
        });
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        setSent(true);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Error al enviar el enlace.");
      }
    });
  };

  const onGoogle = () => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(
              redirectTo
            )}`,
          },
        });
        if (error) setErrorMsg(error.message);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "No se pudo iniciar con Google.");
      }
    });
  };

  return (
    <div className="mt-8 flex flex-col gap-3">
      {sent ? (
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-300">
          Le enviamos un enlace mágico a <strong className="text-gold-200">{email || "su correo"}</strong>.
          Revise su bandeja para continuar.
        </div>
      ) : null}
      {errorMsg ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMsg}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-200/80">
            Correo electrónico
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="usted@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-full border border-white/10 bg-navy-900/60 px-5 text-[15px] text-ivory-50 placeholder:text-ivory-200/40 outline-none transition-colors focus:border-gold-500/60"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "h-12 rounded-full bg-gold-500 px-5 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400",
            pending && "opacity-60"
          )}
        >
          {pending ? "Enviando…" : "Enviar enlace de acceso"}
        </button>
      </form>

      <div className="my-1 flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-ivory-200/40">
        <span className="h-px flex-1 bg-white/10" />
        <span>o</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={pending}
        className="flex h-12 items-center justify-center gap-3 rounded-full border border-white/10 bg-white text-[14px] font-medium text-navy-900 transition-colors hover:bg-ivory-100"
      >
        <GoogleMark />
        Continuar con Google
      </button>

      <p className="mt-2 text-center text-[11.5px] leading-relaxed text-ivory-200/60">
        Al continuar acepta nuestros{" "}
        <a href="/terminos" className="text-gold-500 hover:text-gold-400">
          Términos
        </a>{" "}
        y{" "}
        <a href="/privacidad" className="text-gold-500 hover:text-gold-400">
          Política de Privacidad
        </a>
        .
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.3 6.7 28.9 5 24 5 13.5 5 5 13.5 5 24s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.5 19 12 24 12c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.3 6.7 28.9 5 24 5 16.3 5 9.7 9.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43c5 0 9.4-1.7 12.7-4.5l-5.8-4.9C29 35.2 26.6 36 24 36c-5.4 0-10-3.2-11.5-7.8l-6.5 5C9.6 38.8 16.2 43 24 43z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.2l5.8 4.9C41.4 35.1 44 30 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
