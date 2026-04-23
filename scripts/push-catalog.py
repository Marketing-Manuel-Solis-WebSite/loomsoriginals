"""Push the catalog manifest to Supabase via REST API."""
import io
import json
import os
import sys
import time
from pathlib import Path
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
    "Prefer": "return=representation",
}


def rest(method: str, path: str, body=None, prefer_minimal=False):
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = dict(HEADERS)
    if prefer_minimal:
        headers["Prefer"] = "return=minimal"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} on {method} {path}")
        print(e.read().decode("utf-8", errors="replace")[:500])
        raise


def main():
    manifest = json.loads(Path(__file__).with_name("catalog-manifest.json").read_text(encoding="utf-8"))

    # ─── 1. Upsert missing series ───────────────────────────────────
    existing_series = rest("GET", "/rest/v1/series?select=id,slug")
    existing_slugs = {s["slug"]: s["id"] for s in existing_series or []}
    print(f"Existing series: {len(existing_slugs)}")

    for slug, s in manifest["series"].items():
        if slug in existing_slugs:
            continue
        row = {
            "slug": slug,
            "title_es": s["title_es"],
            "title_en": s.get("title_en"),
            "synopsis_es": s.get("synopsis_es"),
            "is_featured": s.get("is_featured", False),
            "featured_order": s.get("featured_order"),
            "release_year": 2026,
        }
        created = rest("POST", "/rest/v1/series", [row])
        if created:
            existing_slugs[slug] = created[0]["id"]
            print(f"  + series {slug} → {created[0]['id']}")

    # ─── 2. Upsert season 1 for each series that needs one ─────────
    existing_seasons = rest("GET", "/rest/v1/seasons?select=id,series_id,season_number")
    seasons_by_series = {}
    for s in existing_seasons or []:
        seasons_by_series[(s["series_id"], s["season_number"])] = s["id"]

    for slug in manifest["series"].keys():
        sid = existing_slugs.get(slug)
        if not sid:
            continue
        if (sid, 1) in seasons_by_series:
            continue
        created = rest(
            "POST",
            "/rest/v1/seasons",
            [
                {
                    "series_id": sid,
                    "season_number": 1,
                    "title_es": "Primera Temporada",
                    "title_en": "Season One",
                }
            ],
        )
        if created:
            seasons_by_series[(sid, 1)] = created[0]["id"]
            print(f"  + season 1 for {slug}")

    # ─── 3. Load categories ─────────────────────────────────────────
    categories = rest("GET", "/rest/v1/categories?select=id,slug")
    cat_ids = {c["slug"]: c["id"] for c in categories or []}

    # ─── 4. Build list of episodes to insert — skip those already present ──
    existing_eps = rest("GET", "/rest/v1/episodes?select=youtube_id")
    existing_yt_ids = {e["youtube_id"] for e in existing_eps or []}
    print(f"Existing episodes in DB: {len(existing_yt_ids)}")

    # Track max episode_number already used per (series_id)
    ep_existing = rest("GET", "/rest/v1/episodes?select=series_id,episode_number")
    series_counter: dict[str, int] = {}
    for e in ep_existing or []:
        sid = e["series_id"]
        n = int(e["episode_number"])
        if n > series_counter.get(sid, 0):
            series_counter[sid] = n

    # ─── 5. Batch-insert episodes (50 at a time) ────────────────────
    to_insert = []
    slug_ep_link = []  # (youtube_id, category_slug[])
    for v in manifest["videos"]:
        if v["youtube_id"] in existing_yt_ids:
            continue
        series_id = existing_slugs.get(v["series_slug"])
        if not series_id:
            print(f"  ! missing series for {v['series_slug']}")
            continue
        season_id = seasons_by_series.get((series_id, 1))
        if not season_id:
            print(f"  ! missing season for {v['series_slug']}")
            continue
        next_ep = series_counter.get(series_id, 0) + 1
        series_counter[series_id] = next_ep

        # Ensure slug is unique: prefix with ep-N if needed
        slug = v["slug"]
        if len(slug) < 3:
            slug = f"ep-{next_ep}-{slug}"

        row = {
            "series_id": series_id,
            "season_id": season_id,
            "episode_number": next_ep,
            "slug": slug,
            "title_es": v["title"],
            "youtube_id": v["youtube_id"],
            "duration_seconds": v.get("duration_seconds"),
            "published_at": v.get("published_at"),
            "is_published": True,
            "tags": [],
        }
        to_insert.append(row)
        slug_ep_link.append((v["youtube_id"], v["categories"]))

    print(f"\nEpisodes to insert: {len(to_insert)}")

    inserted_episodes = {}
    BATCH = 40
    for i in range(0, len(to_insert), BATCH):
        chunk = to_insert[i : i + BATCH]
        try:
            rows = rest("POST", "/rest/v1/episodes", chunk)
        except urllib.error.HTTPError as e:
            # Retry one-by-one on conflict
            print(f"  batch {i} failed, retrying individually")
            rows = []
            for r in chunk:
                try:
                    one = rest("POST", "/rest/v1/episodes", [r])
                    if one:
                        rows.extend(one)
                except urllib.error.HTTPError as e2:
                    print(f"  ! skipped {r['youtube_id']}: {e2.code}")
                    continue
        for row in rows or []:
            inserted_episodes[row["youtube_id"]] = row["id"]
        print(f"  inserted {i + len(chunk)}/{len(to_insert)}")
        time.sleep(0.1)

    # ─── 6. Link episodes to categories ─────────────────────────────
    links = []
    for yt_id, cat_slugs in slug_ep_link:
        ep_id = inserted_episodes.get(yt_id)
        if not ep_id:
            continue
        for cs in cat_slugs:
            cid = cat_ids.get(cs)
            if not cid:
                continue
            links.append({"episode_id": ep_id, "category_id": cid})

    print(f"\nCategory links to insert: {len(links)}")
    for i in range(0, len(links), 100):
        chunk = links[i : i + 100]
        try:
            rest("POST", "/rest/v1/episode_categories", chunk, prefer_minimal=True)
        except urllib.error.HTTPError as e:
            print(f"  link batch {i} failed: {e.code}")
            continue
        print(f"  linked {i + len(chunk)}/{len(links)}")
        time.sleep(0.1)

    print("\n✓ Done")


if __name__ == "__main__":
    main()
