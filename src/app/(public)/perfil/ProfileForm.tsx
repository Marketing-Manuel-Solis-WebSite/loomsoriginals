"use client";

import { useState, useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Values = {
  display_name: string;
  preferred_language: string;
  avatar_url: string;
};

export function ProfileForm({ defaultValues }: { defaultValues: Values }) {
  const [values, setValues] = useState<Values>(defaultValues);
  const [saving, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        const { error } = await supabase
          .from("profiles")
          .update({
            display_name: values.display_name || null,
            preferred_language: values.preferred_language,
            avatar_url: values.avatar_url || null,
          })
          .eq("id", auth.user.id);
        if (error) throw error;
        setMessage({ kind: "success", text: "Perfil guardado." });
      } catch (err) {
        setMessage({
          kind: "error",
          text: err instanceof Error ? err.message : "No se pudo guardar.",
        });
      }
    });
  };

  const onSignOut = () => {
    fetch("/api/auth/signout", { method: "POST" }).then(() => {
      window.location.href = "/";
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Field label="Nombre a mostrar">
        <input
          type="text"
          value={values.display_name}
          onChange={(e) => setValues((v) => ({ ...v, display_name: e.target.value }))}
          maxLength={60}
          className="h-11 w-full rounded-full border border-white/10 bg-navy-900/60 px-5 text-[15px] text-ivory-50 outline-none focus:border-gold-500/60"
        />
      </Field>
      <Field label="Idioma preferido">
        <select
          value={values.preferred_language}
          onChange={(e) => setValues((v) => ({ ...v, preferred_language: e.target.value }))}
          className="h-11 w-full rounded-full border border-white/10 bg-navy-900/60 px-5 text-[15px] text-ivory-50 outline-none focus:border-gold-500/60"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </Field>
      <Field label="URL de foto (opcional)">
        <input
          type="url"
          value={values.avatar_url}
          onChange={(e) => setValues((v) => ({ ...v, avatar_url: e.target.value }))}
          placeholder="https://…"
          className="h-11 w-full rounded-full border border-white/10 bg-navy-900/60 px-5 text-[15px] text-ivory-50 outline-none focus:border-gold-500/60"
        />
      </Field>

      {message ? (
        <p
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            message.kind === "success"
              ? "border border-gold-500/30 bg-gold-500/10 text-gold-200"
              : "border border-red-500/30 bg-red-500/10 text-red-200"
          )}
        >
          {message.text}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving} variant="primary">
          {saving ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" onClick={onSignOut} variant="ghost">
          Cerrar sesión
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ivory-200/80">
        {label}
      </span>
      {children}
    </label>
  );
}
