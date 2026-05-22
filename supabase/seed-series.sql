-- Loom Originals — siembra de las 6 series reales + temporada 1 de cada una.
-- ─────────────────────────────────────────────────────────────────────
-- PRERREQUISITO de la Fase 2 (clasificación con LLM): el clasificador asigna
-- episodios a estas series, así que deben existir antes de correrlo.
-- Idempotente: re-correrlo no duplica (ON CONFLICT por slug / por temporada).
-- NO crea la inbox 'sin-clasificar' (la crea la ingesta) ni episodios.
-- Títulos/sinopsis tomados del manifest editorial original.
-- ─────────────────────────────────────────────────────────────────────

insert into public.series (slug, title_es, title_en, synopsis_es, is_featured, featured_order, release_year)
values
  ('uniendo-familias-manuel-solis',
   'Uniendo Familias con Manuel Solís', 'Reuniting Families with Manuel Solís',
   'Serie insignia de Loom Originals. Historias reales de familias que reconstruyeron su camino migratorio con el acompañamiento del Bufete Manuel Solís.',
   true, 1, 2026),
  ('testimonios-reales',
   'Testimonios Reales', 'Real Testimonies',
   'Clientes del Bufete Manuel Solís cuentan en primera persona cómo se transformaron sus vidas al obtener su residencia permanente, reunirse con sus familias o proteger sus derechos en Estados Unidos.',
   false, 2, 2026),
  ('guia-migratoria',
   'Guía Migratoria', 'Immigration Guide',
   'Cápsulas informativas sobre procesos migratorios — Visa T, Visa U, VAWA, SIJS, I-130, habeas corpus, defensa contra ICE y más. Presentadas por el equipo legal de Manuel Solís.',
   false, 3, 2026),
  ('en-vivo',
   'En Vivo y Podcasts', 'Live & Podcasts',
   'Sesiones en vivo, podcasts y entrevistas del Bufete Manuel Solís donde se responden dudas reales de la comunidad migrante.',
   false, 4, 2026),
  ('el-bufete',
   'El Bufete', 'About the Firm',
   'Conozca al equipo, la historia y los valores del Bufete Manuel Solís — 35 años acompañando a familias migrantes.',
   false, 5, 2026),
  ('historias-cortas',
   'Historias Cortas', 'Short Stories',
   'Momentos breves — frases, reflexiones y fragmentos del trabajo diario del Bufete Manuel Solís.',
   false, 6, 2026)
on conflict (slug) do nothing;

-- Temporada 1 para cada una de las 6 series.
insert into public.seasons (series_id, season_number, title_es, title_en)
select id, 1, 'Primera Temporada', 'Season One'
from public.series
where slug in (
  'uniendo-familias-manuel-solis', 'testimonios-reales', 'guia-migratoria',
  'en-vivo', 'el-bufete', 'historias-cortas'
)
on conflict (series_id, season_number) do nothing;
