"use client";

import { useActionState, useState } from "react";
import { upsertEpisode } from "./actions";
import { Field, TextInput, Textarea, Select, Checkbox } from "./form-primitives";
import type { Episode, Series, Season } from "@/lib/supabase/types";

type State = { ok?: boolean; error?: string };

export function EpisodeForm({
  episode,
  series,
  seasons,
}: {
  episode?: Episode;
  series: Pick<Series, "id" | "title_es">[];
  seasons: Pick<Season, "id" | "series_id" | "season_number" | "title_es">[];
}) {
  const [seriesId, setSeriesId] = useState(episode?.series_id ?? series[0]?.id ?? "");
  const filteredSeasons = seasons.filter((s) => s.series_id === seriesId);
  const [seasonId, setSeasonId] = useState(
    episode?.season_id ?? filteredSeasons[0]?.id ?? ""
  );

  const [lastSeriesId, setLastSeriesId] = useState(seriesId);
  if (lastSeriesId !== seriesId) {
    setLastSeriesId(seriesId);
    if (!filteredSeasons.find((s) => s.id === seasonId)) {
      setSeasonId(filteredSeasons[0]?.id ?? "");
    }
  }

  const [state, action, pending] = useActionState<State, FormData>(async (_prev, formData) => {
    try {
      await upsertEpisode(formData);
      return { ok: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Error" };
    }
  }, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      {episode ? <input type="hidden" name="id" defaultValue={episode.id} /> : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Serie" required>
          <Select name="series_id" value={seriesId} onChange={(e) => setSeriesId(e.target.value)} required>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title_es}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Temporada" required>
          <Select name="season_id" value={seasonId} onChange={(e) => setSeasonId(e.target.value)} required>
            {filteredSeasons.map((s) => (
              <option key={s.id} value={s.id}>
                T{s.season_number} {s.title_es ? `— ${s.title_es}` : ""}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <Field label="Título (ES)" required>
          <TextInput name="title_es" defaultValue={episode?.title_es ?? ""} required />
        </Field>
        <Field label="# Episodio" required>
          <TextInput type="number" name="episode_number" defaultValue={episode?.episode_number ?? ""} required />
        </Field>
      </div>
      <Field label="Slug (URL)" required>
        <TextInput name="slug" defaultValue={episode?.slug ?? ""} required />
      </Field>
      <Field label="Título (EN)">
        <TextInput name="title_en" defaultValue={episode?.title_en ?? ""} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sinopsis (ES)">
          <Textarea name="synopsis_es" rows={4} defaultValue={episode?.synopsis_es ?? ""} />
        </Field>
        <Field label="Sinopsis (EN)">
          <Textarea name="synopsis_en" rows={4} defaultValue={episode?.synopsis_en ?? ""} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
        <Field label="YouTube Video ID" hint="Ej: dQw4w9WgXcQ — solo el ID, no la URL completa." required>
          <TextInput name="youtube_id" defaultValue={episode?.youtube_id ?? ""} required />
        </Field>
        <Field label="Duración (segundos)">
          <TextInput
            type="number"
            name="duration_seconds"
            defaultValue={episode?.duration_seconds ?? ""}
          />
        </Field>
      </div>
      <Field label="Thumbnail URL" hint="Si omite, se usa la miniatura maxres de YouTube.">
        <TextInput name="thumbnail_url" defaultValue={episode?.thumbnail_url ?? ""} />
      </Field>

      <Field
        label="Transcripción (ES)"
        hint="Texto completo — clave para SEO. 500+ palabras recomendado."
      >
        <Textarea
          name="transcript_es"
          rows={10}
          defaultValue={episode?.transcript_es ?? ""}
        />
      </Field>
      <Field label="Transcripción (EN)">
        <Textarea name="transcript_en" rows={6} defaultValue={episode?.transcript_en ?? ""} />
      </Field>

      <Field label="Tags (separadas por coma)">
        <TextInput
          name="tags"
          defaultValue={(episode?.tags ?? []).join(", ")}
          placeholder="I-130, Guatemala, reunificación"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Fecha de publicación (ISO o YYYY-MM-DD)">
          <TextInput
            name="published_at"
            defaultValue={episode?.published_at ?? ""}
            placeholder="2026-05-01"
          />
        </Field>
        <div className="flex items-center pt-6">
          <Checkbox name="is_published" defaultChecked={episode?.is_published ?? false}>
            Publicar (visible al público)
          </Checkbox>
        </div>
      </div>

      {state.ok ? (
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          Episodio guardado.
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
          {pending ? "Guardando…" : episode ? "Actualizar episodio" : "Crear episodio"}
        </button>
      </div>
    </form>
  );
}
