-- Loom Originals — columnas de clasificación (Fase 2, LLM).
-- ─────────────────────────────────────────────────────────────────────
-- Guarda el resultado del clasificador con LLM (scripts/classify-llm.py).
-- Columnas tipadas (en vez de reusar tags) para poder filtrar y hacer
-- acciones en bloque en /admin (mini-fase 2.5). Idempotente.
-- ─────────────────────────────────────────────────────────────────────

alter table public.episodes
  add column if not exists content_type            text,
  add column if not exists recomendacion           text,
  add column if not exists classification_confidence real,
  add column if not exists classified_at           timestamptz;

-- CHECK de enums (NULL permitido = aún sin clasificar). En bloques DO para
-- ser idempotente (no hay "add constraint if not exists" en SQL plano).
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'episodes_content_type_check') then
    alter table public.episodes add constraint episodes_content_type_check
      check (content_type is null or content_type in
        ('episodio','testimonio','educativo','live_podcast','short_social','institucional'));
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'episodes_recomendacion_check') then
    alter table public.episodes add constraint episodes_recomendacion_check
      check (recomendacion is null or recomendacion in ('publicar','revisar','descartar'));
  end if;
end $$;

-- Índices para filtrar la cola de curación en /admin.
create index if not exists idx_episodes_content_type  on public.episodes (content_type);
create index if not exists idx_episodes_recomendacion  on public.episodes (recomendacion);
create index if not exists idx_episodes_classified_at  on public.episodes (classified_at);
