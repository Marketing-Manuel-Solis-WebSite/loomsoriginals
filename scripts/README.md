# Scripts de Loom Originals

Herramientas de datos (Python 3.10+, stdlib + `openpyxl`). Las credenciales se
leen del entorno vía `scripts/_env.py`, que carga `.env.local` del root del repo
(ver `.env.local.example` y `requirements.txt`). Ningún script lleva secretos.

```bash
python -m pip install -r requirements.txt
```

## Ingesta de contenido (Fase 1 — vigente)

Fuente de verdad: **YouTube Data API v3**. Sin Excel, sin scraping de HTML.

| Script | Qué hace |
|---|---|
| **`ingest-youtube.py`** | Descubre todos los uploads del canal (`YOUTUBE_CHANNEL_ID`), trae metadata vía API (título, descripción, fecha, duración ISO-8601, thumbnails) y hace **upsert por `youtube_id`** en Supabase. Videos nuevos entran como **borrador** (`is_published=false`) en la serie inbox `sin-clasificar`; los existentes solo refrescan campos verdad-YouTube y respetan la curación manual. Idempotente e incremental. `--dry-run` y `--limit N` disponibles. |
| `_env.py` | Loader de `.env.local` + `require_env(...)`. Lo reutilizan todos los scripts. |

**Curación:** revisa y publica los borradores desde `/admin` (filtro "Borrador").
Requiere la migración `supabase/migrations/0003_youtube_id_unique.sql` aplicada.

## Verificación del sitio (utilidades — vigentes)

`check-ep.py`, `check-home.py`, `where-is.py`, `validate-all.py` — comprueban
el HTML del sitio en producción. No tocan la BD.

## Retirados / deprecados

Reemplazados por `ingest-youtube.py`. Se conservan como referencia, **no forman
parte del flujo**:

| Script | Por qué se retiró |
|---|---|
| `enrich-episodes.py`, `fetch-yt-meta.py` | Scrapeaban el HTML de YouTube (`ytInitialPlayerResponse` por regex) — frágil y silencioso. La API los reemplaza. |
| `read-catalog.py`, `push-catalog.py` | Dependían del Excel manual con ruta hardcodeada. El descubrimiento ya no usa Excel. |
| `classify-catalog.py`, `reclassify.py` | Su ejecución basada en Excel queda retirada, **pero contienen la lógica de clasificación (regex) que se retomará en una fase posterior** — se dejan intactos a propósito. |

`catalog-manifest.json` es un artefacto histórico del flujo viejo.
