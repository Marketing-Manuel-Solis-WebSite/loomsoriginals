-- Loom Originals — un episodio por video de YouTube.
-- ─────────────────────────────────────────────────────────────────────
-- Habilita la ingesta idempotente e incremental (scripts/ingest-youtube.py):
-- el upsert se hace por youtube_id, y la BD garantiza que no haya duplicados
-- aunque dos corridas se solapen.
--
-- PRECHECK — corre esto PRIMERO. Debe devolver CERO filas antes de aplicar el
-- índice; si devuelve filas hay youtube_id duplicados que debes resolver a mano
-- (la creación del índice único fallará mientras existan):
--
--   select youtube_id, count(*) as n
--   from public.episodes
--   group by youtube_id
--   having count(*) > 1
--   order by n desc;
--
-- ─────────────────────────────────────────────────────────────────────

create unique index if not exists idx_episodes_youtube_id_unique
  on public.episodes (youtube_id);
