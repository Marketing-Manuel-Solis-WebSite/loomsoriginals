"use client";

import { useActionState, useState } from "react";
import { createSeason } from "./actions";
import { Field, TextInput } from "./form-primitives";

type State = { ok?: boolean; error?: string };

export function SeasonForm({
  seriesId,
  defaultSeasonNumber,
}: {
  seriesId: string;
  defaultSeasonNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<State, FormData>(async (_prev, formData) => {
    try {
      await createSeason(formData);
      return { ok: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Error" };
    }
  }, {});

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-gold-500 hover:text-gold-400"
      >
        + Agregar temporada
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4">
      <input type="hidden" name="series_id" defaultValue={seriesId} />
      <Field label="Número de temporada" required>
        <TextInput
          type="number"
          name="season_number"
          defaultValue={defaultSeasonNumber}
          min={1}
          required
        />
      </Field>
      <Field label="Título (opcional)">
        <TextInput name="title_es" placeholder="p.ej. Primera Temporada" />
      </Field>
      {state.ok ? (
        <p className="text-[12px] text-gold-300">Temporada creada.</p>
      ) : null}
      {state.error ? (
        <p className="text-[12px] text-red-300">{state.error}</p>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-60"
        >
          {pending ? "Creando…" : "Crear"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] text-ivory-200/70 hover:text-ivory-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
