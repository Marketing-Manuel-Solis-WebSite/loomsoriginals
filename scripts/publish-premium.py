"""Selecciona y publica un primer corte PREMIUM curado (is_published=true).

Combina criterios (NO solo recomendacion, que es generosa):
  INCLUIR: content_type ∈ {episodio, testimonio, educativo, institucional}
           Y recomendacion = 'publicar'
           Y duración razonable (umbrales por tipo, abajo).
           Los 4 Uniendo Familias (serie uniendo-familias-manuel-solis) van SIEMPRE.
  EXCLUIR de este corte: short_social y live_podcast (se curan aparte después).

Modos:
  (sin flag)  DRY-RUN: escribe scripts/publish-preview.csv + conteos. NO toca la BD.
  --apply     UPDATE is_published=true SOLO a ese set (service_role). Idempotente
              y reanudable (solo voltea los que están en false).

Todas las lecturas de episodes van por sb_get_all (paginado) — el set se calcula
sobre los 1071, nunca sobre 1000.

Env: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL (vía _env).
"""
import argparse
import csv
import io
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

from _env import require_env

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SUPABASE_URL = require_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL").rstrip("/")
SRK = require_env("SUPABASE_SERVICE_ROLE_KEY")
SB_HEADERS = {"apikey": SRK, "Authorization": f"Bearer {SRK}", "Content-Type": "application/json"}
PREVIEW_CSV = Path(__file__).with_name("publish-preview.csv")

UF_SLUG = "uniendo-familias-manuel-solis"

# ── Criterios configurables ──────────────────────────────────────────
INCLUDE_TYPES = {"episodio", "testimonio", "educativo", "institucional"}
EXCLUDE_TYPES = {"short_social", "live_podcast"}
# Duración mínima (segundos) por content_type para entrar al corte premium.
# (testimonio a 40s: testimonios con nombre de 40-55s son promo fuerte; NO bajar de 40
#  para no colar shorts sociales. institucional a 45s para incluir "la oficina" (55s).)
MIN_DURATION = {"testimonio": 40, "institucional": 45, "educativo": 180, "episodio": 180}

# en-vivo: incluir un PUÑADO curado de live_podcast 'publicar' con tema real (pregunta en
# el título) y duración de sesión normal, para que el rail de en-vivo no quede con 1 item.
LIVE_PODCAST_INCLUDE = True
LIVE_PODCAST_MAX = 12          # tope del puñado
LIVE_PODCAST_MIN_DUR = 900     # 15 min — descarta stubs / 0-dur
LIVE_PODCAST_MAX_DUR = 3600    # 60 min — descarta maratones y artefactos largos (p. ej. "lobby2")


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


def sb_get_all(path: str, page: int = 1000) -> list[dict]:
    sep = "&" if "?" in path else "?"
    out, off = [], 0
    while True:
        chunk = sb("GET", f"{path}{sep}limit={page}&offset={off}") or []
        out.extend(chunk)
        if len(chunk) < page:
            break
        off += page
    return out


def is_premium(ep: dict) -> tuple[bool, str]:
    """(incluir, motivo). UF siempre entra; el resto por tipo+publicar+duración."""
    if ep["series_slug"] == UF_SLUG:
        return True, "UF (siempre)"
    ct = ep.get("content_type")
    if ct in EXCLUDE_TYPES:
        return False, f"excluido: {ct}"
    if ct not in INCLUDE_TYPES:
        return False, f"tipo no incluible: {ct}"
    if ep.get("recomendacion") != "publicar":
        return False, f"rec={ep.get('recomendacion')}"
    d = ep.get("duration_seconds")
    if d is None:
        return False, "sin duración"
    if d < MIN_DURATION.get(ct, 60):
        return False, f"duración {d}s < {MIN_DURATION.get(ct,60)}s"
    return True, "ok"


def select_live_handful(eps: list[dict]) -> list[dict]:
    """Puñado curado de live_podcast: 'publicar', con pregunta en el título (tema real),
    duración de sesión normal y los más recientes. Evita stubs y artefactos (p. ej. 'lobby2')."""
    if not LIVE_PODCAST_INCLUDE:
        return []
    cand = [
        e for e in eps
        if e.get("content_type") == "live_podcast"
        and e.get("recomendacion") == "publicar"
        and e.get("duration_seconds") is not None
        and LIVE_PODCAST_MIN_DUR <= e["duration_seconds"] <= LIVE_PODCAST_MAX_DUR
        and ("¿" in (e.get("title_es") or "") or "?" in (e.get("title_es") or ""))
    ]
    cand.sort(key=lambda e: (e.get("published_at") or ""), reverse=True)
    return cand[:LIVE_PODCAST_MAX]


def mmss(d) -> str:
    if d is None:
        return "—"
    return f"{int(d)//60}:{int(d)%60:02d}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Publica un corte premium curado.")
    parser.add_argument("--apply", action="store_true", help="Publica (is_published=true). Default: dry-run.")
    args = parser.parse_args()
    print(f"== Publish premium | {'APPLY' if args.apply else 'DRY-RUN'} ==")

    eps = sb_get_all("/rest/v1/episodes?select=id,youtube_id,title_es,content_type,"
                     "recomendacion,duration_seconds,is_published,episode_number,published_at,series:series(slug)")
    for e in eps:
        e["series_slug"] = (e.get("series") or {}).get("slug")
    print(f"  Episodios leídos: {len(eps)}")

    main_sel = [e for e in eps if is_premium(e)[0]]
    live_sel = select_live_handful(eps)
    selected = main_sel + live_sel
    print(f"  Seleccionados: {len(selected)}  (corte por tipo {len(main_sel)} + puñado en-vivo {len(live_sel)})")

    from collections import Counter
    by_series = Counter(e["series_slug"] for e in selected)
    by_type = Counter(e["content_type"] for e in selected)

    if not args.apply:
        with PREVIEW_CSV.open("w", encoding="utf-8", newline="") as f:
            w = csv.writer(f)
            w.writerow(["youtube_id", "serie", "content_type", "duration_seconds", "title"])
            for e in sorted(selected, key=lambda e: (e["series_slug"], -(e["duration_seconds"] or 0))):
                w.writerow([e["youtube_id"], e["series_slug"], e["content_type"],
                            e["duration_seconds"] if e["duration_seconds"] is not None else "", e["title_es"]])
        print(f"\n  -> {PREVIEW_CSV}")
        print("\n  == Total por serie ==")
        for s, n in by_series.most_common():
            print(f"    {s:34} {n}")
        print("\n  == Por content_type ==")
        for t, n in by_type.most_common():
            print(f"    {t:14} {n}")
        # Diagnóstico de episodio (para validar los teasers).
        eps_epi = [e for e in selected if e["content_type"] == "episodio"]
        print(f"\n  == content_type=episodio en el corte ({len(eps_epi)}) ==")
        for e in eps_epi:
            print(f"    [{e['series_slug']}] {mmss(e['duration_seconds'])}  {e['title_es'][:60]!r}")
        live = [e for e in selected if e["content_type"] == "live_podcast"]
        print(f"\n  == live_podcast incluidos (puñado, {len(live)}) ==")
        for e in sorted(live, key=lambda e: -(e["duration_seconds"] or 0)):
            print(f"    {mmss(e['duration_seconds'])}  {e['title_es'][:60]!r}")
        print("\n(DRY-RUN: no se escribió nada en la base de datos.)")
        return

    # --apply: voltear is_published=true solo a los seleccionados que están en false.
    to_publish = [e["id"] for e in selected if not e["is_published"]]
    print(f"  Ya publicados: {len(selected) - len(to_publish)}  ·  por publicar: {len(to_publish)}")
    done = 0
    for i in range(0, len(to_publish), 80):
        batch = to_publish[i:i + 80]
        ids = ",".join(batch)
        sb("PATCH", f"/rest/v1/episodes?id=in.({ids})", {"is_published": True}, prefer="return=minimal")
        done += len(batch)
        print(f"    … publicados {done}/{len(to_publish)}")
    print(f"\n  ✓ Publicados {done} episodios (corte premium).")


if __name__ == "__main__":
    main()
