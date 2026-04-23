"""Fetch duration and description for YouTube videos."""
import io
import json
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

IDS = sys.argv[1:] or ["PmU1yOfB9C8", "3Z6BOOCBgas", "n8aJSPHdTXg"]

for vid in IDS:
    req = urllib.request.Request(
        f"https://www.youtube.com/watch?v={vid}",
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
    )
    html = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", errors="replace")

    # Extract ytInitialPlayerResponse JSON
    m = re.search(r"var ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;", html)
    desc = ""
    length_s = 0
    if m:
        try:
            payload = json.loads(m.group(1))
            vd = payload.get("videoDetails", {})
            desc = vd.get("shortDescription", "") or ""
            length_s = int(vd.get("lengthSeconds", "0") or "0")
        except Exception as e:
            print(f"{vid} parse error: {e}", file=sys.stderr)
    print(f"===== {vid}  ({length_s}s) =====")
    print(desc)
    print()
