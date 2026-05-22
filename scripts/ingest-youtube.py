"""Ingesta del canal de YouTube de Loom Originals hacia Supabase.

Fuente de verdad: YouTube Data API v3 — sin Excel y sin scraping de HTML.
Descubre TODOS los uploads del canal, trae la metadata autoritativa (título,
descripción, fecha, duración, thumbnails) y hace upsert por `youtube_id` en
Supabase.

Modelo de curación (la clasificación es de una fase posterior):
  - Video NUEVO  -> se inserta como BORRADOR (is_published=false) en la serie
                    "bandeja de entrada" `sin-clasificar`. Tú lo reasignas a su
                    serie real y lo publicas desde /admin.
  - Video EXISTENTE -> solo se refrescan los campos "verdad de YouTube"
                    (duration_seconds, thumbnail_url, published_at). title_es y
                    synopsis_es solo se rellenan si están vacíos: nunca se pisa
                    una edición manual hecha en /admin.

Idempotente: una segunda corrida sin cambios en el canal no escribe nada.
Incremental: solo toca lo nuevo o lo que cambió.

Variables de entorno (vía scripts/_env.py / .env.local):
  YOUTUBE_API_KEY                          requerida (Google Cloud, API v3 ON)
  YOUTUBE_CHANNEL_ID                       requerida (el canal, formato UC...)
  SUPABASE_SERVICE_ROLE_KEY                requerida
  SUPABASE_URL | NEXT_PUBLIC_SUPABASE_URL  requerida

Uso:
  python scripts/ingest-youtube.py            # corrida real
  python scripts/ingest-youtube.py --dry-run  # reporta sin escribir nada
  python scripts/ingest-youtube.py --limit 5  # procesa solo los primeros 5
"""
import argparse
import csv
import io
import json
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from _env import require_env

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

YOUTUBE_API_KEY = require_env("YOUTUBE_API_KEY")
YOUTUBE_CHANNEL_ID = require_env("YOUTUBE_CHANNEL_ID")
SUPABASE_URL = require_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL").rstrip("/")
SRK = require_env("SUPABASE_SERVICE_ROLE_KEY")

API_BASE = "https://www.googleapis.com/youtube/v3"
INBOX_SERIES_SLUG = "sin-clasificar"
SYNOPSIS_MAX = 5000  # tope que valida el form de /admin (zod) — no lo superes

SB_HEADERS = {
    "apikey": SRK,
    "Authorization": f"Bearer {SRK}",
    "Content-Type": "application/json",
}

# ═════════════════════════════════════════════════════════════════════
# FILTRO DE EXCLUSIÓN (Fase 1.5) — descarta lo inequívocamente interno/
# técnico ANTES de insertar. NO es clasificación de calidad (eso es Fase 2).
# Se evalúa sobre la metadata de YouTube (título + duración). Cada video se
# atribuye a la PRIMERA regla que matchee (orden 1→6). Edita estas
# listas/regex para ajustar el criterio sin tocar la lógica.
# ═════════════════════════════════════════════════════════════════════

# Regla 1 — subidas de prueba: título sólo dígitos, o <10s sin texto útil.
EXCL_TEST_MAX_SECONDS = 10
EXCL_TEST_MIN_LETTERS = 5  # menos de estas letras = título "no informativo"

# Regla 2 — archivos internos de clientes: "485001 Leonardo Aguirre #016",
# "CIU002 Dagoberto Limon #010.mp4". Código (con dígito) + nombre + #NN,
# o título que termina en extensión de video.
EXCL_CLIENT_FILE_RE = re.compile(r"^(?=[A-Z0-9]{0,5}\d)[A-Z0-9]{3,6}\s+\w+.*#\d+")
EXCL_VIDEO_EXT_RE = re.compile(r"\.(mp4|mov|mxf|mts|avi)\s*$", re.I)

# Regla 3 — working files (marcadores técnicos).
EXCL_WORKING_CI = ["newcheck", "checklist", "no sirve"]            # sin distinguir mayúsculas
EXCL_WORKING_CS = ["DELETE", "NO BORRO", "RECHAZADO", "COMPLETO"]  # SÓLO en mayúsculas (evita "proceso completo")

# Regla 4 — producción / spots.
EXCL_PROD_CI = [r"\bspot\b", r"\blobby\b", r"\bharvey\b", r"\bunivision\b", r"\bkavu\b"]  # sin distinguir mayúsculas
EXCL_PROD_CS = [r"\bDEMO\b"]  # SÓLO mayúsculas (evita "demostración")

# Regla 5 — lives crudos genéricos SIN tema. Si hay pregunta (¿/?), NO se excluye
# (esos lives temáticos se curan en Fase 2). Se quita el boilerplate y, si lo que
# queda tiene pocas letras útiles, se considera genérico.
EXCL_LIVE_SIGNAL_RE = re.compile(r"\b(live|livestream|stream|streamed|en vivo)\b", re.I)
EXCL_LIVE_BOILERPLATE_RE = re.compile(
    r"\b(el|la|the|abogado|abogada|lawyer|attorney|manuel|sol[ií]s|en|vivo|live|"
    r"livestream|stream|streamed|with|con|enero|febrero|marzo|abril|mayo|junio|julio|"
    r"agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|"
    r"june|july|august|september|october|november|december)\b",
    re.I,
)
EXCL_LIVE_MIN_RESIDUAL_LETTERS = 6  # letras útiles que deben sobrar para NO excluir

# Regla 6 — bienvenida / onboarding interno.
EXCL_WELCOME_RE = re.compile(r"\bbienvenid[oa]s?\b", re.I)
EXCL_ONBOARDING_SUBSTR = "herramientas para que cuando el nuevo"


def exclusion_rule(title: str, duration_seconds: int | None) -> str | None:
    """Devuelve la clave de la primera regla de exclusión que matchee, o None.

    Determinista; sólo mira título + duración. NO es clasificación de calidad.
    """
    t = (title or "").strip()
    low = t.lower()
    letters = sum(c.isalpha() for c in t)

    # 1) Subidas de prueba.
    if re.fullmatch(r"[\d\s]+", t):
        return "1-prueba-solo-digitos"
    if duration_seconds is not None and duration_seconds < EXCL_TEST_MAX_SECONDS and letters < EXCL_TEST_MIN_LETTERS:
        return "1-prueba-corto-sin-texto"

    # 2) Archivos internos de clientes.
    if EXCL_CLIENT_FILE_RE.search(t) or EXCL_VIDEO_EXT_RE.search(t):
        return "2-archivo-cliente"

    # 3) Working files.
    if any(s in low for s in EXCL_WORKING_CI) or any(s in t for s in EXCL_WORKING_CS):
        return "3-working-file"

    # 4) Producción / spots.
    if any(re.search(p, t, re.I) for p in EXCL_PROD_CI) or any(re.search(p, t) for p in EXCL_PROD_CS):
        return "4-produccion-spot"

    # 5) Lives crudos genéricos (sin tema; respeta los que traen pregunta).
    if EXCL_LIVE_SIGNAL_RE.search(t) and "?" not in t and "¿" not in t:
        residual = EXCL_LIVE_BOILERPLATE_RE.sub(" ", t)
        if sum(c.isalpha() for c in residual) < EXCL_LIVE_MIN_RESIDUAL_LETTERS:
            return "5-live-generico"

    # 6) Bienvenida / onboarding.
    if EXCL_WELCOME_RE.search(t) or EXCL_ONBOARDING_SUBSTR in low:
        return "6-bienvenida-onboarding"

    return None


# ─────────────────────────────────────────────────────────────────────
# Clientes HTTP (stdlib)
# ─────────────────────────────────────────────────────────────────────
def yt_api(endpoint: str, **params) -> dict:
    """GET a la YouTube Data API. Aborta con mensaje claro si se agota la cuota."""
    params["key"] = YOUTUBE_API_KEY
    url = f"{API_BASE}/{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if e.code == 403 and "quotaExceeded" in body:
            sys.stderr.write(
                "\n[X] Cuota de YouTube Data API agotada (403 quotaExceeded).\n"
                "    Reinicia al corte diario (medianoche hora del Pacifico) o\n"
                "    solicita mas cuota en Google Cloud Console. Abortando.\n\n"
            )
            raise SystemExit(2)
        sys.stderr.write(
            f"\n[X] YouTube API respondio {e.code} en {endpoint}:\n{body[:600]}\n\n"
        )
        raise SystemExit(2)
    except urllib.error.URLError as e:
        sys.stderr.write(f"\n[X] Error de red llamando a YouTube API: {e}\n\n")
        raise SystemExit(2)


def sb(method: str, path: str, body=None, prefer: str | None = None):
    """Llamada REST a Supabase (service role)."""
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = dict(SB_HEADERS)
    if prefer:
        headers["Prefer"] = prefer
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        sys.stderr.write(
            f"\n[X] Supabase respondio {e.code} en {method} {path}:\n"
            f"{e.read().decode('utf-8', errors='replace')[:600]}\n\n"
        )
        raise SystemExit(3)


# ─────────────────────────────────────────────────────────────────────
# Utilidades puras
# ─────────────────────────────────────────────────────────────────────
def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def slugify(s: str, max_len: int = 80) -> str:
    s = strip_accents(s or "").lower()
    s = re.sub(r"[^a-z0-9\s-]", " ", s)
    s = re.sub(r"\s+", "-", s.strip())
    s = re.sub(r"-+", "-", s)
    return s[:max_len].rstrip("-") or "video"


_ISO8601_DURATION = re.compile(
    r"^P(?:(?P<d>\d+)D)?T(?:(?P<h>\d+)H)?(?:(?P<m>\d+)M)?(?:(?P<s>\d+)S)?$"
)


def iso8601_to_seconds(text: str | None) -> int | None:
    """'PT2M27S' -> 147. Devuelve None si no parsea."""
    m = _ISO8601_DURATION.match(text or "")
    if not m:
        return None
    d, h, mn, s = (int(v) if v else 0 for v in (m["d"], m["h"], m["m"], m["s"]))
    return d * 86400 + h * 3600 + mn * 60 + s


def best_thumbnail(thumbs: dict) -> str | None:
    """Elige la miniatura de mayor resolución disponible."""
    for key in ("maxres", "standard", "high", "medium", "default"):
        t = thumbs.get(key)
        if t and t.get("url"):
            return t["url"]
    return None


def to_instant(value: str | None) -> datetime | None:
    """Normaliza un timestamp ISO a datetime UTC para comparar instantes."""
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


# ─────────────────────────────────────────────────────────────────────
# Descubrimiento vía YouTube Data API
# ─────────────────────────────────────────────────────────────────────
def get_uploads_playlist_id(channel_id: str) -> str:
    data = yt_api("channels", part="contentDetails", id=channel_id)
    items = data.get("items") or []
    if not items:
        sys.stderr.write(
            f"\n[X] No se encontro el canal '{channel_id}'. Revisa YOUTUBE_CHANNEL_ID\n"
            "    (debe ser el ID del canal, formato UC...). Abortando.\n\n"
        )
        raise SystemExit(2)
    return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]


def iter_all_video_ids(uploads_playlist_id: str) -> list[str]:
    """Pagina playlistItems.list (1 unidad/pagina de 50) y junta los videoId."""
    ids: list[str] = []
    page_token = None
    pages = 0
    while True:
        params = dict(part="contentDetails", playlistId=uploads_playlist_id, maxResults=50)
        if page_token:
            params["pageToken"] = page_token
        data = yt_api("playlistItems", **params)
        for it in data.get("items", []):
            vid = it.get("contentDetails", {}).get("videoId")
            if vid:
                ids.append(vid)
        pages += 1
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    print(f"  · {len(ids)} videos descubiertos en {pages} pagina(s) de la API")
    return ids


def fetch_videos(video_ids: list[str]) -> list[dict]:
    """videos.list en lotes de 50 (1 unidad/lote). Trae snippet+contentDetails+status."""
    out: list[dict] = []
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i : i + 50]
        data = yt_api(
            "videos",
            part="snippet,contentDetails,status",
            id=",".join(chunk),
            maxResults=50,
        )
        out.extend(data.get("items", []))
    return out


# ─────────────────────────────────────────────────────────────────────
# Supabase: inbox + episodios existentes
# ─────────────────────────────────────────────────────────────────────
def ensure_inbox(dry_run: bool) -> tuple[str | None, str | None]:
    """Devuelve (series_id, season_id) de la bandeja 'sin-clasificar', creandola
    si falta. En dry-run no crea nada: devuelve None donde tendria que crear."""
    rows = sb("GET", f"/rest/v1/series?slug=eq.{INBOX_SERIES_SLUG}&select=id")
    if rows:
        series_id = rows[0]["id"]
    elif dry_run:
        print("  [dry-run] crearia la serie inbox 'sin-clasificar'")
        return None, None
    else:
        created = sb(
            "POST",
            "/rest/v1/series",
            [{
                "slug": INBOX_SERIES_SLUG,
                "title_es": "Sin clasificar",
                "title_en": "Unsorted",
                "synopsis_es": "Bandeja de entrada de la ingesta automatica. Videos "
                               "recien descubiertos en YouTube, pendientes de revision "
                               "y clasificacion. No se publica directamente.",
                "is_featured": False,
            }],
            prefer="return=representation",
        )
        series_id = created[0]["id"]
        print(f"  + serie inbox creada ({series_id})")

    seasons = sb(
        "GET",
        f"/rest/v1/seasons?series_id=eq.{series_id}&season_number=eq.1&select=id",
    )
    if seasons:
        season_id = seasons[0]["id"]
    else:
        created = sb(
            "POST",
            "/rest/v1/seasons",
            [{"series_id": series_id, "season_number": 1, "title_es": "Primera Temporada"}],
            prefer="return=representation",
        )
        season_id = created[0]["id"]
        print(f"  + temporada 1 de la inbox creada ({season_id})")
    return series_id, season_id


def load_existing_episodes() -> dict[str, dict]:
    """Mapa youtube_id -> fila. Pagina con offset (PostgREST topa en 1000 filas
    por respuesta; con >1000 episodios un solo GET leeria solo 1000 y romperia la
    idempotencia de re-ingestas). Avisa de duplicados (no deberian existir tras 0003)."""
    select = ("/rest/v1/episodes?select=id,youtube_id,series_id,season_id,episode_number,"
              "slug,title_es,synopsis_es,duration_seconds,thumbnail_url,published_at")
    rows: list[dict] = []
    page, offset = 1000, 0
    while True:
        chunk = sb("GET", f"{select}&limit={page}&offset={offset}") or []
        rows.extend(chunk)
        if len(chunk) < page:
            break
        offset += page
    by_id: dict[str, dict] = {}
    for r in rows:
        yid = r["youtube_id"]
        if yid in by_id:
            print(f"  ! AVISO: youtube_id duplicado en BD: {yid} (aplica la migracion 0003)")
            continue
        by_id[yid] = r
    return by_id


# ─────────────────────────────────────────────────────────────────────
# Lógica de upsert
# ─────────────────────────────────────────────────────────────────────
def youtube_fields(video: dict) -> dict:
    """Extrae los campos relevantes de un recurso video de la API."""
    snip = video.get("snippet", {})
    content = video.get("contentDetails", {})
    desc = (snip.get("description") or "").strip()
    if len(desc) > SYNOPSIS_MAX:
        desc = desc[:SYNOPSIS_MAX].rsplit(" ", 1)[0] + "…"
    return {
        "youtube_id": video["id"],
        "title": (snip.get("title") or "").strip(),
        "description": desc,
        "published_at": snip.get("publishedAt"),
        "duration_seconds": iso8601_to_seconds(content.get("duration")),
        "thumbnail_url": best_thumbnail(snip.get("thumbnails", {})),
        "privacy": video.get("status", {}).get("privacyStatus"),
    }


def build_update_patch(existing: dict, yt: dict) -> dict:
    """Campos a refrescar respetando la curacion manual.

    - Verdad-YouTube (siempre que cambie): duration_seconds, thumbnail_url, published_at.
    - Rellena solo si esta vacio: synopsis_es. (title_es nunca se pisa.)
    """
    patch: dict = {}
    if yt["duration_seconds"] is not None and existing.get("duration_seconds") != yt["duration_seconds"]:
        patch["duration_seconds"] = yt["duration_seconds"]
    if yt["thumbnail_url"] and existing.get("thumbnail_url") != yt["thumbnail_url"]:
        patch["thumbnail_url"] = yt["thumbnail_url"]
    if yt["published_at"] and to_instant(existing.get("published_at")) != to_instant(yt["published_at"]):
        patch["published_at"] = yt["published_at"]
    if not (existing.get("synopsis_es") or "").strip() and yt["description"]:
        patch["synopsis_es"] = yt["description"]
    return patch


def write_previews_and_report(
    kept_rows: list[dict], excluded_rows: list[dict], excl_rule_counts: dict[str, int]
) -> None:
    """Sólo dry-run: vuelca los dos CSV (excluidos y sobrevivientes) y reporta
    los conteos. No escribe en la BD."""
    kept_path = Path(__file__).with_name("kept-preview.csv")
    with kept_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["youtube_id", "title", "duration_seconds", "published_at"])
        for r in kept_rows:
            w.writerow([
                r["youtube_id"],
                r["title"],
                r["duration_seconds"] if r["duration_seconds"] is not None else "",
                r["published_at"] or "",
            ])

    excl_path = Path(__file__).with_name("excluded-preview.csv")
    with excl_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["youtube_id", "title", "duration_seconds", "rule"])
        for r in excluded_rows:
            w.writerow([
                r["youtube_id"],
                r["title"],
                r["duration_seconds"] if r["duration_seconds"] is not None else "",
                r["rule"],
            ])

    print(f"\n  -> CSV sobrevivientes: {kept_path}  ({len(kept_rows)} filas)")
    print(f"  -> CSV excluidos:      {excl_path}  ({len(excluded_rows)} filas)")

    print("\n  == Exclusiones por regla (primera regla que matchea) ==")
    if excl_rule_counts:
        for rule in sorted(excl_rule_counts):
            print(f"    {rule:28} {excl_rule_counts[rule]:>5}")
    else:
        print("    (ninguna exclusión)")
    print(f"    {'TOTAL excluidos':28} {sum(excl_rule_counts.values()):>5}")
    print(f"    {'SOBREVIVEN (se insertarían)':28} {len(kept_rows):>5}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingesta del canal de YouTube hacia Supabase.")
    parser.add_argument("--dry-run", action="store_true", help="Reporta sin escribir en la BD.")
    parser.add_argument("--limit", type=int, default=0, help="Procesa solo los primeros N videos.")
    args = parser.parse_args()

    mode = "DRY-RUN (sin escrituras)" if args.dry_run else "corrida real"
    print(f"== Ingesta YouTube -> Supabase | {mode} ==")
    print(f"Canal: {YOUTUBE_CHANNEL_ID}")

    uploads = get_uploads_playlist_id(YOUTUBE_CHANNEL_ID)
    video_ids = iter_all_video_ids(uploads)
    if args.limit and args.limit > 0:
        video_ids = video_ids[: args.limit]
        print(f"  · --limit: recortado a {len(video_ids)} videos")
    if not video_ids:
        print("Nada que ingerir.")
        return

    videos = fetch_videos(video_ids)
    print(f"  · {len(videos)} videos con metadata completa de la API")

    inbox_series_id, inbox_season_id = ensure_inbox(args.dry_run)
    existing = load_existing_episodes()

    # Estado del inbox para asignar episode_number y slugs unicos sin colisiones.
    inbox_eps = [r for r in existing.values() if r["series_id"] == inbox_series_id] if inbox_series_id else []
    next_ep = max((int(r["episode_number"]) for r in inbox_eps), default=0) + 1
    inbox_slugs = {r["slug"] for r in inbox_eps}

    n_new = n_updated = n_unchanged = n_skipped = n_excluded = 0
    kept_rows: list[dict] = []       # sólo dry-run: sobrevivientes (CSV)
    excluded_rows: list[dict] = []   # sólo dry-run: excluidos (CSV)
    excl_rule_counts: dict[str, int] = {}

    for video in videos:
        yt = youtube_fields(video)
        yid = yt["youtube_id"]

        if yt["privacy"] == "private":
            n_skipped += 1
            print(f"  ~ {yid} privado — saltado")
            continue

        # ── Filtro de exclusión determinista (Fase 1.5) — aplica en dry-run y real.
        rule = exclusion_rule(yt["title"], yt["duration_seconds"])
        if rule:
            n_excluded += 1
            excl_rule_counts[rule] = excl_rule_counts.get(rule, 0) + 1
            if args.dry_run:
                excluded_rows.append({
                    "youtube_id": yid,
                    "title": yt["title"],
                    "duration_seconds": yt["duration_seconds"],
                    "rule": rule,
                })
            continue

        prev = existing.get(yid)
        if prev is None:
            # Nuevo -> borrador en la inbox.
            base_slug = slugify(yt["title"])
            slug = base_slug
            n = 2
            while slug in inbox_slugs:
                slug = f"{base_slug}-{n}"
                n += 1
            inbox_slugs.add(slug)
            row = {
                "series_id": inbox_series_id,
                "season_id": inbox_season_id,
                "episode_number": next_ep,
                "slug": slug,
                "title_es": yt["title"][:200] or yid,
                "synopsis_es": yt["description"] or None,
                "youtube_id": yid,
                "duration_seconds": yt["duration_seconds"],
                "thumbnail_url": yt["thumbnail_url"],
                "published_at": yt["published_at"],
                "is_published": False,
                "tags": [],
            }
            next_ep += 1
            n_new += 1
            if args.dry_run:
                kept_rows.append({
                    "youtube_id": yid,
                    "title": row["title_es"],
                    "duration_seconds": row["duration_seconds"],
                    "published_at": row["published_at"],
                })
            else:
                sb("POST", "/rest/v1/episodes", [row], prefer="return=minimal")
                print(f"  + NUEVO borrador  {yid}  E{row['episode_number']}  {row['title_es'][:60]!r}")
        else:
            patch = build_update_patch(prev, yt)
            if not patch:
                n_unchanged += 1
                continue
            n_updated += 1
            campos = ", ".join(sorted(patch))
            if args.dry_run:
                print(f"  [dry-run] update  {yid}  -> {campos}")
            else:
                sb("PATCH", f"/rest/v1/episodes?id=eq.{prev['id']}", patch, prefer="return=minimal")
                print(f"  ~ update  {yid}  -> {campos}")

    print("\n== Resumen ==")
    print(f"  Descubiertos:      {len(video_ids)}")
    print(f"  Excluidos (filtro):{n_excluded}")
    print(f"  Nuevos borradores: {n_new}")
    print(f"  Actualizados:      {n_updated}")
    print(f"  Sin cambios:       {n_unchanged}")
    print(f"  Privados saltados: {n_skipped}")
    if args.dry_run:
        write_previews_and_report(kept_rows, excluded_rows, excl_rule_counts)
        print("\n(DRY-RUN: no se escribio nada en la base de datos.)")


if __name__ == "__main__":
    main()
