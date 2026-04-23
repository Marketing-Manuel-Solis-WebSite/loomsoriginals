"""Batch-scrape YouTube descriptions + durations for all episodes missing them.

Strips the boilerplate (phone numbers, copyright, CTAs, license notices) and
keeps a clean editorial synopsis. Updates episodes via Supabase REST.
"""
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SUPABASE_URL = "https://lvuikquwactdxofgilsa.supabase.co"
SRK = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dWlrcXV3YWN0ZHhvZmdpbHNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjkzNzA1OCwiZXhwIjoyMDkyNTEzMDU4fQ._tTT9_Uhj1OJ4in15RfYt5MjZGQaOK4Qt4kVGnzpeWc",
)
HEADERS = {
    "apikey": SRK,
    "Authorization": f"Bearer {SRK}",
    "Content-Type": "application/json",
}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def rest(method: str, path: str, body=None):
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = dict(HEADERS)
    headers["Prefer"] = "return=minimal" if method == "PATCH" else "return=representation"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw) if raw else None


def fetch_yt(video_id: str) -> tuple[str | None, int | None]:
    try:
        req = urllib.request.Request(
            f"https://www.youtube.com/watch?v={video_id}",
            headers={"User-Agent": UA, "Accept-Language": "es-US,es;q=0.9,en;q=0.8"},
        )
        html = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ! fetch failed {video_id}: {e}")
        return None, None

    m = re.search(r"var ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;", html)
    if not m:
        return None, None
    try:
        payload = json.loads(m.group(1))
    except Exception:
        return None, None
    vd = payload.get("videoDetails", {})
    desc = (vd.get("shortDescription") or "").strip()
    length_s = int(vd.get("lengthSeconds", "0") or "0")
    return desc, length_s


BOILERPLATE_PATTERNS = [
    re.compile(r"📞[^\n]*", re.I),
    re.compile(r"🌐[^\n]*", re.I),
    re.compile(r"Mas información[^\n]*", re.I),
    re.compile(r"Más información[^\n]*", re.I),
    re.compile(r"Nuestro equipo está listo[^\n]*", re.I),
    re.compile(r"©[^\n]*", re.I),
    re.compile(r"Todos los derechos reservados[^\n]*", re.I),
    re.compile(r"Este contenido es propiedad[^\n]*", re.I),
    re.compile(r"Queda prohibido[^\n]*", re.I),
    re.compile(r"Los recursos de audio[^\n]*", re.I),
    re.compile(r"envato.*elements", re.I),
    re.compile(r"https?://\S+", re.I),
    re.compile(r"\+?1[\s().-]?\d{3}[\s().-]?\d{3}[\s().-]?\d{4}"),
    re.compile(r"Llama hoy al[^\n]*", re.I),
    re.compile(r"¿Necesitas orientación[^\n]*", re.I),
    re.compile(r"¿Necesita orientación[^\n]*", re.I),
    re.compile(r"👉[^\n]*", re.I),
    re.compile(r"⭐[^\n]*suscríbete[^\n]*", re.I),
    re.compile(r"#\w+", re.I),  # tags
]


def clean_description(desc: str, title: str) -> str | None:
    if not desc:
        return None
    # Remove boilerplate lines
    for rx in BOILERPLATE_PATTERNS:
        desc = rx.sub("", desc)
    # Collapse runs of whitespace, but keep paragraph breaks
    lines = [ln.strip() for ln in desc.splitlines()]
    lines = [ln for ln in lines if ln and len(ln) > 2]
    cleaned = "\n\n".join(lines)
    # Strip trailing whitespace
    cleaned = cleaned.strip()
    if not cleaned:
        return None
    # If the clean result is shorter than 40 chars, it's probably not worth it
    if len(cleaned) < 40:
        return None
    # Cap length
    if len(cleaned) > 2000:
        cleaned = cleaned[:2000].rsplit(" ", 1)[0] + "…"
    return cleaned


def fetch_all_candidates():
    # All episodes where synopsis_es IS NULL OR duration_seconds IS NULL
    q = "/rest/v1/episodes?select=id,youtube_id,title_es,synopsis_es,duration_seconds&or=(synopsis_es.is.null,duration_seconds.is.null)&order=episode_number.asc"
    return rest("GET", q) or []


def main():
    eps = fetch_all_candidates()
    print(f"Candidates missing synopsis/duration: {len(eps)}")
    updated = 0
    failed = 0
    start = time.time()
    for i, ep in enumerate(eps, 1):
        yt = ep["youtube_id"]
        desc, length = fetch_yt(yt)
        patch = {}
        if length and not ep.get("duration_seconds"):
            patch["duration_seconds"] = length
        clean = clean_description(desc or "", ep["title_es"])
        if clean and not ep.get("synopsis_es"):
            patch["synopsis_es"] = clean
        if not patch:
            print(f"[{i:>3}/{len(eps)}] {yt} ~ no data")
            continue
        try:
            rest("PATCH", f"/rest/v1/episodes?id=eq.{ep['id']}", patch)
            updated += 1
            short = (patch.get("synopsis_es") or "")[:60]
            dur = patch.get("duration_seconds")
            print(f"[{i:>3}/{len(eps)}] {yt}  {dur or '-'}s  {short!r}")
        except urllib.error.HTTPError as e:
            failed += 1
            print(f"[{i:>3}/{len(eps)}] {yt} ! patch failed {e.code}")
        # Gentle throttle — avoid YouTube rate limiting
        time.sleep(0.25)

    elapsed = time.time() - start
    print(f"\n✓ updated {updated} / {len(eps)} (failed {failed}) in {elapsed:.0f}s")


if __name__ == "__main__":
    main()
