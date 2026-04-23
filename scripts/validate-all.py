import io
import re
import sys
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

SLUGS = [
    ("el-abrazo-que-espero-18-anos", "Lourdes y su esposo"),
    ("tres-decadas-de-vuelta-a-casa", "Eva López emigró"),
    ("historias-que-resisten-al-tiempo", "Juana Cervantes"),
]

for slug, needle in SLUGS:
    url = f"https://www.loomsoriginal.com/series/uniendo-familias-manuel-solis/t1/{slug}"
    html = urllib.request.urlopen(
        urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20
    ).read().decode("utf-8", errors="replace")
    # Strip head and scripts
    body = re.sub(r"<head[\s\S]*?</head>", "", html)
    body = re.sub(r"<script[\s\S]*?</script>", "", body)
    body = re.sub(r"<!--[\s\S]*?-->", "", body)
    text = re.sub(r"<[^>]+>", " ", body)
    text = re.sub(r"\s+", " ", text).strip()
    has_content = needle in text
    shows_404 = ("Página no encontrada" in text and "Volver al inicio" in text)
    status = "OK" if has_content and not shows_404 else "BROKEN"
    print(f"{status:7} {slug}  ·  content={has_content}  ·  shows_404={shows_404}")
