"""Clasifica los borradores de la inbox con la API de Anthropic (Fase 2).

Lee los episodios en estado borrador de la serie inbox 'sin-clasificar' y, para
cada uno, manda título + sinopsis cruda a Claude (Haiku) y obtiene en JSON
estricto: series_slug, categories, content_type, recomendacion, confianza.

Reglas:
  - Uniendo Familias es DETERMINISTA: si el título contiene "Uniendo Familias"
    y un "EP. N" explícito, va a uniendo-familias-manuel-solis con ese
    episode_number y content_type=episodio (no se consulta al LLM para la serie).
    Por eso uniendo-familias NO está entre las opciones que elige el LLM.
  - Series y categorías se LEEN de la BD (no se asumen).

Modos:
  (sin flag)  DRY-RUN: escribe scripts/classify-preview.csv, NO toca la BD.
  --apply     Escribe la clasificación a la BD (series_id, season_id,
              episode_number, links de categorías, columnas nuevas, classified_at).
  --limit N   Procesa sólo los primeros N.

Idempotente / reanudable:
  - dry-run: salta los youtube_id ya presentes en el CSV (append).
  - --apply: salta los que ya tienen classified_at (no reprocesa ni duplica).

Env (vía scripts/_env.py, sin defaults):
  ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL
"""
import argparse
import csv
import io
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import anthropic

from _env import require_env

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ANTHROPIC_API_KEY = require_env("ANTHROPIC_API_KEY")
SUPABASE_URL = require_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL").rstrip("/")
SRK = require_env("SUPABASE_SERVICE_ROLE_KEY")

# Modelo económico verificado con la skill claude-api (Haiku 4.5).
MODEL = "claude-haiku-4-5"
INBOX_SLUG = "sin-clasificar"
UF_SLUG = "uniendo-familias-manuel-solis"
CONTENT_TYPES = ["episodio", "testimonio", "educativo", "live_podcast", "short_social", "institucional"]
RECOMENDACIONES = ["publicar", "revisar", "descartar"]
PREVIEW_CSV = Path(__file__).with_name("classify-preview.csv")
THROTTLE_SECONDS = 0.15  # respiro entre llamadas; el SDK ya reintenta 429/529

SB_HEADERS = {"apikey": SRK, "Authorization": f"Bearer {SRK}", "Content-Type": "application/json"}

# El SDK reintenta 429/500/529 con backoff exponencial; subimos el tope.
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY, max_retries=8)


# ─────────────────────────────────────────────────────────────────────
# Supabase REST (stdlib, con paginación — la API topa en 1000 filas/respuesta)
# ─────────────────────────────────────────────────────────────────────
def sb(method: str, path: str, body=None, prefer: str | None = None):
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
        sys.stderr.write(f"\n[X] Supabase {e.code} en {method} {path}:\n"
                         f"{e.read().decode('utf-8', errors='replace')[:600]}\n\n")
        raise SystemExit(3)


def sb_get_all(path_with_select: str, page: int = 1000) -> list[dict]:
    """GET paginado con offset (PostgREST limita a 1000 filas por respuesta)."""
    sep = "&" if "?" in path_with_select else "?"
    out: list[dict] = []
    offset = 0
    while True:
        chunk = sb("GET", f"{path_with_select}{sep}limit={page}&offset={offset}") or []
        out.extend(chunk)
        if len(chunk) < page:
            break
        offset += page
    return out


# ─────────────────────────────────────────────────────────────────────
# Utilidades
# ─────────────────────────────────────────────────────────────────────
def strip_accents(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if unicodedata.category(c) != "Mn")


def uf_episode_number(title: str) -> int | None:
    """Devuelve N si el título es un EP. N de Uniendo Familias; si no, None."""
    t = strip_accents(title).lower()
    if "uniendo familias" not in t:
        return None
    m = re.search(r"\bep\.?\s*(\d+)", t)
    return int(m.group(1)) if m else None


def to_instant(value: str | None) -> datetime:
    """Para ordenar cronológicamente; los nulos van al final."""
    if not value:
        return datetime.max.replace(tzinfo=timezone.utc)
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return datetime.max.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc) if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


# ─────────────────────────────────────────────────────────────────────
# Prompt + herramienta (JSON estricto vía tool use con enums de la BD)
# ─────────────────────────────────────────────────────────────────────
def build_system_prompt(series: list[dict], categories: list[dict]) -> str:
    series_lines = "\n".join(
        f"  - {s['slug']}: {s['title_es']} — {(s.get('synopsis_es') or '').strip()}"
        for s in series
    )
    cat_lines = "\n".join(f"  - {c['slug']}: {c['name_es']}" for c in categories)
    return f"""Eres el clasificador editorial de Loom Originals, el catálogo tipo Netflix \
del Bufete de Inmigración Manuel Solís. Clasificas videos de YouTube ya ingestados.

Recibes el TÍTULO y la DESCRIPCIÓN CRUDA (de YouTube) de un video y devuelves su \
clasificación llamando a la herramienta `registrar_clasificacion`. No escribes nada más.

SERIES disponibles (elige EXACTAMENTE una por su slug):
{series_lines}

CATEGORÍAS disponibles (elige las que apliquen, por slug; al menos una):
{cat_lines}

content_type (elige uno):
  - episodio: pieza narrativa larga y producida (capítulo de una serie).
  - testimonio: cliente real cuenta su caso/experiencia en primera persona.
  - educativo: cápsula informativa que explica un proceso o concepto migratorio/legal.
  - live_podcast: transmisión en vivo, podcast o entrevista.
  - short_social: clip corto promocional (Shorts, ganchos con emojis, <60s típicamente).
  - institucional: sobre el bufete, su equipo, su trayectoria o sus servicios.

recomendacion (tu mejor juicio para un catálogo PREMIUM de una firma legal):
  - publicar: aporta valor y está listo (p. ej. un testimonio con nombre y apellido,
    una cápsula educativa clara, un episodio producido).
  - revisar: dudoso, incompleto o necesita curaduría humana antes de publicar.
  - descartar: no publicable en un catálogo premium (p. ej. un short de 15s con sólo
    emojis y sin contenido, un gancho sin sustancia, material redundante).

confianza: número entre 0 y 1 con tu certeza en esta clasificación.
razon: una frase breve justificando la recomendación.

Sé honesto y conservador: ante la duda, usa 'revisar'. Clasifica en español."""


def build_tool(series_slugs: list[str], category_slugs: list[str]) -> dict:
    return {
        "name": "registrar_clasificacion",
        "description": "Registra la clasificación del video.",
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "series_slug": {"type": "string", "enum": series_slugs},
                "categories": {
                    "type": "array",
                    "items": {"type": "string", "enum": category_slugs},
                },
                "content_type": {"type": "string", "enum": CONTENT_TYPES},
                "recomendacion": {"type": "string", "enum": RECOMENDACIONES},
                "confianza": {"type": "number"},
                "razon": {"type": "string"},
            },
            "required": ["series_slug", "categories", "content_type", "recomendacion", "confianza", "razon"],
            "additionalProperties": False,
        },
    }


def classify_one(system_prompt: str, tool: dict, title: str, synopsis: str) -> dict | None:
    """Una llamada al LLM. Devuelve el dict de clasificación o None si falla el parseo."""
    user = f"TÍTULO: {title}\n\nDESCRIPCIÓN CRUDA:\n{(synopsis or '').strip() or '(sin descripción)'}"
    try:
        resp = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            system=[{"type": "text", "text": system_prompt, "cache_control": {"type": "ephemeral"}}],
            tools=[tool],
            tool_choice={"type": "tool", "name": "registrar_clasificacion"},
            messages=[{"role": "user", "content": user}],
        )
    except anthropic.APIError as e:
        sys.stderr.write(f"  ! API error: {e}\n")
        return None
    block = next((b for b in resp.content if b.type == "tool_use"), None)
    if block is None or not isinstance(block.input, dict):
        return None
    data = dict(block.input)
    # Saneo defensivo (los enums ya lo garantizan, pero por si acaso).
    try:
        data["confianza"] = max(0.0, min(1.0, float(data.get("confianza", 0))))
    except (TypeError, ValueError):
        data["confianza"] = 0.0
    if not isinstance(data.get("categories"), list) or not data["categories"]:
        data["categories"] = ["casos-reales"]
    return data


# ─────────────────────────────────────────────────────────────────────
# Carga de contexto desde la BD
# ─────────────────────────────────────────────────────────────────────
def load_context() -> tuple[dict, list[dict], dict, dict]:
    """Devuelve (inbox{series_id,...}, series_para_llm, cat_id_by_slug, season_by_series_id)."""
    all_series = sb("GET", "/rest/v1/series?select=id,slug,title_es,synopsis_es") or []
    by_slug = {s["slug"]: s for s in all_series}

    inbox = by_slug.get(INBOX_SLUG)
    if not inbox:
        sys.stderr.write("\n[X] No existe la serie inbox 'sin-clasificar'. ¿Corriste la ingesta?\n\n")
        raise SystemExit(2)

    target_slugs = ["testimonios-reales", "guia-migratoria", "en-vivo", "el-bufete", "historias-cortas"]
    missing = [s for s in ([UF_SLUG] + target_slugs) if s not in by_slug]
    if missing:
        sys.stderr.write(
            "\n[X] Faltan series destino en la BD: " + ", ".join(missing) + "\n"
            "    Corre supabase/seed-series.sql antes de clasificar.\n\n"
        )
        raise SystemExit(2)

    # El LLM elige entre las 5 (Uniendo Familias se asigna deterministamente).
    series_for_llm = [by_slug[s] for s in target_slugs]

    cats = sb("GET", "/rest/v1/categories?select=id,slug,name_es") or []
    cat_id_by_slug = {c["slug"]: c["id"] for c in cats}

    seasons = sb("GET", "/rest/v1/seasons?select=id,series_id,season_number&season_number=eq.1") or []
    season_by_series = {s["series_id"]: s["id"] for s in seasons}

    # Para resolver slug -> id en --apply.
    by_slug["__cats__"] = cat_id_by_slug
    by_slug["__catlist__"] = cats
    by_slug["__seasons__"] = season_by_series
    return inbox, series_for_llm, by_slug, season_by_series


def load_inbox_drafts(inbox_id: str, only_unclassified: bool) -> list[dict]:
    q = (f"/rest/v1/episodes?select=id,youtube_id,title_es,synopsis_es,published_at"
         f"&series_id=eq.{inbox_id}&is_published=is.false")
    if only_unclassified:
        q += "&classified_at=is.null"
    q += "&order=published_at.asc.nullslast"
    return sb_get_all(q)


# ─────────────────────────────────────────────────────────────────────
# DRY-RUN
# ─────────────────────────────────────────────────────────────────────
CSV_COLS = ["youtube_id", "title", "series", "categories", "content_type", "recomendacion", "confianza", "razon"]


def already_in_csv() -> set[str]:
    if not PREVIEW_CSV.exists():
        return set()
    with PREVIEW_CSV.open(encoding="utf-8", newline="") as f:
        return {row["youtube_id"] for row in csv.DictReader(f)}


def run_dry(eps: list[dict], system_prompt: str, tool: dict, limit: int) -> None:
    done = already_in_csv()
    pending = [e for e in eps if e["youtube_id"] not in done]
    if limit:
        pending = pending[:limit]
    print(f"  Ya en CSV: {len(done)}  ·  por clasificar ahora: {len(pending)}")

    new_file = not PREVIEW_CSV.exists()
    n = 0
    counts = {"publicar": 0, "revisar": 0, "descartar": 0}
    with PREVIEW_CSV.open("a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(CSV_COLS)
        for ep in pending:
            title = ep["title_es"]
            uf_n = uf_episode_number(title)
            if uf_n is not None:
                data = {"series_slug": UF_SLUG, "categories": ["reunificacion-familiar", "casos-reales"],
                        "content_type": "episodio", "recomendacion": "publicar",
                        "confianza": 1.0, "razon": f"Uniendo Familias EP. {uf_n} (determinista)."}
            else:
                data = classify_one(system_prompt, tool, title, ep.get("synopsis_es"))
                if data is None:
                    data = {"series_slug": "historias-cortas", "categories": ["casos-reales"],
                            "content_type": "short_social", "recomendacion": "revisar",
                            "confianza": 0.0, "razon": "Respuesta del LLM malformada — revisar a mano."}
                time.sleep(THROTTLE_SECONDS)
            w.writerow([ep["youtube_id"], title, data["series_slug"], "|".join(data["categories"]),
                        data["content_type"], data["recomendacion"], f"{data['confianza']:.2f}", data["razon"]])
            f.flush()  # reanudable: cada fila queda en disco al instante
            counts[data["recomendacion"]] = counts.get(data["recomendacion"], 0) + 1
            n += 1
            if n % 50 == 0:
                print(f"    … {n}/{len(pending)}")

    print(f"\n  -> CSV: {PREVIEW_CSV}")
    print(f"  Clasificados esta corrida: {n}  (publicar {counts['publicar']}, "
          f"revisar {counts['revisar']}, descartar {counts['descartar']})")
    print("\n(DRY-RUN: no se escribió nada en la base de datos.)")


# ─────────────────────────────────────────────────────────────────────
# APPLY (escribe a la BD) — se corre DESPUÉS de revisar el CSV.
# ─────────────────────────────────────────────────────────────────────
def load_preview() -> dict[str, dict]:
    """youtube_id -> clasificación, tomada del CSV del dry-run YA revisado."""
    if not PREVIEW_CSV.exists():
        sys.stderr.write(f"\n[X] No existe {PREVIEW_CSV}. Corre el dry-run primero.\n\n")
        raise SystemExit(2)
    out: dict[str, dict] = {}
    with PREVIEW_CSV.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            out[row["youtube_id"]] = {
                "series_slug": row["series"],
                "categories": [c for c in row["categories"].split("|") if c] or ["casos-reales"],
                "content_type": row["content_type"],
                "recomendacion": row["recomendacion"],
                "confianza": float(row["confianza"]) if row["confianza"] else 0.0,
            }
    return out


def run_apply(eps: list[dict], by_slug: dict, season_by_series: dict, limit: int) -> None:
    """Escribe a la BD la clasificación YA decidida en classify-preview.csv.
    NO llama al LLM: aplica exactamente lo revisado. Reanudable (load_inbox_drafts
    ya filtró los que tienen classified_at). is_published NO se toca."""
    preview = load_preview()
    cat_id_by_slug = by_slug["__cats__"]
    valid_series = {s for s in by_slug if not s.startswith("__")}
    pending = eps[:limit] if limit else eps
    print(f"  Borradores sin clasificar: {len(pending)}  ·  filas en preview: {len(preview)}")

    # Emparejar cada borrador con su clasificación del CSV; validar el slug de serie.
    matched: list[tuple[dict, dict]] = []
    missing = 0
    for ep in pending:
        cls = preview.get(ep["youtube_id"])
        if cls is None:
            missing += 1
            continue
        if cls["series_slug"] not in valid_series:
            sys.stderr.write(f"\n[X] Serie desconocida '{cls['series_slug']}' para "
                             f"{ep['youtube_id']} en el CSV. Abortando (no fuerzo contra el FK).\n\n")
            raise SystemExit(2)
        matched.append((ep, cls))
    if missing:
        print(f"  ! {missing} borradores no están en el CSV — se omiten (re-corre el dry-run para incluirlos).")
    if not matched:
        print("  Nada que aplicar.")
        return

    # episode_number: cronológico por published_at por serie; UF por el N del título.
    # OJO: paginado — un GET plano topa en 1000 filas y subcontaría el máximo,
    # causando colisiones de (season_id, episode_number) al reanudar por lotes.
    series_max: dict[str, int] = {}
    for s in sb_get_all("/rest/v1/episodes?select=series_id,episode_number"):
        sid = s["series_id"]
        series_max[sid] = max(series_max.get(sid, 0), int(s["episode_number"]))

    uf_items: list[tuple[dict, dict]] = []
    groups: dict[str, list] = {}
    for ep, cls in matched:
        if cls["series_slug"] == UF_SLUG:
            uf_items.append((ep, cls))
        else:
            groups.setdefault(cls["series_slug"], []).append((ep, cls))
    for items in groups.values():
        items.sort(key=lambda pair: to_instant(pair[0].get("published_at")))

    written = 0
    for slug, items in groups.items():
        sid = by_slug[slug]["id"]
        for ep, cls in items:
            series_max[sid] = series_max.get(sid, 0) + 1
            _write_episode(ep, cls, sid, season_by_series[sid], series_max[sid], cat_id_by_slug)
            written += 1
            if written % 100 == 0:
                print(f"    … escritos {written}")
    # UF con el número del título (1–4).
    uf_sid = by_slug[UF_SLUG]["id"]
    for ep, cls in uf_items:
        n = uf_episode_number(ep["title_es"]) or (series_max.get(uf_sid, 0) + 1)
        series_max[uf_sid] = max(series_max.get(uf_sid, 0), n)
        _write_episode(ep, cls, uf_sid, season_by_series[uf_sid], n, cat_id_by_slug)
        written += 1

    print(f"\n  ✓ Escritos {written} episodios a la BD (is_published sigue false).")


def _write_episode(ep, data, series_id, season_id, episode_number, cat_id_by_slug) -> None:
    sb("PATCH", f"/rest/v1/episodes?id=eq.{ep['id']}", {
        "series_id": series_id,
        "season_id": season_id,
        "episode_number": episode_number,
        "content_type": data["content_type"],
        "recomendacion": data["recomendacion"],
        "classification_confidence": data["confianza"],
        "classified_at": datetime.now(timezone.utc).isoformat(),
    }, prefer="return=minimal")
    # Reemplazar links de categorías.
    sb("DELETE", f"/rest/v1/episode_categories?episode_id=eq.{ep['id']}", prefer="return=minimal")
    links = [{"episode_id": ep["id"], "category_id": cat_id_by_slug[c]}
             for c in data["categories"] if c in cat_id_by_slug]
    if links:
        sb("POST", "/rest/v1/episode_categories", links, prefer="return=minimal")


def main() -> None:
    parser = argparse.ArgumentParser(description="Clasifica los borradores de la inbox con LLM.")
    parser.add_argument("--apply", action="store_true", help="Escribe a la BD (default: dry-run).")
    parser.add_argument("--limit", type=int, default=0, help="Procesa sólo los primeros N.")
    args = parser.parse_args()

    mode = "APPLY (escribe a la BD)" if args.apply else "DRY-RUN (sin escrituras)"
    print(f"== Clasificación LLM | modelo {MODEL} | {mode} ==")

    inbox, series_for_llm, by_slug, season_by_series = load_context()
    eps = load_inbox_drafts(inbox["id"], only_unclassified=args.apply)
    print(f"  Borradores en inbox: {len(eps)}")
    if not eps:
        print("Nada que clasificar.")
        return

    if args.apply:
        # Aplica el CSV ya revisado — no vuelve a llamar al LLM.
        run_apply(eps, by_slug, season_by_series, args.limit)
    else:
        system_prompt = build_system_prompt(series_for_llm, by_slug["__catlist__"])
        tool = build_tool([s["slug"] for s in series_for_llm], list(by_slug["__cats__"].keys()))
        run_dry(eps, system_prompt, tool, args.limit)


if __name__ == "__main__":
    main()
