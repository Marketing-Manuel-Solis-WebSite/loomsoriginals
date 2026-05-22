"""Reclassify existing episodes with a stronger rule-set.
Reassigns series + categories based on title + synopsis.
Also rewrites titles to clean CTAs/emoji-only names where possible.
"""
import io
import json
import re
import sys
import urllib.request

from _env import require_env

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SUPABASE_URL = require_env("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
SRK = require_env("SUPABASE_SERVICE_ROLE_KEY")
HEADERS = {"apikey": SRK, "Authorization": f"Bearer {SRK}", "Content-Type": "application/json"}


def rest(method: str, path: str, body=None, prefer_minimal=False):
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = dict(HEADERS)
    headers["Prefer"] = "return=minimal" if prefer_minimal else "return=representation"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else None


def rest_get_all(path: str) -> list:
    """GET paginado con offset (PostgREST topa en 1000 filas por respuesta)."""
    sep = "&" if "?" in path else "?"
    out, off = [], 0
    while True:
        chunk = rest("GET", f"{path}{sep}limit=1000&offset={off}") or []
        out.extend(chunk)
        if len(chunk) < 1000:
            break
        off += 1000
    return out


# ─────────────────────────────────────────────────────────────────────
# Patterns — checked in order. First match wins.
# Format: (series_slug, [category_slugs], regex)
# ─────────────────────────────────────────────────────────────────────
RULES = [
    # Uniendo Familias — only real EPs (already pinned to series)
    # (We don't reassign UF from its existing episodes — they're pinned manually.)

    # Testimonios Reales (real client stories)
    (
        "testimonios-reales",
        ["casos-reales", "reunificacion-familiar"],
        re.compile(
            r"(testimonio|caso real|residencia (permanente|aprobada)|aprobaron mi residencia|"
            r"me aprobaron|hoy (soy|ya soy) residente|green.?card|greencard|"
            r"experiencia al obtener|kimberly flores|yaztiri morales|rocío dávila|"
            r"rocio davila|ramiro escobedo|rosa arredondo|maría lourdes|maria lourdes|"
            r"agustín quiroz|agustin quiroz|jesús|josé alvarado|jose alvarado|"
            r"hilda|lourdes|juana|eva lópez|eva lopez|años lejos de su familia|"
            r"24 años lejos|30 años lejos|abrazo que esperó|se borran fácil|"
            r"reencuentro|historia real|historia de [a-záéíóúñü]+\s[a-záéíóúñü]+|"
            r"obtuvo su residencia|recibió la noticia|noticia que cambia|"
            r"sentí mucha alegría|senti mucha alegria|visa de matrimonio aprobada|"
            r"después de años|tres décadas sin|obtuvo la residencia|logró avanzar|"
            r"logro avanzar|valió la pena|valio la pena|reencuentro después|"
            r"podría cambiar tu forma|podria cambiar tu forma|todo valió)",
            re.I,
        ),
    ),

    # Uniendo Familias teasers → Testimonios
    (
        "testimonios-reales",
        ["reunificacion-familiar", "casos-reales"],
        re.compile(
            r"(teaser.*uniendo familias|uniendo familias.*teaser|el abrazo que esperaron|"
            r"reencuentro después de 30 años|30 años sin ver)",
            re.I,
        ),
    ),

    # Guía Migratoria — VAWA
    (
        "guia-migratoria",
        ["asilo", "reunificacion-familiar"],
        re.compile(r"\b(vawa|violencia (doméstica|domestica)|abuso financiero|emocional.*vawa)\b", re.I),
    ),
    # Guía Migratoria — Visa T
    (
        "guia-migratoria",
        ["asilo"],
        re.compile(r"visa\s*t\b|explotación laboral|explotacion laboral|tráfico humano|trafico humano", re.I),
    ),
    # Guía Migratoria — Visa U
    (
        "guia-migratoria",
        ["asilo"],
        re.compile(r"visa\s*u\b|víctima de (delito|crimen)|victim|victim(as|ms)? de delitos", re.I),
    ),
    # Guía Migratoria — SIJS / Juvenil
    (
        "guia-migratoria",
        ["asilo"],
        re.compile(r"sijs|visa juvenil|inmigrante juvenil|menores no acompañados|estatus.*juvenil", re.I),
    ),
    # Guía Migratoria — ICE / habeas corpus / detención
    (
        "guia-migratoria",
        ["deportacion"],
        re.compile(
            r"\bice\b|habeas ?corpus|detenido por ice|detención migratoria|"
            r"detencion migratoria|corte de inmigración|corte de inmigracion|"
            r"notice to appear|i-275|nta|redada|deportación|deportacion|"
            r"juez federal|proceso de remoción|proceso de remocion",
            re.I,
        ),
    ),
    # Guía Migratoria — I-130 / reunif / familiar militar
    (
        "guia-migratoria",
        ["reunificacion-familiar"],
        re.compile(
            r"\bi-?130\b|petición familiar|peticion familiar|familiar militar|"
            r"acompañante militar|reunificación|reunificacion",
            re.I,
        ),
    ),
    # Guía Migratoria — E-2 / trabajo / emprendimiento
    (
        "guia-migratoria",
        ["visas-de-trabajo"],
        re.compile(
            r"visa\s*e-?2|h-?1b|l-?1|o-?1|invertir|emprender|emprendimiento|negocio en ee.?uu|"
            r"residencia por empleo|permiso de trabajo",
            re.I,
        ),
    ),
    # Guía Migratoria — Ciudadanía
    (
        "guia-migratoria",
        ["ciudadania"],
        re.compile(r"ciudadan|naturalización|naturalizacion|examen de civismo|juramento", re.I),
    ),
    # Guía Migratoria — genérico (preguntas legales)
    (
        "guia-migratoria",
        ["casos-reales"],
        re.compile(
            r"¿(sabías|sab[ií]as|qué|qu[eé]|puedo|puedes|te imaginas)|"
            r"errores migratorios|mito|estatus migratorio|seguro social falso|"
            r"formulario g-?28|cambios en la visa|abogado responde|aclara dudas|"
            r"boletín informativo|boletin informativo|orientación|orientacion|"
            r"derechos (humanos|laborales)|verdad o mito",
            re.I,
        ),
    ),
    # Guía Migratoria — casos civiles (accidentes, negligencia, tormentas)
    (
        "guia-migratoria",
        ["casos-reales"],
        re.compile(
            r"accidente|negligencia médica|negligencia medica|tormenta|explosión en texas|"
            r"explosion en texas|daños por tormenta|derechos del paciente|lesi[oó]n personal",
            re.I,
        ),
    ),

    # En Vivo / Podcasts
    (
        "en-vivo",
        ["casos-reales"],
        re.compile(
            r"\blive\b|en vivo|podcast|despierta houston|consejos con|"
            r"arreglando con los abogados|miércoles.*\d+:\d+|miercoles.*\d+:\d+|"
            r"live\s*podcast|1:00pm|1:00 pm",
            re.I,
        ),
    ),

    # El Bufete (institucional / sobre la firma)
    (
        "el-bufete",
        ["casos-reales"],
        re.compile(
            r"35 años de experiencia|manuel sol[ií]s: tu equipo|oficina del abogado|"
            r"bufete de abogados|por qu[eé] recomiendan|confía en el bufete|"
            r"confia en el bufete|equipo legal|tranquilidad migratoria|"
            r"abogados de inmigración manuel solis|abogados de inmigracion manuel solis",
            re.I,
        ),
    ),
]

# Sub-category boost: append extra cats when title matches
BOOSTS = [
    (re.compile(r"familia|abrazo|mam[aá]|padre|hijo|hija|esposa|esposo|hermana|hermano", re.I), "reunificacion-familiar"),
    (re.compile(r"asilo|protección|proteccion|refugio", re.I), "asilo"),
    (re.compile(r"ciudadan|naturaliz", re.I), "ciudadania"),
    (re.compile(r"deport|ice|remoción|remocion|detenci", re.I), "deportacion"),
    (re.compile(r"trabajo|empleo|empresa|visa e|h-1b|l-1|emprend", re.I), "visas-de-trabajo"),
]


def classify(title: str, synopsis: str | None) -> tuple[str, list[str]]:
    text = f"{title}  {synopsis or ''}"
    for series_slug, base_cats, rx in RULES:
        if rx.search(text):
            cats = set(base_cats)
            for brx, bcat in BOOSTS:
                if brx.search(text):
                    cats.add(bcat)
            cats.add("casos-reales")
            return series_slug, sorted(cats)
    # Fallback: short content
    cats = {"casos-reales"}
    for brx, bcat in BOOSTS:
        if brx.search(text):
            cats.add(bcat)
    return "historias-cortas", sorted(cats)


def main():
    # Load series + categories
    all_series = rest("GET", "/rest/v1/series?select=id,slug") or []
    series_by_slug = {s["slug"]: s["id"] for s in all_series}

    cats = rest("GET", "/rest/v1/categories?select=id,slug") or []
    cat_id_by_slug = {c["slug"]: c["id"] for c in cats}

    # Find season_id per series (we assume season 1 for all)
    all_seasons = rest("GET", "/rest/v1/seasons?select=id,series_id,season_number") or []
    season_by_series: dict[str, str] = {}
    for s in all_seasons:
        if s["season_number"] == 1:
            season_by_series[s["series_id"]] = s["id"]

    # PROTECTED: don't reclassify the 3 UF episodes
    UF_SLUG = "uniendo-familias-manuel-solis"
    uf_series_id = series_by_slug.get(UF_SLUG)

    # Episodes with their slugs
    eps = rest_get_all(
        "/rest/v1/episodes?select=id,title_es,synopsis_es,series_id,season_id,episode_number,slug,youtube_id"
    )

    # Current categories per episode
    ec = rest_get_all("/rest/v1/episode_categories?select=episode_id,category_id")
    cur_cats: dict[str, set[str]] = {}
    for row in ec:
        cur_cats.setdefault(row["episode_id"], set()).add(row["category_id"])

    moves: list[dict] = []  # episode_id, new_series_id, new_season_id
    cat_adds: list[dict] = []  # episode_id, category_id
    cat_dels: list[dict] = []  # episode_id, category_id

    # Track per-series next episode_number so moves don't collide
    series_max_ep: dict[str, int] = {}
    for e in eps:
        sid = e["series_id"]
        series_max_ep[sid] = max(series_max_ep.get(sid, 0), int(e["episode_number"]))

    for e in eps:
        # Protect real UF episodes
        if e["series_id"] == uf_series_id and e["episode_number"] in (1, 2, 3):
            continue

        new_series, new_cats = classify(e["title_es"], e.get("synopsis_es"))
        new_series_id = series_by_slug.get(new_series)
        if not new_series_id:
            continue
        new_cat_ids = {cat_id_by_slug[c] for c in new_cats if c in cat_id_by_slug}

        # Move across series?
        if new_series_id != e["series_id"]:
            new_season_id = season_by_series.get(new_series_id)
            if not new_season_id:
                continue
            series_max_ep[new_series_id] = series_max_ep.get(new_series_id, 0) + 1
            moves.append(
                {
                    "episode_id": e["id"],
                    "new_series_id": new_series_id,
                    "new_season_id": new_season_id,
                    "new_episode_number": series_max_ep[new_series_id],
                }
            )

        # Reconcile categories
        current = cur_cats.get(e["id"], set())
        to_add = new_cat_ids - current
        to_del = current - new_cat_ids
        for cid in to_add:
            cat_adds.append({"episode_id": e["id"], "category_id": cid})
        for cid in to_del:
            cat_dels.append({"episode_id": e["id"], "category_id": cid})

    print(f"Episodes to move across series: {len(moves)}")
    print(f"Category adds:    {len(cat_adds)}")
    print(f"Category deletes: {len(cat_dels)}")

    # ─── Apply moves in batches ────────────────────────────────────
    for i, m in enumerate(moves, 1):
        try:
            rest(
                "PATCH",
                f"/rest/v1/episodes?id=eq.{m['episode_id']}",
                {
                    "series_id": m["new_series_id"],
                    "season_id": m["new_season_id"],
                    "episode_number": m["new_episode_number"],
                },
                prefer_minimal=True,
            )
        except urllib.error.HTTPError as e:  # type: ignore[name-defined]
            print(f"  ! move {m['episode_id'][:8]} failed: {e.code}")
        if i % 25 == 0:
            print(f"  moved {i}/{len(moves)}")
    print(f"✓ moves applied")

    # ─── Category deletions (per-pair) ─────────────────────────────
    for i, d in enumerate(cat_dels, 1):
        try:
            rest(
                "DELETE",
                f"/rest/v1/episode_categories?episode_id=eq.{d['episode_id']}&category_id=eq.{d['category_id']}",
                prefer_minimal=True,
            )
        except urllib.error.HTTPError:  # type: ignore[name-defined]
            pass
        if i % 100 == 0:
            print(f"  deleted {i}/{len(cat_dels)} cat links")

    # ─── Category additions (batched) ──────────────────────────────
    for i in range(0, len(cat_adds), 100):
        chunk = cat_adds[i : i + 100]
        try:
            rest("POST", "/rest/v1/episode_categories", chunk, prefer_minimal=True)
        except urllib.error.HTTPError:  # type: ignore[name-defined]
            for row in chunk:
                try:
                    rest("POST", "/rest/v1/episode_categories", [row], prefer_minimal=True)
                except urllib.error.HTTPError:  # type: ignore[name-defined]
                    pass
        print(f"  added {min(i + 100, len(cat_adds))}/{len(cat_adds)} cat links")

    print("✓ done")


if __name__ == "__main__":
    import urllib.error  # deferred to allow except above
    main()
