"use client";

import { useActionState } from "react";
import { upsertSeries } from "./actions";
import type { Series } from "@/lib/supabase/types";
import { Field, TextInput, Textarea, Checkbox } from "./form-primitives";

type State = { ok?: boolean; error?: string };

export function SeriesForm({ series }: { series?: Series }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_prev, formData) => {
    try {
      await upsertSeries(formData);
      return { ok: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Error" };
    }
  }, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      {series ? <input type="hidden" name="id" defaultValue={series.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Título (ES)" required>
          <TextInput name="title_es" defaultValue={series?.title_es ?? ""} required />
        </Field>
        <Field label="Título (EN)">
          <TextInput name="title_en" defaultValue={series?.title_en ?? ""} />
        </Field>
      </div>
      <Field label="Slug (URL)" hint="p.ej. uniendo-familias-manuel-solis" required>
        <TextInput name="slug" defaultValue={series?.slug ?? ""} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sinopsis (ES)">
          <Textarea name="synopsis_es" rows={4} defaultValue={series?.synopsis_es ?? ""} />
        </Field>
        <Field label="Sinopsis (EN)">
          <Textarea name="synopsis_en" rows={4} defaultValue={series?.synopsis_en ?? ""} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Año de estreno">
          <TextInput type="number" name="release_year" defaultValue={series?.release_year ?? ""} />
        </Field>
        <Field label="YouTube ID del trailer">
          <TextInput name="trailer_youtube_id" defaultValue={series?.trailer_youtube_id ?? ""} />
        </Field>
        <Field label="Orden destacada" hint="Menor = primero">
          <TextInput type="number" name="featured_order" defaultValue={series?.featured_order ?? ""} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Poster URL" hint="2:3">
          <TextInput name="poster_url" defaultValue={series?.poster_url ?? ""} />
        </Field>
        <Field label="Backdrop URL" hint="16:9">
          <TextInput name="backdrop_url" defaultValue={series?.backdrop_url ?? ""} />
        </Field>
      </div>
      <Checkbox name="is_featured" defaultChecked={series?.is_featured ?? false}>
        Destacar en hero
      </Checkbox>

      {state.ok ? (
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          Serie guardada.
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div className="pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {pending ? "Guardando…" : series ? "Actualizar serie" : "Crear serie"}
        </button>
      </div>
    </form>
  );
}
